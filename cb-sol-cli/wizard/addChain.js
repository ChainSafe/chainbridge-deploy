const prompts = require("prompts");
const {deployChain} = require("./deployChain");
const {updateConfig, fetchConfig} = require("./helpers");
const {deploy, initial} = require("./questions");
const generic = require("./questions/generic");

async function addChain() {
    const config = {
        contracts: {}
    };

    // Get the old config
    const oldConfig = fetchConfig() || {};

    // Get unique name for the chain
    const {name} = await prompts(initial.name(Object.keys(oldConfig)));

    // Prompt user for chain config
    config.chainOpts = await prompts(initial.chainOpts);

    // Prompt user for deployments
    (await prompts(deploy.contracts))
        .contracts
        .forEach(x => { config.contracts[x] = {address: ""}});

    // Get bridge contract specific configuration
    if (config.contracts.bridge) {
        config.bridgeOpts = await prompts(deploy.bridge);

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
    }

    // Save configuration file
    oldConfig[name] = config;
    updateConfig(oldConfig);

    // Ask if the user wishes to deploy this chain
    const { verify } = await prompts(generic.verify("Do you want to deploy this configuration?", ""));
    if (verify) {
        await deployChain(name);
    }
}

module.exports = {
    addChain,
}