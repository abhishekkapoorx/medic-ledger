import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Local storage
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import walletReducer from './walletSlice';
import userReducer from './userSlice'; // Import user reducer

// Configuration for persisting wallet slice
const walletPersistConfig = {
  key: 'wallet',
  storage,
};

// Create persisted reducer for wallet
const persistedWalletReducer = persistReducer(walletPersistConfig, walletReducer);

// Configuration for persisting user slice
const userPersistConfig = {
  key: 'user',
  storage,
};

// Create persisted reducer for user
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

const store = configureStore({
  reducer: {
    wallet: persistedWalletReducer,
    user: persistedUserReducer, // Add user slice to the store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export { store, persistor };
export type RootState = ReturnType<typeof store.getState>;
