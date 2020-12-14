package runner

import (
	"fmt"
	"math/big"

	msg "github.com/ChainSafe/ChainBridge/message"
	"github.com/ChainSafe/chainbridge-deploy/deploy-test/ethereum"
	"github.com/ChainSafe/chainbridge-deploy/deploy-test/substrate"
	log "github.com/ChainSafe/log15"
)

type Chain interface {
	CreateFungibleDeposit(amount *big.Int, recipient string, rId msg.ResourceId, destId msg.ChainId) (msg.Nonce, error)
	VerifyFungibleProposal(amount *big.Int, recipient string, source msg.ChainId, nonce msg.Nonce) error
	WaitForBlock(block *big.Int) error
	Close()
}

type TestFailure struct {
	Err       error
	Iteration int
	Index     int
}

func Start(cfg *Config) ([]TestFailure, error) {
	// Initialize chains
	var err error
	if cfg.Source.Type == EthereumType {
		cfg.Source.Chain, err = ethereum.NewChain(cfg.Source.Endpoint, cfg.Source.PrivateKey, cfg.Source.Bridge, cfg.Source.Erc20, cfg.Source.Erc20Handler, log.New("chain", "source"))
	} else if cfg.Source.Type == SubstrateType {
		cfg.Source.Chain, err = substrate.NewChain(cfg.Source.Endpoint, cfg.Source.PrivateKey)
	} else {
		return nil, fmt.Errorf("unrecognized chain type: %s", cfg.Source.Type)
	}

	if err != nil {
		return nil, err
	}

	if cfg.Destination.Type == EthereumType {
		cfg.Destination.Chain, err = ethereum.NewChain(cfg.Destination.Endpoint, cfg.Source.PrivateKey, cfg.Destination.Bridge, cfg.Destination.Erc20, cfg.Destination.Erc20Handler, log.New("chain", "dest"))
	} else if cfg.Destination.Type == SubstrateType {
		cfg.Destination.Chain, err = substrate.NewChain(cfg.Destination.Endpoint, cfg.Source.PrivateKey)
	} else {
		return nil, fmt.Errorf("unrecognized chain type: %s", cfg.Source.Type)
	}

	if err != nil {
		return nil, err
	}

	var fails []TestFailure
	for iter := 0; iter < cfg.Iterations; iter++ {
		log.Info(fmt.Sprintf("Running iteration %d of %d", iter+1, cfg.Iterations))
		for i, t := range cfg.Tests {
			log.Info(fmt.Sprintf("Running test %d of %d", i+1, len(cfg.Tests)),
				"src", cfg.Source.ChainId, "dest", cfg.Destination.ChainId, "amount", t.Amount.String(), "recipient", t.Recipient)
			err := t.Run(cfg.Source, cfg.Destination)
			if err != nil {
				log.Error("Test failed", "err", err)
				fails = append(fails, TestFailure{Err: err, Iteration: iter, Index: i})
			} else {
				log.Info("Test passed.")
			}
		}
	}

	log.Info("Tests finished.")
	return fails, nil
}
