#!/bin/bash

export COMPOSE_TLS_VERSION=TLSv1_2

COMPOSE_ARGS="-p bkl"

docker-compose $COMPOSE_ARGS pull
docker-compose $COMPOSE_ARGS build --pull --no-cache
docker-compose $COMPOSE_ARGS up -d
