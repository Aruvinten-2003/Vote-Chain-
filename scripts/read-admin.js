import { network } from "hardhat";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
    const { ethers } = await network.connect("localhost");
    const voting = await ethers.getContractAt("Voting", CONTRACT_ADDRESS);

    console.log("Contract address:", CONTRACT_ADDRESS);
    console.log("Contract admin:", await voting.admin());
}

main().catch((error) => {
    console.error("Failed to read contract admin:", error);
    process.exitCode = 1;
});
