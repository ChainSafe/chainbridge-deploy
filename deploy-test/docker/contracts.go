package docker

import (
	ethutils "github.com/ChainSafe/ChainBridge/shared/ethereum"
	"github.com/ethereum/go-ethereum/common"
)

var TestContracts = ethutils.DeployedContracts{
	BridgeAddress:         common.HexToAddress("0x35542aC472082524e5D815763b2531dFf98Ac548"),
	ERC20HandlerAddress:   common.HexToAddress("0xF8eD8035856241900B23F230b5589f72678Aedfa"),
	ERC721HandlerAddress:  common.HexToAddress("0xAf65aEa42847bcb4897d3CF566Cd89248A196B17"),
	GenericHandlerAddress: common.HexToAddress("0x30663188630403e7df0288B5Bd18c119A9Ef75ED"),
}