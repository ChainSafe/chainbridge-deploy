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

# Admin Command using Multi-sig

When the admin is a Gnosis Safe multi-sig contract all the commads should be executed using `--privateKey` of the multi-sig owner, adding the following parameters:

```
--multiSig <value> Address of Multi-sig which will act as bridge admin
--approve Approve transaction hash
--execute Execute transaction
--approvers <value> Approvers addresses
```

Using not setting `--approve` or `--execute` flag will get the transaction hash and data required by the multi-sig for approving or executing such action

- [`safe-add-relayer`](#safe-add-relayer)
- [`safe-remove-relayer`](#safe-remove-relayer)
- [`safe-set-threshold`](#safe-set-threshold)
- [`safe-pause`](#safe-pause)
- [`safe-unpause`](#safe-unpause)
- [`safe-set-fee`](#safe-set-fee)
- [`safe-withdraw`](#safe-withdraw)
- [`safe-add-admin`](#safe-add-admin)
- [`safe-remove-admin`](#safe-remove-admin)

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
