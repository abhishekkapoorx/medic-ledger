// walletSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  account: string | null;
}

const initialState: WalletState = {
  account: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<string>) => {
      state.account = action.payload;
    },
    clearAccount: (state) => {
      state.account = null;
    },
  },
});

export const { setAccount, clearAccount } = walletSlice.actions;
export default walletSlice.reducer;
