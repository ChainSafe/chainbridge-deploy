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
    relayers: [
        {
            type: "number",
            name: "numRelayers",
            message: "How many relayers do you want? (number)"
        },
        {
            type: "number",
            name: "threshold",
            message: "What threshold do you want? (number)"
        },
        
    ]
}