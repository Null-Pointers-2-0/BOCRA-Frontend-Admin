import { apiClient } from "../client";
import type {
  StaffDomainApplicationListItem,
  StaffDomainApplicationDetail,
  StaffDomainListItem,
  StaffDomainDetail,
  DomainZone,
  DomainZoneDetail,
  DomainStats,
  DomainApplicationListParams,
  DomainListParams,
} from "../types";

export const domainsClient = {
  // ── Stats ──────────────────────────────────────────────────────────
  stats: () =>
    apiClient<DomainStats>("/domains/staff/stats/"),

  // ── Zones ──────────────────────────────────────────────────────────
  publicZones: () =>
    apiClient<DomainZone[]>("/domains/zones/"),

  staffZones: (params?: { search?: string }) =>
    apiClient<DomainZoneDetail[]>("/domains/staff/zones/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  createZone: (data: Partial<DomainZone>) =>
    apiClient<DomainZoneDetail>("/domains/staff/zones/create/", {
      method: "POST",
      body: data,
    }),

  updateZone: (id: string, data: Partial<DomainZone>) =>
    apiClient<DomainZoneDetail>(`/domains/staff/zones/${id}/`, {
      method: "PATCH",
      body: data,
    }),

  // ── Applications (staff queue) ─────────────────────────────────────
  listApplications: (params?: DomainApplicationListParams) =>
    apiClient<StaffDomainApplicationListItem[]>("/domains/staff/applications/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  getApplication: (id: string) =>
    apiClient<StaffDomainApplicationDetail>(`/domains/staff/applications/${id}/`),

  reviewApplication: (id: string) =>
    apiClient<{ status: string }>(`/domains/staff/applications/${id}/review/`, {
      method: "PATCH",
    }),

  approveApplication: (id: string, reason?: string) =>
    apiClient<{ domain_id: string; domain_name: string }>(
      `/domains/staff/applications/${id}/approve/`,
      { method: "PATCH", body: reason ? { reason } : undefined }
    ),

  rejectApplication: (id: string, reason: string) =>
    apiClient<{ status: string }>(`/domains/staff/applications/${id}/reject/`, {
      method: "PATCH",
      body: { reason },
    }),

  requestInfo: (id: string, message: string) =>
    apiClient<{ status: string }>(
      `/domains/staff/applications/${id}/request-info/`,
      { method: "PATCH", body: { message } }
    ),

  // ── Domains (staff registry) ───────────────────────────────────────
  listDomains: (params?: DomainListParams) =>
    apiClient<StaffDomainListItem[]>("/domains/staff/list/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  getDomain: (id: string) =>
    apiClient<StaffDomainDetail>(`/domains/staff/${id}/`),

  updateDomain: (id: string, data: Record<string, string>) =>
    apiClient<unknown>(`/domains/staff/${id}/update/`, {
      method: "PATCH",
      body: data,
    }),

  suspendDomain: (id: string, reason: string) =>
    apiClient<unknown>(`/domains/staff/${id}/suspend/`, {
      method: "PATCH",
      body: { reason },
    }),

  unsuspendDomain: (id: string) =>
    apiClient<unknown>(`/domains/staff/${id}/unsuspend/`, { method: "PATCH" }),

  reassignDomain: (id: string, new_owner_id: string, reason: string) =>
    apiClient<unknown>(`/domains/staff/${id}/reassign/`, {
      method: "PATCH",
      body: { new_owner_id, reason },
    }),

  deleteDomain: (id: string) =>
    apiClient<unknown>(`/domains/staff/${id}/delete/`, { method: "DELETE" }),
};
