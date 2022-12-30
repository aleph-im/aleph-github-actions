#!/usr/bin/env python3

"""
This script uploads the runtime to IPFS.
Requires: 'aioipfs>=0.6.2'
"""

import sys
import asyncio
import json
import logging
import os

from aleph_client.__main__ import _load_account
from aleph_client.conf import settings
from aleph_client.synchronous import create_program, create_store
from aleph_client.asynchronous import (
    get_fallback_session,
    StorageEnum as ASYNCStorageEnum,
)
from aleph_client.types import StorageEnum, AccountFromPrivateKey
from aleph_message.models.program import Encoding

from pathlib import Path
from typing import NewType

import aioipfs

logger = logging.getLogger(__file__)

Multiaddr = NewType("Multiaddr", str)
CID = NewType("CID", str)


def raise_no_cid():
    raise ValueError("Could not obtain a CID")

def create_program_squashfs(path, name: str):
    logger.debug("Creating squashfs archive...")
    print(f"Path {path}/{name}")
    os.system(f"mksquashfs {path}/{name} {name}.squashfs -noappend")
    path = f"./{name}.squashfs"
    assert os.path.isfile(path)
    return path

def upload_program(account, program_squashfs_path: str) -> str:
    with open(program_squashfs_path, "rb") as fd:
        logger.debug("Reading program file")
        # TODO: Read in lazy mode instead of copying everything in memory
        file_content = fd.read()
        print("Uploading program file\n")
        result = create_store(
            account=account,
            file_content=file_content,
            storage_engine=StorageEnum.storage,
            channel=settings.DEFAULT_CHANNEL,
            guess_mime_type=True,
            ref=None,
        )
        print(f"{result.json(indent=4)}")
        print("Program upload finished\n")
        program_ref = result.item_hash.__str__()
    return program_ref


async def upload_runtime(file: Path, multiaddr: Multiaddr) -> CID:
    client = aioipfs.AsyncIPFS(maddr=multiaddr)

    try:
        cid = None
        async for added_file in client.add(file, recursive=True):
            logger.debug(
                f"Uploaded file {added_file['Name']} with CID: {added_file['Hash']}"
            )
            cid = added_file["Hash"]
        # The last CID is the CID of the directory uploaded
        return cid or raise_no_cid()
    finally:
        await client.close()

async def publish_runtime(file: str, multiaddr: Multiaddr) -> CID:
    path = Path(__file__).parent / file
    print(f"Runtime path {path}")
    if not path.is_file():
        raise NotADirectoryError(f"No such directory: {path}")
    cid = await upload_runtime(file=path, multiaddr=multiaddr)
    return cid

def pin_runtime(
          account: AccountFromPrivateKey,
          hash: str
) -> str:
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    result: StoreMessage = create_store(
        account=account,
        file_hash=hash,
        storage_engine=ASYNCStorageEnum.ipfs,
        channel=settings.DEFAULT_CHANNEL,
        ref=None,
    )
    print(f"{result.json(indent=4)}")
    print("Runtime pinning finished\n")
    runtime_ref = result.item_hash.__str__()
    return runtime_ref


def main():
    if len(sys.argv) < 3:
        print("{0} <RUNTIME_FILENAME> <PRIVATE_KEY>".format(sys.argv[0]))
        return

    try:
        account: AccountFromPrivateKey = _load_account(sys.argv[2], None)

        runtime_cid = asyncio.run(publish_runtime(sys.argv[1], Multiaddr("/dns6/ipfs-2.aleph.im/tcp/443/https")))
        runtime_ref = pin_runtime(account=account, hash=runtime_cid)

        program_path = Path(__file__).parent
        print(f"Program path {program_path}")
        program_directory = "program"

        program_squashfs_path = create_program_squashfs(program_path, program_directory)
        assert os.path.isfile(program_squashfs_path)
        program_ref = upload_program(account, program_squashfs_path)

        volumes = [
            {
                "comment": "Indexer Data",
                "mount": "/opt/indexer.data",
                "ref": "",
                "use_latest": True,
            }
        ]

        result = create_program(
            account=account,
            program_ref=program_ref,
            entrypoint="main:app",
            runtime=runtime_ref,
            storage_engine=StorageEnum.storage,
            channel=settings.DEFAULT_CHANNEL,
            address=None,
            session=None,
            api_server=settings.API_HOST,
            memory=4000,
            vcpus=4,
            timeout_seconds=180,
            encoding=Encoding.squashfs,
            volumes=volumes,
        )
        print(f"{result.json(indent=2)}")
        print("Program creation finished\n")
    finally:
        # Prevent aiohttp unclosed connector warning
        asyncio.run(get_fallback_session().close())

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
