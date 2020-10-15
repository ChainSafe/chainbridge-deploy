const versionNumber = require("../package.json").version;
const homedir = require('os').homedir();
const { ethers } = require('ethers');
const {initial} = require("./questions");
const fs = require("fs");
const prompts = require('prompts');
const configDir = homedir + "/.cb-sol-cli/";
const configFilename = "config.json";
const configFullPath = configDir + configFilename;

async function unlockWallet(encryptedWallet = null) {
    if (!encryptedWallet) {
        const {path} = await prompts(initial.walletPath);
        try {
            const data = fs.readFileSync(path, 'utf-8');
            encryptedWallet = JSON.stringify(JSON.parse(data.toString()));
        } catch (e) {
            console.log(e)
            console.log("Couldn't find wallet!")
            process.exit();
        }
    }
    const {password} = await prompts(initial.walletPassword);
    try {
        const wallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password);
        return {wallet, encryptedWallet};
    } catch (e) {
        console.log("error", e);
        process.exit();
    }
}

function fetchConfig() {
    try {
        const data = fs.readFileSync(configFullPath, 'utf-8');
        return JSON.parse(data.toString());
    } catch (e) {
        console.log("Couldn't find config file!")
        return null;
    }
}

function updateConfig(config) {
    const jsonConfig = JSON.stringify(config, null, 4);
    try {
        if (!fs.existsSync(configDir)){
            fs.mkdirSync(configDir);
            // If first time config exists, append version number for future migrations
            config.version = versionNumber;
        }
        // TODO handle versioning
        fs.writeFileSync(configFullPath, jsonConfig);
        console.log(`Saved configuration file to ${configFullPath}!`);
    } catch (e) {
        console.log(e);
    }
}

function getChainsFromConfig(config) {
    return Object.keys(config).map(x => {return {title: x, value: x }});
}

module.exports = {
    fetchConfig,
    updateConfig,
    getChainsFromConfig,
    unlockWallet,
}