FROM debian:stable

WORKDIR /app

RUN apt-get update

RUN apt-get install -y build-essential zlib1g-dev libncurses5-dev \
    libgdbm-dev libnss3-dev libssl-dev libsqlite3-dev libreadline-dev libffi-dev curl libbz2-dev \
    debootstrap squashfs-tools

# Install Python3
RUN apt-get install -y python3 python3-pip

COPY entrypoint.sh /app/entrypoint.sh

# Copy runtime files (TODO: add feature to get the last runtime version from git)
COPY runtime /app/runtime/

RUN chmod +x /app/runtime/create_disk_image.sh

ENTRYPOINT ["/app/entrypoint.sh"]
