const {Command} = require('commander');
const prompts = require("prompts");
const {initial, deploy} = require("./questions");

const promptCommand = new Command("prompt")
.description("An easy to use cli that wraps cb-sol-cli")
.action(async function(args) {
    const config = {
        useConfig: false,
        contracts: [],
        numRelayers: null,
        relayerThreshold: null,
        relayerAddresses: [],
    };

    // Check if user wants to load from config
    config.useConfig = (await prompts(initial.useConfig)).useConfig;
    if (config.useConfig) {
        console.log("TODO Load from config")
    }

    // // Prompt user for deployments
    config.contracts = (await prompts(deploy.contracts)).contracts;

    // Get bridge contract specific configuration
    if (config.contracts.includes("bridge")) {
        config.bridgeOpts = await prompts(deploy.bridge);
    }

    // Prompt user for number of relayers
    config.numRelayers = (await prompts(deploy.relayer.relayerNumber)).numRelayers;
    
    // Get the relayer threshold
    let whileFlag = true
    while (whileFlag) {
        const response = await prompts(deploy.relayer.relayerThreshold);
        if (response.relayerThreshold > config.numRelayers) {
            console.log("> Threshold must be less than or equal to the number of relayers!");
        } else {
            config.relayerThreshold = response.relayerThreshold;
            whileFlag = false;
        }
    }
    
    // Get the relayer addresses
    whileFlag = true
    while (whileFlag) {
        const {relayerAddresses} = await prompts(deploy.relayer.relayerAddresses);
        if (relayerAddresses.length !== config.numRelayers) {
             console.log(`> You entered ${relayerAddresses.length} addresses, you must enter a total of ${config.numRelayers}!`);
        } else {
            config.relayerAddresses = relayerAddresses;
            whileFlag = false;
        }
    }
    

    console.log(config)
});

module.exports = promptCommand;

// expiry
// fee
// chainId