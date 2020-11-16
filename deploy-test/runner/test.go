package runner

import (
	"fmt"
	"math/big"

	msg "github.com/ChainSafe/ChainBridge/message"
	log "github.com/ChainSafe/log15"
	"github.com/status-im/keycard-go/hexutils"
)

type TestType string

var FungibleTest TestType = "fungible"

type Test struct {
	Type       TestType `json:"type"`
	Recipient  string   `json:"recipient"`
	Amount     *big.Int `json:"amount"`
	ResourceId string   `json:"resourceId"`
}

func (t *Test) Run(source, dest ChainCfg) error {
	rId := msg.ResourceIdFromSlice(hexutils.HexToBytes(t.ResourceId))

	if t.Type == FungibleTest {
		log.Debug("Creating fungible deposit", "src", source.ChainId, "dest", dest.ChainId, "amount", t.Amount.String(), "recipient", t.Recipient)
		nonce, err := source.Chain.CreateFungibleDeposit(t.Amount, t.Recipient, rId, dest.ChainId)
		if err != nil {
			return err
		}

		log.Debug("Verifying fungible proposal", "src", source.ChainId, "dest", dest.ChainId, "amount", t.Amount.String(), "nonce", nonce)
		err = dest.Chain.VerifyFungibleProposal(t.Amount, t.Recipient, source.ChainId, nonce)
		if err != nil {
			return err
		}
	} else {
		return fmt.Errorf("unrecognized test type: %s", t.Type)
	}
	return nil
}
