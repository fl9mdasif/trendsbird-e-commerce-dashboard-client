import { baseApi } from "./baseApi";
import { tagTypes } from "../tag-types";
import { ICreatePermissionInput, IPermission } from "@/types/common";

export const permissionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllPermissions: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/permissions",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.permissions],
    }),
    createPermission: build.mutation<IPermission, ICreatePermissionInput>({
      query: (data) => ({
        url: "/permissions",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.permissions],
    }),
    getSinglePermission: build.query<IPermission, string>({
      query: (id: string) => ({
        url: `/permissions/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.permissions],
    }),
    updatePermission: build.mutation<IPermission, { id: string; data: Partial<ICreatePermissionInput> }>({
      query: ({ id, data }) => ({
        url: `/permissions/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.permissions],
    }),
    deletePermission: build.mutation<void, string>({
      query: (id: string) => ({
        url: `/permissions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.permissions],
    }),
  }),
});

export const {
  useGetAllPermissionsQuery,
  useCreatePermissionMutation,
  useGetSinglePermissionQuery,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = permissionApi;
