#!/usr/bin/env bash

set -eux

CONTRACTS="--bridge --erc20Handler --erc721Handler --genericHandler"

# Start geth nodes
docker-compose -f ./docker/docker-compose-2-geth.yml up -d -V

# Cleanup geth when scipt is terminated
trap "docker-compose -f ./docker/docker-compose-2-geth.yml down; exit" EXIT

# Deploy contracts
cb-sol-cli deploy $CONTRACTS --chainId 1
cb-sol-cli --url http://localhost:8546 deploy $CONTRACTS --chainId 2

# Start relayers
docker-compose -f ./docker/docker-compose-3-relayers.yml up -V
