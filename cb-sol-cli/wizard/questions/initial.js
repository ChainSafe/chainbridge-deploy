const { initial } = require(".");

module.exports = {
    useConfig: {
        type: "toggle",
        name: "useConfig",
        message: "Do you want to use your existing configuration?",
        initial: true,
        active: "yes",
        inactive: "no"
    },
    updateConfig: {
        type: "toggle",
        name: "updateConfig",
        message: "Do you want to update this configuration file?",
        initial: false,
        active: "yes",
        inactive: "no"
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
    ]
}