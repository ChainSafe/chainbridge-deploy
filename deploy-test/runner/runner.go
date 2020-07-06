package runner

import (
	"fmt"
	"math/big"

	msg "github.com/ChainSafe/ChainBridge/message"
	"github.com/ChainSafe/chainbridge-deploy/deploy-test/ethereum"
	"github.com/ChainSafe/chainbridge-deploy/deploy-test/substrate"
	log "github.com/ChainSafe/log15"
)

type Client interface {
	CreateFungibleDeposit(amount *big.Int, recipient string, rId msg.ResourceId, destId msg.ChainId) (msg.Nonce, *big.Int, error)
	VerifyFungibleProposal(amount *big.Int, recipient string, source msg.ChainId, nonce msg.Nonce, startBlock *big.Int) error
	WaitForBlock(block *big.Int) error
	Close()
}

type TestFailure struct {
	err   error
	index int
}

func Start(cfg *Config) ([]TestFailure, error) {
	// Initialize clients
	var err error
	if cfg.Source.Type == EthereumType {
		cfg.Source.Client, err = ethereum.NewClient(cfg.Source.Endpoint, cfg.Source.PrivateKey, cfg.Source.Bridge, cfg.Source.Erc20, log.New("chain", "source"))
	} else if cfg.Source.Type == SubstrateType {
		cfg.Source.Client, err = substrate.NewClient(cfg.Source.Endpoint, cfg.Source.PrivateKey)
	} else {
		return nil, fmt.Errorf("unrecognized chain type: %s", cfg.Source.Type)
	}

	if err != nil {
		return nil, err
	}

	if cfg.Destination.Type == EthereumType {
		cfg.Destination.Client, err = ethereum.NewClient(cfg.Destination.Endpoint, cfg.Source.PrivateKey, cfg.Destination.Bridge, cfg.Destination.Erc20, log.New("chain", "dest"))
	} else if cfg.Destination.Type == SubstrateType {
		cfg.Destination.Client, err = substrate.NewClient(cfg.Destination.Endpoint, cfg.Source.PrivateKey)
	} else {
		return nil, fmt.Errorf("unrecognized chain type: %s", cfg.Source.Type)
	}

	if err != nil {
		return nil, err
	}

	var fails []TestFailure
	for i, t := range cfg.Tests {
		err := t.Run(cfg.Source, cfg.Destination)
		if err != nil {
			log.Error("Test failed", "err", err)
			fails = append(fails, TestFailure{err: err, index: i})
		}
	}

	return fails, nil
}
