"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { 
  setAccount, 
  clearAccount, 
  setProvider, 
  setSigner, 
  setContracts,
  setError,
  resetWalletState
} from "@/redux/walletSlice";
import { useRouter } from "next/navigation";
import truncateEthAddress from 'truncate-eth-address';
import { setUserDetails } from "@/redux/userSlice";
import { 
  initializeProvider, 
  getSigner, 
  requestAccounts, 
  initializeContracts,
  setupAccountChangeListener
} from "@/utils/blockchain";

const ConnectWalletButton: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const walletState = useSelector((state: RootState) => state.wallet);
  const { account, isConnected } = walletState;
  const [loading, setLoading] = useState(false);

  // Setup account change listener
  useEffect(() => {
    const cleanup = setupAccountChangeListener(handleAccountsChanged);
    return cleanup;
  }, []);

  // Handle account changes
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      dispatch(resetWalletState());
    } else if (accounts[0] !== account) {
      // Account changed, update everything
      try {
        const provider = await initializeProvider();
        if (!provider) return;
        
        dispatch(setProvider(provider));
        dispatch(setAccount(accounts[0]));
        
        const signer = await getSigner(provider);
        dispatch(setSigner(signer));
        
        const contracts = initializeContracts(signer);
        dispatch(setContracts(contracts));
        
        // Check if user is registered with the new account
        await checkUserRegistration(accounts[0]);
      } catch (error: any) {
        console.error("Error handling account change:", error);
        dispatch(setError(error.message || "Failed to update wallet connection"));
      }
    }
  };

  // Check if user is registered
  const checkUserRegistration = async (address: string) => {
    try {
      const response = await fetch(`/api/check-user?address=${address}`);
      const data = await response.json();

      if (data.error) {
        console.error("API error:", data.error);
        return;
      }

      console.log("User data:", data);

      if (data.isRegistered) {
        dispatch(setUserDetails({
          role: data.role,
          name: data.name,
          licenseIPFSHash: data.licenseIPFSHash,
          isVerified: data.isVerified === 'true',
          isActive: data.isActive === 'true',
          registrationDate: data.registrationDate,
        }));
        // router.push("/dashboard");
      } else {
        // If user is not registered, redirect to registration page
        router.push("/register");
      }
    } catch (error) {
      console.error("Error checking user registration:", error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      
      // Initialize provider
      const provider = await initializeProvider();
      if (!provider) return;
      
      dispatch(setProvider(provider));
      
      // Request accounts from MetaMask
      const accounts = await requestAccounts();
      if (accounts.length === 0) return;
      
      dispatch(setAccount(accounts[0]));
      
      // Get signer
      const signer = await getSigner(provider);
      dispatch(setSigner(signer));
      
      // Initialize contracts
      const contracts = initializeContracts(signer);
      dispatch(setContracts(contracts));
      
      // Check if user is registered
      await checkUserRegistration(accounts[0]);
      
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      dispatch(setError(error.message || "Failed to connect wallet"));
      alert("Failed to connect wallet: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    dispatch(resetWalletState());
  };

  return (
    <div className="cta-button bg-[#308E70] text-[#FFFAFA] px-6 py-2 rounded-md hover:bg-[#308E70]/80 transition-all transform hover:scale-105 flex items-center justify-center">
      {isConnected && account ? (
        <button onClick={handleDisconnectWallet} className="flex items-center justify-center">
          {truncateEthAddress(account)} Disconnect
        </button>
      ) : (
        <button onClick={handleConnectWallet} disabled={loading} className="flex items-center justify-center">
          {loading ? "Connecting..." : "Connect MetaMask Wallet"}
        </button>
      )}
    </div>
  );
};

export default ConnectWalletButton;
