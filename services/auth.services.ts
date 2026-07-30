/* eslint-disable @typescript-eslint/no-explicit-any */
import { authKey } from "@/contains/authKey";
import { decodedToken } from "@/utils/jwt";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
  setToLocalStorage,
} from "@/utils/local-storage";

import { logoutUser } from "./actions/logoutUser";

// ── Auth helpers ─────────────────────────────────────────────────────────────
export const storeUserInfo = ({ accessToken }: { accessToken: string }) => {
  setToLocalStorage(authKey, accessToken);
};

export const getUserInfo = () => {
  const authToken = getFromLocalStorage(authKey);
  if (authToken) {
    const decodedData: any = decodedToken(authToken);
    return {
      ...decodedData,
      role: decodedData?.role?.toLowerCase(),
    };
  }
  return null;
};

export const isLoggedIn = () => {
  const authToken = getFromLocalStorage(authKey);
  return !!authToken;
};

export const removeUser = () => {
  removeFromLocalStorage(authKey);
  logoutUser();
};
