#!/usr/bin/env bash
# Copyright 2020 ChainSafe Systems
# SPDX-License-Identifier: LGPL-3.0-only

CMD=cb-sol-cli

ERC721_HANDLER="0x3f709398808af36ADBA86ACC617FeB7F5B7B193E"
ERC721_RESOURCE_ID="0x0000000000000000000000d7E33e1bbf65dC001A0Eb1552613106CD7e40C3100"
ERC721_CONTRACT="0xd7E33e1bbf65dC001A0Eb1552613106CD7e40C31"

GAS_LIMIT=6721975
GAS_PRICE=20000000000

NEW_RELAYER="0x8cED5ad0d8dA4Ec211C17355Ed3DBFEC4Cf0E5b9"
NEW_ADMIN="0x55f511f91eE0D3368Bd6C2A7A8c1f4E685595b56"

set -eux

$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE deploy --all --erc20Symbol "TKN" --erc20Name "token  token"
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE deploy --centAsset
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE deploy --wetc

$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc20 mint --amount 100
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc20 add-minter
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE bridge register-resource
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE bridge query-resource
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE bridge set-burn
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc20 approve --amount 100
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc20 allowance
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc20 deposit --amount 100
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc20 balance
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc20 data-hash --amount 100
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE bridge query-proposal

$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc721 mint --id 0x1
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc721 add-minter
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE bridge register-resource --handler $ERC721_HANDLER --resourceId $ERC721_RESOURCE_ID --targetContract $ERC721_CONTRACT
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc721 approve --id 0x1
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE bridge set-burn --handler $ERC721_HANDLER --tokenContract $ERC721_CONTRACT
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc721 deposit --id 0x1
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc721 data-hash --id 0x1 --metadata "0x1234"

$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE bridge register-generic-resource --execute "store(bytes32)" --hash
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE cent getHash

$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE admin is-relayer
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE admin add-relayer --relayer $NEW_RELAYER
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE admin remove-relayer --relayer $NEW_RELAYER
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE admin add-admin --admin $NEW_ADMIN
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE admin remove-admin --admin $NEW_ADMIN
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE admin set-threshold --threshold 3
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE admin pause
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE admin unpause
$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE admin set-fee --fee 1

$CMD --gasLimit $GAS_LIMIT --gasPrice $GAS_PRICE erc20 wetc-deposit --amount 1