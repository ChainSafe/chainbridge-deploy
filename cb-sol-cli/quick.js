const Web3 = require("web3");
const abi = require("./abi.json");

(async function() {
  let web3 = new Web3(process.argv[2]);
  let Bridge = new web3.eth.Contract(abi, process.argv[3]);
  let total = await Bridge.methods._totalRelayers().call();

  let relayers = [];
  for (let i = 0; i < total; i++) {
    relayers.push(await Bridge.methods.getRoleMember('0xe2b7fb3b832174769106daebcfd6d1970523240dda11281102db9363b83b0dc4', i).call());
  }
  console.log(relayers);
})()
