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
} from "recharts";
import Link from "next/link";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<StaffDashboard | null>(null);
  const [complaintsTrend, setComplaintsTrend] = useState<TrendItem[]>([]);
  const [appsTrend, setAppsTrend] = useState<TrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [dashRes, compTrend, appTrend] = await Promise.all([
        analyticsClient.staffDashboard(),
        analyticsClient.complaintsTrend(),
        analyticsClient.applicationsTrend(),
      ]);
      if (dashRes.success) setDashboard(dashRes.data);
      if (compTrend.success) setComplaintsTrend(compTrend.data?.volume_trend ?? []);
      if (appTrend.success) setAppsTrend(appTrend.data?.volume_trend ?? []);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Failed to load dashboard data.
      </div>
    );
  }

  const d = dashboard;

  const kpiCards = [
    {
      label: "Total Users",
      value: d.users?.total ?? 0,
      sub: `+${d.users?.new_this_month ?? 0} this month`,
      icon: Users,
      color: "#0073ae",
      href: "/users",
    },
    {
      label: "Pending Applications",
      value: d.applications?.pending_review ?? 0,
      sub: `${d.licensing?.active ?? 0} active licences`,
      icon: FileCheck,
      color: "#008265",
      href: "/licensing",
    },
    {
      label: "Open Complaints",
      value: d.complaints?.open ?? 0,
      sub: `${d.complaints?.overdue ?? 0} overdue`,
      icon: MessageSquareWarning,
      color: "#c60751",
      alert: (d.complaints?.overdue ?? 0) > 0,
      href: "/complaints",
    },
    {
      label: "Published News",
      value: d.content?.news?.published ?? 0,
      sub: `${d.content?.news?.draft ?? 0} drafts`,
      icon: Newspaper,
      color: "#ffd204",
      href: "/cms/news",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">
          Real-time metrics across all BOCRA modules
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  {card.alert && <AlertTriangle className="h-3 w-3 text-[#c60751]" />}
                  {card.sub}
                </p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
            </div>
            <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Applications Trend</h3>
              <p className="text-xs text-gray-500">Monthly licensing applications</p>
            </div>
            <TrendingUp className="h-4 w-4 text-[#008265]" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#008265" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Complaints Trend</h3>
              <p className="text-xs text-gray-500">Monthly complaint volume</p>
            </div>
            <Clock className="h-4 w-4 text-[#c60751]" />
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complaintsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#c60751"
                  strokeWidth={2}
                  dot={{ fill: "#c60751", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status breakdown row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Licensing by status */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Applications by Status</h3>
          <div className="space-y-3">
            {Object.entries({
              pending_review: d.applications?.pending_review ?? 0,
              under_review: d.applications?.under_review ?? 0,
              info_requested: d.applications?.info_requested ?? 0,
              approved: d.applications?.approved_total ?? 0,
              rejected: d.applications?.rejected_total ?? 0,
            }).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot status={status} />
                  <span className="text-sm text-gray-600">{formatStatus(status)}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Complaints by priority */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Complaints by Category</h3>
          <div className="space-y-3">
            {Object.entries(d.complaints?.by_category || {}).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#c60751]" />
                  <span className="text-sm text-gray-600">{formatStatus(category)}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content summary */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Content Overview</h3>
          <div className="space-y-4">
            <ContentRow
              icon={FileText}
              label="Publications"
              published={d.content?.publications?.published ?? 0}
              draft={d.content?.publications?.draft ?? 0}
              href="/cms/publications"
            />
            <ContentRow
              icon={Megaphone}
              label="Tenders"
              published={d.content?.tenders?.open ?? 0}
              draft={d.content?.tenders?.awarded ?? 0}
              href="/cms/tenders"
            />
            <ContentRow
              icon={Newspaper}
              label="News"
              published={d.content?.news?.published ?? 0}
              draft={d.content?.news?.draft ?? 0}
              href="/cms/news"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    DRAFT: "#9ca3af",
    SUBMITTED: "#0073ae",
    UNDER_REVIEW: "#ffd204",
    INFO_REQUESTED: "#f59e0b",
    APPROVED: "#008265",
    REJECTED: "#c60751",
    CANCELLED: "#6b7280",
  };
  return (
    <div
      className="h-2 w-2 rounded-full"
      style={{ backgroundColor: colors[status] || "#9ca3af" }}
    />
  );
}

function ContentRow({
  icon: Icon,
  label,
  published,
  draft,
  href,
}: {
  icon: React.ElementType;
  label: string;
  published: number;
  draft: number;
  href: string;
}) {
  return (
    <Link href={href} className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-700 group-hover:text-[#0073ae] transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700">{published} live</span>
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{draft} draft</span>
      </div>
    </Link>
  );
}

function formatStatus(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
