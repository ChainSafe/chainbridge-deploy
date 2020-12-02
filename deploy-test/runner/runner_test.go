package runner

import (
	"math/big"
	"testing"

	msg "github.com/ChainSafe/ChainBridge/message"
	ethutils "github.com/ChainSafe/ChainBridge/shared/ethereum"
	ethtest "github.com/ChainSafe/ChainBridge/shared/ethereum/testing"
	"github.com/ChainSafe/chainbridge-deploy/deploy-test/docker"
	"github.com/ethereum/go-ethereum/common"
	"github.com/status-im/keycard-go/hexutils"
)

var EthAEndpoint = "ws://localhost:8545"
var EthBEndpoint = "ws://localhost:8546"

var ethRecipient = AliceEthKp.CommonAddress()
var transferAmount = big.NewInt(100)

func createEthEthConfig(ethABridge, ethAErc20, ethAErc20Handler, ethBBridge, ethBErc20, ethBErc20Handler common.Address, rId msg.ResourceId) *Config {
	return &Config{
		Source: ChainCfg{
			PrivateKey:   hexutils.BytesToHex(AliceEthKp.Encode()),
			Type:         "ethereum",
			Endpoint:     EthAEndpoint,
			ChainId:      1,
			Bridge:       ethABridge,
			Erc20:        ethAErc20,
			Erc20Handler: ethAErc20Handler,
		},
		Destination: ChainCfg{
			PrivateKey:   hexutils.BytesToHex(AliceEthKp.Encode()),
			Type:         "ethereum",
			Endpoint:     EthBEndpoint,
			ChainId:      2,
			Bridge:       ethBBridge,
			Erc20:        ethBErc20,
			Erc20Handler: ethBErc20Handler,
		},
		Tests: []Test{
			{
				Type:       FungibleTest,
				Recipient:  ethRecipient.Hex(),
				Amount:     transferAmount,
				ResourceId: hexutils.BytesToHex(rId[:]),
			},
		},
	}
}

func Test_RunnerEthEth(t *testing.T) {
	// Deploy contracts to both chains
	clientA, err := ethutils.NewClient(EthAEndpoint, AliceEthKp)
	if err != nil {
		t.Fatal(err)
	}

	erc20A := ethtest.Erc20DeployMint(t, clientA, transferAmount)
	rId := msg.ResourceIdFromSlice(append(common.LeftPadBytes(erc20A.Bytes(), 31), 0))
	ethtest.RegisterResource(t, clientA, docker.TestContracts.BridgeAddress, docker.TestContracts.ERC20HandlerAddress, rId, erc20A)

	clientB, err := ethutils.NewClient(EthBEndpoint, AliceEthKp)
	if err != nil {
		t.Fatal(err)
	}

	erc20B := ethtest.Erc20DeployMint(t, clientB, transferAmount)
	ethtest.Erc20AddMinter(t, clientB, erc20B, docker.TestContracts.ERC20HandlerAddress)
	ethtest.RegisterResource(t, clientB, docker.TestContracts.BridgeAddress, docker.TestContracts.ERC20HandlerAddress, rId, erc20B)
	ethtest.SetBurnable(t, clientB, docker.TestContracts.BridgeAddress, docker.TestContracts.ERC20HandlerAddress, erc20B)
	// Create config
	cfg := createEthEthConfig(docker.TestContracts.BridgeAddress, erc20A, docker.TestContracts.ERC20HandlerAddress, docker.TestContracts.BridgeAddress, erc20B, docker.TestContracts.ERC20HandlerAddress, rId)

	go ethtest.WatchEvent(clientA, docker.TestContracts.BridgeAddress, ethutils.Deposit)
	// Run Start()
	res, err := Start(cfg)
	if err != nil {
		t.Fatal(err)
	}

	if len(res) > 0 {
		t.Fatalf("runner reported failed test: %s", res[0].Err)
	}
}
