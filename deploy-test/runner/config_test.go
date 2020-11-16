package runner

import (
	"encoding/json"
	"io/ioutil"
	"math/big"
	"os"
	"testing"

	"github.com/ChainSafe/ChainBridge/keystore"
	"github.com/ethereum/go-ethereum/common"
	"github.com/stretchr/testify/require"
)

var exampleEthAddr = common.HexToAddress("0xD0c63e1f2E89B1316053De242456AC56eF2B9A0D")
var exampleRId = "0x0000000000000000000000D0c63e1f2E89B1316053De242456AC56eF2B9A0D"
var AliceEthKp = keystore.TestKeyRing.EthereumKeys[keystore.AliceKey]
var AliceSubKp = keystore.TestKeyRing.SubstrateKeys[keystore.AliceKey]

var exampleConfig = Config{
	Source: ChainCfg{
		PrivateKey: AliceEthKp.CommonAddress().String(),
		Type:       "ethereum",
		Endpoint:   "http://localhost:8545",
		ChainId:    0,
		Bridge:     exampleEthAddr,
		Erc20:      exampleEthAddr,
	},
	Destination: ChainCfg{
		PrivateKey: AliceSubKp.AsKeyringPair().URI,
		Type:       "substrate",
		Endpoint:   "http://localhost:9944",
		ChainId:    1,
	},
	Tests: []Test{
		{
			Type:       "fungible",
			Recipient:  AliceSubKp.PublicKey(),
			Amount:     big.NewInt(100),
			ResourceId: exampleRId,
		},
	},
}

func createTempConfig(t *testing.T) string {
	tmpFile, err := ioutil.TempFile(os.TempDir(), "*.json")
	if err != nil {
		t.Fatal(err)
	}
	err = json.NewEncoder(tmpFile).Encode(exampleConfig)
	if err != nil {
		t.Fatal(err)
	}

	return tmpFile.Name()
}

func TestLoadConfig(t *testing.T) {
	path := createTempConfig(t)

	result, err := LoadConfig(path)
	if err != nil {
		t.Fatal(err)
	}

	require.Equal(t, &exampleConfig, result)
}
