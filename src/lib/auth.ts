import { store } from '@/store/store';
import { logout as logoutAction } from '@/store/authSlice';
import type { RootState } from '@/store/store';

export const getAuthHeader = () => {
  const state = store.getState() as RootState;
  const { token, tokenType } = state.auth;
  
  if (!token || !tokenType) {
    console.log('Missing auth credentials:', { hasToken: !!token, hasTokenType: !!tokenType });
    return null;
  }

  // Format should be: Bearer <token> for JWT
  const headers = {
    'Authorization': `${tokenType} ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  return headers;
};

export const isAuthenticated = () => {
  const state = store.getState() as RootState;
  return state.auth.isAuthenticated;
};

// Custom event for logout to notify all components
export const LOGOUT_EVENT = 'app:logout';

export const logout = () => {
  // Dispatch logout action to clear auth state
  store.dispatch(logoutAction());
  
  // Dispatch a custom event to notify components (like CartContext) to clear their state
  window.dispatchEvent(new Event(LOGOUT_EVENT));
  
  // Redirect to auth page
  window.location.href = '/auth';
};

export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  
  const decoded = decodeJWT(token);
  if (!decoded) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  
  // Return true if token is expired or will expire in next 60 seconds
  return currentTime >= (expirationTime - 60000);
};