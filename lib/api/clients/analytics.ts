import { apiClient } from "../client";
import type { StaffDashboard, ComplaintSummary, LicensingSummary, ComplaintsTrendResponse, ApplicationsTrendResponse, ContentOverview } from "../types";

export const analyticsClient = {
  staffDashboard: () =>
    apiClient<StaffDashboard>("/analytics/dashboard/staff/"),

  complaintsSummary: () =>
    apiClient<ComplaintSummary>("/analytics/complaints/summary/"),

  complaintsTrend: () =>
    apiClient<ComplaintsTrendResponse>("/analytics/complaints/trend/"),

  licensingSummary: () =>
    apiClient<LicensingSummary>("/analytics/licensing/summary/"),

  applicationsTrend: () =>
    apiClient<ApplicationsTrendResponse>("/analytics/applications/trend/"),

  contentOverview: () =>
    apiClient<ContentOverview>("/analytics/content/overview/"),
};
