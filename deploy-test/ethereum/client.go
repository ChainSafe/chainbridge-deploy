package ethereum

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/ChainSafe/ChainBridge/bindings/Bridge"
	"github.com/ChainSafe/ChainBridge/crypto/secp256k1"
	msg "github.com/ChainSafe/ChainBridge/message"
	"github.com/ChainSafe/ChainBridge/shared/ethereum"
	log "github.com/ChainSafe/log15"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	ethtypes "github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
)

var EventTimeout = time.Second * 30
var BlockRetryInterval = time.Second * 3

// TODO: Should be in chainbridge
type EventSig string
func (es EventSig) GetTopic() common.Hash {
	return crypto.Keccak256Hash([]byte(es))
}
var Erc20TransferEvent EventSig = "Transfer(address,address,uint256)"

type Client struct {
	client *utils.Client
	bridge common.Address
	erc20  common.Address
	stop chan int
	log log.Logger
}

func NewClient(url string, privateKey string, bridge, erc20 common.Address, log log.Logger) (*Client, error) {
	kp, err := secp256k1.NewKeypairFromString(privateKey)
	if err != nil {
		return nil, err
	}

	client, err := utils.NewClient(url, kp)
	if err != nil {
		return nil, err
	}

	return &Client{
		client: client,
		bridge: bridge,
		erc20: erc20,
		log: log,
	}, nil
}

func (c *Client) GetBalance(addr string) (*big.Int, error) {
	return utils.Erc20GetBalance(c.client, c.erc20, common.HexToAddress(addr))
}

func (c *Client) CreateFungibleDeposit(amount *big.Int, recipient []byte, rId msg.ResourceId, destId msg.ChainId) (msg.Nonce, *big.Int, error) {
	data := utils.ConstructErc20DepositData(rId, recipient, amount)

	bridgeInstance, err := Bridge.NewBridge(c.bridge, c.client.Client)
	if err != nil {
		return 0, nil, err
	}

	err = c.client.LockNonceAndUpdate()
	if err != nil {
		return 0, nil, err
	}

	tx, err := bridgeInstance.Deposit(
		c.client.Opts,
		uint8(destId),
		rId,
		data,
	)

	c.client.UnlockNonce()

	if err != nil {
		return 0, nil, err
	}

	reciept, err := WaitForTx(c.client, tx)
	if err != nil {
		return 0, nil, err
	}

	nonce, err := c.parseDepositNonce(reciept)

	return nonce, reciept.BlockNumber, nil
}

func (c *Client) parseDepositNonce(receipt *ethtypes.Receipt) (msg.Nonce, error) {
	for _, r := range receipt.Logs {
		if r.Address != c.bridge {
			continue
		}

		if r.Topics[0] != utils.Deposit.GetTopic() {
			continue
		}

		return msg.Nonce(r.Topics[3].Big().Uint64()), nil
	}

	return 0, fmt.Errorf("deposit event not found for tx %s", receipt.TxHash.Hex())
}

func (c *Client) VerifyFungibleProposal(amount *big.Int, recipient []byte, source msg.ChainId, nonce msg.Nonce, startBlock *big.Int) error {
	// wait for proposal created event
	_, err := c.WaitForEvent(utils.ProposalCreated, startBlock, nonce, source)
	if err != nil {
		return err
	}
	// assert execution event
	tx, err := c.WaitForEvent(utils.ProposalFinalized, startBlock, nonce, source)
	if err != nil {
		return err
	}

	// confirm transfer event and params
	receipt, err := c.client.Client.TransactionReceipt(context.Background(), tx)
	if err != nil {
		return err
	}
	for _, evt := range receipt.Logs {
		if evt.Topics[0] == Erc20TransferEvent.GetTopic() {
			if isExpectedErc20Event(*evt, amount, recipient) {
				return nil
			}
		}
	}

	return fmt.Errorf("transfer event not found for tx %s", tx)

}

// TODO: Copied from e2e
func (c *Client) WaitForEvent(event utils.EventSig, startBlock *big.Int, nonce msg.Nonce, source msg.ChainId) (common.Hash, error) {
	query := ethereum.FilterQuery{
		FromBlock: startBlock,
		Addresses: []common.Address{c.bridge},
		Topics: [][]common.Hash{
			{event.GetTopic()},
		},
	}

	ch := make(chan ethtypes.Log)
	sub, err := c.client.Client.SubscribeFilterLogs(context.Background(), query, ch)
	if err != nil {
		return common.Hash{}, err
	}
	defer sub.Unsubscribe()
	timeout := time.After(EventTimeout)
	for {
		select {
		case evt := <-ch:
			if isExpectedEvent(evt, nonce, source) {
				log.Info("Got matching event, continuing...", "event", event, "topics", evt.Topics)
				return evt.TxHash, nil
			} else {
				log.Trace("Incorrect event params", "event", event, "topics", evt.Topics)
			}
		case err := <-sub.Err():
			if err != nil {
				return common.Hash{}, err
			}
		case <-timeout:
			return common.Hash{}, fmt.Errorf("test timed out waiting for event %s", event)
		}
	}
}

func isExpectedEvent(evt ethtypes.Log, expectedNonce msg.Nonce, expectedSourceId msg.ChainId) bool {
	sourceId := evt.Topics[1].Big()
	nonce := evt.Topics[3].Big()

	if nonce.Cmp(big.NewInt(int64(expectedNonce))) != 0 {
		return false
	}

	if sourceId.Cmp(big.NewInt(int64(expectedSourceId))) != 0 {
		return false
	}
	return true
}

func isExpectedErc20Event(evt ethtypes.Log, expectedAmount *big.Int, expectedRecipient []byte) bool {
	recipient := evt.Topics[2].Bytes()
	amount := evt.Topics[3].Big()

	if !bytes.Equal(recipient, expectedRecipient) {
		return false
	}

	if amount.Cmp(expectedAmount) != 0 {
		return false
	}

	return true
}

func (c *Client) Close() {
	c.client.Client.Close()
	close(c.stop)
}

// TODO: Update inside chainbridge instead of using here
func WaitForTx(client *utils.Client, tx *ethtypes.Transaction) (*ethtypes.Receipt, error) {
	retry := 10
	for retry > 0 {
		receipt, err := client.Client.TransactionReceipt(context.Background(), tx.Hash())
		if err != nil {
			retry--
			time.Sleep(time.Second * 1)
			continue
		}

		if receipt.Status != 1 {
			return nil, fmt.Errorf("transaction failed on chain")
		}
		return receipt, nil
	}
	return nil, fmt.Errorf("failed to wait for tx")
}

func (c *Client) WaitForBlock(block *big.Int) error {
	for {
		select {
		case <-c.stop:
			return errors.New("connection terminated")
		default:
			currBlock, err := c.client.Client.BlockByNumber(context.Background(), nil)
			if err != nil {
				return err
			}

			// Equal or greater than target
			if currBlock.Number().Cmp(block) >= 0 {
				return nil
			}
			c.log.Trace("Block not ready, waiting", "target", block, "current", currBlock)
			time.Sleep(BlockRetryInterval)
			continue
		}
	}
}
