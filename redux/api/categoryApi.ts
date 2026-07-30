import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createCategory: build.mutation({
      query: (data) => ({
        url: "/categories",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.categories]
    }),

    getAllCategories: build.query({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      providesTags: [tagTypes.categories]
    }),

    getSingleCategory: build.query({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.categories]
    }),

    updateCategory: build.mutation({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.categories]

    }),

    toggleCategoryStatus: build.mutation({
      query: (id) => ({
        url: `/categories/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.categories]

    }),

    deleteCategory: build.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.categories]

    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useGetSingleCategoryQuery,
  useUpdateCategoryMutation,
  useToggleCategoryStatusMutation,
  useDeleteCategoryMutation,
} = categoryApi;
