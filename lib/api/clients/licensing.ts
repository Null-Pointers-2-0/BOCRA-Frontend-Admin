import { apiClient } from "../client";
import type {
  StaffApplicationListItem,
  StaffApplicationDetail,
  StatusUpdateRequest,
  StaffApplicationListParams,
} from "../types";

export const licensingClient = {
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
};
