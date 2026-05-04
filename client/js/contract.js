const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const EXPECTED_CHAIN_ID = 31337n;

const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "admin",
        "outputs": [
            { "internalType": "address", "name": "", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "string", "name": "_name", "type": "string" },
            { "internalType": "string", "name": "_party", "type": "string" }
        ],
        "name": "addCandidate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "openVoting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "closeVoting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "_candidateId", "type": "uint256" }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllCandidates",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "id", "type": "uint256" },
                    { "internalType": "string", "name": "name", "type": "string" },
                    { "internalType": "string", "name": "party", "type": "string" },
                    { "internalType": "uint256", "name": "voteCount", "type": "uint256" }
                ],
                "internalType": "struct Voting.Candidate[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "votingOpen",
        "outputs": [
            { "internalType": "bool", "name": "", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_voter", "type": "address" }
        ],
        "name": "checkIfVoted",
        "outputs": [
            { "internalType": "bool", "name": "", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

async function getEthereumProvider() {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
    }

    return window.ethereum;
}

async function getBrowserProvider() {
    const ethereum = await getEthereumProvider();
    return new ethers.BrowserProvider(ethereum);
}

async function getContractWithSigner() {
    const provider = await getBrowserProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

async function getContractReadOnly() {
    const provider = await getBrowserProvider();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

async function assertHardhatNetwork(provider) {
    const network = await provider.getNetwork();

    if (network.chainId !== EXPECTED_CHAIN_ID) {
        throw new Error(
            `Wrong MetaMask network. Please switch to Hardhat Local (chain ID 31337). Current chain ID: ${network.chainId}.`
        );
    }
}

async function assertContractDeployed(provider) {
    const code = await provider.getCode(CONTRACT_ADDRESS);

    if (!code || code === "0x") {
        throw new Error(
            `Voting contract is not deployed at ${CONTRACT_ADDRESS} on the selected MetaMask network. Switch MetaMask to Hardhat Local.`
        );
    }
}

async function getContractAdmin() {
    const provider = await getBrowserProvider();
    await assertHardhatNetwork(provider);
    await assertContractDeployed(provider);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    return await contract.admin();
}

async function assertContractAdminSigner() {
    const provider = await getBrowserProvider();
    await assertHardhatNetwork(provider);
    await assertContractDeployed(provider);

    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    const adminAddress = await getContractAdmin();

    if (signerAddress.toLowerCase() !== adminAddress.toLowerCase()) {
        throw new Error(
            `Wrong MetaMask account. Connected: ${signerAddress}. Contract admin: ${adminAddress}.`
        );
    }
}

async function addCandidateOnChain(name, party) {
    await assertContractAdminSigner();
    const contract = await getContractWithSigner();
    const tx = await contract.addCandidate(name, party);
    await tx.wait();
    return tx.hash;
}

async function openVotingOnChain() {
    await assertContractAdminSigner();
    const contract = await getContractWithSigner();
    const tx = await contract.openVoting();
    await tx.wait();
    return tx.hash;
}

async function closeVotingOnChain() {
    await assertContractAdminSigner();
    const contract = await getContractWithSigner();
    const tx = await contract.closeVoting();
    await tx.wait();
    return tx.hash;
}

async function voteOnChain(candidateId) {
    const contract = await getContractWithSigner();
    const tx = await contract.vote(candidateId);
    await tx.wait();
    return tx.hash;
}

async function getAllCandidatesFromChain() {
    const contract = await getContractReadOnly();
    const candidates = await contract.getAllCandidates();

    return candidates.map(candidate => ({
        id: Number(candidate.id),
        name: candidate.name,
        party: candidate.party,
        voteCount: Number(candidate.voteCount)
    }));
}

async function getVotingStatusFromChain() {
    const contract = await getContractReadOnly();
    return await contract.votingOpen();
}

async function checkWalletVotedOnChain(walletAddress) {
    const contract = await getContractReadOnly();
    return await contract.checkIfVoted(walletAddress);
}
