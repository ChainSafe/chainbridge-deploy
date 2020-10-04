const prompts = require("prompts");
const {generic, initial} = require("./questions");
const {fetchConfig, updateConfig, getChainsFromConfig} = require("./helpers");

async function deleteChain() {
    const config = fetchConfig();
    const chains = getChainsFromConfig(config);

    // Ask user which chain they want to update
    const {selectedChain} = await prompts(initial.selectChain(chains));

    // Confirm deletion
    const {verify} = await prompts(generic.verify("Are you sure you want to delete this chain?"));
    if (verify){
        delete config[selectedChain];
        updateConfig(config);
    }
}

module.exports = {
    deleteChain,
}