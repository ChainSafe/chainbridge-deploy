# Multisig Command

Multi-sig admin commads should be executed using `--privateKey` of the multi-sig owner, adding the following parameters:

```
--networkType <value> Network Type [ethereum | avalannche] (default ethereum)
--network <value>     Network [goerli | mainnet] (default goerli, not required for avalanche)
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


## safe-add-owner
Add a new multi-sig owner and change threshold

```
--owner <address>   New owner address
--threshold <value> New threshold
```

## safe-remove-owner
Remove an old multisig-owner and change threshold

```
--owner <address>   Old owner address
--threshold <value> New threshold
```

## safe-swap-owner
Swap multi-sig old owner with a new owner

```
--oldOwner <address> Old owner address
--newOwner <address> New owner address
```


## safe-change-threshold
Change multi-sig threshold

```
--threshold <value> New threshold
```

## safe-get-threshold
Get multi-sig threshold

## safe-get-owners
Get multi-sig owners

## safe-is-owner
Check if a given address is a multi-sig owner

```
--owner <address>  Owner address
```

### Example

Let say we are working in `Mainnet` `ethereum` side, there is a MULTISIG with owners A, B and C and a threshold 2.

`C` wants to propose add a new owner and threshold for the multi-sig so it gets the transaction hash and data for making the proposal
```bash
cb-sol-cli --url RPC_URL --networkType ethereum --network mainnet --privateKey C_PK --gasPrice SOME_GAS_PRICE multisig safe-add-owner --multiSig MULTISIG_ADDRESS --owner NEW_OWNER_ADDRESS --threshold NEW_THRESHOLD
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
cb-sol-cli --url RPC_URL --networkType ethereum --network mainnet --privateKey A_PK --gasPrice SOME_GAS_PRICE multisig safe-add-owner --multiSig MULTISIG_ADDRESS --owner NEW_OWNER_ADDRESS --threshold NEW_THRESHOLD
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
cb-sol-cli --url RPC_URL --networkType ethereum --network mainnet --privateKey A_PK --gasPrice SOME_GAS_PRICE multisig safe-add-owner --multiSig MULTISIG_ADDRESS --owner NEW_OWNER_ADDRESS --threshold NEW_THRESHOLD --approve
```

`B` approves the transaction

Approves:
```bash
cb-sol-cli --url RPC_URL --networkType ethereum --network mainnet --privateKey B_PK --gasPrice SOME_GAS_PRICE multisig safe-add-owner --multiSig MULTISIG_ADDRESS --owner NEW_OWNER_ADDRESS --threshold NEW_THRESHOLD --approve
```

`C` executes the transaction

Executes:
```bash
cb-sol-cli --url RPC_URL --networkType ethereum --network mainnet --privateKey C_PK --gasPrice SOME_GAS_PRICE multisig safe-add-owner --multiSig MULTISIG_ADDRESS --owner NEW_OWNER_ADDRESS --threshold NEW_THRESHOLD  --execute --approvers A_ADDRESS,B_ADDRESS
```
