import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from './types';

const initialState: AuthState = {
  token: null,
  tokenType: null,
  username: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        tokenType: string;
        username: string;
      }>
    ) => {
      state.token = action.payload.token;
      state.tokenType = action.payload.tokenType;
      state.username = action.payload.username;
      state.isAuthenticated = true;
      // Keep localStorage for persistence
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('token_type', action.payload.tokenType);
      localStorage.setItem('username', action.payload.username);
    },
    logout: (state) => {
      state.token = null;
      state.tokenType = null;
      state.username = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('username');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;