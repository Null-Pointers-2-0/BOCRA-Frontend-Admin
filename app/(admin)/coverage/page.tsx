"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { coveragesClient } from "@/lib/api/clients";
import type {
  CoverageComparison,
  CoverageOperator,
  CoverageSummary,
  CoverageStats,
  District,
  DistrictCoverageSummary,
} from "@/lib/api/types";
import {
  Loader2,
  Map,
  BarChart3,
  Table2,
  Upload,
  Signal,
  Layers,
  Eye,
  EyeOff,
  Flame,
  MapPin,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const CoverageMap = dynamic(() => import("./coverage-map"), { ssr: false });

type Tab = "map" | "comparison" | "stats" | "uploads";

const TECHNOLOGIES = ["2G", "3G", "4G"] as const;
const OPERATOR_COLORS: Record<string, string> = {
  MASCOM: "#0073ae",
  ORANGE: "#f97316",
  BTCL: "#008265",
};

export default function CoverageMapPage() {
  // -- Data state
  const [operators, setOperators] = useState<CoverageOperator[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [summary, setSummary] = useState<CoverageSummary | null>(null);
  const [comparison, setComparison] = useState<CoverageComparison | null>(null);
  const [stats, setStats] = useState<CoverageStats | null>(null);
  const [districtDetail, setDistrictDetail] =
    useState<DistrictCoverageSummary | null>(null);

  // -- Filter state
  const [selectedTech, setSelectedTech] = useState<string>("4G");
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("map");

  // -- Map state
  const [districtGeoJSON, setDistrictGeoJSON] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const [coverageGeoJSON, setCoverageGeoJSON] =
    useState<GeoJSON.FeatureCollection | null>(null);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [showCoverage, setShowCoverage] = useState(true);
  const [showDistricts, setShowDistricts] = useState(true);

  // -- Loading
  const [isLoading, setIsLoading] = useState(true);
  const [isMapLoading, setIsMapLoading] = useState(false);

  // -- Initial data load
  useEffect(() => {
    async function loadInitial() {
      const [opRes, distRes, geoRes, sumRes] = await Promise.all([
        coveragesClient.operators(),
        coveragesClient.districts(),
        coveragesClient.districtsGeoJSON(),
        coveragesClient.summary({ technology: "4G" }),
      ]);
      if (opRes.success) setOperators(opRes.data);
      if (distRes.success) setDistricts(distRes.data);
      if (geoRes.success) setDistrictGeoJSON(geoRes.data);
      if (sumRes.success) setSummary(sumRes.data);
      setIsLoading(false);
    }
    loadInitial();
  }, []);

  // -- Load coverage overlay when tech/operator changes
  const loadCoverageOverlay = useCallback(async () => {
    setIsMapLoading(true);
    const params: Record<string, string> = { technology: selectedTech };
    if (selectedOperator) params.operator = selectedOperator;
    const res = await coveragesClient.areasGeoJSON(params);
    if (res.success) setCoverageGeoJSON(res.data);
    setIsMapLoading(false);
  }, [selectedTech, selectedOperator]);

  useEffect(() => {
    loadCoverageOverlay();
  }, [loadCoverageOverlay]);

  // -- Load summary when tech changes
  useEffect(() => {
    coveragesClient.summary({ technology: selectedTech }).then((res) => {
      if (res.success) setSummary(res.data);
    });
  }, [selectedTech]);

  // -- Load comparison data on tab switch
  useEffect(() => {
    if (activeTab === "comparison" && !comparison) {
      coveragesClient.compare({ technology: selectedTech }).then((res) => {
        if (res.success) setComparison(res.data);
      });
    }
  }, [activeTab, comparison, selectedTech]);

  // -- Load stats on tab switch
  useEffect(() => {
    if (activeTab === "stats" && !stats) {
      coveragesClient.stats({ technology: selectedTech }).then((res) => {
        if (res.success) setStats(res.data);
      });
    }
  }, [activeTab, stats, selectedTech]);

  // -- Reload comparison when tech changes
  useEffect(() => {
    if (activeTab === "comparison") {
      coveragesClient.compare({ technology: selectedTech }).then((res) => {
        if (res.success) setComparison(res.data);
      });
    }
    if (activeTab === "stats") {
      coveragesClient.stats({ technology: selectedTech }).then((res) => {
        if (res.success) setStats(res.data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTech]);

  // -- District click handler
  const handleDistrictClick = useCallback(async (districtId: string) => {
    const res = await coveragesClient.districtSummary(districtId);
    if (res.success) {
      setDistrictDetail(res.data);
    } else {
      toast.error("Failed to load district details");
    }
  }, []);

  // -- Coverage level color helper
  const getCoverageLevelColor = useMemo(
    () => (level: string) => {
      switch (level) {
        case "FULL":
          return "#16a34a";
        case "PARTIAL":
          return "#f59e0b";
        case "MINIMAL":
          return "#ef4444";
        case "NONE":
          return "#6b7280";
        default:
          return "#d1d5db";
      }
    },
    []
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof Map }[] = [
    { key: "map", label: "Coverage Map", icon: Map },
    { key: "comparison", label: "Comparison", icon: Table2 },
    { key: "stats", label: "Analytics", icon: BarChart3 },
    { key: "uploads", label: "Uploads", icon: Upload },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Network Coverage Map
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Interactive coverage visualization across Botswana&apos;s {districts.length} districts
          </p>
        </div>
        {summary && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Signal className="h-4 w-4" />
            Period: {summary.period}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  National Avg ({selectedTech})
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summary.national_avg_coverage.toFixed(1)}%
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0073ae]/10">
                <Signal className="h-5 w-5 text-[#0073ae]" />
              </div>
            </div>
          </div>
          {summary.by_operator.map((op) => (
            <div
              key={op.operator}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {op.operator_name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {op.avg_coverage_percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {op.districts_covered}/{op.total_districts} districts |{" "}
                    {op.population_covered.toLocaleString()} pop covered
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${OPERATOR_COLORS[op.operator] || "#6b7280"}15`,
                  }}
                >
                  <TrendingUp
                    className="h-5 w-5"
                    style={{
                      color: OPERATOR_COLORS[op.operator] || "#6b7280",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
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
      {activeTab === "map" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map controls sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Technology filter */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Technology
              </h3>
              <div className="flex flex-wrap gap-2">
                {TECHNOLOGIES.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => setSelectedTech(tech)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTech === tech
                        ? "bg-[#0073ae] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            {/* Operator filter */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Signal className="h-4 w-4" />
                Operator
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedOperator("")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedOperator
                      ? "bg-[#0073ae]/10 text-[#0073ae] font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  All Operators
                </button>
                {operators.map((op) => (
                  <button
                    key={op.code}
                    onClick={() => setSelectedOperator(op.code)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      selectedOperator === op.code
                        ? "bg-[#0073ae]/10 text-[#0073ae] font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          OPERATOR_COLORS[op.code] || "#6b7280",
                      }}
                    />
                    {op.name}
                    <span className="ml-auto text-xs text-gray-400">
                      {op.districts_covered}d
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Map layers */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Map Layers
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    onClick={() => setShowDistricts(!showDistricts)}
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      showDistricts
                        ? "bg-[#0073ae] border-[#0073ae] text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {showDistricts && (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    District Boundaries
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    onClick={() => setShowCoverage(!showCoverage)}
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      showCoverage
                        ? "bg-[#008265] border-[#008265] text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {showCoverage && (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  {showCoverage ? (
                    <Eye className="h-4 w-4 text-gray-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">
                    Coverage Overlay
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    onClick={() => setShowHeatMap(!showHeatMap)}
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      showHeatMap
                        ? "bg-[#c60751] border-[#c60751] text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {showHeatMap && (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                  <Flame className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    Heat Map Mode
                  </span>
                </label>
              </div>
            </div>

            {/* Coverage Legend */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Coverage Legend
              </h3>
              <div className="space-y-2">
                {[
                  { level: "FULL", label: "Full (80-100%)", color: "#16a34a" },
                  {
                    level: "PARTIAL",
                    label: "Partial (40-79%)",
                    color: "#f59e0b",
                  },
                  {
                    level: "MINIMAL",
                    label: "Minimal (1-39%)",
                    color: "#ef4444",
                  },
                  { level: "NONE", label: "No Coverage", color: "#6b7280" },
                ].map((item) => (
                  <div key={item.level} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
              {showHeatMap && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">
                    Heat Map Gradient
                  </p>
                  <div className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
            </div>

            {/* White Spots */}
            {summary && summary.white_spot_count > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  White Spots ({summary.white_spot_count})
                </h3>
                <p className="text-xs text-red-600 mb-2">
                  Districts with no meaningful {selectedTech} coverage:
                </p>
                <div className="space-y-1">
                  {summary.white_spots.map((spot) => (
                    <button
                      key={spot.district_id}
                      onClick={() => handleDistrictClick(spot.district_id)}
                      className="block text-xs text-red-700 hover:text-red-900 hover:underline"
                    >
                      {spot.district} ({spot.district_code})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map + District Detail */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative rounded-xl border border-gray-200 bg-white overflow-hidden">
              {isMapLoading && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
                </div>
              )}
              <div className="h-[600px]">
                <CoverageMap
                  districtGeoJSON={districtGeoJSON}
                  coverageGeoJSON={coverageGeoJSON}
                  showDistricts={showDistricts}
                  showCoverage={showCoverage}
                  showHeatMap={showHeatMap}
                  selectedOperator={selectedOperator}
                  operatorColors={OPERATOR_COLORS}
                  getCoverageLevelColor={getCoverageLevelColor}
                  onDistrictClick={handleDistrictClick}
                />
              </div>
            </div>

            {/* District Detail Panel */}
            {districtDetail && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {districtDetail.district.name} ({districtDetail.district.code})
                  </h3>
                  <button
                    onClick={() => setDistrictDetail(null)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    Close
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Population: {districtDetail.district.population.toLocaleString()} |
                  Period: {districtDetail.period}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 pr-4 font-medium text-gray-500">
                          Operator
                        </th>
                        {TECHNOLOGIES.map((t) => (
                          <th
                            key={t}
                            className="text-center py-2 px-3 font-medium text-gray-500"
                          >
                            {t}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {districtDetail.operators.map((op) => (
                        <tr
                          key={op.operator}
                          className="border-b border-gray-100"
                        >
                          <td className="py-2.5 pr-4 font-medium text-gray-900 flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  OPERATOR_COLORS[op.operator] || "#6b7280",
                              }}
                            />
                            {op.operator_name}
                          </td>
                          {TECHNOLOGIES.map((tech) => {
                            const data = op.technologies[tech];
                            if (!data) {
                              return (
                                <td
                                  key={tech}
                                  className="text-center py-2.5 px-3 text-gray-400"
                                >
                                  --
                                </td>
                              );
                            }
                            return (
                              <td key={tech} className="text-center py-2.5 px-3">
                                <span
                                  className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: `${getCoverageLevelColor(data.coverage_level)}15`,
                                    color: getCoverageLevelColor(
                                      data.coverage_level
                                    ),
                                  }}
                                >
                                  {data.coverage_percentage}%
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "comparison" && (
        <ComparisonTab
          comparison={comparison}
          operators={operators}
          selectedTech={selectedTech}
          operatorColors={OPERATOR_COLORS}
          getCoverageLevelColor={getCoverageLevelColor}
          onDistrictClick={handleDistrictClick}
        />
      )}

      {activeTab === "stats" && (
        <StatsTab stats={stats} operatorColors={OPERATOR_COLORS} />
      )}

      {activeTab === "uploads" && <UploadsTab operators={operators} />}
    </div>
  );
}

// -- Comparison Tab -----------------------------------------------------------

function ComparisonTab({
  comparison,
  operators,
  selectedTech,
  operatorColors,
  getCoverageLevelColor,
  onDistrictClick,
}: {
  comparison: CoverageComparison | null;
  operators: CoverageOperator[];
  selectedTech: string;
  operatorColors: Record<string, string>;
  getCoverageLevelColor: (level: string) => string;
  onDistrictClick: (id: string) => void;
}) {
  if (!comparison) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Operator Comparison - {selectedTech}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Side-by-side coverage comparison across all districts | Period:{" "}
          {comparison.period}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-5 font-medium text-gray-500">
                District
              </th>
              {comparison.operators.map((op) => (
                <th
                  key={op.code}
                  className="text-center py-3 px-4 font-medium"
                  style={{ color: operatorColors[op.code] || "#6b7280" }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: operatorColors[op.code] || "#6b7280",
                      }}
                    />
                    {op.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.comparison.map((row) => (
              <tr
                key={row.district_code}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => onDistrictClick(row.district_id)}
              >
                <td className="py-3 px-5 font-medium text-gray-900">
                  {row.district}
                  <span className="ml-1 text-xs text-gray-400">
                    ({row.district_code})
                  </span>
                </td>
                {comparison.operators.map((op) => {
                  const data = row.operators[op.code];
                  if (!data) {
                    return (
                      <td
                        key={op.code}
                        className="text-center py-3 px-4 text-gray-400"
                      >
                        --
                      </td>
                    );
                  }
                  return (
                    <td key={op.code} className="text-center py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full max-w-[120px] bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${data.coverage_percentage}%`,
                              backgroundColor: getCoverageLevelColor(
                                data.coverage_level
                              ),
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-medium"
                          style={{
                            color: getCoverageLevelColor(data.coverage_level),
                          }}
                        >
                          {data.coverage_percentage}%
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -- Stats Tab ----------------------------------------------------------------

function StatsTab({
  stats,
  operatorColors,
}: {
  stats: CoverageStats | null;
  operatorColors: Record<string, string>;
}) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  const operatorCodes = stats.trends.length
    ? Object.keys(stats.trends[0].operators)
    : [];

  return (
    <div className="space-y-6">
      {/* Coverage Trends */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Coverage Growth Trend
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Average {stats.technology} coverage per operator over time
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-medium text-gray-500">
                  Period
                </th>
                {operatorCodes.map((code) => (
                  <th
                    key={code}
                    className="text-center py-2 px-3 font-medium"
                    style={{ color: operatorColors[code] || "#6b7280" }}
                  >
                    {code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.trends.map((t) => (
                <tr key={t.period} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-700 font-mono text-xs">
                    {t.period}
                  </td>
                  {operatorCodes.map((code) => (
                    <td key={code} className="text-center py-2 px-3">
                      <span className="text-xs font-medium">
                        {t.operators[code]?.toFixed(1) ?? "--"}%
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* District Ranking */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          District Ranking
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Districts ranked by average {stats.technology} coverage
        </p>
        <div className="space-y-2">
          {stats.district_ranking.map((d, i) => (
            <div key={d.code} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 w-6 text-right">
                #{i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {d.district}
                  </span>
                  <span className="text-xs font-medium text-gray-600">
                    {d.avg_coverage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${d.avg_coverage}%`,
                      backgroundColor:
                        d.avg_coverage >= 80
                          ? "#16a34a"
                          : d.avg_coverage >= 40
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>Total records: {stats.total_records.toLocaleString()}</span>
        <span>
          Periods: {stats.periods_available.length} quarters available
        </span>
      </div>
    </div>
  );
}

// -- Uploads Tab --------------------------------------------------------------

function UploadsTab({ operators }: { operators: CoverageOperator[] }) {
  const [uploads, setUploads] = useState<
    { id: string; operator_name: string; operator_code: string; technology: string; file_name: string; file_size: number; period: string; status: string; status_display: string; records_created: number; error_message: string; processed_at: string | null; created_at: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Upload form
  const [uploadOperator, setUploadOperator] = useState("");
  const [uploadTech, setUploadTech] = useState("4G");
  const [uploadPeriod, setUploadPeriod] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  useEffect(() => {
    coveragesClient.uploads().then((res) => {
      if (res.success && res.data) {
        setUploads(res.data.results);
      }
      setIsLoading(false);
    });
  }, []);

  const handleUpload = async () => {
    if (!uploadOperator || !uploadFile || !uploadPeriod) {
      toast.error("Please fill all required fields");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("operator", uploadOperator);
    formData.append("technology", uploadTech);
    formData.append("period", uploadPeriod);
    formData.append("file", uploadFile);

    const res = await coveragesClient.upload(formData);
    if (res.success) {
      toast.success("Coverage data uploaded successfully");
      setUploadFile(null);
      setUploadPeriod("");
      // Refresh uploads list
      const refreshRes = await coveragesClient.uploads();
      if (refreshRes.success && refreshRes.data) {
        setUploads(refreshRes.data.results);
      }
    } else {
      toast.error(res.message || "Upload failed");
    }
    setIsUploading(false);
  };

  const uploadStatusColor: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    PROCESSING: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    FAILED: "bg-red-50 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Upload Coverage Data
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Operator *
            </label>
            <select
              value={uploadOperator}
              onChange={(e) => setUploadOperator(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
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
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Technology *
            </label>
            <select
              value={uploadTech}
              onChange={(e) => setUploadTech(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
            >
              {TECHNOLOGIES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Period *
            </label>
            <input
              type="date"
              value={uploadPeriod}
              onChange={(e) => setUploadPeriod(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              GeoJSON File *
            </label>
            <input
              type="file"
              accept=".json,.geojson"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#0073ae]/10 file:text-[#0073ae] hover:file:bg-[#0073ae]/20"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0073ae] px-4 py-2 text-sm font-medium text-white hover:bg-[#005f8f] disabled:opacity-50 transition-colors"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Uploads History */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload History
          </h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No uploads yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-5 font-medium text-gray-500">
                    File
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Operator
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">
                    Tech
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Period
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500">
                    Records
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Uploaded
                  </th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-5 text-gray-900 font-medium">
                      {u.file_name}
                      <span className="block text-xs text-gray-400">
                        {(u.file_size / 1024).toFixed(1)} KB
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {u.operator_name}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-medium">
                        {u.technology}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">
                      {u.period}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${uploadStatusColor[u.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        {u.status_display}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-gray-700">
                      {u.records_created}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString("en-BW", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
