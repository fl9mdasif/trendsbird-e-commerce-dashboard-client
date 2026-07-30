"use client";

import { useEffect } from "react";
import { store } from "./store";
import { Provider } from "react-redux";
import { loadLocalCart } from "./features/localCartSlice";
import { authKey } from "@/contains/authKey";
import { getFromLocalStorage } from "@/utils/local-storage";
import { authApi } from "./api/authApi";
import { setSession, setInitialized } from "./features/authSlice";

function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(loadLocalCart());

    const token = getFromLocalStorage(authKey);
    const refreshToken = getFromLocalStorage("refreshToken");

    if (token) {
      store
        .dispatch(authApi.endpoints.getSession.initiate(undefined))
        .unwrap()
        .then((res: any) => {
          const sessionData = res?.data || res;
          const user = sessionData?.user || sessionData;
          const permissions = sessionData?.permissions || user?.permissions || [];

          store.dispatch(
            setSession({
              user,
              permissions: Array.isArray(permissions) ? permissions : [],
              accessToken: token,
              refreshToken: refreshToken || undefined,
            })
          );
        })
        .catch(() => {
          store.dispatch(setInitialized(true));
        });
    } else {
      store.dispatch(setInitialized(true));
    }
  }, []);

  return <>{children}</>;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  );
}
