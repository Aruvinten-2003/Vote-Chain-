let connectedWalletAddress = "";
const HARDHAT_CHAIN_ID = "0x7a69";

function showWalletMessage(message, type = "error") {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

messageBox.textContent = message;
messageBox.className = `message ${type}`;
messageBox.style.display = "block";
}

function clearWalletMessage() {
    const messageBox = document.getElementById("messageBox");
    if (!messageBox) return;

    messageBox.textContent = "";
    messageBox.className = "message";
    messageBox.style.display = "none";
}

function updateWalletUI(address = "") {
    const walletStatus = document.getElementById("walletStatus");
    const walletAddressText = document.getElementById("walletAddressText");
    const connectWalletBtn = document.getElementById("connectWalletBtn");

if (address) {
    if (walletStatus) walletStatus.textContent = "Connected";
    if (walletAddressText) {
        walletAddressText.textContent = address;
        walletAddressText.title = address;
    }
    if (connectWalletBtn) connectWalletBtn.textContent = "Wallet Connected";
} else {
    if (walletStatus) walletStatus.textContent = "Not Connected";
    if (walletAddressText) walletAddressText.textContent = "No wallet connected";
    if (connectWalletBtn) connectWalletBtn.textContent = "Connect MetaMask";
}
}

async function ensureHardhatNetwork() {
    if (!window.ethereum) return;

    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: HARDHAT_CHAIN_ID }]
        });
    } catch (error) {
        if (error.code !== 4902) {
            throw error;
        }

        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
                {
                    chainId: HARDHAT_CHAIN_ID,
                    chainName: "Hardhat Local",
                    nativeCurrency: {
                        name: "Ether",
                        symbol: "ETH",
                        decimals: 18
                    },
                    rpcUrls: ["http://127.0.0.1:8545"]
                }
            ]
        });
    }
}

async function connectWallet() {
    clearWalletMessage();

if (!window.ethereum) {
    showWalletMessage("MetaMask is not installed. Please install it to use this app.", "error");
    return null;
}

try {
    await ensureHardhatNetwork();

    await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
    });

    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
    });

    if (!accounts || accounts.length === 0) {
        showWalletMessage("No wallet account found", "error");
        return null;
    }

    connectedWalletAddress = accounts[0];

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        user.walletAddress = connectedWalletAddress;
        localStorage.setItem("loggedInUser", JSON.stringify(user));
    }

    updateWalletUI(connectedWalletAddress);
    showWalletMessage("Wallet connected successfully", "success");

    return connectedWalletAddress;
} catch (error) {
    showWalletMessage("Failed to connect wallet", "error");
    return null;
}
}

async function checkExistingWalletConnection() {
if (!window.ethereum) {
    updateWalletUI("");
    return;
}

try {
    const accounts = await window.ethereum.request({
        method: "eth_accounts"
    });

    if (accounts && accounts.length > 0) {
        connectedWalletAddress = accounts[0];
        updateWalletUI(connectedWalletAddress);

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        user.walletAddress = connectedWalletAddress;
        localStorage.setItem("loggedInUser", JSON.stringify(user));
    }
    } else {
        updateWalletUI("");
    }
} catch (error) {
    updateWalletUI("");
}
}

function listenForWalletChanges() {
if (!window.ethereum) return;

window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length > 0) {
        connectedWalletAddress = accounts[0];
        updateWalletUI(connectedWalletAddress);

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        user.walletAddress = connectedWalletAddress;
        localStorage.setItem("loggedInUser", JSON.stringify(user));
    }
    } else {
        connectedWalletAddress = "";
        updateWalletUI("");

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        user.walletAddress = "";
        localStorage.setItem("loggedInUser", JSON.stringify(user));
    }
    }
});
}

document.addEventListener("DOMContentLoaded", () => {
const connectWalletBtn = document.getElementById("connectWalletBtn");

if (connectWalletBtn) {
    connectWalletBtn.addEventListener("click", connectWallet);
}

checkExistingWalletConnection();
listenForWalletChanges();
});
