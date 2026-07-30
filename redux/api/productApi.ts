import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    // GET /products — public with filters
    getAllProducts: build.query({
      query: (params?: Record<string, unknown>) => ({
        url: "/products",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.products],
    }),

    // GET /products/:id
    getSingleProduct: build.query({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.products],
    }),

    // POST /products — admin/superAdmin
    createProduct: build.mutation({
      query: (data) => ({
        url: "/products",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.products],
    }),

    // PATCH /products/:id — admin/superAdmin
    updateProduct: build.mutation({
      query: ({ id, data }: { id: string; data: unknown }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.products],
    }),

    // PATCH /products/:id/toggle-featured
    toggleFeatured: build.mutation({
      query: (id: string) => ({
        url: `/products/${id}/toggle-featured`,
        method: "PATCH",
      }),
      invalidatesTags: [tagTypes.products],
    }),

    // PATCH /products/:productId/variants/:variantId
    updateVariant: build.mutation({
      query: ({ productId, variantId, data }: { productId: string; variantId: string; data: unknown }) => ({
        url: `/products/${productId}/variants/${variantId}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.products],
    }),

    // DELETE /products/:id — admin/superAdmin
    deleteProduct: build.mutation({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.products],
    }),

    // POST /products/:productId/review — user
    addReview: build.mutation({
      query: ({ productId, data }: { productId: string; data: { rating: number; orderId?: string; variantId?: string } }) => ({
        url: `/products/${productId}/review`,
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.products, tagTypes.orders],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useToggleFeaturedMutation,
  useUpdateVariantMutation,
  useDeleteProductMutation,
  useAddReviewMutation,
} = productApi;
