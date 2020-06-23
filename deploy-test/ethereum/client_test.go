package ethereum

import (
	"context"
	"fmt"
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
	ethtypes "github.com/ethereum/go-ethereum/core/types"
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

// TODO: From chainbridge
// constructErc20ProposalData returns the bytes to construct a proposal suitable for Erc20
func constructErc20ProposalData(amount []byte, recipient []byte, rId msg.ResourceId) []byte {
	var data []byte
	// TODO: Remove once on v.0.0.2-alpha contracts
	data = append(data, rId[:]...)
	data = append(data, common.LeftPadBytes(amount, 32)...) // amount (uint256)

	recipientLen := big.NewInt(int64(len(recipient))).Bytes()
	data = append(data, common.LeftPadBytes(recipientLen, 32)...) // length of recipient (uint256)
	data = append(data, recipient...)                             // recipient ([]byte)
	return data
}

//TODO: From chainbridge, not used here  but should be exported and take ethclient.client
func watchEvent(client *utils.Client, bridge common.Address, subStr utils.EventSig) {
	fmt.Printf("Watching for event: %s\n", subStr)
	query := ethereum.FilterQuery{
		FromBlock: big.NewInt(0),
		Addresses: []common.Address{bridge},
		Topics: [][]common.Hash{
			{subStr.GetTopic()},
		},
	}

	ch := make(chan ethtypes.Log)
	sub, err := client.Client.SubscribeFilterLogs(context.Background(), query, ch)
	if err != nil {
		log.Error("Failed to subscribe to event", "event", subStr)
		return
	}
	defer sub.Unsubscribe()

	for {
		select {
		case evt := <-ch:
			fmt.Printf("%s (block: %d): %#v\n", subStr, evt.BlockNumber, evt.Topics)

		case err := <-sub.Err():
			if err != nil {
				log.Error("Subscription error", "event", subStr, "err", err)
				return
			}
		}
	}
}

func voteOnErc20Proposal(t *testing.T, client *utils.Client, bridge common.Address, srcId msg.ChainId, nonce msg.Nonce, rId msg.ResourceId, hash [32]byte) {
	bridgeInstance, err := Bridge.NewBridge(bridge, client.Client)
	if err != nil {
		t.Fatal(err)
	}

	err = client.LockNonceAndUpdate()
	if err != nil {
		t.Fatal(err)
	}

	tx, err := bridgeInstance.VoteProposal(client.Opts, uint8(srcId), uint64(nonce), rId, hash)
	if err != nil {
		t.Fatal(err)
	}

	client.UnlockNonce()

	err = utils.WaitForTx(client, tx)
	if err != nil {
		t.Fatal(err)
	}
}

func executeErc20Proposal(t *testing.T, client *utils.Client, bridge common.Address, srcId msg.ChainId, nonce msg.Nonce, data []byte) {
	bridgeInstance, err := Bridge.NewBridge(bridge, client.Client)
	if err != nil {
		t.Fatal(err)
	}

	err = client.LockNonceAndUpdate()
	if err != nil {
		t.Fatal(err)
	}

	tx, err := bridgeInstance.ExecuteProposal(client.Opts, uint8(srcId), uint64(nonce), data)
	if err != nil {
		t.Fatal(err)
	}

	client.UnlockNonce()

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
	contracts, err := utils.DeployContracts(testClient, uint8(destId), big.NewInt(1))
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
	srcId := msg.ChainId(0)
	destId := msg.ChainId(1)
	nonce := msg.Nonce(1)
	recipient := AliceKp.CommonAddress()

	// Deploy contracts
	testClient := ethtest.NewClient(t, TestEndpoint, AliceKp)
	contracts, err := utils.DeployContracts(testClient, uint8(destId), big.NewInt(1))
	if err != nil {
		t.Fatal(err)
	}

	// Setup contracts
	erc20Contract := ethtest.Erc20DeployMint(t, testClient, amount)
	ethtest.Erc20AddMinter(t, testClient, erc20Contract, contracts.ERC20HandlerAddress)
	rId := msg.ResourceIdFromSlice(append(common.LeftPadBytes(erc20Contract.Bytes(), 31), uint8(destId)))
	ethtest.RegisterResource(t, testClient, contracts.BridgeAddress, contracts.ERC20HandlerAddress, rId, erc20Contract)
	ethtest.SetBurnable(t, testClient, contracts.BridgeAddress, contracts.ERC20HandlerAddress, erc20Contract)
	// Create client
	client, err := NewClient(TestEndpoint, AlicePrivKey, contracts.BridgeAddress, erc20Contract, log.Root())
	if err != nil {
		t.Fatal(err)
	}
	go watchEvent(client.client, contracts.BridgeAddress, utils.ProposalCreated)
	startBlock, err := client.client.Client.BlockByNumber(context.Background(), nil)
	if err != nil {
		t.Fatal(err)
	}
	fmt.Println(startBlock.Number().String())

	// Create, vote, execute proposal
	data := constructErc20ProposalData(amount.Bytes(), recipient.Bytes(), rId)
	voteOnErc20Proposal(t, testClient, contracts.BridgeAddress, srcId, nonce, rId, utils.Hash(append(contracts.ERC20HandlerAddress.Bytes(), data...)))
	executeErc20Proposal(t, testClient, contracts.BridgeAddress, srcId, nonce, data)


	err = client.VerifyFungibleProposal(amount, recipient.Bytes(), srcId, nonce, startBlock.Number())
	if err != nil {
		t.Fatal(err)
	}
}