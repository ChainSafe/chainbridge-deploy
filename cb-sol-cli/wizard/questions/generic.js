module.exports = {
    update: (message, hint) => {
        return {
            type: "select",
            name: "update",
            message,
            hint,
            choices: [
                {title: "yes", value: true},
                {title: "no", value: false}
            ]
       }
    }
}