package main

import (
	"fmt"
	"math/big"

	msg "github.com/ChainSafe/ChainBridge/message"
	log "github.com/ChainSafe/log15"
)

type TestType string

var FungibleTest TestType = "fungible"

type Test struct {
	Type       TestType
	Recipient  string
	Amount     *big.Int
	ResourceId msg.ResourceId

	// For ETH chains only
	Status *big.Int
	SourceContract      string
	DestinationContract string
}

func (t *Test) Run(source, dest Chain) error {
	if t.Type == FungibleTest {
		log.Info("Starting fungible test")
		nonce, block, err := source.Client.CreateFungibleDeposit(t.Amount, t.Recipient, t.ResourceId, dest.ChainId)
		if err != nil {
			return err
		}

		log.Info("Waiting for block", "target", block.String())
		err = source.Client.WaitForBlock(block)
		if err != nil {
			return err
		}

		log.Info("Verifying fungible proposal")
		err = dest.Client.VerifyFungibleProposal(t.Amount, t.Recipient, source.ChainId, nonce, block, )
		if err != nil {
			return err
		}
	} else {
		return fmt.Errorf("unrecognized test type: %s", t.Type)
	}
	return nil
}
