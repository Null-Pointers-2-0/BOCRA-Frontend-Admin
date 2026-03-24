import { apiClient } from "../client";
import type {
  StaffArticleListItem,
  StaffArticleDetail,
  ArticleCreateRequest,
  ArticleUpdateRequest,
  StaffArticleListParams,
} from "../types";

export const newsClient = {
  list: (params?: StaffArticleListParams) =>
    apiClient<StaffArticleListItem[]>("/news/staff/list/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  get: (id: string) =>
    apiClient<StaffArticleDetail>(`/news/staff/${id}/`),

  create: (data: ArticleCreateRequest) => {
    if (data.featured_image) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value as string | Blob);
      });
      return apiClient<StaffArticleDetail>("/news/staff/", {
        method: "POST",
        body: formData,
        isFormData: true,
      });
    }
    return apiClient<StaffArticleDetail>("/news/staff/", { method: "POST", body: data });
  },

  update: (id: string, data: ArticleUpdateRequest) => {
    if (data.featured_image) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value as string | Blob);
      });
      return apiClient<StaffArticleDetail>(`/news/staff/${id}/edit/`, {
        method: "PATCH",
        body: formData,
        isFormData: true,
      });
    }
    return apiClient<StaffArticleDetail>(`/news/staff/${id}/edit/`, { method: "PATCH", body: data });
  },

  publish: (id: string) =>
    apiClient<StaffArticleDetail>(`/news/staff/${id}/publish/`, { method: "PATCH" }),

  archive: (id: string) =>
    apiClient<StaffArticleDetail>(`/news/staff/${id}/archive/`, { method: "PATCH" }),

  delete: (id: string) =>
    apiClient(`/news/staff/${id}/delete/`, { method: "DELETE" }),
};
