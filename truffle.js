// const HDWalletProvider = require("@truffle/hdwallet-provider");
// const mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*", 
            gas: 4600000
        }
    },
    compilers: {
        solc: {
            version: "0.5.8"
        }
    }
};
