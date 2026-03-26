// -- Scorecard Types ----------------------------------------------------------

export type ScoringDimension = "COVERAGE" | "QOE" | "COMPLAINTS" | "QOS";

// -- Weights ------------------------------------------------------------------

export type ScorecardWeight = {
  id: string;
  dimension: ScoringDimension;
  dimension_display: string;
  weight: string;
  description: string;
  updated_at: string;
};

// -- Operator Score -----------------------------------------------------------

export type OperatorScore = {
  id: string;
  operator: string;
  operator_name: string;
  operator_code: string;
  period: string;
  coverage_score: string;
  qoe_score: string;
  complaints_score: string;
  qos_score: string;
  composite_score: string;
  rank: number;
  created_at: string;
};

export type ScoreMetadata = {
  weights: {
    coverage: number;
    qoe: number;
    complaints: number;
    qos: number;
  };
  coverage: { area_count: number; avg_coverage_pct: number };
  qoe: { report_count: number; avg_rating: number };
  complaints: {
    complaint_count: number;
    resolved_count: number;
    resolution_rate_pct: number;
  };
  qos: {
    metric_count: number;
    metrics: {
      metric: string;
      value: number;
      benchmark: number;
      unit: string;
      score: number;
    }[];
  };
};

export type OperatorScoreDetail = OperatorScore & {
  updated_at: string;
  metadata: ScoreMetadata;
};

// -- Current Scores -----------------------------------------------------------

export type CurrentScoresData = {
  period: string;
  scores: OperatorScore[];
};

// -- Score History ------------------------------------------------------------

export type ScoreHistoryData = {
  months: number;
  periods: { period: string; scores: OperatorScore[] }[];
};

// -- Operator Detail ----------------------------------------------------------

export type OperatorScoreDetailData = {
  operator: string;
  operator_name: string;
  operator_code: string;
  latest: OperatorScoreDetail | null;
  history: OperatorScore[];
};

// -- Rankings / Leaderboard ---------------------------------------------------

export type RankingTrend = {
  score_change: number;
  rank_change: number;
  previous_rank: number;
  previous_composite: number;
};

export type RankingItem = OperatorScore & {
  trend: RankingTrend | null;
};

export type RankingsData = {
  period: string;
  rankings: RankingItem[];
};

// -- Manual Metrics -----------------------------------------------------------

export type ManualMetricEntry = {
  id: string;
  operator: string;
  operator_name: string;
  operator_code: string;
  period: string;
  metric_name: string;
  value: string;
  unit: string;
  entered_by: string;
  entered_by_email: string;
  created_at: string;
};

export type ManualMetricCreatePayload = {
  operator: string;
  period: string;
  metric_name: string;
  value: string | number;
  unit: string;
};
