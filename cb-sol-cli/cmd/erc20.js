const ethers = require('ethers');
const constants = require('../constants');

const {Command} = require('commander');
const {setupParentArgs, waitForTx, log, expandDecimals} = require("./utils")

const mintCmd = new Command("mint")
    .description("Mints erc20 tokens")
    .option('--amount <value>', 'Amount to mint', 100)
    .option('--erc20Address <address>', 'ERC20 contract address', constants.ERC20_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)

        const erc20Instance = new ethers.Contract(args.erc20Address, constants.ContractABIs.Erc20Mintable.abi, args.wallet);
        log(args, `Minting ${args.amount} tokens to ${args.wallet.address} on contract ${args.erc20Address}`);
        const tx = await erc20Instance.mint(args.wallet.address, expandDecimals(args.amount, args.decimals));
        await waitForTx(args.provider, tx.hash)
    })

const addMinterCmd = new Command("add-minter")
    .description("Add a new minter to the contract")
    .option('--erc20Address <address>', 'ERC20 contract address', constants.ERC20_ADDRESS)
    .option('--minter <address>', 'Minter address', constants.relayerAddresses[1])
    .action(async function(args) {
        await setupParentArgs(args, args.parent.parent)
        const erc20Instance = new ethers.Contract(args.erc20Address, constants.ContractABIs.Erc20Mintable.abi, args.wallet);
        let MINTER_ROLE = await erc20Instance.MINTER_ROLE();
        log(args, `Adding ${args.minter} as a minter on contract ${args.erc20Address}`);
        const tx = await erc20Instance.grantRole(MINTER_ROLE, args.minter);
        await waitForTx(args.provider, tx.hash)
    })

const approveCmd = new Command("approve")
    .description("Approve tokens for transfer")
    .option('--amount <value>', "Amount to transfer", 1)
    .option('--recipient <address>', 'Destination recipient address', constants.ERC20_HANDLER_ADDRESS)
    .option('--erc20Address <address>', 'ERC20 contract address', constants.ERC20_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)

        const erc20Instance = new ethers.Contract(args.erc20Address, constants.ContractABIs.Erc20Mintable.abi, args.wallet);
        log(args, `Approving ${args.recipient} to spend ${args.amount} tokens from ${args.wallet.address}!`);
        const tx = await erc20Instance.approve(args.recipient, expandDecimals(args.amount, args.parent.decimals), { gasPrice: args.gasPrice, gasLimit: args.gasLimit});
        await waitForTx(args.provider, tx.hash)
    })

const depositCmd = new Command("deposit")
    .description("Initiates a bridge transfer")
    .option('--amount <value>', "Amount to transfer", 1)
    .option('--dest <id>', "Destination chain ID", 1)
    .option('--recipient <address>', 'Destination recipient address', constants.relayerAddresses[4])
    .option('--resourceId <id>', 'ResourceID for transfer', constants.ERC20_RESOURCEID)
    .option('--bridge <address>', 'Bridge contract address', constants.BRIDGE_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        args.decimals = args.parent.decimals

        // Instances
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);
        const data = '0x' +
            ethers.utils.hexZeroPad(ethers.utils.bigNumberify(expandDecimals(args.amount, args.parent.decimals)).toHexString(), 32).substr(2) +    // Deposit Amount        (32 bytes)
            ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +    // len(recipientAddress) (32 bytes)
            args.recipient.substr(2);                    // recipientAddress      (?? bytes)

        log(args, `Constructed deposit:`)
        log(args, `  Resource Id: ${args.resourceId}`)
        log(args, `  Amount: ${expandDecimals(args.amount, args.parent.decimals).toHexString()}`)
        log(args, `  len(recipient): ${(args.recipient.length - 2)/ 2}`)
        log(args, `  Recipient: ${args.recipient}`)
        log(args, `  Raw: ${data}`)
        log(args, `Creating deposit to initiate transfer!`);

        // Make the deposit
        let tx = await bridgeInstance.deposit(
            args.dest, // destination chain id
            args.resourceId,
            data,
            { gasPrice: args.gasPrice, gasLimit: args.gasLimit}
        );

        await waitForTx(args.provider, tx.hash)
    })

const balanceCmd = new Command("balance")
    .description("Get the balance for an account")
    .option('--address <address>', 'Address to query', constants.deployerAddress)
    .option('--erc20Address <address>', 'ERC20 contract address', constants.ERC20_ADDRESS)
    .action(async function(args) {
        await setupParentArgs(args, args.parent.parent)

        const erc20Instance = new ethers.Contract(args.erc20Address, constants.ContractABIs.Erc20Mintable.abi, args.wallet);
        const balance = await erc20Instance.balanceOf(args.address)
        const decimals = await erc20Instance.decimals();
        log(args, `Account ${args.address} has a balance of ${ethers.utils.formatUnits(balance, decimals)}` )
    })

const allowanceCmd = new Command("allowance")
    .description("Get the allowance of a spender for an address")
    .option('--spender <address>', 'Address of spender', constants.ERC20_HANDLER_ADDRESS)
    .option('--owner <address>', 'Address of token owner', constants.deployerAddress)
    .option('--erc20Address <address>', 'ERC20 contract address', constants.ERC20_ADDRESS)
    .action(async function(args) {
        await setupParentArgs(args, args.parent.parent)

        const erc20Instance = new ethers.Contract(args.erc20Address, constants.ContractABIs.Erc20Mintable.abi, args.wallet);
        const allowance = await erc20Instance.allowance(args.owner, args.spender)

        log(args, `Spender ${args.spender} is allowed to spend ${allowance} tokens on behalf of ${args.owner}`)
    })

const wetcDepositCmd = new Command("wetc-deposit")
    .description("Deposit ether into a wetc contract to mint tokens")
    .option('--amount <number>', 'Amount of ether to include in the deposit')
    .option('--wetcAddress <address>', 'ERC20 contract address', constants.WETC_ADDRESS)
    .action(async function(args) {
            await setupParentArgs(args, args.parent.parent)

            const wetcInstance = new ethers.Contract(args.wetcAddress, constants.ContractABIs.WETC.abi, args.wallet);
            let tx = await wetcInstance.deposit({value: ethers.utils.parseEther(args.amount), gasPrice: args.gasPrice, gasLimit: args.gasLimit})
            await waitForTx(args.provider, tx.hash)
            const newBalance = await wetcInstance.balanceOf(args.wallet.address)
            const decimals = await wetcInstance.decimals();
            log(args, `Deposited ${args.amount} into ${args.wetcAddress}. New Balance: ${ethers.utils.formatUnits(newBalance, decimals)}`)
    })

const createErc20ProposalData = (amount, recipient, decimals) => {
        if (recipient.substr(0, 2) === "0x") {
                recipient = recipient.substr(2)
        }
        return '0x' +
            ethers.utils.hexZeroPad(ethers.utils.hexlify(amount), 32).substr(2) +
            ethers.utils.hexZeroPad(ethers.utils.hexlify(recipient.length / 2 + recipient.length % 2), 32).substr(2) +
            recipient;
}

const proposalDataHashCmd = new Command("data-hash")
    .description("Hash the proposal data for an erc20 proposal")
    .option('--amount <value>', "Amount to transfer", 1)
    .option('--recipient <address>', 'Destination recipient address', constants.relayerAddresses[4])
    .option('--handler <address>', 'ERC20 handler  address', constants.ERC20_HANDLER_ADDRESS)
    .action(async function(args) {
        const data = createErc20ProposalData(expandDecimals(args.amount, args.parent.decimals), args.recipient)
        const hash = ethers.utils.solidityKeccak256(["address", "bytes"], [args.handler, data])

        log(args, `Hash: ${hash} Data: ${data}`)
    })

const erc20Cmd = new Command("erc20")
.option('-d, decimals <number>', "The number of decimal places for the erc20 token", 18)

erc20Cmd.addCommand(mintCmd)
erc20Cmd.addCommand(addMinterCmd)
erc20Cmd.addCommand(approveCmd)
erc20Cmd.addCommand(depositCmd)
erc20Cmd.addCommand(balanceCmd)
erc20Cmd.addCommand(allowanceCmd)
erc20Cmd.addCommand(wetcDepositCmd)
erc20Cmd.addCommand(proposalDataHashCmd)

module.exports = erc20Cmd
