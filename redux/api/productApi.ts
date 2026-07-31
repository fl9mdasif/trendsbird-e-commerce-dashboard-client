import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import { IProduct, ICreateProductInput, IApiResponse } from "@/types/common";

const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /products (getAllProducts)
    getAllProducts: build.query<IApiResponse<IProduct[]>, Record<string, unknown> | void>({
      query: (params) => ({
        url: "/products",
        method: "GET",
        params: params || {},
      }),
      providesTags: [tagTypes.products],
    }),

    // GET /products/:id (getSingleProduct)
    getSingleProduct: build.query<IApiResponse<IProduct>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.products],
    }),

    // POST /products (createProduct)
    createProduct: build.mutation<IApiResponse<IProduct>, ICreateProductInput>({
      query: (data) => ({
        url: "/products",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.products],
    }),

    // PATCH /products/:id (updateProduct)
    updateProduct: build.mutation<IApiResponse<IProduct>, { id: string; data: Partial<ICreateProductInput> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.products],
    }),

    // DELETE /products/:id (deleteProduct)
    deleteProduct: build.mutation<IApiResponse<IProduct>, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.products],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
