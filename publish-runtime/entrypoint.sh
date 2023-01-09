#!/bin/sh

ls -lah

# COPY runtime file
cp -vap /github/workspace/$INPUT_RUNTIME_FILENAME /app/runtime/$INPUT_RUNTIME_FILENAME

python3 /app/runtime/publish.py $INPUT_RUNTIME_FILENAME $INPUT_PRIVATE_KEY


