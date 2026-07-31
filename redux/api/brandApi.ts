import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import { IBrand, ICreateBrandInput, IApiResponse } from "@/types/common";

const brandApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /brands (getAllBrands)
    getAllBrands: build.query<IApiResponse<IBrand[]>, Record<string, unknown> | void>({
      query: (params) => ({
        url: "/brands",
        method: "GET",
        params: params || {},
      }),
      providesTags: [tagTypes.brands],
    }),

    // GET /brands/:id (getSingleBrand)
    getSingleBrand: build.query<IApiResponse<IBrand>, string>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.brands],
    }),

    // POST /brands (createBrand)
    createBrand: build.mutation<IApiResponse<IBrand>, ICreateBrandInput>({
      query: (data) => ({
        url: "/brands",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.brands],
    }),

    // PATCH /brands/:id (updateBrand)
    updateBrand: build.mutation<IApiResponse<IBrand>, { id: string; data: ICreateBrandInput }>({
      query: ({ id, data }) => ({
        url: `/brands/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.brands],
    }),

    // DELETE /brands/:id (deleteBrand)
    deleteBrand: build.mutation<IApiResponse<IBrand>, string>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.brands],
    }),
  }),
});

export const {
  useGetAllBrandsQuery,
  useGetSingleBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandApi;
