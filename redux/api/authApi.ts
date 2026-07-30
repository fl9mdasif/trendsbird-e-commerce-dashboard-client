import { baseApi } from "./baseApi";
import { tagTypes } from "../tag-types";
import { ILoginInput } from "@/types/common";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<any, ILoginInput>({
      query: (loginData) => ({
        url: "/auth/login",
        method: "POST",
        data: loginData,
      }),
      invalidatesTags: [tagTypes.users],
    }),
    getSession: build.query<any, void>({
      query: () => ({
        url: "/auth/session",
        method: "GET",
      }),
      providesTags: [tagTypes.users],
    }),
    logout: build.mutation<any, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: [tagTypes.users],
    }),
  }),
});

export const { useLoginMutation, useGetSessionQuery, useLazyGetSessionQuery, useLogoutMutation } = authApi;
