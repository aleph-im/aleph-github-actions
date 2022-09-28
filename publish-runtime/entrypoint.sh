#!/bin/sh

#TODO: Upload rootfs.squashfs file to IPFS-2 using the public API
#ipfs --api="/ip4/192.168.1.10/tcp/45001" add ./rootfs.squashfs

aleph pin $RUNTIME_HASH --private-key $PRIVATE_KEY

aleph program ./program "run.sh $INDEXER" --persistent --private-key $PRIVATE_KEY --runtime $RUNTIME_HASH


