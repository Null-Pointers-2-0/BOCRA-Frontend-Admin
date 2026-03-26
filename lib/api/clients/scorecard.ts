import { apiClient } from "../client";
import type { PaginatedData } from "../types/common";
import type {
  CurrentScoresData,
  ManualMetricCreatePayload,
  ManualMetricEntry,
  OperatorScoreDetailData,
  RankingsData,
  ScoreHistoryData,
  ScorecardWeight,
  ScoringDimension,
} from "../types/scorecard";

export const scorecardClient = {
  // -- Weights
  weights: () =>
    apiClient<ScorecardWeight[]>("/scorecard/weights/"),

  updateWeight: (dimension: ScoringDimension, data: { weight?: string; description?: string }) =>
    apiClient<ScorecardWeight>(`/scorecard/weights/${dimension}/`, {
      method: "PUT",
      body: data,
    }),

  // -- Scores
  scores: () =>
    apiClient<CurrentScoresData>("/scorecard/scores/"),

  history: (params?: { operator?: string; months?: number }) =>
    apiClient<ScoreHistoryData>("/scorecard/scores/history/", { params }),

  operatorDetail: (operatorCode: string, params?: { months?: number }) =>
    apiClient<OperatorScoreDetailData>(`/scorecard/scores/${operatorCode}/`, { params }),

  compute: (params?: { period?: string }) =>
    apiClient<CurrentScoresData>("/scorecard/scores/compute/", {
      method: "POST",
      body: params || {},
    }),

  // -- Rankings
  rankings: () =>
    apiClient<RankingsData>("/scorecard/rankings/"),

  // -- Manual Metrics
  manualMetrics: (params?: { operator?: string; period?: string; page?: number; page_size?: number }) =>
    apiClient<PaginatedData<ManualMetricEntry>>("/scorecard/manual-metrics/", { params }),

  createManualMetric: (data: ManualMetricCreatePayload) =>
    apiClient<ManualMetricEntry>("/scorecard/manual-metrics/create/", {
      method: "POST",
      body: data,
    }),
};
