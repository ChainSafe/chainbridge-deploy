# cb-sol-cli Documentation

This CLI supports on-chain interactions with components of ChainBridge.

## Installation

Installation requires the ABI files from the contracts which will be fetched and built from the chainbridge-solidity repo.
```
$ make install
```

## Usage

The root command (`cb-sol-cli`) has some options:
```
--url <value>                 URL to connect to
--gasLimit <value>            Gas limit for transactions
--gasPrice <value>            Gas price for transactions
--networkId <value>	      Network id
```
\
The keypair used for interactions can be configured with:
```
--privateKey <value>           Private key to use
```
or
```
--jsonWallet <path>           Encrypted JSON wallet
--jsonWalletPassword <value>  Password for encrypted JSON wallet
```

There are multiple subcommands provided:

- [`deploy`](docs/deploy.md): Deploys contracts via RPC
- [`bridge`](docs/bridge.md): Interactions with the bridge contract such as registering resource IDs and handler addresses
- [`admin`](docs/admin.md): Interactions with the bridge contract for administering relayer set, relayer threshold, fees and more.
- [`erc20`](docs/erc20.md): Interactions with ERC20 contracts and handlers
- [`erc721`](docs/erc721.md): Interactions with ERC721 contracts and handler
- [`multisig`](docs/multisig.md): Interactions Multi-sig for administrating owners and threshold
