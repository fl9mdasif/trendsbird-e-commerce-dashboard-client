import { baseApi } from "./baseApi";
import { tagTypes } from "../tag-types";
import { ILoginInput } from "@/types/common";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<{email:string, password: string}, ILoginInput>({
      query: (loginData) => ({
        url: "/auth/login",
        method: "POST",
        data: loginData,
      }),
      invalidatesTags: [tagTypes.users],
    }),
    getSession: build.query<unknown, void>({
      query: () => ({
        url: "/auth/session",
        method: "GET",
      }),
      providesTags: [tagTypes.users],
    }),
    logout: build.mutation<unknown, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: [tagTypes.users],
    }),
  }),
});

export const { useLoginMutation, useGetSessionQuery, useLazyGetSessionQuery, useLogoutMutation } = authApi;
