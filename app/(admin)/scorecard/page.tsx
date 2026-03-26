"use client";

import { useEffect, useState, useCallback } from "react";
import { scorecardClient } from "@/lib/api/clients";
import type {
  CurrentScoresData,
  ManualMetricEntry,
  OperatorScore,
  OperatorScoreDetailData,
  RankingItem,
  RankingsData,
  ScoreHistoryData,
  ScorecardWeight,
  ScoringDimension,
} from "@/lib/api/types";
import {
  Loader2,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Settings2,
  ClipboardEdit,
  BarChart3,
  RefreshCw,
  Save,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Eye,
  Crown,
  Medal,
  Award,
  ArrowUp,
  ArrowDown,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
} from "recharts";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";

type Tab = "leaderboard" | "history" | "detail" | "weights" | "metrics";

const OPERATOR_COLORS: Record<string, string> = {
  MASCOM: "#0073ae",
  ORANGE: "#f97316",
  BTCL: "#008265",
};

const DIMENSION_COLORS: Record<string, string> = {
  COVERAGE: "#0073ae",
  QOE: "#f59e0b",
  COMPLAINTS: "#c60751",
  QOS: "#008265",
};

const DIMENSION_LABELS: Record<string, string> = {
  COVERAGE: "Coverage",
  QOE: "QoE",
  COMPLAINTS: "Complaints",
  QOS: "QoS",
};

const RANK_ICONS = [Crown, Medal, Award];

function scoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#f59e0b";
  if (score >= 40) return "#ef4444";
  return "#991b1b";
}

function ScoreGauge({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = { sm: 40, md: 56, lg: 72 };
  const dim = sizeMap[size];
  const stroke = size === "sm" ? 3 : 4;
  const radius = (dim - stroke * 2) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const fontSize = size === "sm" ? 10 : size === "md" ? 14 : 18;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: dim, height: dim }}
    >
      <svg width={dim} height={dim} className="-rotate-90">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          fill="none"
          stroke={scoreColor(score)}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span
        className="absolute font-bold"
        style={{ fontSize, color: scoreColor(score) }}
      >
        {score.toFixed(0)}
      </span>
    </div>
  );
}

export default function ScorecardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");
  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  useEffect(() => {
    scorecardClient.rankings().then((res) => {
      if (res.success) setRankings(res.data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Trophy }[] = [
    { key: "leaderboard", label: "Leaderboard", icon: Trophy },
    { key: "history", label: "Score History", icon: TrendingUp },
    { key: "detail", label: "Operator Detail", icon: Eye },
    { key: "weights", label: "Weight Config", icon: Settings2 },
    { key: "metrics", label: "Manual Metrics", icon: ClipboardEdit },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Live Operator Scorecard
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Composite performance scores across coverage, QoE, complaints and QoS
            {rankings && (
              <span className="ml-2 text-gray-400">
                | Period: {rankings.period}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {rankings && activeTab === "leaderboard" && (
        <Podium rankings={rankings.rankings} />
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-[#0073ae] text-[#0073ae]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "leaderboard" && (
        <LeaderboardTab
          rankings={rankings}
          onViewDetail={(code) => {
            setSelectedOperator(code);
            setActiveTab("detail");
          }}
        />
      )}
      {activeTab === "history" && <HistoryTab />}
      {activeTab === "detail" && (
        <DetailTab
          initialOperator={selectedOperator}
          onOperatorChange={setSelectedOperator}
        />
      )}
      {activeTab === "weights" && <WeightsTab />}
      {activeTab === "metrics" && <MetricsTab />}
    </div>
  );
}

// -- Podium -------------------------------------------------------------------

function Podium({ rankings }: { rankings: RankingItem[] }) {
  const top3 = rankings.slice(0, 3);
  // Reorder for podium: 2nd, 1st, 3rd
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const heights = ["h-28", "h-36", "h-24"];
  const podiumHeights =
    top3.length >= 3 ? [heights[1], heights[0], heights[2]] : heights;

  return (
    <div className="flex items-end justify-center gap-4">
      {podiumOrder.map((r, i) => {
        const actualRank = r.rank;
        const RankIcon = RANK_ICONS[actualRank - 1] || Award;
        const color = OPERATOR_COLORS[r.operator_code] || "#6b7280";
        const score = Number(r.composite_score);

        return (
          <div key={r.id} className="flex flex-col items-center">
            {/* Score circle */}
            <ScoreGauge score={score} size="lg" />
            <p className="text-sm font-bold text-gray-900 mt-2">
              {r.operator_name}
            </p>
            {r.trend && (
              <TrendBadge
                scoreChange={r.trend.score_change}
                rankChange={r.trend.rank_change}
              />
            )}
            {/* Podium bar */}
            <div
              className={`${podiumHeights[i]} w-28 rounded-t-xl mt-2 flex items-start justify-center pt-3`}
              style={{ backgroundColor: `${color}20`, borderTop: `3px solid ${color}` }}
            >
              <RankIcon className="h-6 w-6" style={{ color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendBadge({
  scoreChange,
  rankChange,
}: {
  scoreChange: number;
  rankChange: number;
}) {
  const isUp = scoreChange > 0;
  const isDown = scoreChange < 0;
  return (
    <div className="flex items-center gap-1 mt-1">
      {isUp && (
        <span className="flex items-center gap-0.5 text-xs text-green-600">
          <ArrowUp className="h-3 w-3" />+{scoreChange.toFixed(1)}
        </span>
      )}
      {isDown && (
        <span className="flex items-center gap-0.5 text-xs text-red-600">
          <ArrowDown className="h-3 w-3" />
          {scoreChange.toFixed(1)}
        </span>
      )}
      {!isUp && !isDown && (
        <span className="flex items-center gap-0.5 text-xs text-gray-400">
          <Minus className="h-3 w-3" />0.0
        </span>
      )}
      {rankChange !== 0 && (
        <span
          className={`text-[10px] px-1 py-0.5 rounded ${rankChange < 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {rankChange < 0 ? `+${Math.abs(rankChange)} rank` : `-${rankChange} rank`}
        </span>
      )}
    </div>
  );
}

// -- Leaderboard Tab ----------------------------------------------------------

function LeaderboardTab({
  rankings,
  onViewDetail,
}: {
  rankings: RankingsData | null;
  onViewDetail: (code: string) => void;
}) {
  if (!rankings) return null;

  // Build radar chart data
  const radarData = [
    {
      dimension: "Coverage",
      ...Object.fromEntries(
        rankings.rankings.map((r) => [r.operator_code, Number(r.coverage_score)])
      ),
    },
    {
      dimension: "QoE",
      ...Object.fromEntries(
        rankings.rankings.map((r) => [r.operator_code, Number(r.qoe_score)])
      ),
    },
    {
      dimension: "Complaints",
      ...Object.fromEntries(
        rankings.rankings.map((r) => [
          r.operator_code,
          Number(r.complaints_score),
        ])
      ),
    },
    {
      dimension: "QoS",
      ...Object.fromEntries(
        rankings.rankings.map((r) => [r.operator_code, Number(r.qos_score)])
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Score Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {rankings.rankings.map((r) => {
          const color = OPERATOR_COLORS[r.operator_code] || "#6b7280";
          return (
            <div
              key={r.id}
              className="rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => onViewDetail(r.operator_code)}
              style={{ borderLeftWidth: 4, borderLeftColor: color }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      #{r.rank}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {r.operator_name}
                    </span>
                  </div>
                  {r.trend && (
                    <TrendBadge
                      scoreChange={r.trend.score_change}
                      rankChange={r.trend.rank_change}
                    />
                  )}
                </div>
                <ScoreGauge score={Number(r.composite_score)} size="md" />
              </div>

              {/* Dimension Breakdown */}
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    ["Coverage", r.coverage_score],
                    ["QoE", r.qoe_score],
                    ["Complaints", r.complaints_score],
                    ["QoS", r.qos_score],
                  ] as [string, string][]
                ).map(([label, val]) => {
                  const v = Number(val);
                  return (
                    <div key={label} className="text-center">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                        {label}
                      </p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: scoreColor(v) }}
                      >
                        {v.toFixed(1)}
                      </p>
                      <div className="mt-1 h-1 bg-gray-100 rounded-full">
                        <div
                          className="h-1 rounded-full transition-all"
                          style={{
                            width: `${v}%`,
                            backgroundColor: scoreColor(v),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar Comparison */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Dimension Comparison
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          All scores on a 0-100 scale
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            {rankings.rankings.map((r) => (
              <Radar
                key={r.operator_code}
                name={r.operator_name}
                dataKey={r.operator_code}
                stroke={OPERATOR_COLORS[r.operator_code] || "#6b7280"}
                fill={OPERATOR_COLORS[r.operator_code] || "#6b7280"}
                fillOpacity={0.12}
                strokeWidth={2}
              />
            ))}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// -- History Tab ---------------------------------------------------------------

function HistoryTab() {
  const [history, setHistory] = useState<ScoreHistoryData | null>(null);
  const [months, setMonths] = useState(6);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    scorecardClient.history({ months }).then((res) => {
      if (res.success) setHistory(res.data);
      setIsLoading(false);
    });
  }, [months]);

  if (isLoading || !history) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  // Collect all operator codes from the data
  const operatorCodes = new Set<string>();
  history.periods.forEach((p) =>
    p.scores.forEach((s) => operatorCodes.add(s.operator_code))
  );
  const codes = Array.from(operatorCodes);

  // Build composite trend
  const compositeData = history.periods.map((p) => {
    const entry: Record<string, string | number> = { period: p.period };
    for (const s of p.scores) {
      entry[s.operator_code] = Number(s.composite_score);
    }
    return entry;
  });

  // Build dimension charts
  const dimensionKeys = [
    { key: "coverage_score", label: "Coverage Score" },
    { key: "qoe_score", label: "QoE Score" },
    { key: "complaints_score", label: "Complaints Score" },
    { key: "qos_score", label: "QoS Score" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Time range */}
      <div className="flex items-center gap-2">
        {[3, 6, 12].map((m) => (
          <button
            key={m}
            onClick={() => setMonths(m)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              months === m
                ? "bg-[#0073ae] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {m} months
          </button>
        ))}
      </div>

      {/* Composite Score Trend */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Composite Score Trend
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Monthly weighted composite score per operator
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={compositeData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {codes.map((code) => (
              <Line
                key={code}
                type="monotone"
                dataKey={code}
                name={code}
                stroke={OPERATOR_COLORS[code] || "#6b7280"}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Per-dimension breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dimensionKeys.map((dim) => {
          const chartData = history.periods.map((p) => {
            const entry: Record<string, string | number> = {
              period: p.period,
            };
            for (const s of p.scores) {
              entry[s.operator_code] = Number(
                s[dim.key as keyof OperatorScore] as string
              );
            }
            return entry;
          });

          return (
            <div
              key={dim.key}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {dim.label}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  {codes.map((code) => (
                    <Line
                      key={code}
                      type="monotone"
                      dataKey={code}
                      name={code}
                      stroke={OPERATOR_COLORS[code] || "#6b7280"}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- Detail Tab ---------------------------------------------------------------

function DetailTab({
  initialOperator,
  onOperatorChange,
}: {
  initialOperator: string | null;
  onOperatorChange: (code: string) => void;
}) {
  const [operator, setOperator] = useState(initialOperator || "MASCOM");
  const [detail, setDetail] = useState<OperatorScoreDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    scorecardClient.operatorDetail(operator, { months: 6 }).then((res) => {
      if (res.success) setDetail(res.data);
      setIsLoading(false);
    });
  }, [operator]);

  const handleChange = (code: string) => {
    setOperator(code);
    onOperatorChange(code);
  };

  if (isLoading || !detail) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  const latest = detail.latest;
  const color = OPERATOR_COLORS[detail.operator_code] || "#6b7280";

  // Build history chart
  const historyChart = detail.history.map((h) => ({
    period: h.period,
    composite: Number(h.composite_score),
    coverage: Number(h.coverage_score),
    qoe: Number(h.qoe_score),
    complaints: Number(h.complaints_score),
    qos: Number(h.qos_score),
  }));

  return (
    <div className="space-y-6">
      {/* Operator selector */}
      <div className="flex items-center gap-3">
        {["MASCOM", "ORANGE", "BTCL"].map((code) => (
          <button
            key={code}
            onClick={() => handleChange(code)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              operator === code
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={
              operator === code
                ? { backgroundColor: OPERATOR_COLORS[code] || "#6b7280" }
                : undefined
            }
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  operator === code
                    ? "#fff"
                    : OPERATOR_COLORS[code] || "#6b7280",
              }}
            />
            {code}
          </button>
        ))}
      </div>

      {latest ? (
        <>
          {/* Summary Card */}
          <div
            className="rounded-xl border border-gray-200 bg-white p-6"
            style={{ borderLeftWidth: 4, borderLeftColor: color }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {detail.operator_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Period: {latest.period} | Rank #{latest.rank}
                </p>
              </div>
              <ScoreGauge score={Number(latest.composite_score)} size="lg" />
            </div>

            {/* Dimension scores with metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {/* Coverage */}
              <DimensionCard
                label="Coverage"
                score={Number(latest.coverage_score)}
                weight={latest.metadata.weights.coverage}
                color={DIMENSION_COLORS.COVERAGE}
              >
                <p className="text-xs text-gray-500">
                  {latest.metadata.coverage.area_count} coverage areas
                </p>
                <p className="text-xs text-gray-500">
                  Avg: {latest.metadata.coverage.avg_coverage_pct.toFixed(1)}%
                </p>
              </DimensionCard>

              {/* QoE */}
              <DimensionCard
                label="QoE"
                score={Number(latest.qoe_score)}
                weight={latest.metadata.weights.qoe}
                color={DIMENSION_COLORS.QOE}
              >
                <p className="text-xs text-gray-500">
                  {latest.metadata.qoe.report_count} citizen reports
                </p>
                <p className="text-xs text-gray-500">
                  Avg rating: {latest.metadata.qoe.avg_rating.toFixed(2)} / 5
                </p>
              </DimensionCard>

              {/* Complaints */}
              <DimensionCard
                label="Complaints"
                score={Number(latest.complaints_score)}
                weight={latest.metadata.weights.complaints}
                color={DIMENSION_COLORS.COMPLAINTS}
              >
                <p className="text-xs text-gray-500">
                  {latest.metadata.complaints.complaint_count} complaints
                </p>
                <p className="text-xs text-gray-500">
                  {latest.metadata.complaints.resolved_count} resolved (
                  {latest.metadata.complaints.resolution_rate_pct.toFixed(0)}%)
                </p>
              </DimensionCard>

              {/* QoS */}
              <DimensionCard
                label="QoS"
                score={Number(latest.qos_score)}
                weight={latest.metadata.weights.qos}
                color={DIMENSION_COLORS.QOS}
              >
                <p className="text-xs text-gray-500">
                  {latest.metadata.qos.metric_count} QoS metrics
                </p>
              </DimensionCard>
            </div>

            {/* QoS Metric Detail table */}
            {latest.metadata.qos.metrics.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  QoS Metric Compliance
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-4 font-medium">Metric</th>
                        <th className="py-2 px-3 font-medium text-right">
                          Value
                        </th>
                        <th className="py-2 px-3 font-medium text-right">
                          Benchmark
                        </th>
                        <th className="py-2 px-3 font-medium text-right">
                          Score
                        </th>
                        <th className="py-2 pl-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latest.metadata.qos.metrics.map((m) => {
                        const meets =
                          m.metric === "DROP_RATE" || m.metric === "LATENCY"
                            ? m.value <= m.benchmark
                            : m.value >= m.benchmark;
                        return (
                          <tr
                            key={m.metric}
                            className="border-t border-gray-100"
                          >
                            <td className="py-2 pr-4 font-medium text-gray-900">
                              {m.metric.replace(/_/g, " ")}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-700">
                              {m.value} {m.unit}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-500">
                              {m.benchmark} {m.unit}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold">
                              <span style={{ color: scoreColor(m.score) }}>
                                {m.score.toFixed(0)}
                              </span>
                            </td>
                            <td className="py-2 pl-3">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${meets ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                              >
                                {meets ? "MEETS" : "BELOW"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* History Chart */}
          {historyChart.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Score History
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {detail.operator_name} — monthly dimension & composite scores
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historyChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="composite"
                    name="Composite"
                    stroke="#111827"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="coverage"
                    name="Coverage"
                    stroke={DIMENSION_COLORS.COVERAGE}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="qoe"
                    name="QoE"
                    stroke={DIMENSION_COLORS.QOE}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="complaints"
                    name="Complaints"
                    stroke={DIMENSION_COLORS.COMPLAINTS}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="qos"
                    name="QoS"
                    stroke={DIMENSION_COLORS.QOS}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-500 text-sm">
          No score data available for {detail.operator_name}.
        </div>
      )}
    </div>
  );
}

function DimensionCard({
  label,
  score,
  weight,
  color,
  children,
}: {
  label: string;
  score: number;
  weight: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-[10px] text-gray-400">
          w: {(weight * 100).toFixed(0)}%
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ScoreGauge score={score} size="sm" />
        <div className="space-y-0.5">{children}</div>
      </div>
    </div>
  );
}

// -- Weights Tab --------------------------------------------------------------

function WeightsTab() {
  const [weights, setWeights] = useState<ScorecardWeight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isComputing, setIsComputing] = useState(false);

  const loadWeights = useCallback(async () => {
    setIsLoading(true);
    const res = await scorecardClient.weights();
    if (res.success) setWeights(res.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadWeights();
  }, [loadWeights]);

  const handleEdit = (w: ScorecardWeight) => {
    setEditing(w.dimension);
    setEditValue(w.weight);
    setEditDesc(w.description);
  };

  const handleSave = async (dimension: ScoringDimension) => {
    setIsSaving(true);
    const res = await scorecardClient.updateWeight(dimension, {
      weight: editValue,
      description: editDesc,
    });
    if (res.success) {
      toast.success(`Weight for ${dimension} updated`);
      setEditing(null);
      loadWeights();
    } else {
      toast.error("Failed to update weight");
    }
    setIsSaving(false);
  };

  const handleCompute = async () => {
    setIsComputing(true);
    const res = await scorecardClient.compute();
    if (res.success) {
      toast.success(
        `Scores computed for ${res.data.period}. ${res.data.scores.length} operator(s) scored.`
      );
    } else {
      toast.error("Failed to compute scores");
    }
    setIsComputing(false);
  };

  const totalWeight = weights.reduce((sum, w) => sum + Number(w.weight), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Scoring Weight Configuration</p>
          <p className="text-xs mt-1">
            Weights determine how each dimension contributes to the composite
            score. They must sum to 1.0. After changing weights, recompute
            scores to recalculate.
          </p>
        </div>
      </div>

      {/* Weight total indicator */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Total Weight:</span>
        <span
          className={`text-sm font-bold ${Math.abs(totalWeight - 1) < 0.01 ? "text-green-600" : "text-red-600"}`}
        >
          {totalWeight.toFixed(2)}
        </span>
        {Math.abs(totalWeight - 1) >= 0.01 && (
          <span className="text-xs text-red-500">
            (must equal 1.00)
          </span>
        )}
        <button
          onClick={handleCompute}
          disabled={isComputing}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#0073ae] text-white rounded-lg text-sm font-medium hover:bg-[#005f8f] disabled:opacity-50 transition-colors"
        >
          {isComputing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Recompute Scores
        </button>
      </div>

      {/* Weights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {weights.map((w) => {
          const isEditing = editing === w.dimension;
          const color =
            DIMENSION_COLORS[w.dimension] || "#6b7280";
          return (
            <div
              key={w.dimension}
              className="rounded-xl border border-gray-200 bg-white p-5"
              style={{ borderTopWidth: 3, borderTopColor: color }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">
                  {w.dimension_display}
                </h4>
                <span className="text-xs text-gray-400 uppercase">
                  {w.dimension}
                </span>
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500">
                      Weight (0-1)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Description</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={2}
                      className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleSave(w.dimension as ScoringDimension)
                      }
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0073ae] text-white rounded-lg text-sm font-medium hover:bg-[#005f8f] disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="text-3xl font-bold"
                      style={{ color }}
                    >
                      {(Number(w.weight) * 100).toFixed(0)}%
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Number(w.weight) * 100}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {w.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">
                      Updated: {formatDateTime(w.updated_at)}
                    </span>
                    <button
                      onClick={() => handleEdit(w)}
                      className="text-xs text-[#0073ae] hover:text-[#005f8f] font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- Manual Metrics Tab -------------------------------------------------------

function MetricsTab() {
  const [metrics, setMetrics] = useState<ManualMetricEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [operatorFilter, setOperatorFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);
    const params: Record<string, string | number> = { page, page_size: 25 };
    if (operatorFilter) params.operator = operatorFilter;
    const res = await scorecardClient.manualMetrics(params);
    if (res.success && res.data) {
      setMetrics(res.data.results);
      setTotalCount(res.data.count);
    }
    setIsLoading(false);
  }, [page, operatorFilter]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const totalPages = Math.ceil(totalCount / 25);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <select
          value={operatorFilter}
          onChange={(e) => {
            setOperatorFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
        >
          <option value="">All Operators</option>
          <option value="MASCOM">Mascom</option>
          <option value="ORANGE">Orange</option>
          <option value="BTCL">BTCL</option>
        </select>
        <button
          onClick={() => setShowForm(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-[#0073ae] text-white rounded-lg text-sm font-medium hover:bg-[#005f8f] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Metric
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
          </div>
        ) : metrics.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            No manual metrics found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Operator
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      Period
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      Metric
                    </th>
                    <th className="text-right py-3 px-3 font-medium text-gray-500">
                      Value
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      Unit
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      Entered By
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                OPERATOR_COLORS[m.operator_code] || "#6b7280",
                            }}
                          />
                          <span className="font-medium text-gray-900">
                            {m.operator_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-700">{m.period}</td>
                      <td className="py-3 px-3 text-gray-700">
                        {m.metric_name}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-gray-900">
                        {Number(m.value).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-gray-500">{m.unit}</td>
                      <td className="py-3 px-3 text-xs text-gray-500">
                        {m.entered_by_email}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-500">
                        {formatDateTime(m.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * 25 + 1}--
                {Math.min(page * 25, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700 px-2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      {showForm && (
        <CreateMetricModal
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            loadMetrics();
          }}
        />
      )}
    </div>
  );
}

// -- Create Metric Modal ------------------------------------------------------

function CreateMetricModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [operatorId, setOperatorId] = useState("");
  const [period, setPeriod] = useState("");
  const [metricName, setMetricName] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // We need the operator UUIDs. Fetch scores to get them.
  const [operators, setOperators] = useState<
    { id: string; name: string; code: string }[]
  >([]);

  useEffect(() => {
    scorecardClient.scores().then((res) => {
      if (res.success) {
        setOperators(
          res.data.scores.map((s) => ({
            id: s.operator,
            name: s.operator_name,
            code: s.operator_code,
          }))
        );
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorId || !period || !metricName || !value || !unit) {
      toast.error("All fields are required");
      return;
    }
    setIsSaving(true);
    const res = await scorecardClient.createManualMetric({
      operator: operatorId,
      period,
      metric_name: metricName,
      value,
      unit,
    });
    if (res.success) {
      toast.success("Manual metric created");
      onCreated();
    } else {
      toast.error("Failed to create metric");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Add Manual Metric
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Operator
            </label>
            <select
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              required
              className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
            >
              <option value="">Select operator</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Period (first of month)
            </label>
            <input
              type="date"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              required
              className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              Metric Name
            </label>
            <input
              type="text"
              value={metricName}
              onChange={(e) => setMetricName(e.target.value)}
              placeholder="e.g. Customer Satisfaction Index"
              required
              maxLength={200}
              className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Value
              </label>
              <input
                type="number"
                step="any"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="%, score, BWP..."
                required
                maxLength={50}
                className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[#0073ae] text-white rounded-lg text-sm font-medium hover:bg-[#005f8f] disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
