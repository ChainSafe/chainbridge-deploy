package main

import (
	"encoding/json"
	"fmt"

	"github.com/ChainSafe/chainbridge-deploy/deploy-test/runner"
)

func printResults(cfg *runner.Config, errs []runner.TestFailure) {
	numTests := len(cfg.Tests) * cfg.Iterations
	passed := numTests - len(errs)

	for _, e := range errs {
		test, _ := json.MarshalIndent(cfg.Tests[e.Index], "", "\t")

		fmt.Println("=== TEST FAILED ===")
		fmt.Println(string(test))
		fmt.Printf("Iteration: %d Error: %s\n", e.Iteration, e.Err)
	}
	fmt.Printf("Test Passed: %d Tests Failed: %d\n", passed, len(errs))
}
