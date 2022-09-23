FROM python:3-bullseye

ARG FS_PATH
ARG PRIVATE_KEY
ARG RUNTIME_HASH

ENV PRIVATE_KEY=$PRIVATE_KEY
ENV RUNTIME_HASH=$RUNTIME_HASH

RUN apt-get update

# Install secp256k1
RUN apt-get install -y libsecp256k1-dev

# Temporarily run the beta client with the persistent feature working
#RUN pip install aleph-client
RUN pip install 'git+https://github.com/aleph-im/aleph-client@hoh-durable-vms'

COPY entrypoint.sh /entrypoint.sh

COPY program ./program

RUN chmod +x ./program/run.sh

# Copy rootfs.squashfs file
#COPY $FS_PATH ./rootfs.squashfs

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
