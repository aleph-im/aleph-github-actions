#!/bin/sh

aleph pin $RUNTIME_HASH --private-key $PRIVATE_KEY

aleph program ./program run.sh --persistent --private-key $PRIVATE_KEY --runtime $RUNTIME_HASH


