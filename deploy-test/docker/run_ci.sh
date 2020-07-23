#!/usr/bin/env bash

set -eux

CONTRACTS="--bridge --erc20Handler --erc721Handler --genericHandler"

# Start geth nodes
docker-compose -f ./docker/docker-compose-2-geth.yml up -d -V

# Deploy contracts
cb-sol-cli deploy $CONTRACTS
cb-sol-cli --url http://localhost:8546 deploy $CONTRACTS

# Start relayers
docker-compose -f ./docker/docker-compose-3-relayers.yml up -V -d
