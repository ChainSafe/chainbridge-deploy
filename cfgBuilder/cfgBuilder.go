// Copyright 2020 ChainSafe Systems
// SPDX-License-Identifier: LGPL-3.0-only

package main

import (
	"encoding/json"
	"fmt"
	"math/big"
	"os"
	"path/filepath"

	log "github.com/ChainSafe/log15"
)

type RawConfig struct {
	RelayerThreshold string           `json:"relayerThreshold"`
	EthChains        []EthChainConfig `json:"ethChains"`
	SubChains        []SubChainConfig `json:"subChains"`
}

type Config struct {
	RelayerThreshold *big.Int
	Relayers         []string
	EthChains        []EthChainConfig
	SubChains        []SubChainConfig
}

// Identical to config.RawChainConfig, but uses struct for opts to get desired output formatting
type RawChainConfig struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Id       string `json:"id"`       // ChainID
	Endpoint string `json:"endpoint"` // url for rpc endpoint
	From     string `json:"from"`     // address of key to use
	Opts     Opts   `json:"opts"`
}

// Replicates config.Config
type RootConfig struct {
	Chains []RawChainConfig
}

type Opts struct {
	BridgeAddress  string `json:"bridge,omitempty"`
	Erc20Handler   string `json:"erc20Handler,omitempty"`
	Erc721Handler  string `json:"erc721Handler,omitempty"`
	GenericHandler string `json:"genericHandler,omitempty"`
	GasLimit       string `json:"gasLimit,omitempty"`
	MaxGasPrice    string `json:"maxGasPrice,omitempty"`
	GasMultiplier  string `json:"gasMultiplier,omitempty"`
	StartBlock     string `json:"startBlock"`
	Http           string `json:"http,omitempty"`
}

type EthChainConfig struct {
	Name           string   `json:"name"`
	ChainId        string   `json:"chainId"`
	Endpoint       string   `json:"endpoint"`
	BridgeAddress  string   `json:"bridge"`
	Erc20Handler   string   `json:"erc20Handler"`
	Erc721Handler  string   `json:"erc721Handler"`
	GenericHandler string   `json:"genericHandler"`
	GasLimit       string   `json:"gasLimit"`
	MaxGasPrice    string   `json:"maxGasPrice"`
	GasMultiplier  string   `json:"gasMultiplier"`
	StartBlock     string   `json:"startBlock"`
	Http           string   `json:"http"`
	Relayers       []string `json:"relayers"`
}

type SubChainConfig struct {
	Name       string   `json:"name"`
	ChainId    string   `json:"chainId"`
	Endpoint   string   `json:"endpoint"`
	StartBlock string   `json:"startBlock"`
	Relayers   []string `json:"relayers"`
}

func (c *RootConfig) ToJSON(file string) *os.File {
	var (
		newFile *os.File
		err     error
	)

	var raw []byte
	if raw, err = json.MarshalIndent(*c, "", "\t"); err != nil {
		log.Warn("error marshalling json", "err", err)
		os.Exit(1)
	}

	newFile, err = os.Create(file)
	if err != nil {
		log.Warn("error creating config file", "err", err)
	}
	_, err = newFile.Write(raw)
	if err != nil {
		log.Warn("error writing to config file", "err", err)
	}

	if err := newFile.Close(); err != nil {
		log.Warn("error closing file", "err", err)
	}
	return newFile
}

func constructEthChainConfig(cfg EthChainConfig, relayer string) RawChainConfig {
	return RawChainConfig{
		Name:     cfg.Name,
		Type:     "ethereum",
		From:     relayer,
		Id:       cfg.ChainId,
		Endpoint: cfg.Endpoint,
		Opts: Opts{
			BridgeAddress:  cfg.BridgeAddress,
			Erc20Handler:   cfg.Erc20Handler,
			Erc721Handler:  cfg.Erc721Handler,
			GenericHandler: cfg.GenericHandler,
			GasLimit:       cfg.GasLimit,
			MaxGasPrice:    cfg.MaxGasPrice,
			GasMultiplier:  cfg.GasMultiplier,
			StartBlock:     cfg.StartBlock,
			Http:           cfg.Http,
		},
	}
}

func constructSubChainConfig(cfg SubChainConfig, relayer string) RawChainConfig {
	return RawChainConfig{
		Name:     cfg.Name,
		Type:     "substrate",
		From:     relayer,
		Id:       cfg.ChainId,
		Endpoint: cfg.Endpoint,
		Opts: Opts{
			StartBlock: cfg.StartBlock,
		},
	}
}

func parseRawConfig(raw *RawConfig) (*Config, error) {
	var res Config

	threshold, ok := big.NewInt(0).SetString(raw.RelayerThreshold, 10)
	if !ok {
		return nil, fmt.Errorf("failed to parse relayer threshold")
	}
	res.RelayerThreshold = threshold
	res.SubChains = raw.SubChains
	res.EthChains = raw.EthChains
	return &res, nil

}

func ParseDeployConfig(path string) (*Config, error) {
	fp, err := filepath.Abs(path)
	if err != nil {
		return nil, err
	}
	f, err := os.Open(filepath.Clean(fp))
	if err != nil {
		return nil, err
	}

	var rawCfg RawConfig
	err = json.NewDecoder(f).Decode(&rawCfg)
	if err != nil {
		return nil, err
	}

	return parseRawConfig(&rawCfg)
}

// CreateRelayerConfigs takes a prepared config and constructs the configs for each relayer
func CreateRelayerConfigs(cfg *Config) ([]RootConfig, error) {
	var unsortedConfigs [][]RawChainConfig

	for _, chain := range cfg.EthChains {
		var cfgs []RawChainConfig
		for _, relayer := range chain.Relayers {
			cfgs = append(cfgs, constructEthChainConfig(chain, relayer))
		}

		unsortedConfigs = append(unsortedConfigs, cfgs)
	}

	for _, chain := range cfg.SubChains {
		var cfgs []RawChainConfig
		for _, relayer := range chain.Relayers {
			cfgs = append(cfgs, constructSubChainConfig(chain, relayer))
		}

		unsortedConfigs = append(unsortedConfigs, cfgs)
	}

	max := 0
	for _, cfg := range unsortedConfigs {
		if len(cfg) > max {
			max = len(cfg)
		}
	}

	configs := make([]RootConfig, max)

	for _, cfg := range unsortedConfigs {
		for i, rCfg := range cfg {
			configs[i].Chains = append(configs[i].Chains, rCfg)
		}
	}

	return configs, nil
}
