const prompts = require("prompts");
const { initial } = require("./questions");
const { fetchConfig, getChainsFromConfig } = require("./helpers")

async function deployChain() {
    const config = fetchConfig();
    const chains = getChainsFromConfig(config);

    // Ask user which chain they want to update
    const {selectedChain} = await prompts(initial.selectChain(chains));
    const chain = config[selectedChain];

    // TODO deploy based on contracts found in config.contracts
}

module.exports = {
    deployChain,
}