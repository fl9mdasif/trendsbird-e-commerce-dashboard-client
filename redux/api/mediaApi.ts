import { tagTypes } from "../tag-types";
import { baseApi } from "./baseApi";
import { IMedia, IApiResponse } from "@/types/common";

const mediaApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // GET /media (getAllMedia)
    getAllMedia: build.query<IApiResponse<IMedia[]>, Record<string, unknown> | void>({
      query: (params) => ({
        url: "/media",
        method: "GET",
        params: params || {},
      }),
      providesTags: [tagTypes.media],
    }),

    // POST /media/upload (uploadSingleMedia)
    uploadSingleMedia: build.mutation<IApiResponse<IMedia>, FormData>({
      query: (formData) => ({
        url: "/media/upload",
        method: "POST",
        data: formData,
        contentType: "multipart/form-data",
      }),
      invalidatesTags: [tagTypes.media],
    }),

    // POST /media/upload-bulk (uploadMultipleMedia)
    uploadBulkMedia: build.mutation<IApiResponse<IMedia[]>, FormData>({
      query: (formData) => ({
        url: "/media/upload-bulk",
        method: "POST",
        data: formData,
        contentType: "multipart/form-data",
      }),
      invalidatesTags: [tagTypes.media],
    }),

    // DELETE /media/:id (deleteMedia)
    deleteMedia: build.mutation<IApiResponse<IMedia>, string>({
      query: (id) => ({
        url: `/media/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.media],
    }),
  }),
});

export const {
  useGetAllMediaQuery,
  useUploadSingleMediaMutation,
  useUploadBulkMediaMutation,
  useDeleteMediaMutation,
} = mediaApi;
