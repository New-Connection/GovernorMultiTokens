import { HardhatUserConfig, task } from "hardhat/config";
import "hardhat-deploy";
import "solidity-coverage";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import * as dotenv from "dotenv";

dotenv.config();

task("moveBlocks", "Move for N blocks")
    .addParam("blocks", "Amount of blocks")
    .setAction(async (taskArgs) => {
        console.log(`running for ${taskArgs.blocks} blocks`);
        for (let i = 0; i < +taskArgs.blocks; i++) {
            // @ts-ignore
            await network.provider.request({
                method: "evm_mine",
                params: [],
            });
        }
    });


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

        localhost: {
            url: "http://127.0.0.1:8545"
        },

        rinkeby: {
            url: process.env.RINKEBY_URL || "",
            accounts:
                process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
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
