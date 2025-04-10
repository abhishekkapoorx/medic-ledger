'use client'
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setAccount } from '@/redux/walletSlice';

declare global {
    interface Window {
      ethereum?: {
        request: (request: { method: string; params?: any[] }) => Promise<any>;
      };
    }
  }

const ConnectWalletButton: React.FC = () => {
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.wallet.account);

  const handleConnectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to use this app!");
        return;
      }
      // Request accounts from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        dispatch(setAccount(accounts[0]));
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <div>
      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <button onClick={handleConnectWallet}>Connect MetaMask Wallet</button>
      )}
    </div>
  );
};

export default ConnectWalletButton;
