import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Reducers
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import vehicleReducer from './slices/vehicleSlice';
import stationReducer from './slices/stationSlice';
import chargingReducer from './slices/chargingSlice';
import reservationReducer from './slices/reservationSlice';
import paymentReducer from './slices/paymentSlice';
import notificationReducer from './slices/notificationSlice';
import locationReducer from './slices/locationSlice';
import uiReducer from './slices/uiSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'vehicles', 'location', 'ui'], // Only persist specific slices
  blacklist: ['stations', 'charging', 'reservations', 'payments', 'notifications'], // Don't persist real-time data
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  vehicles: vehicleReducer,
  stations: stationReducer,
  charging: chargingReducer,
  reservations: reservationReducer,
  payments: paymentReducer,
  notifications: notificationReducer,
  location: locationReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
    }),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export type { useSelector, useDispatch } from 'react-redux';
