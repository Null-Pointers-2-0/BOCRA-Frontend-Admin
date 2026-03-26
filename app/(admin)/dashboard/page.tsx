"use client";

import { useEffect, useState } from "react";
import { analyticsClient } from "@/lib/api/clients";
import type { StaffDashboard, TrendItem } from "@/lib/api/types";
import {
  Users,
  FileCheck,
  MessageSquareWarning,
  Newspaper,
  FileText,
  Megaphone,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  Globe,
  Map,
  Activity,
  Trophy,
  BellRing,
  Shield,
  CheckCircle2,
  XCircle,
  Timer,
  Wifi,
  Star,
  Flag,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";

const OPERATOR_COLORS: Record<string, string> = {
  MASCOM: "#0073ae",
  ORANGE: "#f97316",
  BTCL: "#008265",
};

const PIE_COLORS = ["#0073ae", "#008265", "#c60751", "#f59e0b", "#6366f1", "#10b981"];

export default function DashboardPage() {
  const [d, setD] = useState<StaffDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsClient.staffDashboard().then((res) => {
      if (res.success) setD(res.data);
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

  if (!d) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">
          Real-time metrics across all BOCRA platform modules
        </p>
      </div>

      {/* ── Primary KPI Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiLink
          label="Active Licences"
          value={d.licensing.active}
          sub={`${d.licensing.renewals_due_30d} renewals due (30d)`}
          icon={FileCheck}
          color="#008265"
          href="/licensing"
          alert={d.licensing.renewals_due_30d > 0}
        />
        <KpiLink
          label="Open Complaints"
          value={d.complaints.open}
          sub={`${d.complaints.overdue} overdue, ${d.complaints.unassigned} unassigned`}
          icon={MessageSquareWarning}
          color="#c60751"
          href="/complaints"
          alert={d.complaints.overdue > 0}
        />
        <KpiLink
          label="Active Domains"
          value={d.domains.active}
          sub={`${d.domains.expiring_30d} expiring (30d)`}
          icon={Globe}
          color="#6366f1"
          href="/domains"
          alert={d.domains.expiring_30d > 0}
        />
        <KpiLink
          label="Total Users"
          value={d.users.total}
          sub={`+${d.users.new_this_month} this month`}
          icon={Users}
          color="#0073ae"
          href="/users"
        />
      </div>

      {/* ── Secondary KPI Row (Innovation Features) ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MiniKpi
          label="Avg Coverage"
          value={d.coverage ? `${d.coverage.avg_coverage_percent}%` : "--"}
          icon={Map}
          color="#0073ae"
          href="/coverage"
        />
        <MiniKpi
          label="QoE Rating"
          value={d.qoe?.avg_rating ? `${d.qoe.avg_rating}/5` : "--"}
          icon={Star}
          color="#f59e0b"
          href="/qoe"
        />
        <MiniKpi
          label="QoE Reports"
          value={d.qoe ? d.qoe.total_reports : 0}
          icon={Activity}
          color="#10b981"
          href="/qoe"
        />
        <MiniKpi
          label="Top Operator"
          value={d.scorecard?.latest_scores?.[0]?.operator__name ?? "--"}
          icon={Trophy}
          color="#ffd204"
          href="/scorecard"
        />
        <MiniKpi
          label="Alert Subs"
          value={d.alerts?.active ?? 0}
          icon={BellRing}
          color="#8b5cf6"
          href="/alerts"
        />
        <MiniKpi
          label="Subscribers"
          value={d.telecoms.total_subscribers.toLocaleString()}
          icon={Wifi}
          color="#0073ae"
        />
      </div>

      {/* ── Trends Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Trend */}
        <ChartCard
          title="Applications Trend"
          subtitle="Monthly licensing applications (6 months)"
          icon={TrendingUp}
          iconColor="#008265"
        >
          {d.applications.trend_6m.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.applications.trend_6m}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Applications" fill="#008265" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>

        {/* Complaints Trend */}
        <ChartCard
          title="Complaints Trend"
          subtitle="Monthly complaint volume (6 months)"
          icon={Clock}
          iconColor="#c60751"
        >
          {d.complaints.trend_6m.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.complaints.trend_6m}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Complaints"
                  stroke="#c60751"
                  strokeWidth={2}
                  dot={{ fill: "#c60751", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </ChartCard>
      </div>

      {/* ── Complaints & Licensing Detail Row ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaints Performance */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Complaint Metrics
          </h3>
          <div className="space-y-3">
            <MetricRow
              icon={CheckCircle2}
              iconColor="text-green-600"
              label="Resolution Rate"
              value={`${d.complaints.resolution_rate}%`}
              good={d.complaints.resolution_rate >= 70}
            />
            <MetricRow
              icon={Shield}
              iconColor="text-blue-600"
              label="SLA Compliance"
              value={`${d.complaints.sla_compliance}%`}
              good={d.complaints.sla_compliance >= 80}
            />
            <MetricRow
              icon={Timer}
              iconColor="text-amber-600"
              label="Avg Resolution"
              value={d.complaints.avg_resolution_days ? `${d.complaints.avg_resolution_days}d` : "--"}
            />
            <MetricRow
              icon={AlertTriangle}
              iconColor="text-red-600"
              label="Overdue"
              value={String(d.complaints.overdue)}
              good={d.complaints.overdue === 0}
            />
            <MetricRow
              icon={XCircle}
              iconColor="text-gray-500"
              label="Unassigned"
              value={String(d.complaints.unassigned)}
              good={d.complaints.unassigned === 0}
            />
          </div>
          {/* By priority */}
          {Object.keys(d.complaints.by_priority).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">Open by Priority</p>
              <div className="flex gap-2">
                {(["URGENT", "HIGH", "MEDIUM", "LOW"] as const).map((p) => {
                  const count = d.complaints.by_priority[p] || 0;
                  if (!count) return null;
                  const colors: Record<string, string> = {
                    URGENT: "bg-red-100 text-red-700",
                    HIGH: "bg-orange-100 text-orange-700",
                    MEDIUM: "bg-amber-100 text-amber-700",
                    LOW: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <span
                      key={p}
                      className={`px-2 py-1 rounded text-xs font-medium ${colors[p]}`}
                    >
                      {p}: {count}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Application Pipeline */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Application Pipeline
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            {d.applications.approval_rate}% approval rate
            {d.applications.avg_processing_days
              ? ` | ${d.applications.avg_processing_days}d avg processing`
              : ""}
          </p>
          <div className="space-y-2.5">
            {([
              ["Pending Review", d.applications.pending_review, "#0073ae"],
              ["Under Review", d.applications.under_review, "#ffd204"],
              ["Info Requested", d.applications.info_requested, "#f59e0b"],
              ["Approved", d.applications.approved_total, "#008265"],
              ["Rejected", d.applications.rejected_total, "#c60751"],
            ] as const).map(([label, count, color]) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-600 flex-1">{label}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>{d.applications.recent_30d} new (last 30d)</span>
            <span>{d.applications.total} total</span>
          </div>
        </div>

        {/* Licensing Summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Licensing Overview
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatBox label="Active" value={d.licensing.active} color="text-green-700" bg="bg-green-50" />
            <StatBox label="Expired" value={d.licensing.expired} color="text-red-700" bg="bg-red-50" />
            <StatBox label="Suspended" value={d.licensing.suspended} color="text-amber-700" bg="bg-amber-50" />
            <StatBox label="Total" value={d.licensing.total} color="text-gray-700" bg="bg-gray-50" />
          </div>
          {/* By sector */}
          {Object.keys(d.licensing.by_sector).length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400 mb-2">Active by Sector</p>
              <div className="space-y-1.5">
                {Object.entries(d.licensing.by_sector)
                  .sort((a, b) => b[1] - a[1])
                  .map(([sector, count]) => (
                    <div key={sector} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 truncate">{sector || "Uncategorized"}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4">
            <div className="text-xs">
              <span className="text-gray-400">Renewing 30d</span>
              <span className={`ml-1 font-semibold ${d.licensing.renewals_due_30d > 0 ? "text-amber-600" : "text-gray-900"}`}>
                {d.licensing.renewals_due_30d}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400">60d</span>
              <span className="ml-1 font-semibold text-gray-900">{d.licensing.renewals_due_60d}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Domains & Telecom Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Registry */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Domain Registry</h3>
              <p className="text-xs text-gray-400">{d.domains.total} total domains</p>
            </div>
            <Link
              href="/domains"
              className="text-xs text-[#0073ae] hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatBox label="Active" value={d.domains.active} color="text-green-700" bg="bg-green-50" />
            <StatBox label="Expired" value={d.domains.expired} color="text-red-700" bg="bg-red-50" />
            <StatBox label="Expiring 30d" value={d.domains.expiring_30d} color="text-amber-700" bg="bg-amber-50" />
          </div>
          {/* By zone */}
          {Object.keys(d.domains.by_zone).length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400 mb-2">Active by Zone</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(d.domains.by_zone)
                  .sort((a, b) => b[1] - a[1])
                  .map(([zone, count]) => (
                    <span
                      key={zone}
                      className="px-2 py-1 bg-[#6366f1]/10 text-[#6366f1] rounded text-xs font-medium"
                    >
                      {zone}: {count}
                    </span>
                  ))}
              </div>
            </div>
          )}
          {/* Domain apps */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
            <span>
              <span className="text-gray-400">Apps:</span>{" "}
              <span className="font-semibold text-gray-900">{d.domains.applications.total}</span>
            </span>
            <span>
              <span className="text-gray-400">Pending:</span>{" "}
              <span className="font-semibold text-amber-600">{d.domains.applications.pending}</span>
            </span>
            <span>
              <span className="text-gray-400">Reviewing:</span>{" "}
              <span className="font-semibold text-blue-600">{d.domains.applications.under_review}</span>
            </span>
          </div>
        </div>

        {/* Telecom Market */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Telecom Market</h3>
              <p className="text-xs text-gray-400">
                {d.telecoms.total_subscribers.toLocaleString()} subscribers
                {d.telecoms.latest_period ? ` (${d.telecoms.latest_period})` : ""}
              </p>
            </div>
            <span className="text-xs text-gray-400">
              {d.telecoms.active_operators} operators
            </span>
          </div>
          {d.telecoms.by_operator.length > 0 ? (
            <div className="space-y-3">
              {d.telecoms.by_operator.map((op) => {
                const pct = d.telecoms.total_subscribers > 0
                  ? (op.subscribers / d.telecoms.total_subscribers) * 100
                  : 0;
                const color = OPERATOR_COLORS[op.operator__code] || "#6b7280";
                return (
                  <div key={op.operator__code}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {op.operator__name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {op.subscribers.toLocaleString()} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No telecom data</p>
          )}
        </div>
      </div>

      {/* ── Operator Scorecard + QoE Row ────────────────────────────────── */}
      {(d.scorecard || d.qoe) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scorecard */}
          {d.scorecard && d.scorecard.latest_scores.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Operator Scorecard
                  </h3>
                  <p className="text-xs text-gray-400">
                    Period: {d.scorecard.latest_period}
                  </p>
                </div>
                <Link
                  href="/scorecard"
                  className="text-xs text-[#0073ae] hover:underline flex items-center gap-1"
                >
                  Details <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              {/* Radar chart */}
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    data={[
                      { dimension: "Coverage", ...radarVals(d.scorecard.latest_scores, "coverage_score") },
                      { dimension: "QoE", ...radarVals(d.scorecard.latest_scores, "qoe_score") },
                      { dimension: "Complaints", ...radarVals(d.scorecard.latest_scores, "complaints_score") },
                      { dimension: "QoS", ...radarVals(d.scorecard.latest_scores, "qos_score") },
                    ]}
                  >
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    {d.scorecard.latest_scores.map((s) => (
                      <Radar
                        key={s.operator__code}
                        name={s.operator__name}
                        dataKey={s.operator__code}
                        stroke={OPERATOR_COLORS[s.operator__code] || "#6b7280"}
                        fill={OPERATOR_COLORS[s.operator__code] || "#6b7280"}
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {/* Ranking bar */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4">
                {d.scorecard.latest_scores.map((s) => (
                  <div
                    key={s.operator__code}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-white text-[10px] font-bold"
                      style={{
                        backgroundColor:
                          OPERATOR_COLORS[s.operator__code] || "#6b7280",
                      }}
                    >
                      {s.rank}
                    </span>
                    <span className="font-medium text-gray-900">
                      {s.operator__name}
                    </span>
                    <span className="text-gray-400">
                      {Number(s.composite_score).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QoE Summary */}
          {d.qoe && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Citizen QoE Reports
                  </h3>
                  <p className="text-xs text-gray-400">
                    {d.qoe.total_reports} total | {d.qoe.reports_last_30d} last 30d
                  </p>
                </div>
                <Link
                  href="/qoe"
                  className="text-xs text-[#0073ae] hover:underline flex items-center gap-1"
                >
                  Details <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              {/* Overall rating */}
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">
                    {d.qoe.avg_rating?.toFixed(1) ?? "--"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Avg Rating</p>
                  <div className="flex mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          (d.qoe?.avg_rating ?? 0) >= s
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {d.qoe.by_operator.map((op) => {
                    const pct = (op.avg_rating / 5) * 100;
                    const color = OPERATOR_COLORS[op.operator__code] || "#6b7280";
                    return (
                      <div key={op.operator__code}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-600">{op.operator__name}</span>
                          <span className="text-gray-500">
                            {Number(op.avg_rating).toFixed(1)} ({op.report_count})
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {d.qoe.flagged_reports > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                  <Flag className="h-3.5 w-3.5" />
                  {d.qoe.flagged_reports} flagged report{d.qoe.flagged_reports === 1 ? "" : "s"} require review
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Coverage + Alerts Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coverage */}
        {d.coverage && (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Network Coverage
                </h3>
                <p className="text-xs text-gray-400">
                  {d.coverage.total_areas} coverage areas tracked
                </p>
              </div>
              <Link
                href="/coverage"
                className="text-xs text-[#0073ae] hover:underline flex items-center gap-1"
              >
                Map <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* By technology */}
              <div>
                <p className="text-xs text-gray-400 mb-2">By Technology</p>
                {Object.entries(d.coverage.by_technology).length > 0 ? (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(d.coverage.by_technology).map(
                            ([tech, count], i) => ({
                              name: tech,
                              value: count,
                              fill: PIE_COLORS[i % PIE_COLORS.length],
                            })
                          )}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {Object.entries(d.coverage.by_technology).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-8">No data</p>
                )}
              </div>
              {/* By operator */}
              <div>
                <p className="text-xs text-gray-400 mb-2">By Operator</p>
                <div className="space-y-2">
                  {Object.entries(d.coverage.by_operator)
                    .sort((a, b) => b[1] - a[1])
                    .map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{name}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                </div>
                {d.coverage.pending_uploads > 0 && (
                  <div className="mt-3 px-2 py-1.5 bg-amber-50 rounded text-xs text-amber-700">
                    {d.coverage.pending_uploads} pending upload{d.coverage.pending_uploads === 1 ? "" : "s"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alerts + Content */}
        <div className="space-y-6">
          {/* Alerts summary */}
          {d.alerts && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Alert System
                </h3>
                <Link
                  href="/alerts"
                  className="text-xs text-[#0073ae] hover:underline flex items-center gap-1"
                >
                  Manage <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="px-2 py-2.5 rounded-lg bg-gray-50">
                  <p className="text-lg font-bold text-gray-900">{d.alerts.total_subscribers}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Total</p>
                </div>
                <div className="px-2 py-2.5 rounded-lg bg-green-50">
                  <p className="text-lg font-bold text-green-700">{d.alerts.confirmed}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Confirmed</p>
                </div>
                <div className="px-2 py-2.5 rounded-lg bg-blue-50">
                  <p className="text-lg font-bold text-blue-700">{d.alerts.active}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Active</p>
                </div>
                <div className="px-2 py-2.5 rounded-lg bg-emerald-50">
                  <p className="text-lg font-bold text-emerald-700">{d.alerts.alerts_sent_30d}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Sent (30d)</p>
                </div>
                <div className="px-2 py-2.5 rounded-lg bg-red-50">
                  <p className="text-lg font-bold text-red-700">{d.alerts.alerts_failed_30d}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Failed</p>
                </div>
              </div>
            </div>
          )}

          {/* Content Overview */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Content Overview
            </h3>
            <div className="space-y-4">
              <ContentRow
                icon={FileText}
                label="Publications"
                published={d.content.publications.published}
                draft={d.content.publications.draft}
                href="/cms/publications"
              />
              <ContentRow
                icon={Megaphone}
                label="Tenders"
                published={d.content.tenders.open}
                draft={d.content.tenders.awarded}
                publishedLabel="open"
                draftLabel="awarded"
                href="/cms/tenders"
              />
              {d.content.tenders.closing_soon > 0 && (
                <div className="ml-7 text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {d.content.tenders.closing_soon} tender{d.content.tenders.closing_soon === 1 ? "" : "s"} closing soon
                </div>
              )}
              <ContentRow
                icon={Newspaper}
                label="News"
                published={d.content.news.published}
                draft={d.content.news.draft}
                href="/cms/news"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers & Reusable Components ──────────────────────────────────────────

const tooltipStyle = {
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontSize: "12px",
};

function radarVals(
  scores: NonNullable<StaffDashboard["scorecard"]>["latest_scores"],
  key: string
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const s of scores) {
    result[s.operator__code] = Number((s as Record<string, unknown>)[key] || 0);
  }
  return result;
}

function KpiLink({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
  alert,
}: {
  label: string;
  value: number;
  sub: string;
  icon: typeof Users;
  color: string;
  href: string;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            {alert && <AlertTriangle className="h-3 w-3 text-[#c60751]" />}
            {sub}
          </p>
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
    </Link>
  );
}

function MiniKpi({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  color: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-lg border border-gray-200 bg-white p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-3.5 w-3.5" style={{ color }} />
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold text-gray-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function ChartCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof TrendingUp;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <div className="h-56">{children}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      No trend data available
    </div>
  );
}

function MetricRow({
  icon: Icon,
  iconColor,
  label,
  value,
  good,
}: {
  icon: typeof CheckCircle2;
  iconColor: string;
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span
        className={`text-sm font-semibold ${
          good === true
            ? "text-green-600"
            : good === false
              ? "text-red-600"
              : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`rounded-lg px-3 py-2 ${bg} text-center`}>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

function ContentRow({
  icon: Icon,
  label,
  published,
  draft,
  publishedLabel = "published",
  draftLabel = "draft",
  href,
}: {
  icon: React.ElementType;
  label: string;
  published: number;
  draft: number;
  publishedLabel?: string;
  draftLabel?: string;
  href: string;
}) {
  return (
    <Link href={href} className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-700 group-hover:text-[#0073ae] transition-colors">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700">
          {published} {publishedLabel}
        </span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
          {draft} {draftLabel}
        </span>
      </div>
    </Link>
  );
}
