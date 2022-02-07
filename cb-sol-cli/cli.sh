#!/bin/bash -e

# Usage:
# 	* Deploy bridge + erc20Handler + erc20Token
#     ./cli.sh [ropsten | kovan | bsctestnet] deploy
#	  * collect the address to accounts.sh
#	* Configure Contract
#	  ./cli.sh [ropsten | kovan | bsctestnet] init
#	  * mint erc20 token to test account, approve to erc20Handler
#     * mint erc20 token to erc20Handler
#	  * register resourceID + erc20Token to bridge
#	* Make a deposit
#	  ./cli.sh [ropsten | kovan | bsctestnet] deposit [ropsten | kovan | bsctestnet] ${recipient}
# Example:
#	> ./cli.sh kovan deploy
#	> ./cli.sh bsctestnet deploy
#	> # fill the addresses to accounts.sh 
#	> ./cli.sh kovan init
#	> ./cli.sh bsctestnet init
#	> ./cli.sh kovan deposit bsctestnet ${recipient address}

source ./env.sh

export THRESHOLD=1
export GAS_PRICE=40000000000
export GAS_LIMIT=100000
export GAS_LIMIT_2=200000
export GAS_LIMIT_DEPLOY=4000000
if [[ "$AMOUNT" == "" ]]; then
	export AMOUNT=0.001
fi

function _to_list() {
	if [[ "$1" == "" ]]; then
		awk -F, '{for (i = 1; i<=NF; i++) print $i}'
	else 
		awk -F, '{for (i = 1; i<=NF; i++) print $i}' | head -n $1
	fi
}

function upper() {
	echo $1 | awk '{print toupper($0)}'
} 

function env_value() {
	eval echo '$'$1'_'$2
}

function _env() {
	network=$(upper $1)
	export CHAIN_ID=$(env_value CHAIN_ID $network)
	export DOMAIN_ID=$(env_value DOMAIN_ID $network)
	if [[ "$DOMAIN_ID" == "" ]]; then
		export DOMAIN_ID=$CHAIN_ID
	fi
	export NETWORK_NAME=$network
	export NETWORK_RPC=$(env_value NETWORK_RPC $network)
	export ERC20_SYMBOL=$TOKEN
	export ERC20_NAME=$(env_value ERC20_NAME $ERC20_SYMBOL)
	export ERC20_HANDLER=$(env_value ERC20_HANDLER $network)
	export RESOURCE_ID=$(env_value RESOURCE_ID $ERC20_SYMBOL)
	export ERC20_ADDR=$(env_value ERC20_ADDR_${ERC20_SYMBOL} $network)
	export BRIDGE_ADDR=$(env_value BRIDGE_ADDR $network)
	if [[ "$CHAIN_ID" == "" ]]; then
		echo "invalid network: $1" >&2
		exit 1
	fi
}

function _mint_erc20_one() {
	_PK=$1 _call erc20 mint --amount 100000 --erc20Address ${ERC20_ADDR} --recipient "$2"
}

function mint_erc20() {
	echo $TESTS | _to_list | while read to; do
		_mint_erc20_one ${DEPLOY_ACCOUNT_PRIVATE_KEY} $to
	done
}

function mint_erc20_to_handler() {
	_mint_erc20_one ${DEPLOY_ACCOUNT_PRIVATE_KEY} $ERC20_HANDLER
}

function _approve() {
	_PK=$1 _call erc20 approve --amount 1000000000 --erc20Address ${ERC20_ADDR} --recipient ${ERC20_HANDLER}
}

function approve() {
	echo $TESTS_PRIVATE_KEY | _to_list | while read pk; do
		_approve $pk
	done
}

function gen_config() {
	source ./config-tmpl.sh
	pk=$(echo $RELAYERS_PRIVATE_KEY | _to_list 1)
	_tmpl_header
	__comma=""
	echo $NETWORKS | _to_list | while read name; do 
		_env $name
		_tmpl_chain "$__comma" $pk
		if [[ "$__comma" == "" ]]; then
			__comma=,
		fi
	done
	_tmpl_footer
}

function add_resource() {
	_GL=${GAS_LIMIT_2} _call bridge register-resource --bridge ${BRIDGE_ADDR} --handler ${ERC20_HANDLER} --targetContract ${ERC20_ADDR} --resourceId ${RESOURCE_ID} 
}

function deploy() {
	if [[ "$DEPLOY_ACCOUNT_PRIVATE_KEY" == "" ]]; then
		echo "missing env DEPLOY_ACCOUNT_PRIVATE_KEY" >&2
		return 1
	fi
	_GL=${GAS_LIMIT_DEPLOY} _call deploy --bridge --erc20Handler --erc20 --chainId ${DOMAIN_ID} --relayerThreshold ${THRESHOLD} --relayers ${RELAYERS} --erc20Symbol ${ERC20_SYMBOL} --erc20Name ${ERC20_NAME}
}

function init() {
	echo 'mint erc20...'
	mint_erc20
	echo 'approve'
	approve
	echo 'mint to erc20 handler...'
	mint_erc20_to_handler
	echo 'add resource mapping'
	add_resource
}

function _call() {
	if [[ "$_PK" == "" ]]; then
		export _PK=${DEPLOY_ACCOUNT_PRIVATE_KEY}
	fi
	if [[ "$_GL" == "" ]]; then
		export _GL=${GAS_LIMIT}
	fi
	if [[ "$DEBUG" != "" ]]; then
		echo cb-sol-cli --privateKey $_PK --url ${NETWORK_RPC} --gasLimit $_GL --gasPrice ${GAS_PRICE} $@
	else
		cb-sol-cli --privateKey $_PK --url ${NETWORK_RPC} --gasLimit $_GL --gasPrice ${GAS_PRICE} $@
	fi
}

function withdraw() {
	recipient=$1
	amountOrId=$2
	if [[ "$amountOrId" == "" ]]; then
		echo "$0 $NETWORK_NAME withdraw \${recipient} \${amountOrId}"
		return 1
	fi
	_call admin withdraw --bridge ${BRIDGE_ADDR} --handler ${ERC20_HANDLER} --tokenContract ${ERC20_ADDR} --amountOrId $amountOrId --recipient $recipient
}

function deposit() {
	if [[ "$2" == "" ]]; then
		echo "usage $0"' deposit ${destNetworkName} ${recipient}' >&2
		return 1
	fi
	dest=$(env_value DOMAIN_ID $(upper $1))
	if [[ "$dest" == "" ]]; then
		dest=$(env_value CHAIN_ID $(upper $1))
	fi
	recipient=$2
	echo $TESTS_PRIVATE_KEY | _to_list 1 | while read pk; do
		_PK=$pk _GL=${GAS_LIMIT_2} _call erc20 deposit --resourceId ${RESOURCE_ID} --bridge ${BRIDGE_ADDR} --dest $dest --recipient $recipient --amount $AMOUNT
	done
}

if [[ "$1" == "" ]]; then
	echo "usage: $0 \$network" >&2
	exit 1
fi


_env $1
shift
$@
