const { ethers } = require("ethers");

module.exports = {
    contracts: [
        {
            type: "multiselect",
            name: "contracts",
            message: "Which contracts do you want to deploy?",
            hint: '- Space to select. Return to submit',
            instructions: false,
            choices: [
                {
                    title: "bridge",
                    value: "bridge",
                },
                {
                    title: "erc20Handler",
                    value: "erc20Handler",
                },
                {
                    title: "erc721Handler",
                    value: "erc721Handler",
                },
                {
                    title: "genericHandler",
                    value: "genericHandler",
                },
                {
                    title: "erc20",
                    value: "erc20",
                },
                {
                    title: "erc721",
                    value: "erc721",
                },
                {
                    title: "centrifuge",
                    value: "centrifuge",
                },
                
            ]
        }
    ],
    bridge: [
        {
            type: "number",
            name: "fee",
            message: "What fee would you like to charge? (in ETH)",
            validate: x => x < 0 ? "Number must be greater than 0" : true
        },
        {
            type: "number",
            name: "expiry",
            message: "Number of blocks after which a proposal is considered cancelled?",
            validate: x => x <= 0 ? "Number must be greater than 0" : true
        },
        {
            type: "number",
            name: "chainId",
            message: "What is the ChainBridge chainId?",
            validate: x => x <= 0 ? "Number must be greater than 0" : true
        }
    ],
    relayer: {
        relayerNumber: {
                type: "number",
                name: "numRelayers",
                message: "How many relayers do you want?",
                validate: x => x <= 0 ? "Number must be greater than 0" : true
            },
        relayerThreshold: {
                type: "number",
                name: "relayerThreshold",
                message: "What vote threshold do you want?"
            },
        relayerAddresses: {
            type: "list",
            name: "relayerAddresses",
            message: "Enter relayer addresses (Comma separated values)",
            separator: ",",
            validate: function(values) {
                values = values.split(",");
                for (let i=0; i < values.length; i++) {
                    try {
                        // an invalid address will throw
                        ethers.utils.getAddress(values[i]);
                    } catch (e) {
                        return `${values[i]} is not a valid Ethereum address!`
                    }
                }
                return true;
            }
        }
    }
}