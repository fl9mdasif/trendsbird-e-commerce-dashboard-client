import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";

const orderApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // Create / Place Order (User)
        placeOrder: build.mutation({
            query: (data) => ({
                url: "/orders",
                method: "POST",
                data,
            }),
            invalidatesTags: [tagTypes.orders, tagTypes.cart],
        }),

        // Get All Orders (Admin)
        getAllOrders: build.query({
            query: (params) => ({
                url: "/orders",
                method: "GET",
                params,
            }),
            providesTags: [tagTypes.orders],
        }),

        // Get Sales Analytics (Admin)
        getSalesAnalytics: build.query({
            query: (period) => ({
                url: `/orders/analytics/sales?period=${period || 'monthly'}`,
                method: "GET",
            }),
            providesTags: [tagTypes.orders],
        }),

        // Get My Orders (User)
        getMyOrders: build.query({
            query: () => ({
                url: "/orders/my-orders",
                method: "GET",
            }),
            providesTags: [tagTypes.orders],
        }),

        // Get Single Order
        getSingleOrder: build.query({
            query: (id) => ({
                url: `/orders/${id}`,
                method: "GET",
            }),
            providesTags: [tagTypes.orders],
        }),

        // Update Order Lifecycle Status (Admin)
        updateOrderStatus: build.mutation({
            query: ({ id, data }) => ({
                url: `/orders/${id}/status`,
                method: "PATCH",
                data, // { status: "processing", note: "..." }
            }),
            invalidatesTags: [tagTypes.orders],

        }),

        // Update Payment Status (Admin)
        updatePaymentStatus: build.mutation({
            query: ({ id, data }) => ({
                url: `/orders/${id}/payment-status`,
                method: "PATCH",
                data, // { paymentStatus: "paid", transactionId: "..." }
            }),
            invalidatesTags: [tagTypes.orders],

        }),

        // Cancel Order (User/Admin)
        cancelOrder: build.mutation({
            query: ({ id, data }) => ({
                url: `/orders/${id}/cancel`,
                method: "PATCH",
                data, // { reason: "..." }
            }),
            invalidatesTags: [tagTypes.orders],

        }),
    }),
});

export const {
    usePlaceOrderMutation,
    useGetAllOrdersQuery,
    useGetSalesAnalyticsQuery,
    useGetMyOrdersQuery,
    useGetSingleOrderQuery,
    useUpdateOrderStatusMutation,
    useUpdatePaymentStatusMutation,
    useCancelOrderMutation,
} = orderApi;
