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
    }
}