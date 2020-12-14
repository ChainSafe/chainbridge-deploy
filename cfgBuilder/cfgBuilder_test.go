// Copyright 2020 ChainSafe Systems
// SPDX-License-Identifier: LGPL-3.0-only

package main

import (
	"encoding/json"
	"io/ioutil"
	"math/big"
	"os"
	"reflect"
	"testing"
)

const goerliEndpoint = "http://goerli.com"
const kottiEndpoint = "http://kotti.com"
const golangEndpoint = "https://golang.org/"

var EthAddr = "0xff93B45308FD417dF303D6515aB04D9e89a750Ca"
var SubAddr = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"

var BridgeAddress = "0x76F5c0Da89421dC43fA000bFC3a9a7841aA3a5F3"
var ERC20HandlerAddress = "0x9202584Ac2A5081C6d1F27d637d1DD1Fb2AEc6B7"
var ERC721HandlerAddress = "0xF171e935472148298A4Fe76628193B6C2020A08a"
var GenericHandlerAddress = "0x59105441977ecD9d805A4f5b060E34676F50F806"

var exampleEthOptsStruct = Opts{
	BridgeAddress:  BridgeAddress,
	Erc20Handler:   ERC20HandlerAddress,
	Erc721Handler:  ERC721HandlerAddress,
	GenericHandler: GenericHandlerAddress,
	GasLimit:       "100",
	MaxGasPrice:    "1000",
	GasMultiplier:  "1.3",
	StartBlock:     "10",
	Http:           "false",
}

var exampleSubOptsStruct = Opts{
	StartBlock: "11",
}

var exampleRawConfig = &RawConfig{
	RelayerThreshold: "3",
	EthChains: []EthChainConfig{
		{
			Name:           "goerli",
			ChainId:        "1",
			Endpoint:       goerliEndpoint,
			BridgeAddress:  BridgeAddress,
			Erc20Handler:   ERC20HandlerAddress,
			Erc721Handler:  ERC721HandlerAddress,
			GenericHandler: GenericHandlerAddress,
			GasLimit:       "100",
			MaxGasPrice:    "1000",
			GasMultiplier:  "1.3",
			StartBlock:     "10",
			Http:           "false",
			Relayers:       []string{EthAddr, EthAddr, EthAddr},
		},
		{
			Name:           "kotti",
			ChainId:        "2",
			Endpoint:       kottiEndpoint,
			BridgeAddress:  BridgeAddress,
			Erc20Handler:   ERC20HandlerAddress,
			Erc721Handler:  ERC721HandlerAddress,
			GenericHandler: GenericHandlerAddress,
			GasLimit:       "100",
			MaxGasPrice:    "1000",
			GasMultiplier:  "1.3",
			StartBlock:     "10",
			Http:           "false",
			Relayers:       []string{EthAddr, EthAddr, EthAddr},
		},
	},
	SubChains: []SubChainConfig{
		{
			Name:       "gopher",
			ChainId:    "3",
			Endpoint:   golangEndpoint,
			StartBlock: "11",
			Relayers:   []string{SubAddr, SubAddr, SubAddr},
		},
	},
}

var exampleConfig = &Config{
	RelayerThreshold: big.NewInt(3),
	EthChains: []EthChainConfig{
		{
			Name:           "goerli",
			ChainId:        "1",
			Endpoint:       goerliEndpoint,
			BridgeAddress:  BridgeAddress,
			Erc20Handler:   ERC20HandlerAddress,
			Erc721Handler:  ERC721HandlerAddress,
			GenericHandler: GenericHandlerAddress,
			GasLimit:       "100",
			MaxGasPrice:    "1000",
			GasMultiplier:  "1.3",
			StartBlock:     "10",
			Http:           "false",
			Relayers:       []string{EthAddr, EthAddr, EthAddr},
		},
		{
			Name:           "kotti",
			ChainId:        "2",
			Endpoint:       kottiEndpoint,
			BridgeAddress:  BridgeAddress,
			Erc20Handler:   ERC20HandlerAddress,
			Erc721Handler:  ERC721HandlerAddress,
			GenericHandler: GenericHandlerAddress,
			GasLimit:       "100",
			MaxGasPrice:    "1000",
			GasMultiplier:  "1.3",
			StartBlock:     "10",
			Http:           "false",
			Relayers:       []string{EthAddr, EthAddr, EthAddr},
		},
	},
	SubChains: []SubChainConfig{
		{
			Name:       "gopher",
			ChainId:    "3",
			Endpoint:   golangEndpoint,
			StartBlock: "11",
			Relayers:   []string{SubAddr, SubAddr, SubAddr},
		},
	},
}

func TestParseConfig(t *testing.T) {
	// Write to temp file
	f, err := ioutil.TempFile(os.TempDir(), "chainbridge")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(f.Name())
	err = json.NewEncoder(f).Encode(exampleRawConfig)
	if err != nil {
		t.Fatal(err)
	}

	// Parse
	result, err := ParseDeployConfig(f.Name())
	if err != nil {
		t.Fatal(err)
	}

	// Verify
	expected := exampleConfig
	if !reflect.DeepEqual(result, expected) {
		t.Fatalf("Mismatch.\n\tExpected: %#v\n\tGot:%#v", expected, result)
	}
}

func TestCreateRelayerConfigs(t *testing.T) {
	expected := []RootConfig{
		{
			Chains: []RawChainConfig{
				{
					Name:     "goerli",
					Type:     "ethereum",
					Id:       "1",
					Endpoint: goerliEndpoint,
					From:     EthAddr,
					Opts:     exampleEthOptsStruct,
				},
				{
					Name:     "kotti",
					Type:     "ethereum",
					Id:       "2",
					Endpoint: kottiEndpoint,
					From:     EthAddr,
					Opts:     exampleEthOptsStruct,
				},
				{
					Name:     "gopher",
					Type:     "substrate",
					Id:       "3",
					From:     SubAddr,
					Endpoint: golangEndpoint,
					Opts:     exampleSubOptsStruct,
				},
			},
		},
		{
			Chains: []RawChainConfig{
				{
					Name:     "goerli",
					Type:     "ethereum",
					Id:       "1",
					Endpoint: goerliEndpoint,
					From:     EthAddr,
					Opts:     exampleEthOptsStruct,
				},
				{
					Name:     "kotti",
					Type:     "ethereum",
					Id:       "2",
					Endpoint: kottiEndpoint,
					From:     EthAddr,
					Opts:     exampleEthOptsStruct,
				},
				{
					Name:     "gopher",
					Type:     "substrate",
					Id:       "3",
					From:     SubAddr,
					Endpoint: golangEndpoint,
					Opts:     exampleSubOptsStruct,
				},
			},
		},
		{
			Chains: []RawChainConfig{
				{
					Name:     "goerli",
					Type:     "ethereum",
					Id:       "1",
					Endpoint: goerliEndpoint,
					From:     EthAddr,
					Opts:     exampleEthOptsStruct,
				},
				{
					Name:     "kotti",
					Type:     "ethereum",
					Id:       "2",
					Endpoint: kottiEndpoint,
					From:     EthAddr,
					Opts:     exampleEthOptsStruct,
				},
				{
					Name:     "gopher",
					Type:     "substrate",
					Id:       "3",
					From:     SubAddr,
					Endpoint: golangEndpoint,
					Opts:     exampleSubOptsStruct,
				},
			},
		},
	}

	actual, err := CreateRelayerConfigs(exampleConfig)
	if err != nil {
		t.Fatal(err)
	}

	if len(expected) != len(actual) {
		t.Errorf("Incorrect number of relayer configs. Expected: %d Got: %d", len(expected), len(actual))
	}

	if !reflect.DeepEqual(expected, actual) {
		t.Fatalf("Mismatch.\n\tExpected: %#v\n\tGot:%#v", expected, actual)
	}
}
