package runner

import (
	"encoding/json"
	"os"
	"path/filepath"

	msg "github.com/ChainSafe/ChainBridge/message"
	"github.com/ethereum/go-ethereum/common"
)

type ChainType string

var EthereumType ChainType = "ethereum"
var SubstrateType ChainType = "substrate"

type Config struct {
	Source      ChainCfg `json:"source"`
	Destination ChainCfg `json:"destination"`
	Tests       []Test   `json:"tests"`
	Iterations  int      `json:"iterations"`
}

type ChainCfg struct {
	PrivateKey string      `json:"privateKey"`
	Type       ChainType   `json:"type"`
	Endpoint   string      `json:"endpoint"`
	ChainId    msg.ChainId `json:"chainId"`
	// Optional ethereum fields
	Bridge       common.Address `json:"bridge"`
	Erc20        common.Address `json:"erc20"`
	Erc20Handler common.Address `json:"erc20Handler"`
	Chain        Chain
}

func LoadConfig(path string) (*Config, error) {
	fp, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}
	f, err := os.Open(filepath.Clean(fp))
	if err != nil {
		return nil, err
	}

	var cfg Config
	err = json.NewDecoder(f).Decode(&cfg)
	if err != nil {
		return nil, err
	}

	return &cfg, nil
}
