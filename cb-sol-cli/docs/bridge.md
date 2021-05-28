# Bridge Command

- [`register-resource`](#register-resource)
- [`register-generic-resource`](#register-generic-resource)
- [`set-burn`](#set-burn)
- [`cancel-proposal`](#cancel-proposal)
- [`query-proposal`](#query-proposal)
- [`query-resource`](#query-resouce)


## `register-resource`
Register a resource ID with a contract address for a handler.

```
  --bridge <address>          Bridge contract address
  --handler <address>         Handler address
  --targetContract <address>  Contract address to be registered
  --resourceId <address>      Resource ID to be registered
```

## `register-generic-resource`
Register a resource ID with a contract address for a generic handler.

>Note: The `--hash` flag can be used to avoid computing the function selector ahead of time.

```
  --bridge <address>          Bridge contract address
  --handler <address>         Handler contract address
  --targetContract <address>  Contract address to be registered
  --resourceId <address>      ResourceID to be registered
  --deposit <string>          Deposit function signature
  --execute <string>          Execute proposal function signature
  --hash                      Treat signature inputs as function prototype strings, hash and take the first 4 bytes
```

## `set-burn`
Set a token contract as mintable/burnable in a handler.

```
  --bridge <address>         Bridge contract address
  --handler <address>        ERC20 handler contract address
  --tokenContract <address>  Token contract to be registered
```

## `cancel-proposal`
Cancels an expired proposal.

```
  --bridge <address>      Bridge contract address
  --chainId <id>          Chain ID of proposal to cancel
  --depositNonce <value>  Deposit nonce of proposal to cancel
```

## `query-proposal`
Queries an inbound proposal.

```
  --bridge <address>      Bridge contract address
  --chainId <id>          Source chain ID of proposal
  --depositNonce <value>  Deposit nonce of proposal
  --dataHash <value>      Hash of proposal metadata
```

## `query-resouce`
Queries the contract address associated with the provided resource ID for a specific handler contract.

```
  --handler <address>     Handler contract address
  --resourceId <address>  ResourceID to query

```

# Bridge Command using Multi-sig

When the admin is a Gnosis Safe multi-sig contract all the commads should be executed using `--privateKey` of the multi-sig owner, adding the following parameters:

```
--networkType <value> Network Type [ethereum | avalannche] (default ethereum)
--network <value>     Network [testnet | mainnet] (default testnet)
--multiSig <value>    Address of Multi-sig which will act as bridge admin
--approve             Approve transaction hash
--execute             Execute transaction
--approvers <value>   Approvers addresses
```

Using not setting `--approve` or `--execute` flag will get the transaction hash and data required by the multi-sig for approving or executing such action

- [`safe-register-resource`](#safe-register-resource)
- [`safe-register-generic-resource`](#safe-register-generic-resource)
- [`safe-set-burn`](#safe-set-burn)
- [`safe-cancel-proposal`](#safe-cancel-proposal)

## `safe-register-resource`
Register a resource ID with a contract address for a handler.

```
  --bridge <address>          Bridge contract address
  --handler <address>         Handler address
  --targetContract <address>  Contract address to be registered
  --resourceId <address>      Resource ID to be registered
```

## `safe-register-generic-resource`
Register a resource ID with a contract address for a generic handler.

>Note: The `--hash` flag can be used to avoid computing the function selector ahead of time.

```
  --bridge <address>          Bridge contract address
  --handler <address>         Handler contract address
  --targetContract <address>  Contract address to be registered
  --resourceId <address>      ResourceID to be registered
  --depositSig <string>          Deposit function signature
  --executeSig <string>          Execute proposal function signature
  --hash                      Treat signature inputs as function prototype strings, hash and take the first 4 bytes
```

## `safe-set-burn`
Set a token contract as mintable/burnable in a handler.

```
  --bridge <address>         Bridge contract address
  --handler <address>        ERC20 handler contract address
  --tokenContract <address>  Token contract to be registered
```

## `safe-cancel-proposal`
Cancels an expired proposal.

```
  --bridge <address>      Bridge contract address
  --chainId <id>          Chain ID of proposal to cancel
  --depositNonce <value>  Deposit nonce of proposal to cancel
```
