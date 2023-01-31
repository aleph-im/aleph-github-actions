#!/bin/sh

ls -lah

if [ ! -z ${INPUT_DOCKER_COMPOSE_URL+x} ]; then
  wget -O docker-compose.yml $INPUT_DOCKER_COMPOSE_URL
  mv docker-compose.yml /app/runtime/program/docker-compose.yml
  #mv docker-compose.yml ./program/docker-compose.yml
fi

if [ ! -z ${INPUT_ENV_URL+x} ]; then
  wget -O .env $INPUT_ENV_URL
  mv .env /app/runtime/program/.env
  #mv .env ./program/.env
fi

# COPY runtime file
cp -vap /github/workspace/$INPUT_RUNTIME_FILENAME /app/runtime/$INPUT_RUNTIME_FILENAME

python3 /app/runtime/publish.py $INPUT_RUNTIME_FILENAME $INPUT_PRIVATE_KEY
#python3 ./publish.py $INPUT_RUNTIME_FILENAME $INPUT_PRIVATE_KEY


