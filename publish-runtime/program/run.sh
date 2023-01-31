#!/bin/bash

docker-compose -f /opt/code/docker-compose.yml --env-file /opt/code/.env up -d
