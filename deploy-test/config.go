package main

import (
	msg "github.com/ChainSafe/ChainBridge/message"
	"github.com/ethereum/go-ethereum/common"
)

type ChainType string

var EthereumType ChainType = "ethereum"
var SubstrateType ChainType = "substrate"

type Config struct {
	PrivateKey  string
	Source      Chain
	Destination Chain
	Tests       []Test
}

type Chain struct {
	Type     ChainType
	Endpoint string
	ChainId  msg.ChainId
	Bridge   common.Address
	Erc20    common.Address
	Client   Client
}
