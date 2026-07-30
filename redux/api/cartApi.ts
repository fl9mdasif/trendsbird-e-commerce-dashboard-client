import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const cartApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getCart: build.query({
            query: () => ({
                url: "/carts",
                method: "GET",
            }),
            providesTags: [tagTypes.cart],
        }),

        addToCart: build.mutation({
            query: (data) => ({
                url: "/carts",
                method: "POST",
                data,
            }),
            invalidatesTags: [tagTypes.cart],
        }),

        updateQuantity: build.mutation({
            query: ({ productId, variantId, quantity }) => ({
                url: `/carts/${productId}/${variantId}`,
                method: "PATCH",
                data: { quantity },
            }),
            invalidatesTags: [tagTypes.cart],
        }),

        removeFromCart: build.mutation({
            query: ({ productId, variantId }) => ({
                url: `/carts/${productId}/${variantId}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.cart],
        }),

        clearCart: build.mutation({
            query: () => ({
                url: "/carts/clear",
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.cart],
        }),
    }),
});

export const {
    useGetCartQuery,
    useAddToCartMutation,
    useUpdateQuantityMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
} = cartApi;
