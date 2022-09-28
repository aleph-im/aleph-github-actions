#!/bin/bash

docker-compose -f /opt/docker-compose.yml up -e INDEXER=$1
