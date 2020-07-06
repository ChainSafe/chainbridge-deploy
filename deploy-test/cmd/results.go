package main

import (
	"fmt"

	"github.com/ChainSafe/chainbridge-deploy/deploy-test/runner"
)

func printResults(cfg *runner.Config, errs []runner.TestFailure) {
	fmt.Printf("%+v\n", cfg)
	fmt.Printf("%+v\n", errs)
}