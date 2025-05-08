export interface AuthState {
  token: string | null;
  tokenType: string | null;
  username: string | null;
  isAuthenticated: boolean;
}

export interface RootState {
  auth: AuthState;
}