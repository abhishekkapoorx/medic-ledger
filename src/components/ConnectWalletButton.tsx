"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setAccount, clearAccount } from "@/redux/walletSlice";
// import { useRouter } from "next/router";
import { useRouter } from "next/navigation";
import truncateEthAddress from 'truncate-eth-address'
import { setUserDetails } from "@/redux/userSlice";

declare global {
  interface Window {
    ethereum?: {
      request: (request: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

const ConnectWalletButton: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const account = useSelector((state: RootState) => state.wallet.account);
  const [loading, setLoading] = useState(false);

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to use this app!");
        return;
      }
      setLoading(true);
  
      // Request accounts from MetaMask
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        dispatch(setAccount(accounts[0]));
  
        // Check if user is registered
        const response = await fetch(`/api/check-user?address=${accounts[0]}`);
        const data = await response.json();
  
        if (data.error) {
          // Handle API errors
          alert(data.error || "An error occurred.");
          return;
        }

        console.log("User data:", data); // Log the user data for debugging
  
        if (data.isRegistered) {
          dispatch(setUserDetails({
            role: data.role,
            name: data.name,
            licenseIPFSHash: data.licenseIPFSHash,
            isVerified: data.isVerified === 'true',  // Convert to boolean if necessary
            isActive: data.isActive === 'true',  // Convert to boolean if necessary
            registrationDate: data.registrationDate,
          }));
          // router.push("/dashboard");
        } else {
          // If user is not registered, redirect to registration page
          router.push("/register");
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const handleDisconnectWallet = () => {
    dispatch(clearAccount());
  };

  return (
    <div className="cta-button bg-[#308E70] text-[#FFFAFA] px-6 py-2 rounded-md hover:bg-[#308E70]/80 transition-all transform hover:scale-105 flex items-center justify-center">
      {account ? (
          <button onClick={handleDisconnectWallet} className="flex items-center justify-center">{truncateEthAddress(account)} Disconnect</button>
      ) : (
        <button onClick={handleConnectWallet} disabled={loading}  className="flex items-center justify-center">
          {loading ? "Connecting..." : "Connect MetaMask Wallet"}
        </button>
      )}
    </div>
  );
};

export default ConnectWalletButton;
