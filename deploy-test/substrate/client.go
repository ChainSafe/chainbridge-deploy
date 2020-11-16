package substrate

import (
	"math/big"

	"github.com/ChainSafe/ChainBridge/crypto/sr25519"
	msg "github.com/ChainSafe/ChainBridge/message"
	utils "github.com/ChainSafe/ChainBridge/shared/substrate"
)

type Chain struct {
	client *utils.Client
}

func NewChain(url string, privateKey string) (*Chain, error) {

	kp, err := sr25519.NewKeypairFromSeed(privateKey)
	if err != nil {
		return nil, err
	}

	client, err := utils.CreateClient(kp.AsKeyringPair(), url)
	if err != nil {
		return nil, err
	}
	return &Chain{client: client}, nil
}

func (c *Chain) GetBalance(addr string) (*big.Int, error) {
	panic("not implemented")
}

func (c *Chain) CreateFungibleDeposit(amount *big.Int, recipient string, rId msg.ResourceId, destId msg.ChainId) (msg.Nonce, error) {
	panic("not implemented")
}

func (c *Chain) VerifyFungibleProposal(amount *big.Int, recipient string, source msg.ChainId, nonce msg.Nonce) error {
	panic("not implemented")
}

func (c *Chain) WaitForBlock(block *big.Int) error {
	panic("not implemented")
}

func (c *Chain) Close() {}
