const assert = require('assert')
const { Command } = require('commander');
const { safeSetupParentArgs, splitCommaList, waitForTx } = require("./utils")

const addOwnerWithThresholdCmd = new Command('safe-add-owner')
    .description('Add a new multi-sig owner and change threshold')
    .requiredOption('--multiSig <address>', 'Address of Multi-sig')
    .option('--owner <address>', 'New owner address')
    .option('--threshold <value>', 'New threshold')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async (args) => {
      await safeSetupParentArgs(args, args.parent.parent)

      const { provider, safeToolchain, multiSig, owner, threshold, approve, execute, approvers } = args
      const addOwnerWithThresholdTx = await safeToolchain.admin.addOwnerWithThreshold(multiSig, owner, threshold)

      console.log('transactionHash', addOwnerWithThresholdTx.transactionHash)
      console.log('txData', addOwnerWithThresholdTx.txData)

      if (approve) {
        const tx = await addOwnerWithThresholdTx.approve()
        await waitForTx(provider, tx.hash)
      } else if (execute) {
          assert(approvers && approvers.length, 'Missing approvers')
          const tx = await addOwnerWithThresholdTx.execute(approvers)
          await waitForTx(provider, tx.hash)
      }
    })

const removeOwnerCmd = new Command('safe-remove-owner')
    .description('Remove an old multisig-owner and change threshold')
    .requiredOption('--multiSig <value>', 'Address of Multi-sig')
    .option('--owner <address>', 'Old owner address')
    .option('--threshold <value>', 'New threshold')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async (args) => {
            await safeSetupParentArgs(args, args.parent.parent)

      const { provider, safeToolchain, multiSig, owner, threshold, approve, execute, approvers } = args
      const removeOwnerTx = await safeToolchain.admin.removeOwner(multiSig, owner, threshold)

      console.log('transactionHash', removeOwnerTx.transactionHash)
      console.log('txData', removeOwnerTx.txData)

      if (approve) {
        const tx = await removeOwnerTx.approve()
        await waitForTx(provider, tx.hash)
      } else if (execute) {
          assert(approvers && approvers.length, 'Missing approvers')
          const tx = await removeOwnerTx.execute(approvers)
          await waitForTx(provider, tx.hash)
      }

    })

const swapOwnerCmd = new Command('safe-swap-owner')
    .description('Swap multi-sig old owner with a new owner')
    .requiredOption('--multiSig <value>', 'Address of Multi-sig')
    .option('--oldOwner <address>', 'Old owner address')
    .option('--newOwner <address>', 'New owner address')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async (args) => {
            await safeSetupParentArgs(args, args.parent.parent)

      const { provider, safeToolchain, multiSig, oldOwner, newOwner, approve, execute, approvers } = args
      const swapOwnerTx = await safeToolchain.admin.swapOwner(multiSig, oldOwner, newOwner)

      console.log('transactionHash', swapOwnerTx.transactionHash)
      console.log('txData', swapOwnerTx.txData)

      if (approve) {
        const tx = await swapOwnerTx.approve()
        await waitForTx(provider, tx.hash)
      } else if (execute) {
          assert(approvers && approvers.length, 'Missing approvers')
          const tx = await swapOwnerTx.execute(approvers)
          await waitForTx(provider, tx.hash)
      }
    })

const changeThresholdCmd = new Command('safe-change-threshold')
    .description('Change multi-sig threshold')
    .requiredOption('--multiSig <value>', 'Address of Multi-sig')
    .option('--threshold <value>', 'New threshold')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async (args) => {
            await safeSetupParentArgs(args, args.parent.parent)

      const { provider, safeToolchain, multiSig, threshold, approve, execute, approvers } = args
      const changeThresholdTx = await safeToolchain.admin.changeThreshold(multiSig, threshold)

      console.log('transactionHash', changeThresholdTx.transactionHash)
      console.log('txData', changeThresholdTx.txData)

      if (approve) {
        const tx = await changeThresholdTx.approve()
        await waitForTx(provider, tx.hash)
      } else if (execute) {
          assert(approvers && approvers.length, 'Missing approvers')
          const tx = await changeThresholdTx.execute(approvers)
          await waitForTx(provider, tx.hash)
      }
    })

const getThresholdCmd = new Command('safe-get-threshold')
    .description('Get multi-sig threshold')
    .requiredOption('--multiSig <value>', 'Address of Multi-sig')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async (args) => {
            await safeSetupParentArgs(args, args.parent.parent)

      const { safeToolchain, multiSig } = args
      const threshold = await safeToolchain.admin.getThreshold(multiSig)

      console.log(`[${args._name}] Multi-sig Threshold ${threshold.toString()}`)
    })

const getOwnersCmd = new Command('safe-get-owners')
    .description('Get multi-sig owners')
    .requiredOption('--multiSig <value>', 'Address of Multi-sig')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async (args) => {
      await safeSetupParentArgs(args, args.parent.parent)

      const { safeToolchain, multiSig } = args
      const owners = await safeToolchain.admin.getOwners(multiSig)

      console.log(`[${args._name}] Multi-sig Owners ${owners.join(', ')}`)
    })

const isOwnerCmd = new Command('safe-is-owner')
    .description('Check if a given address is a multi-sig owner')
    .requiredOption('--multiSig <value>', 'Address of Multi-sig')
    .option('--owner <address>', 'Owner address')
    .option('--approve', 'Approve transaction hash')
    .option('--execute', 'Execute transaction')
    .option('--approvers <value>', 'Approvers addresses', splitCommaList)
    .action(async (args) => {
      await safeSetupParentArgs(args, args.parent.parent)

      const { safeToolchain, multiSig, owner } = args
      const res = await safeToolchain.admin.isOwner(multiSig, owner)

      console.log(`[${args._name}] Address ${owner} ${res ? "is" : "is not"} a Multi-sig owner.`)
    })

const multisigCmd = new Command("multisig")

multisigCmd.addCommand(addOwnerWithThresholdCmd)
multisigCmd.addCommand(removeOwnerCmd)
multisigCmd.addCommand(swapOwnerCmd)
multisigCmd.addCommand(changeThresholdCmd)
multisigCmd.addCommand(getThresholdCmd)
multisigCmd.addCommand(getOwnersCmd)
multisigCmd.addCommand(isOwnerCmd)

module.exports = multisigCmd
