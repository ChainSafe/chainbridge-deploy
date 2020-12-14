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

func verifyDepositEvent(t *testing.T, client *utils.Client, bridge common.Address, expectedNonce msg.Nonce) {
	query := ethereum.FilterQuery{
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

// TODO: REMOVE
// constructErc20ProposalData returns the bytes to construct a proposal suitable for Erc20
func constructErc20ProposalData(amount []byte, recipient []byte) []byte {
	var data []byte
	data = append(data, common.LeftPadBytes(amount, 32)...) // amount (uint256)

	recipientLen := big.NewInt(int64(len(recipient))).Bytes()
	data = append(data, common.LeftPadBytes(recipientLen, 32)...) // length of recipient (uint256)
	data = append(data, recipient...)                             // recipient ([]byte)
	return data
}

//TODO: REMOVE
func watchForProposalEvent(client *utils.Client, bridge common.Address) {
	query := ethereum.FilterQuery{
		FromBlock: big.NewInt(0),
		Addresses: []common.Address{bridge},
		Topics: [][]common.Hash{
			{utils.ProposalEvent.GetTopic()},
		},
	}

	ch := make(chan ethtypes.Log)
	sub, err := client.Client.SubscribeFilterLogs(context.Background(), query, ch)
	if err != nil {
		log.Error("Failed to subscribe to event", "event")
		return
	}
	defer sub.Unsubscribe()

	for {
		select {
		case evt := <-ch:
			fmt.Printf("(block: %d): %#v\n", evt.BlockNumber, evt.Topics)

		case err := <-sub.Err():
			if err != nil {
				log.Error("Subscription error", "event", "err", err)
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

func executeErc20Proposal(t *testing.T, client *utils.Client, bridge common.Address, srcId msg.ChainId, nonce msg.Nonce, data []byte, rId msg.ResourceId) {
	bridgeInstance, err := Bridge.NewBridge(bridge, client.Client)
	if err != nil {
		t.Fatal(err)
	}

	err = client.LockNonceAndUpdate()
	if err != nil {
		t.Fatal(err)
	}

	tx, err := bridgeInstance.ExecuteProposal(client.Opts, uint8(srcId), uint64(nonce), data, rId)
	if err != nil {
		t.Fatal(err)
	}

	client.UnlockNonce()

	err = utils.WaitForTx(client, tx)
	if err != nil {
		t.Fatal(err)
	}
}

func TestChain_CreateFungibleDeposit(t *testing.T) {
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
	client, err := NewChain(TestEndpoint, AlicePrivKey, contracts.BridgeAddress, erc20Contract, contracts.ERC20HandlerAddress, log.Root())
	if err != nil {
		t.Fatal(err)
	}
	// Create deposit

	nonce, err := client.CreateFungibleDeposit(amount, AliceKp.CommonAddress().Hex(), rId, destId)
	if err != nil {
		t.Fatal(err)
	}

	// Verify deposit
	verifyDepositEvent(t, testClient, contracts.BridgeAddress, nonce)
}

func TestChain_VerifyFungibleProposal(t *testing.T) {
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
	client, err := NewChain(TestEndpoint, AlicePrivKey, contracts.BridgeAddress, erc20Contract, contracts.ERC20HandlerAddress, log.Root())
	if err != nil {
		t.Fatal(err)
	}
	go watchForProposalEvent(client.ethClient, contracts.BridgeAddress)
	_, err = client.ethClient.Client.BlockByNumber(context.Background(), nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create, vote, execute proposal
	data := constructErc20ProposalData(amount.Bytes(), recipient.Bytes())
	voteOnErc20Proposal(t, testClient, contracts.BridgeAddress, srcId, nonce, rId, utils.Hash(append(contracts.ERC20HandlerAddress.Bytes(), data...)))
	executeErc20Proposal(t, testClient, contracts.BridgeAddress, srcId, nonce, data, rId)

	err = client.VerifyFungibleProposal(amount, recipient.String(), srcId, nonce)
	if err != nil {
		t.Fatal(err)
	}
}
