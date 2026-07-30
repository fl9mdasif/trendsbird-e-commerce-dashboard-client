import { baseApi } from "./baseApi";
import { tagTypes } from "../tag-types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (loginData: { email?: string; password?: string }) => ({
        url: "/auth/login",
        method: "POST",
        data: loginData,
      }),
      invalidatesTags: [tagTypes.users],
    }),
    getSession: build.query({
      query: () => ({
        url: "/auth/session",
        method: "GET",
      }),
      providesTags: [tagTypes.users],
    }),
    logout: build.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: [tagTypes.users],
    }),
  }),
});

export const { useLoginMutation, useGetSessionQuery, useLazyGetSessionQuery, useLogoutMutation } = authApi;
