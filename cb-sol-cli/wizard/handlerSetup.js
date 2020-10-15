const prompts = require("prompts");
const ethers = require("ethers");
const { initial, generic } = require("./questions");
const { fetchConfig, getChainsFromConfig, updateConfig, unlockWallet } = require("./helpers")
const deploy = require("./questions/deploy");

async function handlerSetup(name) {
    const config = fetchConfig();
    const chains = getChainsFromConfig(config);

    // Ask user which chain they want to update
    const selectedChain = name ? name : (await prompts(initial.selectChain(chains))).selectedChain;
    const chain = config[selectedChain];

    // Prompt user for wallet
    // let {wallet, encryptedWallet} = await unlockWallet(chain.encryptedWallet);
    // chain.encryptedWallet = {};

    // Connect wallet to the provider
    const provider = new ethers.providers.JsonRpcProvider(chain.url, {
        // TODO Make chain.chainOpts the actual provider information
        chainId: chain.chainOpts.networkId
    });
    // wallet = wallet.connect(provider);

    // Filter out contracts to only include handlers
    const list = Object.keys(chain.contracts)
        .map(x => { return { title: x, value: x }})
        .filter(x => { return x.title.toLowerCase().includes("handler") });
    
    // Prompt user
    const {multiSelect} = await prompts(generic.multiselect("Please confirm which handlers you want to configure!", "", list));
    for (let i = 0; i < multiSelect.length; i++) {
        // const address = await deployContract(multiSelect[i], chain, wallet);
        if (!chain.contracts[multiSelect[i]].resourceIds) {
            chain.contracts[multiSelect[i]].resourceIds = [];
        }
        chain.contracts[multiSelect[i]].resourceIds.push({
            resourceId: "",
            resourceAddress: ""
        });
    }

    // Update config file
    config[selectedChain] = chain;
    updateConfig(config);
};

module.exports = {
    handlerSetup,
};
