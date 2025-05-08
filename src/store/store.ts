import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<typeof store.getState>;

// Initialize auth state from localStorage
const token = localStorage.getItem('token');
const tokenType = localStorage.getItem('token_type');
const username = localStorage.getItem('username');

if (token && tokenType && username) {
  store.dispatch({
    type: 'auth/setCredentials',
    payload: { token, tokenType, username }
  });
}