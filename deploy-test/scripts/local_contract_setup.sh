#!/usr/bin/env bash

set -eux

ACCT="0xff93B45308FD417dF303D6515aB04D9e89a750Ca"

ETHA_URL="http://localhost:8545"
ETHB_URL="http://localhost:8546"

ERC20_RESOURCE_ID="0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00"
ETHA_BRIDGE="0x62877dDCd49aD22f5eDfc6ac108e9a4b5D2bD88B"
ETHA_ERC20="0x3f709398808af36ADBA86ACC617FeB7F5B7B193E"
ETHA_ERC20HANDLER="0x3167776db165D8eA0f51790CA2bbf44Db5105ADF"

ETHB_BRIDGE="0x62877dDCd49aD22f5eDfc6ac108e9a4b5D2bD88B"
ETHB_ERC20="0x3f709398808af36ADBA86ACC617FeB7F5B7B193E"
ETHB_ERC20HANDLER="0x3167776db165D8eA0f51790CA2bbf44Db5105ADF"

cb-sol-cli --url $ETHA_URL deploy --bridge --erc20Handler --erc20
cb-sol-cli --url $ETHB_URL deploy --bridge --erc20Handler --erc20

cb-sol-cli --url $ETHA_URL bridge register-resource --bridge $ETHA_BRIDGE --handler $ETHA_ERC20HANDLER --resourceId $ERC20_RESOURCE_ID --targetContract $ETHA_ERC20
cb-sol-cli --url $ETHB_URL bridge register-resource --bridge $ETHB_BRIDGE --handler $ETHB_ERC20HANDLER --resourceId $ERC20_RESOURCE_ID --targetContract $ETHB_ERC20

cb-sol-cli --url $ETHA_URL bridge set-burn --bridge $ETHA_BRIDGE --handler $ETHA_ERC20HANDLER --tokenContract $ETHA_ERC20
cb-sol-cli --url $ETHB_URL bridge set-burn --bridge $ETHB_BRIDGE --handler $ETHB_ERC20HANDLER --tokenContract $ETHB_ERC20

cb-sol-cli --url $ETHA_URL erc20 add-minter --erc20Address $ETHA_ERC20 --minter $ACCT
cb-sol-cli --url $ETHB_URL erc20 add-minter --erc20Address $ETHB_ERC20 --minter $ACCT

cb-sol-cli --url $ETHA_URL erc20 mint --amount 1000 --erc20Address $ETHA_ERC20
cb-sol-cli --url $ETHB_URL erc20 mint --amount 1000 --erc20Address $ETHB_ERC20