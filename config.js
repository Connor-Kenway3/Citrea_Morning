export const contractAddress = "0xdF4396EE66dd4d8a5D54d1F2cc211e3cE7cf8956";

export const contractABI = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "Said_GM", "type": "event" }, { "inputs": [], "name": "GM", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "canGM", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "lastGM", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];

export const myCustomChainId = 4114;
export const customChain = {
	chainId: '0x' + myCustomChainId.toString(16),
	chainName: "Citrea Mainnet",
	rpcUrls: ["https://rpc.mainnet.citrea.xyz"],
	nativeCurrency: {
		name: "cBTC",
		symbol: "cBTC",
		decimals: 18
	},
	blockExplorerUrls: ["https://explorer.mainnet.citrea.xyz/"]
};
