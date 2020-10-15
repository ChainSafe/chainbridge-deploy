const prompts = require("prompts");
const {initial} = require("./questions");
const {updateChain} = require("./updateChain");
const {addChain} = require("./addChain");
const {fetchConfig} = require("./helpers");
const {deployChain} = require("./deployChain");
const {handlerSetup} = require("./handlerSetup");
const {deleteChain} = require("./deleteChain");

(async function() {
    const {action} = await prompts(initial.action);
    switch (action) {
        case "addChain":
            await addChain();
            break;
        case "updateChain":
            await updateChain();
            break;
        case "viewConfig":
            console.log(JSON.stringify(await fetchConfig(), null, 4));
            break;
        case "deployChain":
            await deployChain();
            break;
        case "deleteChain":
            await deleteChain();
        case "handlerSetup":
            await handlerSetup();
        case "quit":
            process.exit(0);
    }
})();