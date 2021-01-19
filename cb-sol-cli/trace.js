const Web3 = require("web3");
const bridgeAbi = require("./abi.json");
const abiDecoder = require("abi-decoder");

//const relayerConfig = require("./rado-config.json").chains;
const relayerConfig = require("./ava-config.json").chains;

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
          name: c.name,
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

  async getChainConfigs() {
    for (let key in this.config) {
      let chain = this.config[key];
      let chainId = await chain.bridgeContract.methods._chainID().call();
      let expiry = await chain.bridgeContract.methods._expiry().call();
      let fee = await chain.bridgeContract.methods._fee().call();
      let threshold = await chain.bridgeContract.methods._relayerThreshold().call();
      let paused = await chain.bridgeContract.methods.paused().call();
      let totalRelayers = await chain.bridgeContract.methods._totalRelayers().call();

      console.log(`
      ${chain.name}
      -------------
      paused: ${paused}
      chainId: ${chainId}
      expiry: ${expiry}
      fee: ${fee}
      threshold: ${threshold}
      totalRelayers: ${totalRelayers}
      `);
    }
  }

  async getAdmins() {
    for (let key in this.config) {
      let chain = this.config[key];
      const adminRole = await chain.bridgeContract.methods.DEFAULT_ADMIN_ROLE().call();
      
      let admins = [];
      let flag = true;
      let index = 0;
      while (flag) {
        try {
          const addr = await chain.bridgeContract.methods.getRoleMember(adminRole, index).call();
          const code = await chain.conn.eth.getCode(addr);
          const isContract = code === "0x" ? true : false;
          admins.push(`${addr} (is contract: ${isContract})`);
          index++;
        } catch (e) {
          // discard error, as we are probably out-of-bounds
          // exit loop
          flag = false;
        }
      }
      console.log(`
      ${chain.name} Admins
      -------------
      `)
      admins.forEach(x => console.log("\t"+x))
    }
  }

  async getRelayers() {
    for (let key in this.config) {
      let chain = this.config[key];
      let total = await chain.bridgeContract.methods._totalRelayers().call();

      let relayers = [];
      let relayerRole = await chain.bridgeContract.methods.RELAYER_ROLE().call();
      for (let i = 0; i < total; i++) {
        relayers.push(await chain.bridgeContract.methods.getRoleMember(relayerRole, i).call());
      }
      console.log(`
      ${chain.name} Relayers
      -------------
      `)
      relayers.forEach(x => console.log("\t"+x))
    }
  }

  async trace(homeId, txhash) {
    const homeChain = this.config[homeId];
    const receipt = await homeChain.conn.eth.getTransactionReceipt(txhash);
    console.log("=======================")
    let deposit; 
    /**
     * Decode home chain logs, and find deposit otherwise exit
     */
    abiDecoder.addABI(bridgeAbi);
    const decodedLogs = abiDecoder.decodeLogs(receipt.logs)
    decodedLogs.forEach(log => {
      if (log && log.address == homeChain.bridgeContract._address) {
        if (log.name === "Deposit") {
          console.log("Found deposit")
          log.events.forEach(x => {
            log[x.name] = x.value 
          })
          // deposit event found
          deposit = log;
        }
      }
    })
    if (!deposit) {
      console.log("No deposit event found!")
      process.exit(1);
    }
    /**
     * Decode destination chain logs
     */
    const destChain = this.config[deposit.destinationChainID];
    let startBlock = Number(destChain.startBlock);
    console.log("attempting dest chain")
    const f = await destChain.bridgeContract.events.ProposalEvent({
      fromBlock: startBlock,
    }, (err, log) => {
      if (err) console.log(error);
      if (parseInt(homeId) == parseInt(log.returnValues.originChainID) &&
        deposit.resourceID == log.returnValues.resourceID &&
        parseInt(deposit.depositNonce.slice(2),0) == log.returnValues.depositNonce
        ) {
        console.log(log);      
      }
    })
  }
}

(async function() {
  const t = new Trace(relayerConfig, bridgeAbi);
  // await t.getChainConfigs();
  // await t.getRelayers();
  // await t.getAdmins();
  // console.log("================NEW TRACE================")
  await t.trace(process.argv[2], process.argv[3]);
})()
