import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import {
  ICategory,
  ICreateCategoryInput,
  IApiResponse,
} from "@/types/common";

const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /categories (getAllCategories)
    getAllCategories: build.query<IApiResponse<ICategory[]>, { tree?: string } | void>({
      query: (params) => ({
        url: "/categories",
        method: "GET",
        params: params || {},
      }),
      providesTags: [tagTypes.categories],
    }),

    // GET /categories/:id (getSingleCategory)
    getSingleCategory: build.query<IApiResponse<ICategory>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.categories],
    }),

    // POST /categories (createCategory)
    createCategory: build.mutation<IApiResponse<ICategory>, ICreateCategoryInput>({
      query: (data) => ({
        url: "/categories",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),

    // PATCH /categories/:id (updateCategory)
    updateCategory: build.mutation<
      IApiResponse<ICategory>,
      { id: string; data: Partial<ICreateCategoryInput> }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),

    // DELETE /categories/:id (deleteCategory)
    deleteCategory: build.mutation<IApiResponse<ICategory>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.categories],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useGetSingleCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
