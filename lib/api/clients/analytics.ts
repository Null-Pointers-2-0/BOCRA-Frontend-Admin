import { apiClient } from "../client";
import type { StaffDashboard } from "../types";

export const analyticsClient = {
  staffDashboard: () =>
    apiClient<StaffDashboard>("/analytics/dashboard/staff/"),
};
