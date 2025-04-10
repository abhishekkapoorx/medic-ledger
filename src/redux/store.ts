import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Local storage
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import walletReducer from './walletSlice'; 

const persistConfig = {
  key: 'wallet', 
  storage,     
};


const persistedAuthReducer = persistReducer(persistConfig, walletReducer);

const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
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