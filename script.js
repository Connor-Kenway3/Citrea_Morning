import { BrowserProvider, Contract } from "https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.min.js";
import { contractAddress, contractABI, myCustomChainId, customChain } from "./config.js";

let provider;
let signer;
let contract;
let intervalId;
let isConnected = false;

// --- Functions ---
async function switchToCustomChain() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: customChain.chainId }]
        });
        return true;
    } catch (switchError) {
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [customChain]
                });
                return true;
            } catch (addError) {
                console.error("Failed to add network:", addError);
                alert("Please add the network manually in MetaMask.");
                return false;
            }
        } else {
            console.error("Failed to switch network:", switchError);
            alert("Please switch network manually in MetaMask.");
            return false;
        }
    }
}

async function connectWallet() {
    if (isConnected) {
        // Disconnect
        provider = null;
        signer = null;
        contract = null;
        isConnected = false;
        document.getElementById("walletAddress").style.visibility = 'hidden';

        document.getElementById("walletAddress").innerText = "";
        document.getElementById("connectWallet").innerText = "Connect wallet";
        document.getElementById("clickButton").disabled = true;
        clearInterval(intervalId);
        document.getElementById("timer").innerText = "";
        document.getElementById("status").innerText = "";
        return;
    }

    if (typeof window.ethereum === 'undefined') {
        alert("Please install a wallet like MetaMask.");
        document.getElementById("status").innerText = "Please install a wallet to use this dapp";
        return;
    }

    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        const { chainId } = await provider.getNetwork();
        if (chainId !== BigInt(myCustomChainId)) {
            const switched = await switchToCustomChain();
            if (!switched) return; // Stop if user didn't switch
        }

        contract = new Contract(contractAddress, contractABI, signer);

        const address = await signer.getAddress();
        document.getElementById("walletAddress").innerText =
            `${address.substring(0, 6)}..........${address.substring(address.length - 4)}`;
        document.getElementById("walletAddress").style.visibility = 'visible';
        document.getElementById("connectWallet").innerText = "Disconnect";
        isConnected = true;

        checkClickable();
    } catch (error) {
        console.error("Wallet connection failed:", error);
        document.getElementById("status").innerText = "Connection failed. Please try again.";
    }
}

async function checkClickable() {
    if (!contract || !signer) return;

    try {
        const address = await signer.getAddress();
        const canGM = await contract.canGM(address);
        const button = document.getElementById("clickButton");
        button.disabled = !canGM;

        if (canGM) {
            document.getElementById("status").innerText = "You can CM now!";
            document.getElementById("timer").innerText = "";
        } else {
            document.getElementById("status").innerText = "Already said CM in the last 24 hours!";
            startCountdown();
        }
    } catch (e) {
        console.error("Error checking clickable status:", e);
        document.getElementById("status").innerText =
            "Error checking status. Make sure you are on the correct network.";
    }
}

async function sayGM() {
    if (!contract) {
        document.getElementById("status").innerText = "Please connect your wallet first";
        return;
    }

    const status = document.getElementById("status");
    status.innerText = "Sending transaction...";

    try {
        const tx = await contract.GM();
        await tx.wait();

        status.innerText = "You just said CM!";
        document.getElementById("clickButton").disabled = true;
        startCountdown();
    } catch (e) {
        console.error("Transaction failed:", e);
        status.innerText = "Transaction failed";
    }
}

async function startCountdown() {
    if (!contract || !signer) return;

    const address = await signer.getAddress();
    const lastGM = await contract.lastGM(address);
    const timerDiv = document.getElementById("timer");
    clearInterval(intervalId);

    const update = () => {
        const now = Math.floor(Date.now() / 1000);
        let remaining = Number(lastGM) + 24 * 3600 - now;

        if (remaining <= 0) {
            timerDiv.innerText = "You can click now!";
            document.getElementById("clickButton").disabled = false;
            clearInterval(intervalId);
            return;
        }

        const hrs = Math.floor(remaining / 3600);
        const mins = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;
        timerDiv.innerText = `Next CM in: ${hrs}H ${mins}M ${secs}S`;
    };

    update();
    intervalId = setInterval(update, 1000);
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("connectWallet").onclick = connectWallet;
    document.getElementById("clickButton").onclick = sayGM;
});

if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) connectWallet(); // auto-disconnect
        else if (!isConnected) connectWallet(); // auto-connect new account
    });

    window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
    });
}
