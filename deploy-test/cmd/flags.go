package main

import (
	"github.com/urfave/cli/v2"
)

var cliFlags = []cli.Flag{
	verbosityFlag,
}

var (
	verbosityFlag = &cli.StringFlag{
		Name:  "verbosity",
		Usage: "Specify log verbosity",
		Value: "info",
	}
)
