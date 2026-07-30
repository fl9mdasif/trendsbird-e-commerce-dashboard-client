import { TSavedAddress } from "@/types";
import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const userApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // ── Profile (all authenticated users) ─────────────────────────────────

        // GET /users/me
        getMyProfile: build.query({
            query: () => ({ url: "/users/me", method: "GET" }),
            providesTags: [tagTypes.users],
        }),

        // PATCH /users/me
        updateProfile: build.mutation({
            query: (data) => ({ url: "/users/me", method: "PATCH", data }),
            invalidatesTags: [tagTypes.users],
        }),

        // POST /users/me/change-password
        changePassword: build.mutation({
            query: (data: { oldPassword: string; newPassword: string }) => ({
                url: "/users/me/change-password",
                method: "POST",
                data,
            }),
        }),

        // ── Address management ─────────────────────────────────────────────────

        // GET /users/addresses
        getAddresses: build.query({
            query: () => ({ url: "/users/addresses", method: "GET" }),
            providesTags: [tagTypes.users],
        }),

        // POST /users/addresses
        addAddress: build.mutation({
            query: (data: TSavedAddress) => ({
                url: "/users/addresses",
                method: "POST",
                data,
            }),
            invalidatesTags: [tagTypes.users],
        }),

        // PATCH /users/addresses/:id
        updateAddress: build.mutation({
            query: ({ id, data }: { id: string; data: Partial<TSavedAddress> }) => ({
                url: `/users/addresses/${id}`,
                method: "PATCH",
                data,
            }),
            invalidatesTags: [tagTypes.users],
        }),

        // PATCH /users/addresses/:id/default
        setDefaultAddress: build.mutation({
            query: (id: string) => ({
                url: `/users/addresses/${id}/default`,
                method: "PATCH",
            }),
            invalidatesTags: [tagTypes.users],
        }),

        // DELETE /users/addresses/:id
        deleteAddress: build.mutation({
            query: (id: string) => ({
                url: `/users/addresses/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.users],
        }),

        // ── Admin / Superadmin user management ────────────────────────────────

        // GET all users (admin/superAdmin)
        getAllUsers: build.query({
            query: (params) => ({ url: "/users", method: "GET", params }),
            providesTags: [tagTypes.users],
        }),

        // PATCH user role (superAdmin)
        updateUserRole: build.mutation({
            query: ({ id, role }) => ({
                url: `/users/${id}/role`,
                method: "PATCH",
                data: { role },
            }),
            invalidatesTags: [tagTypes.users],
        }),

        // PATCH block/unblock user (superAdmin)
        toggleBlockUser: build.mutation({
            query: (id: string) => ({
                url: `/users/${id}/block`,
                method: "PATCH",
            }),
            invalidatesTags: [tagTypes.users],
        }),

        // DELETE user (superAdmin)
        deleteUser: build.mutation({
            query: (id: string) => ({
                url: `/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.users],
        }),

        // Guest checkout — find-or-create user with real email, return accessToken
        guestCheckout: build.mutation({
            query: (data: { email: string; fullName: string; phone: string }) => ({
                url: "/auth/guest-checkout",
                method: "POST",
                data,
            }),
        }),
    }),
});

export const {
    useGetMyProfileQuery,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useGetAllUsersQuery,
    useUpdateUserRoleMutation,
    useToggleBlockUserMutation,
    useDeleteUserMutation,
    useGetAddressesQuery,
    useAddAddressMutation,
    useUpdateAddressMutation,
    useSetDefaultAddressMutation,
    useDeleteAddressMutation,
    useGuestCheckoutMutation,
} = userApi;
