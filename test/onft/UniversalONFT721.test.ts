import { expect } from "chai";
import { ethers } from "hardhat";
import {
    LZEndpointMock,
    UniversalONFT721,
} from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("UniversalONFT721: ", function () {
    const chainIdSrc = 1;
    const chainIdDst = 2;
    const name = "UniversalONFT";
    const symbol = "UONFT";

    let owner: SignerWithAddress;
    let lzEndpointSrcMock: LZEndpointMock;
    let lzEndpointDstMock: LZEndpointMock;
    let ONFTSrc: UniversalONFT721;
    let ONFTDst: UniversalONFT721;
    let LZEndpointMock: any;
    let ONFT: any;
    let ONFTSrcIds: number[];
    let ONFTDstIds: number[];

    before(async function () {
        owner = (await ethers.getSigners())[0];

        LZEndpointMock = await ethers.getContractFactory("LZEndpointMock");
        ONFT = await ethers.getContractFactory("UniversalONFT721");
        ONFTSrcIds = [1, 1]; // [startID, endID]... only allowed to mint one ONFT
        ONFTDstIds = [2, 2]; // [startID, endID]... only allowed to mint one ONFT
    });

    beforeEach(async function () {
        lzEndpointSrcMock = await LZEndpointMock.deploy(chainIdSrc);
        lzEndpointDstMock = await LZEndpointMock.deploy(chainIdDst);

        // create two UniversalONFT instances
        ONFTSrc = await ONFT.deploy(
            name,
            symbol,
            lzEndpointSrcMock.address,
            ONFTSrcIds[0],
            ONFTSrcIds[1]
        );
        ONFTDst = await ONFT.deploy(
            name,
            symbol,
            lzEndpointDstMock.address,
            ONFTDstIds[0],
            ONFTDstIds[1]
        );

        await lzEndpointSrcMock.setDestLzEndpoint(ONFTDst.address, lzEndpointDstMock.address);
        await lzEndpointDstMock.setDestLzEndpoint(ONFTSrc.address, lzEndpointSrcMock.address);

        // set each contracts source address, so it can send to each other
        await ONFTSrc.setTrustedRemote(chainIdDst, ONFTDst.address); // for A, set B
        await ONFTDst.setTrustedRemote(chainIdSrc, ONFTSrc.address); // for B, set A
    });

    it("sendFrom() - mint on the source chain and send ONFT to the destination chain", async function () {
        // mint ONFT
        const newId = await ONFTSrc.nextMintId();
        await ONFTSrc.mint();

        // verify the owner of the token is on the source chain
        expect(await ONFTSrc.ownerOf(newId)).to.be.equal(owner.address);

        // approve and send ONFT
        await ONFTSrc.approve(ONFTSrc.address, newId);
        // v1 adapterParams, encoded for version 1 style, and 200k gas quote
        const adapterParam = ethers.utils.solidityPack(["uint16", "uint256"], [1, 225000]);

        await ONFTSrc.sendFrom(
            owner.address,
            chainIdDst,
            owner.address,
            newId,
            owner.address,
            "0x000000000000000000000000000000000000dEaD",
            adapterParam
        );

        // verify the owner of the token is no longer on the source chain
        await expect(ONFTSrc.ownerOf(newId)).to.revertedWith(
            "ERC721: invalid token ID"
        );

        // verify the owner of the token is on the destination chain
        expect(await ONFTDst.ownerOf(newId)).to.not.equal(owner);

        // hit the max mint on the source chain
        await expect(ONFTSrc.mint()).to.revertedWith("UniversalONFT721: max mint limit reached");
    });
});
