#!/usr/bin/env python3

"""
This script uploads the build SPA to IPFS.
It does not ping it or do anything else yet, so the result can only be accessed
 as long as the files are not garbage collected.
Requires: 'aioipfs>=0.6.2'
"""

import asyncio
import logging
import sys
from pathlib import Path
from typing import NewType

import aioipfs

logger = logging.getLogger(__file__)

Multiaddr = NewType("Multiaddr", str)
CID = NewType("CID", str)


def raise_no_cid():
    raise ValueError("Could not obtain a CID")


async def upload_site(files: list[Path], multiaddr: Multiaddr) -> CID:
    client = aioipfs.AsyncIPFS(maddr=multiaddr)

    try:
        cid = None
        async for added_file in client.add(*files, recursive=True):
            logger.debug(
                f"Uploaded file {added_file['Name']} with CID: {added_file['Hash']}"
            )
            cid = added_file["Hash"]
        # The last CID is the CID of the directory uploaded
        return cid or raise_no_cid()
    finally:
        await client.close()


async def publish_site(path: Path, multiaddr: Multiaddr) -> CID:
    if not path.is_dir():
        raise NotADirectoryError(f"No such directory: {path}")
    cid = await upload_site(files=[path], multiaddr=multiaddr)
    return cid


def main():
    if len(sys.argv) != 2:
        print(f"Usage: {Path(__file__).name} <directory>")
        sys.exit(1)

    directory = Path(sys.argv[1]).resolve()
    print(asyncio.run(publish_site(directory, Multiaddr("/dns/ipfs-2.aleph.im/tcp/443/https"))))


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    main()
