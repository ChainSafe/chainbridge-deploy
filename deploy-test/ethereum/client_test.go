package ethereum

import (
	"context"
	"math/big"
	"testing"

	"github.com/ChainSafe/ChainBridge/bindings/Bridge"
	"github.com/ChainSafe/ChainBridge/keystore"
	msg "github.com/ChainSafe/ChainBridge/message"
	utils "github.com/ChainSafe/ChainBridge/shared/ethereum"
	ethtest "github.com/ChainSafe/ChainBridge/shared/ethereum/testing"
	log "github.com/ChainSafe/log15"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/status-im/keycard-go/hexutils"
)

var TestEndpoint = "ws://localhost:8545"
var AliceKp = keystore.TestKeyRing.EthereumKeys[keystore.AliceKey]
var AlicePrivKey = hexutils.BytesToHex(AliceKp.Encode())

func verifyDepositEvent(t *testing.T, client *utils.Client, block *big.Int, bridge common.Address, expectedNonce msg.Nonce) {
	query := ethereum.FilterQuery{
		FromBlock: block,
		ToBlock: block,
		Addresses: []common.Address{bridge},
		Topics: [][]common.Hash{
			{utils.Deposit.GetTopic()},
		},
	}

	events, err := client.Client.FilterLogs(context.Background(), query)
	if err != nil {
		t.Fatal(err)
	}

	if len(events) > 1 {
		t.Error("multiple deposit events found")
	}

	nonce := events[0].Topics[3].Big().Uint64()

	if nonce != uint64(expectedNonce) {
		t.Fatalf("nonce mismatch. expected: %d got: %d", expectedNonce, nonce)
	}

}

func voteOnErc20Proposal(t *testing.T, client *utils.Client, bridge common.Address, srcId msg.ChainId, nonce msg.Nonce, rId msg.ResourceId) {
	bridgeInstance, err := Bridge.NewBridge(bridge, client.Client)
	if err != nil {
		t.Fatal(err)
	}

	tx, _ , err := bridgeInstance.VoteProposal(client.Opts, srcId, nonce, rId, hash)
	if err != nil {
		t.Fatal(err)
	}

	err = utils.WaitForTx(client, tx)
	if err != nil {
		t.Fatal(err)
	}
}

func TestClient_CreateFungibleDeposit(t *testing.T) {
	amount := big.NewInt(100)
	destId := msg.ChainId(1)

	// Deploy contracts
	testClient := ethtest.NewClient(t, TestEndpoint, AliceKp)
	contracts, err := utils.DeployContracts(testClient, 0, big.NewInt(1))
	if err != nil {
		t.Fatal(err)
	}

	// Setup contracts
	erc20Contract := ethtest.DeployMintApproveErc20(t, testClient, contracts.ERC20HandlerAddress, amount)
	rId := msg.ResourceIdFromSlice(append(common.LeftPadBytes(erc20Contract.Bytes(), 31), uint8(destId)))
	ethtest.RegisterResource(t, testClient, contracts.BridgeAddress, contracts.ERC20HandlerAddress, rId, erc20Contract)

	// Create client
	client, err := NewClient(TestEndpoint, AlicePrivKey, contracts.BridgeAddress, erc20Contract, log.Root())
	if err != nil {
		t.Fatal(err)
	}
	// Create deposit

	nonce, blockNum, err := client.CreateFungibleDeposit(amount, AliceKp.CommonAddress().Bytes(), rId, destId)
	if err != nil {
		t.Fatal(err)
	}

	// Verify deposit
	verifyDepositEvent(t, testClient, blockNum, contracts.BridgeAddress, nonce)
}

func TestClient_VerifyFungibleProposal(t *testing.T) {
	amount := big.NewInt(100)
	destId := msg.ChainId(1)

	// Deploy contracts
	testClient := ethtest.NewClient(t, TestEndpoint, AliceKp)
	contracts, err := utils.DeployContracts(testClient, 0, big.NewInt(1))
	if err != nil {
		t.Fatal(err)
	}

	// Setup contracts
	erc20Contract := ethtest.Erc20DeployMint(t, testClient, amount)
	ethtest.Erc20AddMinter(t, testClient, erc20Contract, contracts.ERC20HandlerAddress)
	rId := msg.ResourceIdFromSlice(append(common.LeftPadBytes(erc20Contract.Bytes(), 31), uint8(destId)))
	ethtest.RegisterResource(t, testClient, contracts.BridgeAddress, contracts.ERC20HandlerAddress, rId, erc20Contract)

	// Create client
	client, err := NewClient(TestEndpoint, AlicePrivKey, contracts.BridgeAddress, erc20Contract, log.Root())
	if err != nil {
		t.Fatal(err)
	}

	// Create, vote, execute proposal
	voteOnErc20Proposal(t, testClient, )



	err := client.VerifyFungibleProposal(amount, recipient, srcId, nonce, startBlock)
	if err != nil {
		t.Fatal(err)
	}


}