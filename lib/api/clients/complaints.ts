import { apiClient } from "../client";
import type {
  StaffComplaintListItem,
  StaffComplaintDetail,
  ComplaintStatusUpdateRequest,
  ComplaintAssignRequest,
  ComplaintResolveRequest,
  CaseNoteCreateRequest,
  StaffComplaintListParams,
  CaseNote,
} from "../types";

export const complaintsClient = {
  list: (params?: StaffComplaintListParams) =>
    apiClient<StaffComplaintListItem[]>("/complaints/staff/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  get: (id: string) =>
    apiClient<StaffComplaintDetail>(`/complaints/staff/${id}/`),

  updateStatus: (id: string, data: ComplaintStatusUpdateRequest) =>
    apiClient<{ status: string }>(`/complaints/${id}/status/`, {
      method: "PATCH",
      body: data,
    }),

  assign: (id: string, data: ComplaintAssignRequest) =>
    apiClient<{ assigned_to: string; assigned_to_name: string; status: string }>(`/complaints/${id}/assign/`, {
      method: "PATCH",
      body: data,
    }),

  resolve: (id: string, data: ComplaintResolveRequest) =>
    apiClient<{ status: string; resolved_at: string }>(`/complaints/${id}/resolve/`, {
      method: "POST",
      body: data,
    }),

  addNote: (id: string, data: CaseNoteCreateRequest) =>
    apiClient<CaseNote>(`/complaints/${id}/notes/`, {
      method: "POST",
      body: data,
    }),
};
