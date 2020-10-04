const prompts = require("prompts");
const ethers = require("ethers");
const { initial, generic } = require("./questions");
const { fetchConfig, getChainsFromConfig, updateConfig, unlockWallet } = require("./helpers")
const {deployBridgeContract, deployERC20Handler, deployERC721Handler, deployGenericHandler, deployERC721, deployERC20, deployCentrifugeAssetStore} = require("../cmd/deploy");

async function deployChain(name, deployAll = true) {
    const config = fetchConfig();
    const chains = getChainsFromConfig(config);

    // Ask user which chain they want to update
    const selectedChain = name ? name : (await prompts(initial.selectChain(chains))).selectedChain;
    const chain = config[selectedChain];

    // Prompt user for wallet
    let {wallet, encryptedWallet} = await unlockWallet(chain.encryptedWallet);
    chain.encryptedWallet = encryptedWallet;

    // Connect wallet to the provider
    const provider = new ethers.providers.JsonRpcProvider(chain.url);
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

    if (deployAll) {

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

        // Deploy remaining contracts
        for (let contractName in chain.contracts) {
            if (contractName === "erc20Handler") {
                const contract = await deployERC20Handler({
                    wallet,
                    bridgeContract: chain.contracts.bridge.address
                })
                chain.contracts.erc20Handler.address = contract.address;
            }
            if (contractName === "erc721Handler") {
                const contract = await deployERC721Handler({
                    wallet,
                    bridgeContract: chain.contracts.bridge.address
                })
                chain.contracts.erc721Handler.address = contract.address;
            }
            if (contractName === "genericHandler") {
                const contract = await deployGenericHandler({
                    wallet,
                    bridgeContract: chain.contracts.bridge.address
                })
                chain.contracts.genericHandler.address = contract.address;
            }
            if (contractName === "erc20") {
                const contract = await deployERC20({wallet});
                chain.contracts.erc20.address = contract.address;
            }
            if (contractName === "erc721") {
                const contract = await deployERC721({wallet});
                chain.contracts.erc721.address = contract.address;
            }
            if (contractName === "centrifuge") {
                const contract = await deployCentrifugeAssetStore({wallet});
                chain.contracts.centrifuge.address = contract.address;
            }
        };
    } else {
        // todo implement
    }

    config[selectedChain] = chain;
    updateConfig(config);
}

module.exports = {
    deployChain,
}