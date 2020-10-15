module.exports = {
    action: {
        type: "select",
        name: "action",
        message: "What do you want to do?",
        instructions: false,
        choices: [
            {title: "Add new chain", value: "addChain"},
            {title: "Update existing chain", value: "updateChain"},
            {title: "View config", value: "viewConfig"},
            {title: "Deploy Chain", value: "deployChain"},
            {title: "Setup Handlers", value: "handlerSetup"},
            {title: "Delete Chain", value: "deleteChain"},
            {title: "Quit", value: "quit"}
        ]
    },
    selectChain: (chains) => {
        return {
            type: "select",
            name: "selectedChain",
            message: "Choose a chain to update?",
            instructions: false,
            choices: chains
        }
    },
    confirmUpdate: {
        type: "toggle",
        name: "confirmUpdate",
        message: "Are you sure you want to update this configuration file?",
        initial: false,
        active: "yes",
        inactive: "no"
    },
    name: (existingChains) => {
        return {
            type: "text",
            name: "name",
            message: "Please provide a unique name for this chain",
            validate: x => existingChains.includes(x) ? "Name already taken!" : true
        }
    },
    chainOpts: [
        {
            type: "text",
            name: "url",
            message: "Please provide a url to a node:"
        },
        {
            type: "number",
            name: "networkId",
            message: "What is the chain network id?"
        }
    ],
    walletPath: {
        type: "text",
        name: "path",
        message: "What is the path to your wallet?",
    },
    walletPassword: {
        type: "password",
        name: "password",
        message: "Please enter your keystore password"
    }
}