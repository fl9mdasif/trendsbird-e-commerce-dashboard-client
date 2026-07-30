import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authKey } from "@/contains/authKey";
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from "@/utils/local-storage";

export interface User {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  role?: string;
  status?: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  permissions: string[];
  accessToken: string | null;
  refreshToken: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  permissions: [],
  accessToken: typeof window !== "undefined" ? getFromLocalStorage(authKey) : null,
  refreshToken: typeof window !== "undefined" ? getFromLocalStorage("refreshToken") : null,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{
        user: User | null;
        permissions?: string[];
        accessToken: string | null;
        refreshToken?: string | null;
      }>
    ) => {
      const { user, permissions = [], accessToken, refreshToken } = action.payload;
      state.user = user;
      state.permissions = permissions;
      state.accessToken = accessToken;
      state.isInitialized = true;

      if (accessToken) {
        setToLocalStorage(authKey, accessToken);
        if (typeof document !== "undefined") {
          document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
        }
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
        setToLocalStorage("refreshToken", refreshToken);
      }
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    clearSession: (state) => {
      state.user = null;
      state.permissions = [];
      state.accessToken = null;
      state.refreshToken = null;
      state.isInitialized = true;
      removeFromLocalStorage(authKey);
      removeFromLocalStorage("refreshToken");
      if (typeof document !== "undefined") {
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { setSession, setPermissions, clearSession, setInitialized } = authSlice.actions;

export default authSlice.reducer;
