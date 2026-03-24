import { apiClient } from "../client";
import type {
  StaffPublicationListItem,
  StaffPublicationDetail,
  PublicationCreateRequest,
  PublicationUpdateRequest,
  StaffPublicationListParams,
} from "../types";

export const publicationsClient = {
  list: (params?: StaffPublicationListParams) =>
    apiClient<StaffPublicationListItem[]>("/publications/staff/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  get: (id: string) =>
    apiClient<StaffPublicationDetail>(`/publications/staff/${id}/`),

  create: (data: PublicationCreateRequest) => {
    if (data.file) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value as string | Blob);
      });
      return apiClient<StaffPublicationDetail>("/publications/staff/", {
        method: "POST",
        body: formData,
        isFormData: true,
      });
    }
    return apiClient<StaffPublicationDetail>("/publications/staff/", {
      method: "POST",
      body: data,
    });
  },

  update: (id: string, data: PublicationUpdateRequest) => {
    if (data.file) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value as string | Blob);
      });
      return apiClient<StaffPublicationDetail>(`/publications/staff/${id}/`, {
        method: "PATCH",
        body: formData,
        isFormData: true,
      });
    }
    return apiClient<StaffPublicationDetail>(`/publications/staff/${id}/`, {
      method: "PATCH",
      body: data,
    });
  },

  publish: (id: string) =>
    apiClient<StaffPublicationDetail>(`/publications/staff/${id}/publish/`, { method: "PATCH" }),

  archive: (id: string) =>
    apiClient<StaffPublicationDetail>(`/publications/staff/${id}/archive/`, { method: "PATCH" }),

  delete: (id: string) =>
    apiClient(`/publications/staff/${id}/`, { method: "DELETE" }),
};
