require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    hardhat: {
      // This ensures that hardhat network uses the same settings as other networks
      // for things like gas price and block gas limit
      initialBaseFeePerGas: 0
    },
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY], 
      gasPrice: 1000000000,
    },
    baseGoerli: {
      url: "https://goerli.base.org",
      accounts: [process.env.PRIVATE_KEY], 
      gasPrice: 1000000000,
    },
  },
};