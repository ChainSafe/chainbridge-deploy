package ethereum

import (
	"fmt"
	"math/big"

	msg "github.com/ChainSafe/ChainBridge/message"
	utils "github.com/ChainSafe/ChainBridge/shared/ethereum"
	log "github.com/ChainSafe/log15"
	"github.com/ethereum/go-ethereum/common"
	ethtypes "github.com/ethereum/go-ethereum/core/types"
)

var Erc20TransferEvent utils.EventSig = "Transfer(address,address,uint256)"

func isExpectedProposalEvent(evt ethtypes.Log, expectedNonce msg.Nonce, expectedSourceId msg.ChainId, expectedStatus *big.Int) bool {
	sourceId := evt.Topics[1].Big()
	nonce := evt.Topics[2].Big()
	status := evt.Topics[3].Big()

	if nonce.Cmp(big.NewInt(int64(expectedNonce))) != 0 {
		log.Trace("Ignoring proposal event, unexpected nonce", "expected", expectedNonce, "actual", nonce.String())
		return false
	}

	if sourceId.Cmp(big.NewInt(int64(expectedSourceId))) != 0 {
		log.Trace("Ignoring proposal event, unexpected source ID", "expected", expectedSourceId, "actual", sourceId.String())
		return false
	}

	if status.Cmp(expectedStatus) != 0 {
		log.Trace("Ignoring proposal event, unexpected status", "expected", expectedStatus, "actual", status.String())
		return false
	}
	return true
}

func isExpectedErc20Event(evt ethtypes.Log, expectedAmount *big.Int, expectedRecipient string) (bool, error) {
	recipient := common.BigToAddress(evt.Topics[2].Big()).Hex()
	if recipient != expectedRecipient {
		return false, fmt.Errorf("recipient does not match expected. Actual: %s, Expected: %s", recipient, expectedRecipient)
	}

	amount := big.NewInt(0).SetBytes(evt.Data)
	if amount.Cmp(expectedAmount) != 0 {
		return false, fmt.Errorf("amount does not match expected. Actual: %s, Expected: %s", amount.String(), expectedAmount.String())
	}

	return true, nil
}

func statusString(status uint64) string {
	if utils.ProposalStatus(status) == utils.Active {
		return "Active"
	}
	if utils.ProposalStatus(status) == utils.Passed {
		return "Passed"
	}
	if utils.ProposalStatus(status) == utils.Executed {
		return "Executed"
	}
	return fmt.Sprintf("unknown status: %d", status)
}
