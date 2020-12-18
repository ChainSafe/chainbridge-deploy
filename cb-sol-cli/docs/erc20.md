# ERC20 Command

```
-d, decimals <number>          The number of decimal places for the erc20 token

```

- [`mint`](#mint)
- [`add-minter`](#add-minter)
- [`approve`](#approve)
- [`deposit`](#deposit)
- [`balance`](#balance)
- [`allowance`](#allowance)
- [`data-hash`](#data-hash)

## `mint`
Mint tokens on an ERC20 mintable contract.

```
  --amount <value>          Amount to mint
  --erc20Address <address>  ERC20 contract address
```
## `add-minter`
Add a minter to an ERC20 mintable contact

```
  --erc20Address <address>  ERC20 contract address
  --minter <address>        Minter address
```
## `approve`
Approve tokens in an ERC20 contract for transfer.

```
  --erc20Address <address>  ERC20 contract address
  --minter <address>        Minter address
```

## `deposit`
Initiate a transfer of ERC20 tokens.

```
  --amount <value>       Amount to transfer
  --dest <id>            Destination chain ID
  --recipient <address>  Destination recipient address
  --resourceId <id>      ResourceID for transfer
  --bridge <address>     Bridge contract address
```

## `balance`
Query balance for an account in an ERC20 contract.

```
  --address <address>       Address to query
  --erc20Address <address>  ERC20 contract address
```

## `allowance`
Get the allowance of a spender for an address

```
  --spender <address>       Address of spender
  --owner <address>         Address of token owner
  --erc20Address <address>  ERC20 contract address
```

## `wetc-depost`
Deposit ether into a WETC contract to mint tokens

```
  --amount <number>        Amount of ether to include in the deposit
  --wetcAddress <address>  ERC20 contract address
```

## `data-hash`
Constructs proposal data and returns the hash required for on-chain queries.

```
  --amount <value>       Amount to transfer
  --recipient <address>  Destination recipient address 
  --handler <address>    ERC20 handler  address
```