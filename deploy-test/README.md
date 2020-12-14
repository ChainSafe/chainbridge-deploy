# Deployment Tester

This is a utility to automate the submission of transfers and verify their results.

## Building

Run `make build`.

## Running

`./build/deploy-test config.json`

## Config 

See [local.json](/local.json) for an example config.

A config file consists of these top-level elements.

`source` - the source chain definition

`destination` - the destination chain definition

`test` - an array of tests to run

`iterations` - the number of times to run the defined tests

