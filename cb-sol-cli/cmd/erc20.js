const ethers = require('ethers');
const constants = require('../constants');

const {Command} = require('commander');
const {setupParentArgs, waitForTx, log} = require("./utils")

const mintCmd = new Command("mint")
    .description("Mints erc20 tokens")
    .option('--amount <value>', 'Amount to mint', 100)
    .option('--erc20Address <address>', 'ERC20 contract address', constants.ERC20_ADDRESS)
    .action(async function (args) {
        await setupParentArgs(args, args.parent.parent)
        const erc20Instance = new ethers.Contract(args.erc20Address, constants.ContractABIs.Erc20Mintable.abi, args.wallet);
        log(args, `Minting ${args.amount} tokens to ${args.wallet.address} on contract ${args.erc20Address}`);
        const tx = await erc20Instance.mint(args.wallet.address, args.amount);
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
        const tx = await erc20Instance.approve(args.recipient, args.amount, { gasPrice: args.gasPrice, gasLimit: args.gasLimit});
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

        // Instances
        const bridgeInstance = new ethers.Contract(args.bridge, constants.ContractABIs.Bridge.abi, args.wallet);

        const data = '0x' +
            ethers.utils.hexZeroPad(ethers.utils.bigNumberify(args.amount).toHexString(), 32).substr(2) +    // Deposit Amount        (32 bytes)
            ethers.utils.hexZeroPad(ethers.utils.hexlify((args.recipient.length - 2)/2), 32).substr(2) +    // len(recipientAddress) (32 bytes)
            args.recipient.substr(2);                    // recipientAddress      (?? bytes)

        log(args, `Constructed deposit:`)
        log(args, `  Resource Id: ${args.resourceId}`)
        log(args, `  Amount: ${ethers.utils.bigNumberify(args.amount).toHexString()}`)
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
        log(args, `Account ${args.address} has a balance of ${balance}` )
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

const createErc20ProposalData = (amount, recipient) => {
        if (recipient.substr(0, 2) === "0x") {
                recipient = recipient.substr(2)
        }
        return '0x' +
            ethers.utils.hexZeroPad(ethers.utils.bigNumberify(amount).toHexString(), 32).substr(2) +
            ethers.utils.hexZeroPad(ethers.utils.hexlify(recipient.length / 2 + recipient.length % 2), 32).substr(2) +
            recipient;
}

const proposalDataHashCmd = new Command("data-hash")
    .description("Hash the proposal data for an erc20 proposal")
    .option('--amount <value>', "Amount to transfer", 1)
    .option('--recipient <address>', 'Destination recipient address', constants.relayerAddresses[4])
    .option('--handler <address>', 'ERC20 handler  address', constants.ERC20_HANDLER_ADDRESS)
    .action(async function(args) {

        const data = createErc20ProposalData(args.amount, args.recipient)
        const hash = ethers.utils.solidityKeccak256(["address", "bytes"], [args.handler, data])

        log(args, `Hash: ${hash} Data: ${data}`)
    })

const erc20Cmd = new Command("erc20")

erc20Cmd.addCommand(mintCmd)
erc20Cmd.addCommand(addMinterCmd)
erc20Cmd.addCommand(approveCmd)
erc20Cmd.addCommand(depositCmd)
erc20Cmd.addCommand(balanceCmd)
erc20Cmd.addCommand(allowanceCmd)
erc20Cmd.addCommand(proposalDataHashCmd)

module.exports = erc20Cmd