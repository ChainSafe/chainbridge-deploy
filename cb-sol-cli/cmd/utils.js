const assert = require('assert')
const ethers = require('ethers');
const fs = require('fs');
const SafeToolchain = require('@protofire/gnosis-safe-toolchain')
const constants = require('../constants');

const setupParentArgs = async (args, parent) => {
    args.url= parent.url
    if (!parent.networkId) {
        args.provider = new ethers.providers.JsonRpcProvider(args.url);
    } else {
        args.provider = new ethers.providers.JsonRpcProvider(args.url, {
            name: "custom",
            chainId: Number(parent.networkId)
        });
    }
    args.gasLimit = ethers.utils.hexlify(Number(parent.gasLimit))
    args.gasPrice = ethers.utils.hexlify(Number(parent.gasPrice))
    if (!parent.jsonWallet) {
        args.wallet = new ethers.Wallet(parent.privateKey, args.provider);
    } else {
        const raw = fs.readFileSync(parent.jsonWallet);
        const keyfile = JSON.parse(raw);
        args.wallet = await ethers.Wallet.fromEncryptedJson(keyfile, parent.jsonWalletPassword)
    }
}

const safeSetupParentArgs = async (args, parent) => {
    await setupParentArgs(args, parent)

    assert(typeof parent.networkType !== 'undefined', "Missing networkType")
    assert(['ethereum', 'avalanche'].includes(parent.networkType), "Wrong networkType")
    assert(['testnet', 'mainnet'].includes(parent.network), "Wrong network")

    let networkId = parent.networkType === 'ethereum' ? 1 : 'mainnet'
    if (parent.networkType === 'ethereum' && parent.network === 'testnet') {
        networkId = 5
    }

    if (parent.networkType === 'avalanche' && parent.network === 'testnet') {
        networkId = 'testnet'
    }

    args.safeToolchain = SafeToolchain({
        rpcUrl: args.url,
        walletPk: parent.privateKey,
        gasPrice: parent.gasPrice,
        networkType: parent.networkType,
        networkId: networkId,
        // logger: true
      })
}

const splitCommaList = (str) => {
    return str.split(",")
}

const getFunctionBytes = (sig) => {
    return ethers.utils.keccak256(ethers.utils.hexlify(ethers.utils.toUtf8Bytes(sig))).substr(0, 10)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const waitForTx = async (provider, hash) => {
    console.log(`Waiting for tx: ${hash}...`)
    while (!await provider.getTransactionReceipt(hash)) {
        sleep(5000)
    }
}

const expandDecimals = (amount, decimals = 18) => {
    return ethers.utils.parseUnits(String(amount), decimals);
}

const log = (args, msg) => console.log(`[${args.parent._name}/${args._name}] ${msg}`)

const safeTransactionAppoveExecute = async (args, functionName, params =[]) => {
    const { bridge, safeToolchain, multiSig, approve, provider, execute, approvers } = args
    const encodedFuntionData = SafeToolchain.util.encodeFunctionData(constants.ContractABIs.Bridge.abi, bridge, safeToolchain.wallet, functionName, params)

    const { transactionHash, txData} = await safeToolchain.commands.transactionData(multiSig, {
        to: bridge,
        value: '0',
        data: encodedFuntionData,
        operation: SafeToolchain.util.constants.CALL // CALL
    })

    console.log('transactionHash', transactionHash)
    console.log('txData', txData)

    // approve transaction
    if (approve) {
        const tx = await safeToolchain.commands.approveHash(multiSig, transactionHash)
        await waitForTx(provider, tx.hash)
    } else if (execute) {
        assert(approvers && approvers.length, 'Missing approvers')
        const tx = await safeToolchain.commands.executeTransaction(
            multiSig,
            {
                ...txData,
                approvers: approvers
            }
        )
        await waitForTx(provider, tx.hash)
    }
}

const { GETTING_MULTISIG_TRANSACTION, APPROVING_MULTISIG_TRANSACTION, EXECUTING_MULTISIG_TRANSACTION } = constants
const logSafe = (args, msg) => {
    const { approve, execute } = args
    const action = approve
        ? APPROVING_MULTISIG_TRANSACTION
        : execute
            ? EXECUTING_MULTISIG_TRANSACTION
            : GETTING_MULTISIG_TRANSACTION

    log(args, `${action}${msg}`)
}

module.exports = {
    setupParentArgs,
    safeSetupParentArgs,
    splitCommaList,
    getFunctionBytes,
    waitForTx,
    log,
    logSafe,
    expandDecimals,
    safeTransactionAppoveExecute
}
