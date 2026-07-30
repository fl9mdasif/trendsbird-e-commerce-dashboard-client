/* eslint-disable @typescript-eslint/no-explicit-any */
import { authKey } from "@/contains/authKey";
import { decodedToken } from "@/utils/jwt";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from "@/utils/local-storage";
import { instance } from "@/helpers/axios/axiosInstance";

export const getRoleString = (role: any): string => {
  if (!role) return "Admin";
  if (typeof role === "string") return role;
  if (typeof role === "object") return role.name || role.title || "Admin";
  return "Admin";
};

// ── Auth helpers ─────────────────────────────────────────────────────────────
export const storeUserInfo = ({ accessToken }: { accessToken: string }) => {
  setToLocalStorage(authKey, accessToken);
};

export const getUserInfo = () => {
  const authToken = getFromLocalStorage(authKey);
  if (authToken) {
    const decodedData: any = decodedToken(authToken);
    if (!decodedData) return null;
    return {
      ...decodedData,
      role: getRoleString(decodedData?.role),
    };
  }
  return null;
};

export const isLoggedIn = () => {
  const authToken = getFromLocalStorage(authKey);
  return !!authToken;
};

export const removeUser = async () => {
  const refreshToken = getFromLocalStorage("refreshToken");
  try {
    await instance.post("/auth/logout", { refreshToken });
  } catch {
    // Ignore server error on logout cleanup
  }
  removeFromLocalStorage(authKey);
  removeFromLocalStorage("refreshToken");
  if (typeof document !== "undefined") {
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};
