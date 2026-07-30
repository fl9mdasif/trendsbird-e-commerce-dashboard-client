/* eslint-disable @typescript-eslint/no-unused-vars */
// Need to use the React-specific entry point to import createApi
import { axiosBaseQuery } from "@/helpers/axios/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { tagTypesList } from "../tag-types";

// Define a service using a base URL and expected endpoints
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_URL as string,
  }),
  endpoints: (builder) => ({}),
  tagTypes: tagTypesList,
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
