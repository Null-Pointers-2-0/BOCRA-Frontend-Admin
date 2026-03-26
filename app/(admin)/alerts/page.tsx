"use client";

import { useEffect, useState, useCallback } from "react";
import { alertsClient } from "@/lib/api/clients";
import type {
  AlertCategory,
  AlertLog,
  AlertLogParams,
  AlertStats,
  AlertStatus,
  AlertSubscription,
} from "@/lib/api/types";
import {
  Loader2,
  Bell,
  BellRing,
  MailCheck,
  MailX,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  List,
  Grid3X3,
  Settings,
  Users,
  TrendingUp,
  Eye,
  X,
  Save,
  Trash2,
  WifiOff,
  Activity,
  MapPin,
  FileCheck,
  MessageSquare,
  Scale,
  Megaphone,
  Trophy,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";

type Tab = "dashboard" | "logs" | "categories" | "subscription";

const STATUS_CONFIG: Record<
  AlertStatus,
  { color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  SENT: { color: "text-green-700", bg: "bg-green-50", icon: CheckCircle2 },
  PENDING: { color: "text-amber-700", bg: "bg-amber-50", icon: Clock },
  FAILED: { color: "text-red-700", bg: "bg-red-50", icon: XCircle },
};

const CATEGORY_ICONS: Record<string, typeof Bell> = {
  NETWORK_OUTAGE: WifiOff,
  QOE_DROP: Activity,
  COVERAGE_CHANGE: MapPin,
  LICENSE_UPDATE: FileCheck,
  COMPLAINT_RESOLVED: MessageSquare,
  REGULATORY: Scale,
  TENDER_NOTICE: Megaphone,
  SCORECARD_UPDATE: Trophy,
};

const PIE_COLORS = [
  "#0073ae",
  "#f97316",
  "#008265",
  "#c60751",
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
];

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    alertsClient.stats({ days: 30 }).then((res) => {
      if (res.success) setStats(res.data);
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

  const tabs: { key: Tab; label: string; icon: typeof Bell }[] = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "logs", label: "Delivery Logs", icon: List },
    { key: "categories", label: "Categories", icon: Grid3X3 },
    { key: "subscription", label: "My Subscription", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Proactive Alert Subscriptions
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Email alert delivery, subscription analytics, and configuration
        </p>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Total Subscribers"
            value={stats.subscriptions.total.toLocaleString()}
            sub={`${stats.subscriptions.active} active`}
            icon={Users}
            color="#0073ae"
          />
          <KpiCard
            label="Confirmed"
            value={stats.subscriptions.confirmed.toLocaleString()}
            sub={`${stats.subscriptions.total > 0 ? ((stats.subscriptions.confirmed / stats.subscriptions.total) * 100).toFixed(0) : 0}% confirmation rate`}
            icon={MailCheck}
            color="#008265"
          />
          <KpiCard
            label="Recent Signups"
            value={stats.subscriptions.recent_signups.toLocaleString()}
            sub={`Last ${stats.days} days`}
            icon={TrendingUp}
            color="#6366f1"
          />
          <KpiCard
            label="Alerts Sent"
            value={stats.delivery.total_sent.toLocaleString()}
            sub={`${stats.delivery.total_pending} pending`}
            icon={Send}
            color="#f59e0b"
          />
          <KpiCard
            label="Failed"
            value={stats.delivery.total_failed.toLocaleString()}
            sub={
              stats.delivery.total_sent > 0
                ? `${((stats.delivery.total_failed / (stats.delivery.total_sent + stats.delivery.total_failed)) * 100).toFixed(1)}% failure rate`
                : "No deliveries"
            }
            icon={AlertTriangle}
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

      {activeTab === "dashboard" && <DashboardTab stats={stats} />}
      {activeTab === "logs" && <LogsTab />}
      {activeTab === "categories" && <CategoriesTab />}
      {activeTab === "subscription" && <SubscriptionTab />}
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
  icon: typeof Bell;
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

function DashboardTab({ stats }: { stats: AlertStats | null }) {
  if (!stats) return null;

  // Subscriber pie data
  const subscriberPieData = stats.by_category.map((c, i) => ({
    name: c.name,
    value: c.active_subscribers,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  // Delivery bar data by category
  const deliveryBarData = stats.delivery.by_category.map((c) => ({
    name: c.category__code,
    fullName: c.category__name,
    sent: c.sent,
    failed: c.failed,
    total: c.total,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscribers by Category */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Subscribers by Category
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Active subscribers per alert category
          </p>
          {subscriberPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subscriberPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {subscriberPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              No subscription data
            </div>
          )}
        </div>

        {/* Delivery by Category */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Delivery by Category
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Sent vs failed alerts per category (last {stats.days} days)
          </p>
          {deliveryBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliveryBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "sent" ? "Sent" : "Failed",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="sent"
                  name="Sent"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
                <Bar
                  dataKey="failed"
                  name="Failed"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              No delivery data
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Category Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-500">
                  Category
                </th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">
                  Active Subscribers
                </th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">
                  Total Sent
                </th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">
                  Failed
                </th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.by_category.map((cat) => {
                const delivery = stats.delivery.by_category.find(
                  (d) => d.category__code === cat.code
                );
                const sent = delivery?.sent || 0;
                const failed = delivery?.failed || 0;
                const total = sent + failed;
                const successRate =
                  total > 0 ? ((sent / total) * 100).toFixed(1) : "--";
                const CatIcon = CATEGORY_ICONS[cat.code] || Bell;

                return (
                  <tr
                    key={cat.code}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <CatIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {cat.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {cat.code}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-3 font-semibold text-gray-900">
                      {cat.active_subscribers}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-700">
                      {sent}
                    </td>
                    <td className="text-right py-3 px-3 text-gray-700">
                      {failed > 0 ? (
                        <span className="text-red-600 font-medium">
                          {failed}
                        </span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="text-right py-3 px-3">
                      {successRate !== "--" ? (
                        <span
                          className={`font-medium ${Number(successRate) >= 95 ? "text-green-600" : Number(successRate) >= 80 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {successRate}%
                        </span>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -- Logs Tab -----------------------------------------------------------------

function LogsTab() {
  const [logs, setLogs] = useState<AlertLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AlertLog | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState<AlertCategory[]>([]);

  useEffect(() => {
    alertsClient.categories().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const params: AlertLogParams = { page, page_size: 25 };
    if (categoryFilter) params.category = categoryFilter;
    if (statusFilter) params.status = statusFilter as AlertStatus;

    const res = await alertsClient.logs(params);
    if (res.success && res.data) {
      setLogs(res.data.results);
      setTotalCount(res.data.count);
    }
    setIsLoading(false);
  }, [page, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(totalCount / 25);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
          >
            <option value="">All Statuses</option>
            <option value="SENT">Sent</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            No alert logs found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Status
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      Category
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      Subject
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      Recipient
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      Type
                    </th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">
                      Sent At
                    </th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const sc = STATUS_CONFIG[log.status];
                    const StatusIcon = sc.icon;
                    return (
                      <tr
                        key={log.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${log.status === "FAILED" ? "bg-red-50/30" : ""}`}
                      >
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${sc.bg} ${sc.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const CatIcon =
                                CATEGORY_ICONS[log.category_code] || Bell;
                              return (
                                <CatIcon className="h-3.5 w-3.5 text-gray-400" />
                              );
                            })()}
                            <span className="text-gray-700 text-xs">
                              {log.category_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-900 max-w-[250px] truncate">
                          {log.subject}
                        </td>
                        <td className="py-3 px-3 text-xs text-gray-600">
                          {log.subscription_email}
                        </td>
                        <td className="py-3 px-3">
                          {log.related_object_type && (
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
                              {log.related_object_type}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-xs text-gray-500">
                          {log.sent_at
                            ? formatDateTime(log.sent_at)
                            : "--"}
                        </td>
                        <td className="text-center py-3 px-3">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-[#0073ae] hover:text-[#005f8f]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * 25 + 1}--
                {Math.min(page * 25, totalCount)} of{" "}
                {totalCount.toLocaleString()} logs
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

      {/* Log Detail Modal */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}

function LogDetailModal({
  log,
  onClose,
}: {
  log: AlertLog;
  onClose: () => void;
}) {
  const sc = STATUS_CONFIG[log.status];
  const StatusIcon = sc.icon;
  const CatIcon = CATEGORY_ICONS[log.category_code] || Bell;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Alert Log Detail
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CatIcon className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">
                {log.category_name}
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${sc.bg} ${sc.color}`}
            >
              <StatusIcon className="h-3 w-3" />
              {log.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DetailField label="Subject" value={log.subject} />
            <DetailField label="Recipient" value={log.subscription_email} />
            <DetailField
              label="Related Type"
              value={log.related_object_type || "N/A"}
            />
            <DetailField
              label="Sent At"
              value={log.sent_at ? formatDateTime(log.sent_at) : "Not sent"}
            />
            <DetailField label="Created" value={formatDateTime(log.created_at)} />
            <DetailField
              label="Related ID"
              value={log.related_object_id || "N/A"}
            />
          </div>

          {log.body_preview && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Body Preview
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                {log.body_preview}
              </p>
            </div>
          )}

          {log.error_message && (
            <div>
              <p className="text-xs font-medium text-red-500 mb-1">
                Error Message
              </p>
              <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">
                {log.error_message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900 break-all">{value}</p>
    </div>
  );
}

// -- Categories Tab -----------------------------------------------------------

function CategoriesTab() {
  const [categories, setCategories] = useState<AlertCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    alertsClient.categories().then((res) => {
      if (res.success) setCategories(res.data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {categories.length} alert categories configured. Categories define the
        types of alerts citizens can subscribe to.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat.code] || Bell;
            return (
              <div
                key={cat.id}
                className={`rounded-xl border bg-white p-5 ${cat.is_active ? "border-gray-200" : "border-dashed border-gray-300 opacity-60"}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "#0073ae15" }}
                  >
                    <CatIcon className="h-5 w-5 text-[#0073ae]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {cat.is_public && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                        PUBLIC
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cat.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {cat.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">
                  {cat.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {cat.description}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {cat.code}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Order: {cat.sort_order}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// -- Subscription Tab (current user) ------------------------------------------

function SubscriptionTab() {
  const [subscriptions, setSubscriptions] = useState<AlertSubscription[]>([]);
  const [categories, setCategories] = useState<AlertCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [operatorFilter, setOperatorFilter] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([alertsClient.subscriptions(), alertsClient.categories()]).then(
      ([subRes, catRes]) => {
        if (subRes.success) setSubscriptions(subRes.data);
        if (catRes.success) setCategories(catRes.data);
        setIsLoading(false);
      }
    );
  }, []);

  const sub = subscriptions[0] || null;

  const startEdit = () => {
    if (sub) {
      setSelectedCats(sub.categories.map((c) => c.code));
      setOperatorFilter(sub.operator_filter || "");
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await alertsClient.updateSubscription({
      categories: selectedCats,
      operator_filter: operatorFilter || undefined,
    });
    if (res.success) {
      toast.success("Subscription updated");
      setSubscriptions([res.data]);
      setIsEditing(false);
    } else {
      toast.error("Failed to update subscription");
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your subscription?")) return;
    const res = await alertsClient.deleteSubscription();
    if (res.success) {
      toast.success("Subscription deleted");
      setSubscriptions([]);
    } else {
      toast.error("Failed to delete subscription");
    }
  };

  const toggleCat = (code: string) => {
    setSelectedCats((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <BellRing className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No Subscription
        </h3>
        <p className="text-sm text-gray-500">
          Your account does not have an alert subscription yet. Subscribe via the
          public portal to start receiving alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Your Subscription
            </h3>
            <p className="text-sm text-gray-500 mt-1">{sub.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {sub.is_confirmed ? (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium">
                <MailCheck className="h-3 w-3" />
                Confirmed
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-medium">
                <Clock className="h-3 w-3" />
                Pending Confirmation
              </span>
            )}
            {sub.is_active ? (
              <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-medium">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs font-medium">
                Inactive
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">Created</p>
            <p className="font-medium text-gray-900">
              {formatDateTime(sub.created_at)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Confirmed At</p>
            <p className="font-medium text-gray-900">
              {sub.confirmed_at ? formatDateTime(sub.confirmed_at) : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Operator Filter</p>
            <p className="font-medium text-gray-900">
              {sub.operator_filter || "All operators"}
            </p>
          </div>
        </div>

        {/* Subscribed categories */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Subscribed Categories</p>
          <div className="flex flex-wrap gap-2">
            {sub.categories.map((cat) => {
              const CatIcon = CATEGORY_ICONS[cat.code] || Bell;
              return (
                <span
                  key={cat.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0073ae]/10 text-[#0073ae] text-xs font-medium"
                >
                  <CatIcon className="h-3 w-3" />
                  {cat.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={startEdit}
            className="flex items-center gap-2 px-4 py-2 bg-[#0073ae] text-white rounded-lg text-sm font-medium hover:bg-[#005f8f] transition-colors"
          >
            <Settings className="h-4 w-4" />
            Edit Subscription
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="rounded-xl border border-[#0073ae]/30 bg-[#0073ae]/5 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Update Subscription
          </h4>

          {/* Category Toggles */}
          <p className="text-xs text-gray-500 mb-2">
            Select categories (at least one)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {categories
              .filter((c) => c.is_active)
              .map((cat) => {
                const isSelected = selectedCats.includes(cat.code);
                const CatIcon = CATEGORY_ICONS[cat.code] || Bell;
                return (
                  <button
                    key={cat.code}
                    onClick={() => toggleCat(cat.code)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-[#0073ae] bg-[#0073ae]/10 text-[#0073ae]"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <CatIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
          </div>

          {/* Operator Filter */}
          <div className="mb-4">
            <label className="text-xs text-gray-500">
              Operator Filter (optional)
            </label>
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:ring-1 focus:ring-[#0073ae] outline-none"
            >
              <option value="">All Operators</option>
              <option value="MASCOM">Mascom</option>
              <option value="ORANGE">Orange</option>
              <option value="BTCL">BTCL</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || selectedCats.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#0073ae] text-white rounded-lg text-sm font-medium hover:bg-[#005f8f] disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
