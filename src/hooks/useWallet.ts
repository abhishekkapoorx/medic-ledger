import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { 
  setAccount, 
  setProvider, 
  setSigner, 
  setContracts,
  setError,
  resetWalletState
} from '@/redux/walletSlice';
import { 
  initializeProvider, 
  getSigner, 
  requestAccounts, 
  initializeContracts,
  setupAccountChangeListener
} from '@/utils/blockchain';

/**
 * Custom hook for wallet functionality across the application
 */
const useWallet = () => {
  const dispatch = useDispatch();
  const walletState = useSelector((state: RootState) => state.wallet);
  
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
    } else if (accounts[0] !== walletState.account) {
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
      } catch (error: any) {
        console.error("Error handling account change:", error);
        dispatch(setError(error.message || "Failed to update wallet connection"));
      }
    }
  };
  
  // Connect wallet
  const connectWallet = async (): Promise<boolean> => {
    try {
      // Initialize provider
      const provider = await initializeProvider();
      if (!provider) return false;
      
      dispatch(setProvider(provider));
      
      // Request accounts from MetaMask
      const accounts = await requestAccounts();
      if (accounts.length === 0) return false;
      
      dispatch(setAccount(accounts[0]));
      
      // Get signer
      const signer = await getSigner(provider);
      dispatch(setSigner(signer));
      
      // Initialize contracts
      const contracts = initializeContracts(signer);
      dispatch(setContracts(contracts));
      
      return true;
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      dispatch(setError(error.message || "Failed to connect wallet"));
      return false;
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    dispatch(resetWalletState());
  };
  
  return {
    ...walletState,
    connectWallet,
    disconnectWallet
  };
};

export default useWallet; 