import { apiClient } from "../client";
import type { PaginatedData } from "../types/common";
import type {
  QoEAnalytics,
  QoECompareData,
  QoEDistrictItem,
  QoEHeatmapData,
  QoEHeatmapParams,
  QoEReport,
  QoEReportListParams,
  QoESpeedData,
  QoESummary,
  QoETrendsData,
} from "../types/qoe";

export const qoeClient = {
  // -- Public aggregation
  heatmap: (params?: QoEHeatmapParams) =>
    apiClient<QoEHeatmapData>("/qoe/heatmap/", { params }),

  summary: (params?: { operator?: string; days?: number }) =>
    apiClient<QoESummary>("/qoe/summary/", { params }),

  trends: (params?: { months?: number }) =>
    apiClient<QoETrendsData>("/qoe/trends/", { params }),

  speeds: (params?: { connection_type?: string; days?: number }) =>
    apiClient<QoESpeedData>("/qoe/speeds/", { params }),

  districts: () =>
    apiClient<QoEDistrictItem[]>("/qoe/districts/"),

  // -- Staff endpoints
  reports: (params?: QoEReportListParams) =>
    apiClient<PaginatedData<QoEReport>>("/qoe/reports/list/", { params }),

  report: (id: string) =>
    apiClient<QoEReport>(`/qoe/reports/${id}/`),

  analytics: (params?: { days?: number }) =>
    apiClient<QoEAnalytics>("/qoe/analytics/", { params }),

  compare: () =>
    apiClient<QoECompareData>("/qoe/compare/"),
};
