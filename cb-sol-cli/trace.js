const Web3 = require("web3");
const bridgeAbi = require("./abi.json");
const abiDecoder = require("abi-decoder");

const relayerConfig = require("./config").chains;

class Trace {
  constructor(config, bridgeAbi) {
    this.bridgeAbi = bridgeAbi;
    this.config = this.setup(config);
  }

  setup(config) {
    const chains = {};
    config.forEach(c => {
      if (c.type == "ethereum") {
        const conn = new Web3(c.endpoint);

        chains[c.id] = {
          conn,
          bridgeContract: new conn.eth.Contract(this.bridgeAbi, c.opts.bridge),
          ...c.opts
        };
      } else if (c.type == "substrate") {
        console.log("WARNING: substrate not yet supported");
      } else {
        console.log("WARNING: ", c.name, "is unknown chain type");
      }
    })
    return chains;
  }

  async trace(home, txhash) {
    const homeChain = this.config[home];
    const receipt = await homeChain.conn.eth.getTransactionReceipt(txhash);
    console.log("=======================")
    const info = [];

    /**
     * Decode home chain logs, and find deposit otherwise exit
    */
    abiDecoder.addABI(bridgeAbi);
    const decodedLogs = abiDecoder.decodeLogs(receipt.logs)
    decodedLogs.forEach(log => {
      if (log && log.address == homeChain.bridgeContract._address) {
        if (log.name === "Deposit") {
          log.events.forEach(x => {
            log[x.name] = x.value 
          })
          // deposit event found
          info.push(log);
        }
      }
    })
    if (info.length === 0) {
      console.log("No deposit event found!")
      process.exit(1);
    }

    /**
     * Decode destination chain logs
     */
    const destChain = this.config[info[0].destinationChainID];
    let startBlock = Number(destChain.startBlock);
    const f = await destChain.bridgeContract.events.ProposalEvent({
      fromBlock: startBlock,
    }, (e, f) => { console.log(e,f)})
    // console.log(f)
  }
}

const poll = async (fn, time) => {
  await fn();
  setTimeout(() => poll(fn), time);
};

(async function() {
  const t = new Trace(relayerConfig, bridgeAbi)
  // const d = await t.getDeposit(1, 1, "0x0000000000000000000000ed52eca444088d3892edaebb05ccd012165545d305")
  // console.log(d)
  await t.trace(1, "0x3b22c1eb5400cc86fc3efc207b4a1395b9c190f40e8f45e0c9df89900ef9a1ec");
})()

/**(async function() {
  let web3 = new Web3(process.argv[2]);
  let Bridge = new web3.eth.Contract(abi, process.argv[3]);
  let total = await Bridge.methods._totalRelayers().call();

  let relayers = [];
  for (let i = 0; i < total; i++) {
    relayers.push(await Bridge.methods.getRoleMember('0xe2b7fb3b832174769106daebcfd6d1970523240dda11281102db9363b83b0dc4', i).call());
  }
  console.log(relayers);
})()
*/
