package runner

import (
	"math/big"
	"testing"

	msg "github.com/ChainSafe/ChainBridge/message"
	ethutils "github.com/ChainSafe/ChainBridge/shared/ethereum"
	ethtest "github.com/ChainSafe/ChainBridge/shared/ethereum/testing"
	"github.com/ethereum/go-ethereum/common"
	"github.com/status-im/keycard-go/hexutils"
)

var EthAEndpoint = "ws://localhost:8545"
var EthBEndpoint = "ws://localhost:8546"

var ethRecipient = AliceEthKp.CommonAddress()
var transferAmount = big.NewInt(100)

func createEthEthConfig(ethABridge, ethAErc20, ethBBridge, ethBErc20 common.Address, rId msg.ResourceId) *Config {
	return &Config{
		Source:      Chain{
			PrivateKey: hexutils.BytesToHex(AliceEthKp.Encode()),
			Type:       "ethereum",
			Endpoint:   EthAEndpoint,
			ChainId:    0,
			Bridge:     ethABridge,
			Erc20:      ethAErc20,
		},
		Destination: Chain{
			PrivateKey: hexutils.BytesToHex(AliceEthKp.Encode()),
			Type:       "ethereum",
			Endpoint:   EthBEndpoint,
			ChainId:    1,
			Bridge:     ethBBridge,
			Erc20:      ethBErc20,
		},
		Tests:       []Test{
			{
				Type:                FungibleTest,
				Recipient:           ethRecipient.Hex(),
				Amount:              transferAmount,
				ResourceId:          rId,
				SourceContract:      ethAErc20.Hex(),
				DestinationContract: ethBErc20.Hex(),
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

	contractsA, err := ethutils.DeployContracts(clientA,0, big.NewInt(1) )
	if err != nil {
		t.Fatal(err)
	}

	erc20A := ethtest.DeployMintApproveErc20(t, clientA, contractsA.ERC20HandlerAddress, transferAmount)
	ethtest.Erc20AddMinter(t, clientA, erc20A, contractsA.ERC20HandlerAddress)
	rId := msg.ResourceIdFromSlice(append(common.LeftPadBytes(erc20A.Bytes(), 31), 0))
	ethtest.RegisterResource(t, clientA, contractsA.BridgeAddress, contractsA.ERC20HandlerAddress, rId, erc20A)

	clientB, err := ethutils.NewClient(EthBEndpoint, AliceEthKp)
	if err != nil {
		t.Fatal(err)
	}

	contractsB, err := ethutils.DeployContracts(clientB,0, big.NewInt(1) )
	if err != nil {
		t.Fatal(err)
	}

	erc20B := ethtest.DeployMintApproveErc20(t, clientB, contractsB.ERC20HandlerAddress, transferAmount)
	ethtest.Erc20AddMinter(t, clientB, erc20B, contractsB.ERC20HandlerAddress)
	ethtest.RegisterResource(t, clientB, contractsB.BridgeAddress, contractsB.ERC20HandlerAddress, rId, erc20B)

	// Create config
	cfg := createEthEthConfig(contractsA.BridgeAddress, erc20A, contractsB.BridgeAddress, erc20B, rId)

	// Run Start()
	res, err := Start(cfg)
	if err != nil {
		t.Fatal(err)
	}

	if len(res) > 0 {
		t.Fatalf("runner reported failed test: %s", res[0].err)
	}
}