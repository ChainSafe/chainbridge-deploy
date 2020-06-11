# Config Builder

This is a simple CLI tool to help automate deployment of new relayers.

An input JSON config looks like this:

```json
{
  "relayerThreshold": "3",
  "ethChains": [
    {
      "name": "goerli",
      "chainId": "1",
      "endpoint": "http://localhost:8545",
      "bridge": "0x35542aC472082524e5D815763b2531dFf98Ac548",
      "erc20Handler": "0xF8eD8035856241900B23F230b5589f72678Aedfa",
      "erc721Handler": "0xAf65aEa42847bcb4897d3CF566Cd89248A196B17",
      "genericHandler": "0x30663188630403e7df0288B5Bd18c119A9Ef75ED",
      "gasLimit": "1000000",
      "gasPrice": "20000000",
      "startBlock": "0",
      "http": "false",
      "relayers": [
        "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
        "0x8e0a907331554AF72563Bd8D43051C2E64Be5d35",
        "0x24962717f8fA5BA3b931bACaF9ac03924EB475a0"
      ]
    },
    {
      "name": "kotti",
      "chainId": "2",
      "endpoint": "http://localhost:8546",
      "bridge": "0x35542aC472082524e5D815763b2531dFf98Ac548",
      "erc20Handler": "0xF8eD8035856241900B23F230b5589f72678Aedfa",
      "erc721Handler": "0xAf65aEa42847bcb4897d3CF566Cd89248A196B17",
      "genericHandler": "0x30663188630403e7df0288B5Bd18c119A9Ef75ED",
      "gasLimit": "1000000",
      "gasPrice": "20000000",
      "startBlock": "0",
      "http": "true",
      "relayers": [
        "0xff93B45308FD417dF303D6515aB04D9e89a750Ca",
        "0x8e0a907331554AF72563Bd8D43051C2E64Be5d35",
        "0x24962717f8fA5BA3b931bACaF9ac03924EB475a0"
      ]
    }
  ],
  "subChains": [
    {
      "name":       "gopher",
      "chainId":    "3",
      "endpoint":   "http://localhost:8546",
      "startBlock": "11",
      "relayers": [
        "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
        "5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y"
      ]
    }
  ]
}
```

This example would result in three configs, one for each relayer, with each containing the three provided chains.

## Build/Install

```
$ make build
```
OR
```
$ make install
```

## Usage
```
$ cfgBuilder <input-file> <output-path>
```