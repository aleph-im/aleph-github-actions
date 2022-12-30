FROM python:3.10.6-bullseye

ARG PRIVATE_KEY
ARG RUNTIME_FILENAME
ENV PRIVATE_KEY=$PRIVATE_KEY
ENV RUNTIME_FILENAME=$RUNTIME_FILENAME

RUN apt-get update

# Install secp256k1
RUN apt-get install -y libsecp256k1-dev squashfs-tools

RUN pip install aioipfs
RUN pip install aleph_client

COPY entrypoint.sh ./entrypoint.sh
COPY publish.py ./publish.py

COPY program ./program

# Copy runtime file
COPY $RUNTIME_FILENAME ./$RUNTIME_FILENAME

RUN chmod +x ./program/run.sh

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
