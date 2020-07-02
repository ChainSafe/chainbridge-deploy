package substrate

import (
	"math/big"

	"github.com/ChainSafe/ChainBridge/crypto/sr25519"
	msg "github.com/ChainSafe/ChainBridge/message"
	utils "github.com/ChainSafe/ChainBridge/shared/substrate"
)

type Client struct {
	client *utils.Client
}

func NewClient(url string, privateKey string) (*Client, error) {

	kp, err := sr25519.NewKeypairFromSeed(privateKey)
	if err != nil {
		return nil, err
	}

	client, err := utils.CreateClient(kp.AsKeyringPair(), url)
	if err != nil {
		return nil, err
	}
	return &Client{client: client}, nil
}

func (c *Client) GetBalance(addr string) (*big.Int, error) {
	panic("not implemented")
}

func (c *Client) CreateFungibleDeposit(amount *big.Int, recipient string, rId msg.ResourceId, destId msg.ChainId) (msg.Nonce, *big.Int, error) {
	panic("not implemented")
}

func (c *Client) VerifyFungibleProposal(amount *big.Int, recipient string, source msg.ChainId, nonce msg.Nonce, startBlock *big.Int) error {
	panic("not implemented")
}

func (c *Client) WaitForBlock(block *big.Int) error {
	panic("not implemented")
}

func (c *Client) Close() {}
