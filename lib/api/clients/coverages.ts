import { apiClient } from "../client";
import type { PaginatedData } from "../types/common";
import type {
  CoverageArea,
  CoverageAreaListParams,
  CoverageComparison,
  CoverageGeoJSONParams,
  CoverageOperator,
  CoverageStats,
  CoverageSummary,
  CoverageUpload,
  District,
  DistrictCoverageSummary,
  DistrictDetail,
} from "../types/coverages";

export const coveragesClient = {
  // -- Districts
  districts: () =>
    apiClient<District[]>("/coverages/districts/"),

  districtsGeoJSON: () =>
    apiClient<GeoJSON.FeatureCollection>("/coverages/districts/geojson/"),

  districtDetail: (id: string) =>
    apiClient<DistrictDetail>(`/coverages/districts/${id}/`),

  // -- Operators
  operators: () =>
    apiClient<CoverageOperator[]>("/coverages/operators/"),

  // -- Coverage areas
  areas: (params?: CoverageAreaListParams) =>
    apiClient<PaginatedData<CoverageArea>>("/coverages/areas/", { params }),

  areasGeoJSON: (params?: CoverageGeoJSONParams) =>
    apiClient<GeoJSON.FeatureCollection>("/coverages/areas/geojson/", { params }),

  // -- Summaries
  summary: (params?: { technology?: string }) =>
    apiClient<CoverageSummary>("/coverages/summary/", { params }),

  districtSummary: (districtId: string) =>
    apiClient<DistrictCoverageSummary>(`/coverages/summary/${districtId}/`),

  // -- Comparison
  compare: (params?: { technology?: string }) =>
    apiClient<CoverageComparison>("/coverages/compare/", { params }),

  // -- Staff
  stats: (params?: { technology?: string }) =>
    apiClient<CoverageStats>("/coverages/stats/", { params }),

  uploads: () =>
    apiClient<PaginatedData<CoverageUpload>>("/coverages/uploads/"),

  upload: (formData: FormData) =>
    apiClient<CoverageUpload>("/coverages/upload/", {
      method: "POST",
      body: formData,
      isFormData: true,
    }),
};
