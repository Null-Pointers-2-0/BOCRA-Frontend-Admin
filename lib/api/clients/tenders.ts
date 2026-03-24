import { apiClient } from "../client";
import type {
  StaffTenderListItem,
  StaffTenderDetail,
  TenderCreateRequest,
  TenderUpdateRequest,
  TenderAwardCreateRequest,
  TenderAddendumCreateRequest,
  StaffTenderListParams,
} from "../types";

export const tendersClient = {
  list: (params?: StaffTenderListParams) =>
    apiClient<StaffTenderListItem[]>("/tenders/staff/list/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  get: (id: string) =>
    apiClient<StaffTenderDetail>(`/tenders/staff/${id}/`),

  create: (data: TenderCreateRequest) =>
    apiClient<StaffTenderDetail>("/tenders/staff/", { method: "POST", body: data }),

  update: (id: string, data: TenderUpdateRequest) =>
    apiClient<StaffTenderDetail>(`/tenders/staff/${id}/edit/`, { method: "PATCH", body: data }),

  publish: (id: string) =>
    apiClient<StaffTenderDetail>(`/tenders/staff/${id}/publish/`, { method: "PATCH" }),

  close: (id: string) =>
    apiClient<StaffTenderDetail>(`/tenders/staff/${id}/close/`, { method: "PATCH" }),

  award: (id: string, data: TenderAwardCreateRequest) =>
    apiClient<StaffTenderDetail>(`/tenders/staff/${id}/award/`, { method: "POST", body: data }),

  addAddendum: (id: string, data: TenderAddendumCreateRequest) =>
    apiClient(`/tenders/staff/${id}/addenda/`, { method: "POST", body: data }),

  uploadDocument: (id: string, formData: FormData) =>
    apiClient(`/tenders/staff/${id}/documents/`, { method: "POST", body: formData, isFormData: true }),

  delete: (id: string) =>
    apiClient(`/tenders/staff/${id}/delete/`, { method: "DELETE" }),
};
