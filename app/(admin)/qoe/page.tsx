"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { qoeClient } from "@/lib/api/clients";
import type {
  QoEAnalytics,
  QoECompareData,
  QoEHeatmapData,
  QoEReport,
  QoEReportListParams,
  QoESpeedData,
  QoESummary,
  QoETrendsData,
} from "@/lib/api/types";
import {
  Loader2,
  BarChart3,
  Table2,
  Signal,
  TrendingUp,
  Gauge,
  Flag,
  Star,
  ArrowDown,
  ArrowUp,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Activity,
  MapPin,
  Wifi,
  GitCompareArrows,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";

const QoEHeatmap = dynamic(() => import("./qoe-heatmap"), { ssr: false });

type Tab = "dashboard" | "reports" | "heatmap" | "trends" | "speeds" | "compare";

const OPERATOR_COLORS: Record<string, string> = {
  MASCOM: "#0073ae",
  ORANGE: "#f97316",
  BTCL: "#008265",
};

const CONNECTION_TYPES = ["2G", "3G", "4G", "5G"] as const;
const SERVICE_TYPES = ["DATA", "VOICE", "SMS", "FIXED"] as const;

function ratingColor(rating: number): string {
  if (rating >= 4) return "#16a34a";
  if (rating >= 3) return "#f59e0b";
  if (rating >= 2) return "#ef4444";
  return "#991b1b";
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={s <= Math.round(rating) ? "fill-current" : ""}
          style={{
            color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db",
            width: size,
            height: size,
          }}
        />
      ))}
    </div>
  );
}

export default function QoEPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard data
  const [analytics, setAnalytics] = useState<QoEAnalytics | null>(null);
  const [summary, setSummary] = useState<QoESummary | null>(null);

  // Initial load
  useEffect(() => {
    async function load() {
      const [aRes, sRes] = await Promise.all([
        qoeClient.analytics({ days: 30 }),
        qoeClient.summary({ days: 30 }),
      ]);
      if (aRes.success) setAnalytics(aRes.data);
      if (sRes.success) setSummary(sRes.data);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "reports", label: "Reports", icon: Table2 },
    { key: "heatmap", label: "Heatmap", icon: MapPin },
    { key: "trends", label: "Trends", icon: TrendingUp },
    { key: "speeds", label: "Speed Tests", icon: Gauge },
    { key: "compare", label: "QoS vs QoE", icon: GitCompareArrows },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Citizen QoE Reporter
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Crowdsourced network experience reports from Botswana citizens
        </p>
      </div>

      {/* KPI Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Total Reports"
            value={analytics.total_reports.toLocaleString()}
            sub={`Last ${analytics.days} days`}
            icon={Activity}
            color="#0073ae"
          />
          <KpiCard
            label="Avg Rating"
            value={analytics.overall.avg_rating.toFixed(1)}
            sub={<StarRating rating={analytics.overall.avg_rating} size={12} />}
            icon={Star}
            color="#f59e0b"
          />
          <KpiCard
            label="Avg Download"
            value={`${analytics.overall.avg_download_mbps.toFixed(1)} Mbps`}
            sub={`${analytics.reports_with_speed_test} speed tests`}
            icon={ArrowDown}
            color="#008265"
          />
          <KpiCard
            label="Avg Latency"
            value={`${analytics.overall.avg_latency_ms.toFixed(0)} ms`}
            sub={`${analytics.reports_with_location} with location`}
            icon={Clock}
            color="#6366f1"
          />
          <KpiCard
            label="Flagged"
            value={analytics.flagged_reports.toString()}
            sub="Suspicious reports"
            icon={Flag}
            color="#c60751"
          />
        </div>
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
      {activeTab === "dashboard" && (
        <DashboardTab analytics={analytics} summary={summary} />
      )}
      {activeTab === "reports" && <ReportsTab />}
      {activeTab === "heatmap" && <HeatmapTab />}
      {activeTab === "trends" && <TrendsTab />}
      {activeTab === "speeds" && <SpeedsTab />}
      {activeTab === "compare" && <CompareTab />}
    </div>
  );
}

// -- KPI Card -----------------------------------------------------------------

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  icon: typeof BarChart3;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="text-xs text-gray-400 mt-1">{sub}</div>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// -- Dashboard Tab ------------------------------------------------------------

function DashboardTab({
  analytics,
  summary,
}: {
  analytics: QoEAnalytics | null;
  summary: QoESummary | null;
}) {
  if (!analytics || !summary) return null;

  const ratingData = Object.entries(summary.rating_distribution).map(
    ([rating, count]) => ({
      rating: `${rating} Star`,
      count,
      fill:
        Number(rating) >= 4
          ? "#16a34a"
          : Number(rating) === 3
            ? "#f59e0b"
            : "#ef4444",
    })
  );

  const serviceData = analytics.by_service_type.map((s) => ({
    name: s.service_type,
    count: s.count,
    rating: s.avg_rating,
  }));

  const connectionData = analytics.by_connection_type.map((c) => ({
    name: c.connection_type,
    count: c.count,
    rating: c.avg_rating,
    download: c.avg_download,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operator Breakdown */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            By Operator
          </h3>
          <div className="space-y-4">
            {analytics.by_operator.map((op) => (
              <div key={op.operator__code} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          OPERATOR_COLORS[op.operator__code] || "#6b7280",
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {op.operator__name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{op.report_count} reports</span>
                    <span
                      className="font-semibold"
                      style={{ color: ratingColor(op.avg_rating) }}
                    >
                      {op.avg_rating.toFixed(1)}
                    </span>
                    <StarRating rating={op.avg_rating} size={10} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">Download</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {op.avg_download.toFixed(1)}
                      <span className="text-xs font-normal text-gray-400">
                        {" "}
                        Mbps
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">Upload</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {op.avg_upload.toFixed(1)}
                      <span className="text-xs font-normal text-gray-400">
                        {" "}
                        Mbps
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">Latency</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {op.avg_latency.toFixed(0)}
                      <span className="text-xs font-normal text-gray-400">
                        {" "}
                        ms
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rating Distribution
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ratingData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {ratingData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Service Type */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            By Service Type
          </h3>
          <div className="space-y-3">
            {serviceData.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Wifi className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {s.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">{s.count} reports</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: ratingColor(s.rating) }}
                  >
                    {s.rating.toFixed(1)}
                  </span>
                  <StarRating rating={s.rating} size={10} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Connection Type */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            By Connection Type
          </h3>
          <div className="space-y-3">
            {connectionData.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Signal className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">{c.count} reports</span>
                  <span className="text-xs text-gray-500">
                    {c.download.toFixed(1)} Mbps
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: ratingColor(c.rating) }}
                  >
                    {c.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Districts */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Reporting Districts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {analytics.top_districts.map((d, i) => (
            <div
              key={d.district__code}
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
            >
              <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {d.district__name}
                </p>
                <p className="text-xs text-gray-400">
                  {d.report_count} reports
                </p>
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: ratingColor(d.avg_rating) }}
              >
                {d.avg_rating.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -- Reports Tab (Staff) ------------------------------------------------------

function ReportsTab() {
  const [reports, setReports] = useState<QoEReport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<QoEReport | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("");
  const [connectionFilter, setConnectionFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [flaggedFilter, setFlaggedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState("-submitted_at");

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    const params: QoEReportListParams = {
      page,
      page_size: 25,
      ordering,
    };
    if (search) params.search = search;
    if (operatorFilter) params.operator = operatorFilter;
    if (connectionFilter) params.connection_type = connectionFilter;
    if (serviceFilter) params.service_type = serviceFilter;
    if (ratingFilter) params.rating = Number(ratingFilter);
    if (flaggedFilter === "true") params.is_flagged = true;
    if (flaggedFilter === "false") params.is_flagged = false;

    const res = await qoeClient.reports(params);
    if (res.success && res.data) {
      setReports(res.data.results);
      setTotalCount(res.data.count);
    }
    setIsLoading(false);
  }, [
    page,
    ordering,
    search,
    operatorFilter,
    connectionFilter,
    serviceFilter,
    ratingFilter,
    flaggedFilter,
  ]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const totalPages = Math.ceil(totalCount / 25);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search description, operator..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
            />
          </div>
          {/* Operator */}
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
          {/* Connection */}
          <select
            value={connectionFilter}
            onChange={(e) => {
              setConnectionFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
          >
            <option value="">All Connections</option>
            {CONNECTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {/* Service */}
          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
          >
            <option value="">All Services</option>
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {/* Rating */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Star
              </option>
            ))}
          </select>
          {/* Flagged */}
          <select
            value={flaggedFilter}
            onChange={(e) => {
              setFlaggedFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
          >
            <option value="">All Reports</option>
            <option value="true">Flagged Only</option>
            <option value="false">Not Flagged</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            No reports found
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
                    <th className="text-center py-3 px-3 font-medium text-gray-500">
                      Rating
                    </th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">
                      Type
                    </th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">
                      Connection
                    </th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">
                      <button
                        onClick={() =>
                          setOrdering(
                            ordering === "-download_speed"
                              ? "download_speed"
                              : "-download_speed"
                          )
                        }
                        className="flex items-center gap-1 mx-auto hover:text-gray-700"
                      >
                        DL
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">
                      <button
                        onClick={() =>
                          setOrdering(
                            ordering === "-upload_speed"
                              ? "upload_speed"
                              : "-upload_speed"
                          )
                        }
                        className="flex items-center gap-1 mx-auto hover:text-gray-700"
                      >
                        UL
                        <ArrowUp className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">
                      Latency
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      District
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      <button
                        onClick={() =>
                          setOrdering(
                            ordering === "-submitted_at"
                              ? "submitted_at"
                              : "-submitted_at"
                          )
                        }
                        className="flex items-center gap-1 hover:text-gray-700"
                      >
                        Date
                        <Clock className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${r.is_flagged ? "bg-red-50/50" : ""}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                OPERATOR_COLORS[r.operator_code] || "#6b7280",
                            }}
                          />
                          <span className="font-medium text-gray-900">
                            {r.operator_name}
                          </span>
                          {r.is_flagged && (
                            <Flag className="h-3 w-3 text-[#c60751]" />
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 px-3">
                        <div className="flex justify-center">
                          <StarRating rating={r.rating} size={12} />
                        </div>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                          {r.service_type}
                        </span>
                      </td>
                      <td className="text-center py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                          {r.connection_type}
                        </span>
                      </td>
                      <td className="text-center py-3 px-3 font-mono text-xs">
                        {r.download_speed
                          ? `${Number(r.download_speed).toFixed(1)}`
                          : "--"}
                      </td>
                      <td className="text-center py-3 px-3 font-mono text-xs">
                        {r.upload_speed
                          ? `${Number(r.upload_speed).toFixed(1)}`
                          : "--"}
                      </td>
                      <td className="text-center py-3 px-3 font-mono text-xs">
                        {r.latency_ms ?? "--"}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-600">
                        {r.district_name || "--"}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-500">
                        {formatDateTime(r.submitted_at)}
                      </td>
                      <td className="text-center py-3 px-3">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="text-[#0073ae] hover:text-[#005f8f]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
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
                {Math.min(page * 25, totalCount)} of{" "}
                {totalCount.toLocaleString()} reports
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

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}

// -- Report Detail Modal ------------------------------------------------------

function ReportDetailModal({
  report,
  onClose,
}: {
  report: QoEReport;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Report Detail
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* Operator & Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    OPERATOR_COLORS[report.operator_code] || "#6b7280",
                }}
              />
              <span className="font-semibold text-gray-900">
                {report.operator_name}
              </span>
              {report.is_flagged && (
                <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-medium">
                  FLAGGED
                </span>
              )}
            </div>
            <StarRating rating={report.rating} size={16} />
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailField label="Service Type" value={report.service_type_display} />
            <DetailField label="Connection" value={report.connection_type} />
            <DetailField
              label="Download"
              value={
                report.download_speed
                  ? `${Number(report.download_speed).toFixed(2)} Mbps`
                  : "N/A"
              }
            />
            <DetailField
              label="Upload"
              value={
                report.upload_speed
                  ? `${Number(report.upload_speed).toFixed(2)} Mbps`
                  : "N/A"
              }
            />
            <DetailField
              label="Latency"
              value={report.latency_ms ? `${report.latency_ms} ms` : "N/A"}
            />
            <DetailField
              label="District"
              value={report.district_name || "Unknown"}
            />
            <DetailField
              label="Location"
              value={
                report.latitude && report.longitude
                  ? `${report.latitude}, ${report.longitude}`
                  : "No coordinates"
              }
            />
            <DetailField
              label="Submitted"
              value={formatDateTime(report.submitted_at)}
            />
            <DetailField
              label="Submitted By"
              value={report.submitted_by_email || "Anonymous"}
            />
            <DetailField
              label="Verified"
              value={report.is_verified ? "Yes" : "No"}
            />
          </div>

          {/* Description */}
          {report.description && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Description
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                {report.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

// -- Heatmap Tab --------------------------------------------------------------

function HeatmapTab() {
  const [heatmapData, setHeatmapData] = useState<QoEHeatmapData | null>(null);
  const [operatorFilter, setOperatorFilter] = useState("");
  const [connectionFilter, setConnectionFilter] = useState("");
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const params: Record<string, string | number> = { days };
    if (operatorFilter) params.operator = operatorFilter;
    if (connectionFilter) params.connection_type = connectionFilter;
    const res = await qoeClient.heatmap(params);
    if (res.success) setHeatmapData(res.data);
    setIsLoading(false);
  }, [operatorFilter, connectionFilter, days]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
          >
            <option value="">All Operators</option>
            <option value="MASCOM">Mascom</option>
            <option value="ORANGE">Orange</option>
            <option value="BTCL">BTCL</option>
          </select>
          <select
            value={connectionFilter}
            onChange={(e) => setConnectionFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
          >
            <option value="">All Connections</option>
            {CONNECTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            {[7, 30, 90, 180].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  days === d
                    ? "bg-[#0073ae] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-[500px]">
              <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
            </div>
          ) : (
            <div className="h-[500px]">
              <QoEHeatmap
                districts={heatmapData?.districts || []}
              />
            </div>
          )}
        </div>

        {/* District List */}
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              District QoE Rankings
            </h3>
          </div>
          <div className="overflow-y-auto max-h-[452px]">
            {heatmapData?.districts
              .sort((a, b) => b.avg_rating - a.avg_rating)
              .map((d, i) => (
                <div
                  key={d.district_id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <span className="text-xs font-bold text-gray-400 w-5 text-right">
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {d.district_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {d.report_count} reports |{" "}
                      {d.avg_download_mbps.toFixed(1)} Mbps |{" "}
                      {d.avg_latency_ms.toFixed(0)} ms
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className="text-sm font-bold"
                      style={{ color: ratingColor(d.avg_rating) }}
                    >
                      {d.avg_rating.toFixed(1)}
                    </span>
                    <StarRating rating={d.avg_rating} size={8} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500">
        <span>Circle size = report count</span>
        <span>Circle color = avg rating</span>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>1-2</span>
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span>3</span>
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span>4-5</span>
        </div>
      </div>
    </div>
  );
}

// -- Trends Tab ---------------------------------------------------------------

function TrendsTab() {
  const [trends, setTrends] = useState<QoETrendsData | null>(null);
  const [months, setMonths] = useState(6);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    qoeClient.trends({ months }).then((res) => {
      if (res.success) setTrends(res.data);
      setIsLoading(false);
    });
  }, [months]);

  if (isLoading || !trends) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  // Build chart data
  const operatorCodes = trends.trends.length
    ? Object.keys(trends.trends[0].operators)
    : [];

  const ratingChartData = trends.trends.map((t) => {
    const entry: Record<string, string | number> = { month: t.month };
    for (const code of operatorCodes) {
      entry[code] = t.operators[code]?.avg_rating ?? 0;
    }
    return entry;
  });

  const downloadChartData = trends.trends.map((t) => {
    const entry: Record<string, string | number> = { month: t.month };
    for (const code of operatorCodes) {
      entry[code] = t.operators[code]?.avg_download_mbps ?? 0;
    }
    return entry;
  });

  const volumeChartData = trends.trends.map((t) => {
    const entry: Record<string, string | number> = { month: t.month };
    for (const code of operatorCodes) {
      entry[code] = t.operators[code]?.report_count ?? 0;
    }
    return entry;
  });

  return (
    <div className="space-y-6">
      {/* Time range selector */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Trends */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Average Rating Trend
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Monthly avg citizen rating per operator (1-5 stars)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ratingChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[1, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {operatorCodes.map((code) => (
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

        {/* Download Speed Trends */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Download Speed Trend
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Monthly avg download speed per operator (Mbps)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={downloadChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {operatorCodes.map((code) => (
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

        {/* Report Volume */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Report Volume
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Monthly QoE report submissions per operator
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={volumeChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {operatorCodes.map((code) => (
                <Bar
                  key={code}
                  dataKey={code}
                  name={code}
                  fill={OPERATOR_COLORS[code] || "#6b7280"}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// -- Speeds Tab ---------------------------------------------------------------

function SpeedsTab() {
  const [speedData, setSpeedData] = useState<QoESpeedData | null>(null);
  const [connectionFilter, setConnectionFilter] = useState("");
  const [days, setDays] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const params: Record<string, string | number> = { days };
    if (connectionFilter) params.connection_type = connectionFilter;
    qoeClient.speeds(params).then((res) => {
      if (res.success) setSpeedData(res.data);
      setIsLoading(false);
    });
  }, [connectionFilter, days]);

  if (isLoading || !speedData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  // Build radar chart data for comparing operators
  const radarData = speedData.operators.map((op) => ({
    operator: op.operator,
    name: op.operator_name,
    download: op.download.avg_mbps,
    upload: op.upload.avg_mbps,
    latency: Math.max(0, 100 - op.latency.avg_ms), // Invert latency for radar (higher = better)
    samples: op.sample_count,
  }));

  const radarChartData = [
    {
      metric: "Download",
      ...Object.fromEntries(
        speedData.operators.map((op) => [op.operator, op.download.avg_mbps])
      ),
    },
    {
      metric: "Upload",
      ...Object.fromEntries(
        speedData.operators.map((op) => [op.operator, op.upload.avg_mbps])
      ),
    },
    {
      metric: "Low Latency",
      ...Object.fromEntries(
        speedData.operators.map((op) => [
          op.operator,
          Math.max(0, 100 - op.latency.avg_ms),
        ])
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={connectionFilter}
          onChange={(e) => setConnectionFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
        >
          <option value="">All Connections</option>
          {CONNECTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? "bg-[#0073ae] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Operator Speed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {speedData.operators.map((op) => (
          <div
            key={op.operator}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: OPERATOR_COLORS[op.operator] || "#6b7280",
                }}
              />
              <h3 className="text-lg font-semibold text-gray-900">
                {op.operator_name}
              </h3>
              <span className="ml-auto text-xs text-gray-400">
                {op.sample_count.toLocaleString()} tests
              </span>
            </div>

            {/* Speed Gauges */}
            <div className="space-y-4">
              <SpeedGauge
                label="Download"
                avg={op.download.avg_mbps}
                min={op.download.min_mbps}
                max={op.download.max_mbps}
                unit="Mbps"
                color="#0073ae"
                maxScale={50}
              />
              <SpeedGauge
                label="Upload"
                avg={op.upload.avg_mbps}
                min={op.upload.min_mbps}
                max={op.upload.max_mbps}
                unit="Mbps"
                color="#008265"
                maxScale={15}
              />
              <SpeedGauge
                label="Latency"
                avg={op.latency.avg_ms}
                min={op.latency.min_ms}
                max={op.latency.max_ms}
                unit="ms"
                color="#f59e0b"
                maxScale={400}
                invertColor
              />
            </div>

            {/* By Connection Type */}
            {op.by_connection_type.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">
                  By Connection Type
                </p>
                <div className="space-y-1.5">
                  {op.by_connection_type.map((ct) => (
                    <div
                      key={ct.connection_type}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-gray-700">
                        {ct.connection_type}
                      </span>
                      <div className="flex items-center gap-3 text-gray-500">
                        <span>{ct.sample_count} tests</span>
                        <span>
                          {ct.avg_download_mbps.toFixed(1)} /{" "}
                          {ct.avg_upload_mbps.toFixed(1)} Mbps
                        </span>
                        <span>{ct.avg_latency_ms.toFixed(0)} ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Radar Comparison */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Operator Comparison Radar
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Higher = better (latency inverted: 100 - avg_ms)
        </p>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarChartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fontSize: 10 }} />
            {speedData.operators.map((op) => (
              <Radar
                key={op.operator}
                name={op.operator_name}
                dataKey={op.operator}
                stroke={OPERATOR_COLORS[op.operator] || "#6b7280"}
                fill={OPERATOR_COLORS[op.operator] || "#6b7280"}
                fillOpacity={0.15}
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

function SpeedGauge({
  label,
  avg,
  min,
  max,
  unit,
  color,
  maxScale,
  invertColor,
}: {
  label: string;
  avg: number;
  min: number;
  max: number;
  unit: string;
  color: string;
  maxScale: number;
  invertColor?: boolean;
}) {
  const pct = Math.min(100, (avg / maxScale) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <span className="text-sm font-bold text-gray-900">
          {avg.toFixed(1)} <span className="text-xs font-normal text-gray-400">{unit}</span>
        </span>
      </div>
      <div className="relative w-full h-2 bg-gray-100 rounded-full">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
          }}
        />
        {/* Min/Max markers */}
        <div
          className="absolute top-0 h-2 w-0.5 bg-gray-400 opacity-50"
          style={{ left: `${Math.min(100, (min / maxScale) * 100)}%` }}
          title={`Min: ${min.toFixed(1)} ${unit}`}
        />
        <div
          className="absolute top-0 h-2 w-0.5 bg-gray-400 opacity-50"
          style={{ left: `${Math.min(100, (max / maxScale) * 100)}%` }}
          title={`Max: ${max.toFixed(1)} ${unit}`}
        />
      </div>
      <div className="flex justify-between mt-0.5 text-[10px] text-gray-400">
        <span>min {min.toFixed(1)}</span>
        <span>max {max.toFixed(1)}</span>
      </div>
    </div>
  );
}

// -- Compare Tab (QoS vs QoE) -------------------------------------------------

function CompareTab() {
  const [compareData, setCompareData] = useState<QoECompareData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    qoeClient.compare().then((res) => {
      if (res.success) setCompareData(res.data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !compareData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          QoS vs QoE Comparison
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Operator-reported QoS metrics vs citizen-reported QoE experience.
          QoE window: {compareData.qoe_window_days} days | QoS period: {compareData.qos_period}
        </p>
      </div>

      {compareData.comparison.map((op) => (
        <div
          key={op.operator}
          className="rounded-xl border border-gray-200 bg-white overflow-hidden"
        >
          <div
            className="px-5 py-4 border-b border-gray-200 flex items-center gap-3"
            style={{
              borderLeftWidth: 4,
              borderLeftColor: OPERATOR_COLORS[op.operator] || "#6b7280",
            }}
          >
            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: OPERATOR_COLORS[op.operator] || "#6b7280",
              }}
            />
            <h4 className="text-lg font-semibold text-gray-900">
              {op.operator_name}
            </h4>
            <span className="text-xs text-gray-400 ml-2">
              {op.citizen_qoe.report_count} citizen reports
            </span>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Citizen QoE */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#f59e0b]" />
                  Citizen-Reported (QoE)
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  <MetricCard
                    label="Avg Rating"
                    value={op.citizen_qoe.avg_rating.toFixed(1)}
                    sub="/5 stars"
                  />
                  <MetricCard
                    label="Download"
                    value={op.citizen_qoe.avg_download_mbps.toFixed(1)}
                    sub="Mbps"
                  />
                  <MetricCard
                    label="Upload"
                    value={op.citizen_qoe.avg_upload_mbps.toFixed(1)}
                    sub="Mbps"
                  />
                  <MetricCard
                    label="Latency"
                    value={op.citizen_qoe.avg_latency_ms.toFixed(0)}
                    sub="ms"
                  />
                </div>
              </div>

              {/* Operator QoS */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Signal className="h-4 w-4 text-[#0073ae]" />
                  Operator-Reported (QoS)
                </h5>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(op.operator_qos.metrics).map(
                    ([key, metric]) => {
                      const meetsTarget = key === "DROP_RATE" || key === "LATENCY"
                        ? metric.value <= metric.benchmark
                        : metric.value >= metric.benchmark;
                      return (
                        <div
                          key={key}
                          className={`rounded-lg p-3 border ${meetsTarget ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                        >
                          <p className="text-xs text-gray-500">
                            {key.replace(/_/g, " ")}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {metric.value}
                            <span className="text-xs font-normal text-gray-400 ml-0.5">
                              {metric.unit}
                            </span>
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Benchmark: {metric.benchmark} {metric.unit}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Discrepancy highlight */}
            {op.operator_qos.metrics.DATA_SPEED && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <GitCompareArrows className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Speed discrepancy:</span>
                  <span className="font-semibold text-gray-900">
                    Operator reports{" "}
                    {op.operator_qos.metrics.DATA_SPEED.value.toFixed(1)} Mbps
                  </span>
                  <span className="text-gray-400">vs</span>
                  <span className="font-semibold text-gray-900">
                    Citizens experience{" "}
                    {op.citizen_qoe.avg_download_mbps.toFixed(1)} Mbps
                  </span>
                  {op.operator_qos.metrics.DATA_SPEED.value >
                    op.citizen_qoe.avg_download_mbps * 1.3 && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-medium">
                      Significant gap
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-900">
        {value}
        <span className="text-xs font-normal text-gray-400 ml-0.5">{sub}</span>
      </p>
    </div>
  );
}
