// walletSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

// Define types for our blockchain objects
export interface BlockchainContracts {
  medicineContract: ethers.Contract | null;
  marketplaceContract: ethers.Contract | null;
  userRegistryContract: ethers.Contract | null;
}

interface WalletState {
  account: string | null;
  provider: any | null;
  signer: any | null;
  contracts: BlockchainContracts;
  isConnected: boolean;
  error: string | null;
}

const initialState: WalletState = {
  account: null,
  provider: null,
  signer: null,
  contracts: {
    medicineContract: null,
    marketplaceContract: null,
    userRegistryContract: null
  },
  isConnected: false,
  error: null
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<string>) => {
      state.account = action.payload;
      state.isConnected = true;
    },
    clearAccount: (state) => {
      state.account = null;
      state.isConnected = false;
    },
    setProvider: (state, action: PayloadAction<any>) => {
      state.provider = action.payload;
    },
    setSigner: (state, action: PayloadAction<any>) => {
      state.signer = action.payload;
    },
    setContracts: {
      reducer: (state, action: PayloadAction<BlockchainContracts>) => {
        // Replace the entire contracts object instead of setting properties individually
        state.contracts = action.payload as any;
      },
      prepare: (contracts: BlockchainContracts) => {
        return { payload: contracts };
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // For complete reset or disconnect
    resetWalletState: (state) => {
      return initialState;
    }
  },
});

export const { 
  setAccount, 
  clearAccount, 
  setProvider, 
  setSigner, 
  setContracts, 
  setError, 
  clearError,
  resetWalletState
} = walletSlice.actions;

export default walletSlice.reducer;
