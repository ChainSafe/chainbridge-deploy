# Admin Command

- [`is-relayer`](#is-relayer)
- [`add-relayer`](#add-relayer)
- [`remove-relayer`](#remove-relayer)
- [`set-threshold`](#set-threshold)
- [`pause`](#pause)
- [`unpause`](#unpause)
- [`set-fee`](#set-fee)
- [`withdraw`](#withdraw)
- [`add-admin`](#add-admin)
- [`remove-admin`](#remove-admin)
- [`transfer-funds`](#transfer-funds)

## `is-relayer`
Check if an address is registered as a relayer.

```
--relayer <value>   Address to check
--bridge <address>  Bridge contract address
```

## `renounce-admin`
Admin renounce and set a new admin"

```
--newAdmin <address> Address of new admin check
--bridge <address>   Bridge contract address
```

## `add-relayer`
Adds a new relayer.

```
--relayer <address>  Address of relayer
--bridge <address>   Bridge contract address
```

## `remove-relayer`
Removes a relayer.

```
--relayer <address>  Address of relayer
--bridge <address>   Bridge contract address
```

## `set-threshold`
Sets a new relayer vote threshold.

```
--bridge <address>   Bridge contract address
--threshold <value>  New relayer threshold
```

## `pause`
Pauses deposits and proposals.

```
--bridge <address>  Bridge contract address
```

## `unpause`
Unpause deposits and proposals.

```
--bridge <address>  Bridge contract address
```

## `set-fee`
Set a new fee.

```
--bridge <address>  Bridge contract address
--fee <value>       New fee (in wei)
```

## `withdraw`
Withdraw tokens from a handler contract.

```
--bridge <address>         Bridge contract address
--handler <address>        Handler contract address
--tokenContract <address>  ERC20 or ERC721 token contract address
--recipient <address>      Address to withdraw to
--amountOrId <value>       Token ID or amount to withdraw
```

## `add-admin`
Adds an admin

```
--admin <address>   Address of admin
--bridge <address>  Bridge contract address
```

## `remove-admin`
Removes an admin

```
--admin <address>   Address of admin
--bridge <address>  Bridge contract address
```

## `transfer-funds`
Transfers eth in the contract to the specified addresses

```
--bridge <address> Bridge contract address
--addrs <value>    Array of addresses to transfer amounts to
--amounts <value>  Array of amonuts to addrs
```

# Admin Command using Multi-sig

When the admin is a Gnosis Safe multi-sig contract all the commads should be executed using `--privateKey` of the multi-sig owner, adding the following parameters:

```
--networkType <value> Network Type [ethereum | avalannche] (default ethereum)
--network <value>     Network [testnet | mainnet] (default testnet)
--multiSig <value>    Address of Multi-sig which will act as bridge admin
--approve             Approve transaction hash
--execute             Execute transaction
--approvers <value>   Approvers addresses
```

Not setting `--approve` or `--execute` flag will get the transaction hash and data required by the multi-sig for approving or executing such action. [`example`](#example)

- [`safe-add-relayer`](#safe-add-relayer)
- [`safe-remove-relayer`](#safe-remove-relayer)
- [`safe-set-threshold`](#safe-set-threshold)
- [`safe-pause`](#safe-pause)
- [`safe-unpause`](#safe-unpause)
- [`safe-set-fee`](#safe-set-fee)
- [`safe-withdraw`](#safe-withdraw)
- [`safe-add-admin`](#safe-add-admin)
- [`safe-remove-admin`](#safe-remove-admin)
- [`safe-remove-admin`](#safe-transfer-funds)

## `safe-add-relayer`
Adds a new relayer.

```
--relayer <address>  Address of relayer
--bridge <address>   Bridge contract address
```

## `safe-remove-relayer`
Removes a relayer.

```
--relayer <address>  Address of relayer
--bridge <address>   Bridge contract address
```

## `safe-set-threshold`
Sets a new relayer vote threshold.

```
--bridge <address>   Bridge contract address
--threshold <value>  New relayer threshold
```

## `safe-pause`
Pauses deposits and proposals.

```
--bridge <address>  Bridge contract address
```

## `safe-unpause`
Unpause deposits and proposals.

```
--bridge <address>  Bridge contract address
```

## `safe-set-fee`
Set a new fee.

```
--bridge <address>  Bridge contract address
--fee <value>       New fee (in wei)
```

## `safe-withdraw`
Withdraw tokens from a handler contract.

```
--bridge <address>         Bridge contract address
--handler <address>        Handler contract address
--tokenContract <address>  ERC20 or ERC721 token contract address
--recipient <address>      Address to withdraw to
--amountOrId <value>       Token ID or amount to withdraw
```

## `safe-add-admin`
Adds an admin

```
--admin <address>   Address of admin
--bridge <address>  Bridge contract address
```

## `safe-remove-admin`
Removes an admin

```
--admin <address>   Address of admin
--bridge <address>  Bridge contract address
```

## `safe-transfer-funds`
Transfers eth in the contract to the specified addresses

```
--bridge <address> Bridge contract address
--addrs <value>    Array of addresses to transfer amounts to
--amounts <value>  Array of amonuts to addrs
```


### Example

Let say we are working in `Mainnet` `ethereum` side, the admin of BRIDGE is a MULTISIG with owners A, B and C and a threshold 2.

`C` wants to propose updating the `fee` to a value of 10, so it gets the transaction hash and data for making the proposal
```bash
cb-sol-cli --url RCP_URL --networkType ethereum --network mainnet --privateKey C_PK --gasPrice SOME_GAS_PRICE  admin safe-set-fee --bridge BRIDGE_ADDRESS --fee 10 --multiSig MULTISIG_ADDRESS
```
Reult:
```
transactionHash <THE HASH THAT NEEDS TO BE APPROVED>
txData {
  to: <'BRIDGE_ADDRESS'>,
  value: '0',
  data: <'SOME HEXA STRING'>,
  operation: 0,
  txGasEstimate: <SOME NUMBER>,
  baseGasEstimate: <SOME NUMBER>,
  transactionNonce: <BIGNUMBER REPRESENTING THE CURRENT MULTISIG NONCE WHICH WILL BE USES FOR EXECUTING THE TRANSACTION>
}
```


Since current multi-sig threshold is 2, at least 2 owners have to approve the transaction hash

`A` approves the transaction, but first it checks that it right

Get hash and data:
```bash
cb-sol-cli --url RCP_URL --networkType ethereum --network mainnet --privateKey A_PK --gasPrice SOME_GAS_PRICE  admin safe-set-fee --bridge BRIDGE_ADDRESS --fee 10 --multiSig MULTISIG_ADDRESS
```
Checks result:
```
transactionHash <SAME HASH PROPOSED BY C>
txData {
  SAME DATA PROPOSED BY C
}
```

Approves:
```bash
cb-sol-cli --url RCP_URL --networkType ethereum --network mainnet --privateKey A_PK --gasPrice SOME_GAS_PRICE  admin safe-set-fee --bridge BRIDGE_ADDRESS --fee 10 --multiSig MULTISIG_ADDRESS --approve
```

`B` approves the transaction

Approves:
```bash
cb-sol-cli --url RCP_URL --networkType ethereum --network mainnet --privateKey B_PK --gasPrice SOME_GAS_PRICE  admin safe-set-fee --bridge BRIDGE_ADDRESS --fee 10 --multiSig MULTISIG_ADDRESS --approve
```

`C` executes the transaction

Executes:
```bash
cb-sol-cli --url RCP_URL --networkType ethereum --network mainnet --privateKey PK_B --gasPrice SOME_GAS_PRICE  admin safe-set-fee --bridge BRIDGE_ADDRESS --fee 10 --multiSig MULTISIG_ADDRESS  --execute --approvers A_ADDRESS,B_ADDRESS
```
