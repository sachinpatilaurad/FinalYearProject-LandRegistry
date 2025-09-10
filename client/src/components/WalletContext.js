import React, { createContext, useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import LandRegistry from '../contracts/LandRegistry.json';

// --- (No changes to this part) ---
const accountNames = {};
const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};
export const WalletContext = createContext();
export const useWallet = () => {
    return useContext(WalletContext);
};
// ------------------------------------

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [accountName, setAccountName] = useState('');
    const [contract, setContract] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const getAccountName = (addr) => {
        return accountNames[addr] || shortenAddress(addr);
    };

    useEffect(() => {
        const init = async () => {
            // --- START DEBUGGING ---
            console.log("1. Starting wallet initialization...");
            try {
                const provider = window.ethereum || "http://127.0.0.1:7545";
                const web3 = new Web3(provider);
                console.log("2. Web3 instance created.");

                const accounts = await web3.eth.requestAccounts();
                const currentAccount = accounts[0];
                setAccount(currentAccount);
                setAccountName(getAccountName(currentAccount));
                console.log("3. Account fetched:", currentAccount);

                const networkId = await web3.eth.net.getId();
                console.log("4. Network ID from MetaMask/Ganache:", networkId);

                // Let's inspect the contract artifact we imported
                console.log("5. LandRegistry JSON artifact:", LandRegistry);
                console.log("6. Networks available in JSON:", LandRegistry.networks);

                const deployedNetwork = LandRegistry.networks[networkId];
                if (!deployedNetwork) {
                    console.error("CRITICAL ERROR: No deployed network found for Network ID", networkId);
                    throw new Error("Contract not deployed on this network. Please check your network settings.");
                }
                console.log("7. Found deployed network info:", deployedNetwork);
                
                const instance = new web3.eth.Contract(
                    LandRegistry.abi,
                    deployedNetwork.address
                );
                setContract(instance);
                console.log("8. Contract instance created successfully at address:", deployedNetwork.address);

                const adminAddress = await instance.methods.admin().call();
                setIsAdmin(currentAccount.toLowerCase() === adminAddress.toLowerCase());
                console.log("9. Admin check complete. Is Admin:", currentAccount.toLowerCase() === adminAddress.toLowerCase());

            } catch (error) {
                console.error("Initialization failed at some point.", error);
                alert("Failed to connect with the blockchain. Check the developer console for detailed errors.");
            } finally {
                setIsLoading(false);
                console.log("10. Initialization finished.");
            }
            // --- END DEBUGGING ---
        };

        init();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', () => { window.location.reload(); });
            window.ethereum.on('chainChanged', () => { window.location.reload(); });
        }
    }, []);

    const value = { account, accountName, contract, isAdmin, isLoading, getAccountName };

    return (
        <WalletContext.Provider value={value}>
            {!isLoading && children}
        </WalletContext.Provider>
    );
};