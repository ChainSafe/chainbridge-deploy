package main

import (
	"errors"
	"os"

	"github.com/ChainSafe/chainbridge-deploy/deploy-test/runner"
	log "github.com/ChainSafe/log15"
	"github.com/urfave/cli/v2"
)


var app = cli.NewApp()

func init() {
	app.Action = run
	app.Copyright = "Copyright 2019 ChainSafe Systems Authors"
	app.Name = "deploy-test"
	app.Usage = "deploy-test [config]"
	app.EnableBashCompletion = true
}

func run(ctx *cli.Context) error {
	// Pares first argument for path
	if ctx.NArg() < 1 {
		log.Error("Please specify path to config json")
		os.Exit(1)
	}
	path := ctx.Args().Get(0)
	if path == "" {
		return errors.New("must provide path")
	}

	cfg, err := runner.LoadConfig(path)
	if err != nil {
		return err
	}

	res, err := runner.Start(cfg)
	if err != nil {
		return err
	}

	printResults(cfg, res)

	return nil
}

func main() {
	if err := app.Run(os.Args); err != nil {
		log.Error(err.Error())
		os.Exit(1)
	}
}