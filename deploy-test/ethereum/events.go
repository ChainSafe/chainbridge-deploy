package ethereum

import (
	"fmt"
	"math/big"

	msg "github.com/ChainSafe/ChainBridge/message"
	utils "github.com/ChainSafe/ChainBridge/shared/ethereum"
	"github.com/ethereum/go-ethereum/common"
	ethtypes "github.com/ethereum/go-ethereum/core/types"
)

var Erc20TransferEvent utils.EventSig = "Transfer(address,address,uint256)"

func isExpectedEvent(evt ethtypes.Log, expectedNonce msg.Nonce, expectedSourceId msg.ChainId, expectedStatus *big.Int) bool {
	sourceId := evt.Topics[1].Big()
	nonce := evt.Topics[2].Big()
	status := evt.Topics[3].Big()

	if nonce.Cmp(big.NewInt(int64(expectedNonce))) != 0 {
		return false
	}

	if sourceId.Cmp(big.NewInt(int64(expectedSourceId))) != 0 {
		return false
	}

	if status.Cmp(expectedStatus) != 0{
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