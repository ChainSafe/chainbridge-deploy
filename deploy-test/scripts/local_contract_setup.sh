#!/usr/bin/env bash

set -eux

ACCT="0xff93B45308FD417dF303D6515aB04D9e89a750Ca"

ETHA_URL="http://localhost:8545"
ETHB_URL="http://localhost:8546"

ERC20_RESOURCE_ID="0x00000000000000000000000021605f71845f372A9ed84253d2D024B7B10999f4"
ETHA_BRIDGE="0x62877dDCd49aD22f5eDfc6ac108e9a4b5D2bD88B"
ETHA_ERC20="0x21605f71845f372A9ed84253d2D024B7B10999f4"
ETHA_ERC20HANDLER="0x3167776db165D8eA0f51790CA2bbf44Db5105ADF"

ETHB_BRIDGE="0x62877dDCd49aD22f5eDfc6ac108e9a4b5D2bD88B"
ETHB_ERC20="0x21605f71845f372A9ed84253d2D024B7B10999f4"
ETHB_ERC20HANDLER="0x3167776db165D8eA0f51790CA2bbf44Db5105ADF"

cb-sol-cli --url $ETHA_URL deploy --erc20
cb-sol-cli --url $ETHB_URL deploy --erc20

cb-sol-cli --url $ETHA_URL bridge register-resource --bridge $ETHA_BRIDGE --handler $ETHA_ERC20HANDLER --resourceId $ERC20_RESOURCE_ID --targetContract $ETHA_ERC20
cb-sol-cli --url $ETHB_URL bridge register-resource --bridge $ETHB_BRIDGE --handler $ETHB_ERC20HANDLER --resourceId $ERC20_RESOURCE_ID --targetContract $ETHB_ERC20

cb-sol-cli --url $ETHA_URL bridge set-burn --bridge $ETHA_BRIDGE --handler $ETHA_ERC20HANDLER --tokenContract $ETHA_ERC20
cb-sol-cli --url $ETHB_URL bridge set-burn --bridge $ETHB_BRIDGE --handler $ETHB_ERC20HANDLER --tokenContract $ETHB_ERC20

cb-sol-cli --url $ETHA_URL erc20 add-minter --erc20Address $ETHA_ERC20 --minter $ACCT
cb-sol-cli --url $ETHB_URL erc20 add-minter --erc20Address $ETHB_ERC20 --minter $ACCT
cb-sol-cli --url $ETHA_URL erc20 add-minter --erc20Address $ETHB_ERC20 --minter $ETHA_ERC20HANDLER
cb-sol-cli --url $ETHB_URL erc20 add-minter --erc20Address $ETHB_ERC20 --minter $ETHB_ERC20HANDLER

cb-sol-cli --url $ETHA_URL erc20 mint --amount 100000 --erc20Address $ETHA_ERC20
cb-sol-cli --url $ETHB_URL erc20 mint --amount 100000 --erc20Address $ETHB_ERC20

