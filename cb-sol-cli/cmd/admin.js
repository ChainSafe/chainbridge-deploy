const ethers = require('ethers');
const constants = require('../constants');

const {Command} = require('commander');
const {setupParentArgs, safeSetupParentArgs, safeTransactionAppoveExecute, splitCommaList, waitForTx, log, logSafe} = require("./utils")

const isRelayerCmd = new Command("is-relayer")
    .description("Check if address is relayer")
    .option('--relayer <value>', 'Address to check', constants.relayerAddresses[0])
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .action(async function (args) {
            await setupParentArgs(args, args.parent.parent)
            const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

            let res = await bridgeInstance.isRelayer(args.relayer)
            console.log(`[${args._name}] Address ${args.relayer} ${res ? "is" : "is not"} a relayer.`)
    })

const isAdminCmd = new Command("is-admin")
  .description("Check if address is admin")
  .requiredOption('--admin <address>', 'Address of admin')
  .requiredOption('--bridge <address>', 'Bridge contract address')
  .action(async function (args) {
    await setupParentArgs(args, args.parent.parent)
    const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
    let res = await bridgeInstance.hasRole(constants.ADMIN_ROLE, args.admin)
    console.log(`[${args._name}] Address ${args.admin} ${res ? "is" : "is not"} a admin.`)
  })

const renounceAdminCmd = new Command("renounce-admin")
  .description("Admin renounce and set a new admin")
  .option('--newAdmin <address>', 'Address of new admin', constants.adminAddresses[0])
  .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
  .action(async function (args) {
    await setupParentArgs(args, args.parent.parent)
    const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
    log(args, `Adding ${args.newAdmin} as the new admin.`)
    let tx = await bridgeInstance.renounceAdmin(args.newAdmin)
    await waitForTx(args.provider, tx.hash)
  })

  const addAdminCmd = new Command("add-admin")
  .description("Adds an admin")
  .option('--admin <address>', 'Address of admin', constants.adminAddresses[0])
  .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
  .action(async function (args) {
    await setupParentArgs(args, args.parent.parent)
    const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
    log(args, `Adding ${args.admin} as a admin.`)
    let tx = await bridgeInstance.grantRole(constants.ADMIN_ROLE, args.admin)
    await waitForTx(args.provider, tx.hash)
  })

const safeAddAdminCmd = new Command("safe-add-admin")
  .description("Adds an admin")
  .option('--admin <address>', 'Address of admin', constants.adminAddresses[0])
  .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
  .requiredOption('--multiSig <value>', 'Address of Multi-sig which will act as bridge admin')
  .option('--approve', 'Approve transaction hash')
  .option('--execute', 'Execute transaction hash')
  .option('--approvers <value>', 'Approvers addresses', splitCommaList)
  .action(async function (args) {
    await safeSetupParentArgs(args, args.parent.parent)

    logSafe(args, `Adding ${args.admin} as a admin.`)

    await safeTransactionAppoveExecute(args, 'grantRole', [constants.ADMIN_ROLE, args.admin])
  })

const removeAdminCmd = new Command("remove-admin")
  .description("Removes an admin")
  .option('--admin <address>', 'Address of admin', constants.adminAddresses[0])
  .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
  .action(async function (args) {
    await setupParentArgs(args, args.parent.parent)
    const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
    log(args, `Removing ${args.admin} as a admin.`)
    let tx = await bridgeInstance.revokeRole(constants.ADMIN_ROLE, args.admin)
    await waitForTx(args.provider, tx.hash)
  })

const safeRemoveAdminCmd = new Command("safe-remove-admin")
  .description("Removes an admin")
  .option('--admin <address>', 'Address of admin', constants.adminAddresses[0])
  .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
  .requiredOption('--multiSig <value>', 'Address of Multi-sig which will act as bridge admin')
  .option('--approve', 'Approve transaction hash')
  .option('--execute', 'Execute transaction hash')
  .option('--approvers <value>', 'Approvers addresses', splitCommaList)
  .action(async function (args) {
    await safeSetupParentArgs(args, args.parent.parent)

    logSafe(args, `Removing ${args.admin} as a admin.`)

    await safeTransactionAppoveExecute(args, 'revokeRole', [constants.ADMIN_ROLE, args.admin])
  })

const addRelayerCmd = new Command("add-relayer")
    .description("Add a relayer")
    .option('--relayer <address>', 'Address of relayer', constants.relayerAddresses[0])
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args, `Adding ${args.relayer} as a relayer.`)
        let tx = await bridgeInstance.adminAddRelayer(args.relayer)
        await waitForTx(args.provider, tx.hash)
    })

const safeAddRelayerCmd = new Command("safe-add-relayer")
    .description("Add a relayer")
    .option('--relayer <address>', 'Address of relayer', constants.relayerAddresses[0])
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .requiredOption('--multiSig <value>', 'Address of Multi-sig which will act as bridge admin')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction hash')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async function (args) {
        await safeSetupParentArgs(args, args.parent.parent)

        logSafe(args, `Adding ${args.relayer} as a relayer.`)

        await safeTransactionAppoveExecute(args, 'adminAddRelayer', [args.relayer])
    })

const removeRelayerCmd = new Command("remove-relayer")
    .description("Remove a relayer")
    .option('--relayer <address>', 'Address of relayer', constants.relayerAddresses[0])
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args, `Removing relayer ${args.relayer}.`)
        let tx = await bridgeInstance.adminRemoveRelayer(args.relayer)
        await waitForTx(args.provider, tx.hash)
    })

const safeRemoveRelayerCmd = new Command("safe-remove-relayer")
    .description("Remove a relayer")
    .option('--relayer <address>', 'Address of relayer', constants.relayerAddresses[0])
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .requiredOption('--multiSig <value>', 'Address of Multi-sig which will act as bridge admin')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction hash')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async function (args) {
        await safeSetupParentArgs(args, args.parent.parent)

        logSafe(args, `Removing relayer ${args.relayer}.`)

        await safeTransactionAppoveExecute(args, 'adminRemoveRelayer', [args.relayer])
    })

const pauseTransfersCmd = new Command("pause")
    .description("Pause deposits and proposal on the bridge")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args, `Pausing deposits and proposals`)
        let tx = await bridgeInstance.adminPauseTransfers()
        await waitForTx(args.provider, tx.hash)
    })

const safePauseTransfersCmd = new Command("safe-pause")
    .description("Pause deposits and proposal on the bridge")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .requiredOption('--multiSig <value>', 'Address of Multi-sig which will act as bridge admin')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction hash')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async function (args) {
        await safeSetupParentArgs(args, args.parent.parent)

        logSafe(args, `Pausing deposits and proposals`)

        await safeTransactionAppoveExecute(args, 'adminPauseTransfers',[])
    })

const unpauseTransfersCmd = new Command("unpause")
    .description("Unpause deposits and proposals on the bridge")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args, `Unpausing deposits and proposals`)
        let tx = await bridgeInstance.adminUnpauseTransfers()
        await waitForTx(args.provider, tx.hash)
    })

const safeUnpauseTransfersCmd = new Command("safe-unpause")
    .description("Unpause deposits and proposals on the bridge")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .requiredOption('--multiSig <value>', 'Address of Multi-sig which will act as bridge admin')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction hash')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async function (args) {
        await safeSetupParentArgs(args, args.parent.parent)

        logSafe(args, `Unpausing deposits and proposals`)

        await safeTransactionAppoveExecute(args, 'adminUnpauseTransfers',[])
    })


const setThresholdCmd = new Command("set-threshold")
    .description("Set relayer threshold")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--threshold <value>', 'New relayer threshold', 3)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args, `Setting relayer threshold to ${args.threshold}`)
        let tx = await bridgeInstance.adminChangeRelayerThreshold(args.threshold)
        await waitForTx(args.provider, tx.hash)

    })
const safeSetThresholdCmd = new Command("safe-set-threshold")
    .description("Set relayer threshold")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--threshold <value>', 'New relayer threshold', 3)
    .requiredOption('--multiSig <value>', 'Address of Multi-sig which will act as bridge admin')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction hash')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async function (args) {
        await safeSetupParentArgs(args, args.parent.parent)

        logSafe(args, `Setting relayer threshold to ${args.threshold}`)

        await safeTransactionAppoveExecute(args, 'adminChangeRelayerThreshold',[args.threshold])
    })

const changeFeeCmd = new Command("set-fee")
    .description("Set a new fee for deposits")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--fee <value>', 'New fee (in wei)', 0)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args, `Setting fee to ${args.fee} wei`)
        let tx = await bridgeInstance.adminChangeFee(args.fee)
        await waitForTx(args.provider, tx.hash)
    })

const safeChangeFeeCmd = new Command("safe-set-fee")
    .description("Set a new fee for deposits")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--fee <value>', 'New fee (in wei)', 0)
    .requiredOption('--multiSig <value>', 'Address of Multi-sig which will act as bridge admin')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction hash')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async function (args) {
        await safeSetupParentArgs(args, args.parent.parent)

        logSafe(args, `Setting fee to ${args.fee} wei`)

        await safeTransactionAppoveExecute(args, 'adminChangeFee',[args.fee])
    })

const withdrawCmd = new Command("withdraw")
    .description("Withdraw funds collected from fees")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'Handler contract address', constants.ERC20_HANDLER_ADDRESS)
    .option('--tokenContract <address>', 'ERC20 or ERC721 token contract address', constants.ERC20_ADDRESS)
    .option('--recipient <address>', 'Address to withdraw to', constants.relayerAddresses[0])
    .option('--amountOrId <value>', 'Token ID or amount to withdraw', 1)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        log(args, `Withdrawing tokens (${args.amountOrId}) in contract ${args.tokenContract} to recipient ${args.recipient}`)
        let tx = await bridgeInstance.adminWithdraw(args.handler, args.tokenContract, args.recipient, args.amountOrId)
        await waitForTx(args.provider, tx.hash)
    })

const safeWithdrawCmd = new Command("safe-withdraw")
    .description("Withdraw funds collected from fees")
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .option('--handler <address>', 'Handler contract address', constants.ERC20_HANDLER_ADDRESS)
    .option('--tokenContract <address>', 'ERC20 or ERC721 token contract address', constants.ERC20_ADDRESS)
    .option('--recipient <address>', 'Address to withdraw to', constants.relayerAddresses[0])
    .option('--amountOrId <value>', 'Token ID or amount to withdraw', 1)
    .requiredOption('--multiSig <value>', 'Address of Multi-sig which will act as bridge admin')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction hash')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async function (args) {
        await safeSetupParentArgs(args, args.parent.parent)

        logSafe(args, `Withdrawing tokens (${args.amountOrId}) in contract ${args.tokenContract} to recipient ${args.recipient}`)

        await safeTransactionAppoveExecute(args, 'adminWithdraw',[args.handler, args.tokenContract, args.recipient, args.amountOrId])
    })

const adminCmd = new Command("admin")

adminCmd.addCommand(isRelayerCmd)
adminCmd.addCommand(isAdminCmd)
adminCmd.addCommand(addAdminCmd)
adminCmd.addCommand(safeAddAdminCmd)
adminCmd.addCommand(renounceAdminCmd)
adminCmd.addCommand(removeAdminCmd)
adminCmd.addCommand(safeRemoveAdminCmd)
adminCmd.addCommand(addRelayerCmd)
adminCmd.addCommand(safeAddRelayerCmd)
adminCmd.addCommand(removeRelayerCmd)
adminCmd.addCommand(safeRemoveRelayerCmd)
adminCmd.addCommand(setThresholdCmd)
adminCmd.addCommand(safeSetThresholdCmd)
adminCmd.addCommand(pauseTransfersCmd)
adminCmd.addCommand(safePauseTransfersCmd)
adminCmd.addCommand(unpauseTransfersCmd)
adminCmd.addCommand(safeUnpauseTransfersCmd)
adminCmd.addCommand(changeFeeCmd)
adminCmd.addCommand(safeChangeFeeCmd)
adminCmd.addCommand(withdrawCmd)
adminCmd.addCommand(safeWithdrawCmd)

module.exports = adminCmd
