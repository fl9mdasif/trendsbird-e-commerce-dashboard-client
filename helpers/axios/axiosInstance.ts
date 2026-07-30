import { authKey } from "@/contains/authKey";
import { IGenericErrorResponse, ResponseSuccessType } from "@/types/common";
import { getFromLocalStorage, setToLocalStorage, removeFromLocalStorage } from "@/utils/local-storage";
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 60000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
instance.interceptors.request.use(
  function (config) {
    const accessToken = getFromLocalStorage(authKey);
    if (accessToken) {
      config.headers.Authorization = accessToken.startsWith("Bearer ")
        ? accessToken
        : `Bearer ${accessToken}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  function (response) {
    const responseObject: ResponseSuccessType = {
      data: response?.data?.data !== undefined ? response.data.data : response.data,
      meta: response?.data?.meta,
    };
    return responseObject;
  },
  async function (error) {
    const originalRequest = error?.config;

    // Handle 401 Unauthorized & Refresh Token Flow
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token: string) => {
            originalRequest.headers.Authorization = token.startsWith("Bearer ")
              ? token
              : `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getFromLocalStorage("refreshToken");
      const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000/api";

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          });

          const newAccessToken = data?.data?.accessToken || data?.accessToken;
          const newRefreshToken = data?.data?.refreshToken || data?.refreshToken;

          if (newAccessToken) {
            setToLocalStorage(authKey, newAccessToken);
            if (newRefreshToken) {
              setToLocalStorage("refreshToken", newRefreshToken);
            }
            if (typeof document !== "undefined") {
              document.cookie = `accessToken=${newAccessToken}; path=/; max-age=86400; SameSite=Lax`;
            }

            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = newAccessToken.startsWith("Bearer ")
              ? newAccessToken
              : `Bearer ${newAccessToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          removeFromLocalStorage(authKey);
          removeFromLocalStorage("refreshToken");
          if (typeof document !== "undefined") {
            document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        removeFromLocalStorage(authKey);
        if (typeof document !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    const responseObject: IGenericErrorResponse = {
      statusCode: error?.response?.status || error?.response?.data?.statusCode || 500,
      message: error?.response?.data?.message || error?.message || "Something went wrong!",
      errorMessages: error?.response?.data?.message,
    };
    return Promise.reject(responseObject);
  }
);

export { instance };
export default instance;
