import { baseApi } from "./baseApi";
import { tagTypes } from "../tag-types";
import { IRole, IUpdateRoleInput, IAssignPermissionInput } from "@/types/common";

export const roleApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllRoles: build.query<any, Record<string, any> | void>({
      query: (params) => ({
        url: "/roles",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.roles],
    }),

    getSingleRole: build.query<IRole | { data: IRole }, string>({
      query: (id: string) => ({
        url: `/roles/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.roles],
    }),

    createRole: build.mutation<IRole, { name: string; description?: string }>({
      query: (data) => ({
        url: "/roles",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.roles],
    }),

    updateRole: build.mutation<{ success: boolean }, { id: string; data: IUpdateRoleInput }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.roles],
    }),

    deleteRole: build.mutation<void, string>({
      query: (id: string) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.roles],
    }),

    assignPermission: build.mutation<any, { roleId: string; permissionId: string } | IAssignPermissionInput & { roleId: string }>({
      query: ({ roleId, permissionId }) => ({
        url: `/roles/${roleId}/permissions`,
        method: "POST",
        data: { permissionId },
      }),
      invalidatesTags: [tagTypes.roles],
    }),

    removePermission: build.mutation<void, { roleId: string; permissionId: string }>({
      query: ({ roleId, permissionId }) => ({
        url: `/roles/${roleId}/permissions/${permissionId}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.roles],
    }),
  }),
});

export const {
  useGetAllRolesQuery,
  useGetSingleRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useAssignPermissionMutation,
  useRemovePermissionMutation,
} = roleApi;
