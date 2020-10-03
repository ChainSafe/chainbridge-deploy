const {Command} = require('commander');
const prompts = require("prompts");
const {initial, deploy} = require("./questions");

const promptCommand = new Command("prompt")
.description("An easy to use cli that wraps cb-sol-cli")
.action(async function(args) {

    // Check if user wants to load from config
    let response = await prompts(initial.useConfig);
    if (response.useConfig.toLowerCase() === "y") {
        console.log("TODO Load from config")
    }

    // Prompt user for deployments
    response = await prompts(deploy.contracts);
    console.log("Do something with responses")    
    
    // Prompt user for relayers
    response = await recursivePrompt(
        deploy.relayers, 
        function({threshold, numRelayers}){return threshold > 0 && numRelayers > 0 && threshold <= numRelayers},
        "The relayer threshold must be `<=` the number of relayers! Please try again!"
    );
    console.log("made it", response);

});

async function recursivePrompt(questions, condition, errorMessage) {
    const responses = await prompts(questions)
    if (condition(responses)) {
        return responses;
    } else {
        console.log(errorMessage);
        await recursivePrompt(questions, condition, errorMessage);
    }
}

module.exports = promptCommand;