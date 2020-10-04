const prompts = require("prompts");
const {initial} = require("./questions");
const {updateChain} = require("./updateChain");
const {addChain} = require("./addChain");
const {fetchConfig} = require("./helpers");
const {deployChain} = require("./deployChain");

(async function() {
    let loadedConfig = false;
    
    /**
     * interface config {
            [key: string]: chain[];
        }
        interface chain {
            url: String;
            networkId: Number;
            contracts: {
                address: String;
                name: String;
            }[];
            numRelayers: Number;
            relayerThreshold: Number;
            relayerAddresses: String[];
            bridgeOpts: {
                fee: Number;
                expiry: Number;
                chainId: Number;
            };
        }
     */
    let config = {};

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
        case "quit":
            process.exit(0);
    }
})();