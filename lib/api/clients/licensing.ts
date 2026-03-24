import { apiClient } from "../client";
import type {
  LicenceSector,
  LicenceSectorDetail,
  LicenceTypeListItem,
  LicenceTypeDetail,
  LicenceListItem,
  StaffApplicationListItem,
  StaffApplicationDetail,
  StatusUpdateRequest,
  StaffApplicationListParams,
  StaffSectorListParams,
  StaffLicenceTypeListParams,
} from "../types";

export const licensingClient = {
  // ── Public Sectors ─────────────────────────────────────────────────
  publicSectors: () =>
    apiClient<LicenceSector[]>("/licensing/sectors/"),

  sectorDetail: (id: string) =>
    apiClient<LicenceSectorDetail>(`/licensing/sectors/${id}/`),

  // ── Public Types ───────────────────────────────────────────────────
  publicTypes: () =>
    apiClient<LicenceTypeListItem[]>("/licensing/types/"),

  typeDetail: (id: string) =>
    apiClient<LicenceTypeDetail>(`/licensing/types/${id}/`),

  // ── Staff — Sectors CRUD ───────────────────────────────────────────
  staffSectors: (params?: StaffSectorListParams) =>
    apiClient<LicenceSector[]>("/licensing/staff/sectors/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  createSector: (data: Partial<LicenceSector>) =>
    apiClient<LicenceSector>("/licensing/staff/sectors/create/", {
      method: "POST",
      body: data,
    }),

  updateSector: (id: string, data: Partial<LicenceSector>) =>
    apiClient<LicenceSector>(`/licensing/staff/sectors/${id}/`, {
      method: "PATCH",
      body: data,
    }),

  deleteSector: (id: string) =>
    apiClient<void>(`/licensing/staff/sectors/${id}/delete/`, {
      method: "DELETE",
    }),

  // ── Staff — Licence Types CRUD ─────────────────────────────────────
  staffTypes: (params?: StaffLicenceTypeListParams) =>
    apiClient<LicenceTypeListItem[]>("/licensing/staff/types/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  staffTypeDetail: (id: string) =>
    apiClient<LicenceTypeDetail>(`/licensing/staff/types/${id}/`),

  createType: (data: Partial<LicenceTypeDetail>) =>
    apiClient<LicenceTypeDetail>("/licensing/staff/types/create/", {
      method: "POST",
      body: data,
    }),

  updateType: (id: string, data: Partial<LicenceTypeDetail>) =>
    apiClient<LicenceTypeDetail>(`/licensing/staff/types/${id}/update/`, {
      method: "PATCH",
      body: data,
    }),

  deleteType: (id: string) =>
    apiClient<void>(`/licensing/staff/types/${id}/delete/`, {
      method: "DELETE",
    }),

  // ── Staff — Applications ───────────────────────────────────────────
  listApplications: (params?: StaffApplicationListParams) =>
    apiClient<StaffApplicationListItem[]>("/licensing/staff/applications/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  getApplication: (id: string) =>
    apiClient<StaffApplicationDetail>(`/licensing/staff/applications/${id}/`),

  updateStatus: (id: string, data: StatusUpdateRequest) =>
    apiClient<{ status: string; licence_number: string | null }>(`/licensing/applications/${id}/status/`, {
      method: "PATCH",
      body: data,
    }),

  // ── Staff — Licences ───────────────────────────────────────────────
  listLicences: () =>
    apiClient<LicenceListItem[]>("/licensing/staff/licences/"),
};
