import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import {
  IAttribute,
  IAttributeValue,
  ICreateAttributeInput,
  IApiResponse,
} from "@/types/common";

const attributeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /attributes (getAllAttributes)
    getAllAttributes: build.query<IApiResponse<IAttribute[]>, Record<string, unknown> | void>({
      query: (params) => ({
        url: "/attributes",
        method: "GET",
        params: params || {},
      }),
      providesTags: [tagTypes.attributes],
    }),

    // GET /attributes/:id (getSingleAttribute)
    getSingleAttribute: build.query<IApiResponse<IAttribute>, string>({
      query: (id) => ({
        url: `/attributes/${id}`,
        method: "GET",
      }),
      providesTags: [tagTypes.attributes],
    }),

    // POST /attributes (createAttribute)
    createAttribute: build.mutation<IApiResponse<IAttribute>, ICreateAttributeInput>({
      query: (data) => ({
        url: "/attributes",
        method: "POST",
        data,
      }),
      invalidatesTags: [tagTypes.attributes],
    }),

    // PATCH /attributes/:id (updateAttribute)
    updateAttribute: build.mutation<IApiResponse<IAttribute>, { id: string; data: ICreateAttributeInput }>({
      query: ({ id, data }) => ({
        url: `/attributes/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: [tagTypes.attributes],
    }),

    // DELETE /attributes/:id (deleteAttribute)
    deleteAttribute: build.mutation<IApiResponse<IAttribute>, string>({
      query: (id) => ({
        url: `/attributes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.attributes],
    }),

    // POST /attributes/:id/values (createAttributeValue)
    createAttributeValue: build.mutation<
      IApiResponse<IAttributeValue>,
      { attributeId: string; value: string; data?: { value: string } }
    >({
      query: (arg) => {
        const attributeId = arg.attributeId;
        const bodyData = arg.data ? arg.data : { value: arg.value };
        return {
          url: `/attributes/${attributeId}/values`,
          method: "POST",
          data: bodyData,
        };
      },
      invalidatesTags: [tagTypes.attributes],
    }),

    // PATCH /attributes/:id/values/:vid (updateAttributeValue)
    updateAttributeValue: build.mutation<
      IApiResponse<IAttributeValue>,
      { attributeId: string; valueId: string; value?: string; data?: { value: string } }
    >({
      query: (arg) => {
        const { attributeId, valueId } = arg;
        const bodyData = arg.data ? arg.data : { value: arg.value };
        return {
          url: `/attributes/${attributeId}/values/${valueId}`,
          method: "PATCH",
          data: bodyData,
        };
      },
      invalidatesTags: [tagTypes.attributes],
    }),

    // DELETE /attributes/:id/values/:vid (deleteAttributeValue)
    deleteAttributeValue: build.mutation<
      IApiResponse<IAttributeValue>,
      { attributeId: string; valueId: string }
    >({
      query: ({ attributeId, valueId }) => ({
        url: `/attributes/${attributeId}/values/${valueId}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.attributes],
    }),
  }),
});

export const {
  useGetAllAttributesQuery,
  useGetSingleAttributeQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  useCreateAttributeValueMutation,
  useUpdateAttributeValueMutation,
  useDeleteAttributeValueMutation,
} = attributeApi;
