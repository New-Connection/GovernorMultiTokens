import { ethers, network } from "hardhat";
import LZ_ENDPOINTS from "../constants/layerzeroEndpoints.json";
import ONFT_ARGS from "../constants/onftArgs.json";

export const MIN_DELAY = 3600;
export const VOTING_PERIOD = 5;
export const VOTING_DELAY = 1;
export const QUORUM_PERCENTAGE = 4;
export const PROPOSAL_THRESHOLD = 1;
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export const NEW_STORE_VALUE = 77;
export const PROPOSAL_DESCRIPTION = "Proposal #1: execute";
export const TOKEN_NAME = "Governor Token";
export const TOKEN_SYMBOL = "GT";
export const NFT_NAME = "NFT Example";
export const NFT_SYMBOL = "NFTE";
export const NFT_PRICE = "0.123";
export const NFT_BASE_URI = "ipfs://ASDkfCfgFgddkWvHocHpSxC1K3sfFNfribqmZ7WYB2";
export const NFT_TEST_NAME = "NFT2";
export const GOVERNOR_NAME = "Governor Contract";
export const GOVERNOR_INFO_URI = "ipfs://QmeqfJkfCfgFgddkWvHocHpSxC1K3sfFNfribqmZ7WYB2";
export const PROPOSAL_INFO_URI = "ipfs://ZdfSDfsfgFgddkWvHocHpSxC1K3sfFNfribqdf3dDDF35/proposals/0";
export const developmentChains = ["hardhat", "localhost"];
export const proposalsFiles = "proposals.json";


export const DEBUG_BLOCKS = false;
export const DEBUG = false;


export async function deployFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    // @ts-ignore
    const lzEndpointAddress = LZ_ENDPOINTS[hre.network.name];
    // @ts-ignore
    const onftArgs = ONFT_ARGS[hre.network.name];

    const _governanceNFT = await ethers.getContractFactory("GovernanceNFT", owner);
    const GovernanceNFT = await _governanceNFT.deploy(NFT_NAME, NFT_SYMBOL, NFT_BASE_URI, ethers.utils.parseEther(NFT_PRICE), lzEndpointAddress,
        onftArgs.startMintId, onftArgs.endMintId,);
    await GovernanceNFT.deployed();

    const _governorContract = await ethers.getContractFactory("GovernorContract", owner);
    const GovernorContract = await _governorContract.deploy(GOVERNOR_NAME, GovernanceNFT.address, VOTING_PERIOD, QUORUM_PERCENTAGE);
    await GovernorContract.deployed();


    const _fakeNFT = await ethers.getContractFactory("GovernanceNFT", addr1);
    const FakeNFT = await _fakeNFT.deploy(NFT_NAME, NFT_SYMBOL, NFT_BASE_URI, ethers.utils.parseEther(NFT_PRICE), lzEndpointAddress,
        onftArgs.startMintId, onftArgs.endMintId,);
    await FakeNFT.deployed();

    return { GovernanceNFT, GovernorContract, FakeNFT, owner, addr1, addr2 }
}

export async function moveBlocks(amount: number) {
    DEBUG_BLOCKS ? console.log(`Moving ${amount} blocks`) : '';

    for (let i = 0; i < amount; i++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        });
    }
}

export async function moveTime(amount: number) {
    DEBUG_BLOCKS ? console.log("Moving time...") : ''
    await network.provider.send("evm_increaseTime", [amount]);
    DEBUG_BLOCKS ? console.log(`Moved forward ${amount} seconds`) : ''
}
