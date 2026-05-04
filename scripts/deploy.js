import { network } from "hardhat";

async function main() {
    const { ethers } = await network.create();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    await voting.waitForDeployment();

    console.log("Voting contract deployed to:", await voting.getAddress());
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});