import { apiClient } from "../client";
import type { PaginatedData } from "../types/common";
import type {
  AuditRequest,
  AuditRequestCounts,
  AuditRequestListItem,
  AuditRequestParams,
} from "../types/cybersecurity";

export const cybersecurityClient = {
  // -- Staff endpoints
  list: (params?: AuditRequestParams) =>
    apiClient<PaginatedData<AuditRequestListItem>>("/cybersecurity/staff/", { params }),

  counts: () =>
    apiClient<AuditRequestCounts>("/cybersecurity/staff/counts/"),

  detail: (id: string) =>
    apiClient<AuditRequest>(`/cybersecurity/staff/${id}/`),

  updateStatus: (id: string, data: { status: string; staff_notes?: string; resolution?: string }) =>
    apiClient<AuditRequest>(`/cybersecurity/staff/${id}/status/`, {
      method: "PATCH",
      body: data,
    }),

  assign: (id: string, data: { assigned_to: string }) =>
    apiClient<AuditRequest>(`/cybersecurity/staff/${id}/assign/`, {
      method: "PATCH",
      body: data,
    }),
};
