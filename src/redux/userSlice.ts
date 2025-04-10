import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  role: string;
  name: string;
  licenseIPFSHash: string;
  isVerified: boolean;
  isActive: boolean;
  registrationDate: string;  // Store as a string to handle BigInt serialization
}

const initialState: UserState = {
  role: '',
  name: '',
  licenseIPFSHash: '',
  isVerified: false,
  isActive: false,
  registrationDate: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserDetails: (state, action: PayloadAction<UserState>) => {
      state.role = action.payload.role;
      state.name = action.payload.name;
      state.licenseIPFSHash = action.payload.licenseIPFSHash;
      state.isVerified = action.payload.isVerified;
      state.isActive = action.payload.isActive;
      state.registrationDate = action.payload.registrationDate;
    },
    clearUserDetails: (state) => {
      state.role = '';
      state.name = '';
      state.licenseIPFSHash = '';
      state.isVerified = false;
      state.isActive = false;
      state.registrationDate = '';
    },
  },
});

export const { setUserDetails, clearUserDetails } = userSlice.actions;
export default userSlice.reducer;
