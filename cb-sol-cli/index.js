#!/usr/bin/env node

const {Command} = require('commander');
const constants = require('./constants');
const commands = require('./cmd/index');

const program = new Command();
program.option('--url <value>', 'URL to connect to', "http://localhost:8545");
program.option('--privateKey <value>', 'Private key to use', constants.deployerPrivKey);
program.option('--jsonWallet <path>', '(Optional) Encrypted JSON wallet');
program.option('--jsonWalletPassword <value>', '(Optional) Password for encrypted JSON wallet');
program.option('--gasLimit <value>', "Gas limit for transactions", "8000000")
program.option('--gasPrice <value>', "Gas limit for transactions", "20000000")
program.option('--networkId <value>', "Network Id")

program.allowUnknownOption(false);

for (let cmd in commands) {
    program.addCommand(commands[cmd])
}

const run = async () => {
    try {
        await program.parseAsync(process.argv);
    } catch (e) {
        console.log({ e });
        process.exit(1)
    }
}


if (process.argv && process.argv.length <= 2) {
    program.outputHelp();
} else {
    run()
}