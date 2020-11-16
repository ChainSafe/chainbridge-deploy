package main

import (
	"errors"
	"os"
	"strconv"

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
	app.Flags = cliFlags
}

func startLogger(ctx *cli.Context) error {
	logger := log.Root()
	handler := logger.GetHandler()
	var lvl log.Lvl

	if lvlToInt, err := strconv.Atoi(ctx.String(verbosityFlag.Name)); err == nil {
		lvl = log.Lvl(lvlToInt)
	} else if lvl, err = log.LvlFromString(ctx.String(verbosityFlag.Name)); err != nil {
		return err
	}
	log.Root().SetHandler(log.LvlFilterHandler(lvl, handler))

	return nil
}

func run(ctx *cli.Context) error {
	err := startLogger(ctx)
	if err != nil {
		return err
	}
	// Pares first argument for path
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
