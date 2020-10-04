const prompts = require("prompts");
const {initial} = require("./questions");
const {updateConfig, fetchConfig, getChainsFromConfig} = require("./helpers");

async function updateChain() {
    const config = fetchConfig();
    const chains = getChainsFromConfig(config);

    // Ask user which chain they want to update
    const {selectedChain} = await prompts(initial.selectChain(chains));
    const chain = config[selectedChain];

    console.log("TODO Finish this")
} 

module.exports = {
    updateChain,
}