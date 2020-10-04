module.exports = {
    verify: (message, hint) => {
        return {
            type: "select",
            name: "verify",
            message,
            hint,
            choices: [
                {title: "yes", value: true},
                {title: "no", value: false}
            ]
       }
    },
    multiselect: (message, hint, list) => {
        return {
            type: "multiselect",
            name: "multiSelect",
            message,
            hint,
            instructions: false,
            choices: list
        }
    }
}