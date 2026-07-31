import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import {
  IUser,
  ICreateUserInput,
  IUpdateUserInput,
  IApiResponse,
} from "@/types/common";

const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // POST /users (createUser)
    createUser: build.mutation<IApiResponse<IUser>, ICreateUserInput>({
      query: (data) => ({
        url: "/users",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.users],
    }),

    // GET /users (getAllUsers)
    getAllUsers: build.query<IApiResponse<IUser[]>, Record<string, unknown> | void>({
      query: (params) => ({ url: "/users", method: "GET", params: params || {} }),
      providesTags: [tagTypes.users],
    }),

    // GET /users/:id (getSingleUser)
    getSingleUser: build.query<IApiResponse<IUser>, string>({
      query: (id) => ({ url: `/users/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: tagTypes.users, id }],
    }),

    // PATCH /users/:id (updateUser)
    updateUser: build.mutation<IApiResponse<IUser>, { id: string; data: IUpdateUserInput }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [tagTypes.users, { type: tagTypes.users, id }],
    }),

    // DELETE /users/:id (deleteUser)
    deleteUser: build.mutation<IApiResponse<void>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.users],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetAllUsersQuery,
  useGetSingleUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
