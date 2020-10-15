const prompts = require("prompts");
const ethers = require("ethers");
const { initial, generic } = require("./questions");
const { fetchConfig, getChainsFromConfig, updateConfig, unlockWallet } = require("./helpers")
const {deployBridgeContract, deployERC20Handler, deployERC721Handler, deployGenericHandler, deployERC721, deployERC20, deployCentrifugeAssetStore} = require("../cmd/deploy");
const deploy = require("./questions/deploy");

async function deployChain(name = null, deployAll = false) {
    const config = fetchConfig();
    const chains = getChainsFromConfig(config);

    // Ask user which chain they want to update
    const selectedChain = name ? name : (await prompts(initial.selectChain(chains))).selectedChain;
    const chain = config[selectedChain];

    // Prompt user for wallet
    let {wallet, encryptedWallet} = await unlockWallet(chain.encryptedWallet);
    chain.encryptedWallet = encryptedWallet;

    // Connect wallet to the provider
    const provider = new ethers.providers.JsonRpcProvider(chain.url, {
        // TODO Make chain.chainOpts the actual provider information
        chainId: chain.chainOpts.networkId
    });
    wallet = wallet.connect(provider);

    let existsFlag = false;
    for (let contract in chain.contracts) {
        if (!existsFlag && chain.contracts[contract].address !== "") {
            const {verify} = await prompts(generic.verify(
                "Some contracts have already been set, are you sure you want to redeploy them?",
                ""
            ));
            if (!verify) {
                console.log("Exiting...");
                process.exit();
            }
            existsFlag = true;
        }
    }

    if (!existsFlag) console.log("Found no existing deployments, starting fresh!");

    // We always have to deploy the bridge contract first
    if (chain.contracts.bridge && !chain.contracts.bridge.address) {
        const contract = await deployBridgeContract({
            wallet,
            chainId: chain.bridgeOpts.chainId.toString(),
            relayers: chain.relayerAddresses,
            relayerThreshold: chain.relayerThreshold,
            fee: chain.bridgeOpts.fee,
            expiry: chain.bridgeOpts.expiry
        });
        chain.contracts.bridge.address = contract.address;
    }

    if (deployAll) {
        // Deploy remaining contracts
        for (let contractName in chain.contracts) {
            if (contractName !== "bridge") {
                chain.contracts[contractName].address = await deployContract(contractName, chain, wallet);
            };
        };
    } else {
        // Filter out bridge contract
        const list = Object.keys(chain.contracts)
            .map(x => { return { title: x, value: x }})
            .filter(x => { return x.title !== "bridge"});
    
        // Prompt user
        const {multiSelect} = await prompts(generic.multiselect("Please confirm which contracts you want to deploy!", "", list));
        for (let i = 0; i < multiSelect.length; i++) {
            const address = await deployContract(multiSelect[i], chain, wallet);
            chain.contracts[multiSelect[i]].address = address;
        }
    }
    config[selectedChain] = chain;
    updateConfig(config);

    // Ask if the user wishes to deploy this chain
    const { verify } = await prompts(generic.verify("Do you want to setup the handlers?", ""));
    if (verify) {
        await handlerSetup(name);
    }

}

async function deployContract(contractName, chain, wallet) {
    switch (contractName) {
        case "erc20Handler":
            console.log(contractName)
            let c = await deployERC20Handler({
                wallet,
                bridgeContract: chain.contracts.bridge.address
            })
            console.log(c.address)
            return c.address;
        case "erc721Handler":
            return (await deployERC721Handler({
                wallet,
                bridgeContract: chain.contracts.bridge.address
            })).address
        case "genericHandler":
            return (await deployGenericHandler({
                wallet,
                bridgeContract: chain.contracts.bridge.address
            })).address
        case "erc20":
            return (await deployERC20({wallet})).address;
        case "erc721":
            return (await deployERC721({wallet})).address;
        case "centrifuge":
            return (await deployCentrifugeAssetStore({wallet})).address;
    }
}

module.exports = {
    deployChain,
}