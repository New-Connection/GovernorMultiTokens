import { HardhatUserConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
// import "@nomiclabs/hardhat-web3";
import "solidity-coverage";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
// import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    notOwner: {
      default: 2,
    },
  },
  // gasReporter: {
  //   enabled: false,
  //   currency: "USD",
  //   outputFile: "gas-report.txt",
  //   noColors: true,
  //   coinmarketcap: COINMARKETCAP_API_KEY,
  // },
};

export default config;
