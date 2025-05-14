#!/bin/bash

export COMPOSE_TLS_VERSION=TLSv1_2

COMPOSE_ARGS="-p funda-dev"

docker compose $COMPOSE_ARGS pull
docker compose $COMPOSE_ARGS build
docker compose $COMPOSE_ARGS up -d
