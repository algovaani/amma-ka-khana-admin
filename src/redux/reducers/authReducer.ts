import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loadSession, clearSession, saveSession, AdminSession } from '../../services/auth/sessionStorage';

const stored = loadSession();

interface AuthState {
  user: { id: string; name: string; email: string; role: string } | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: stored?.user ?? null,
  token: stored?.token ?? null,
  refreshToken: stored?.refreshToken ?? null,
  isAuthenticated: Boolean(stored?.token),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<AdminSession>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      clearSession();
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateTokens: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      if (state.user) {
        saveSession({
          user: state.user,
          token: action.payload.token,
          refreshToken: action.payload.refreshToken,
        });
      }
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, logout, updateTokens } = authSlice.actions;
export default authSlice.reducer;
