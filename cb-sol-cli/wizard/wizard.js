const prompts = require("prompts");
const {initial, deploy, ge} = require("./questions");
const {updateConfig, fetchConfig} = require("./helpers");

(async function() {
    let loadedConfig = false;

    let config = {
        contracts: [],
        numRelayers: null,
        relayerThreshold: null,
        relayerAddresses: [],
        bridgeOpts: {},
        chainOpts: {},
    };

    // Check if user wants to load from config
    const useConfig = (await prompts(initial.useConfig)).useConfig;
    if (useConfig) {
        config = fetchConfig();
        console.log("Recovered the following config file:");
        console.log(config);
        const update = (await prompts(initial.updateConfig)).updateConfig;
        if (!update) {
            console.log("Exiting the setup wizard!")
            process.exit(1);
        }
        loadedConfig = true;
    }

    // Prompt user for chain config
    config.chainOpts = await prompts(initial.chainOpts);

    // Prompt user for deployments
    config.contracts = (await prompts(deploy.contracts)).contracts;

    // Get bridge contract specific configuration
    if (config.contracts.includes("bridge")) {
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
    updateConfig(config);
})();