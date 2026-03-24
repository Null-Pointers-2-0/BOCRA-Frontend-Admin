"use client";

import { useEffect, useState } from "react";
import { domainsClient } from "@/lib/api/clients";
import type { DomainStats } from "@/lib/api/types";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Loader2,
  Globe,
  CheckCircle,
  Clock,
  AlertTriangle,
  Ban,
  ListChecks,
} from "lucide-react";

export default function DomainStatsPage() {
  const [stats, setStats] = useState<DomainStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await domainsClient.stats();
      if (res.success && res.data) setStats(res.data);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-400">Failed to load statistics</div>;
  }

  const kpis = [
    { label: "Total Domains", value: stats.total_domains, icon: Globe, color: "text-[#0073ae]", bg: "bg-blue-50" },
    { label: "Active", value: stats.active_domains, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Expired", value: stats.expired_domains, icon: Clock, color: "text-red-600", bg: "bg-red-50" },
    { label: "Suspended", value: stats.suspended_domains, icon: Ban, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Expiring Soon", value: stats.expiring_soon, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Pending Apps", value: stats.pending_applications, icon: ListChecks, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-gray-200 bg-white p-4 space-y-2"
          >
            <div className={`inline-flex p-2 rounded-lg ${kpi.bg}`}>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Domains by Zone */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Domains by Zone</h3>
          {stats.domains_by_zone.length === 0 ? (
            <p className="text-xs text-gray-400">No data</p>
          ) : (
            <div className="space-y-2">
              {stats.domains_by_zone.map((item) => {
                const pct =
                  stats.total_domains > 0
                    ? Math.round((item.count / stats.total_domains) * 100)
                    : 0;
                return (
                  <div key={item.zone__code}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.zone__name}</span>
                      <span className="text-gray-500 font-medium">{item.count}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0073ae]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Domains by Status */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Domains by Status</h3>
          {stats.domains_by_status.length === 0 ? (
            <p className="text-xs text-gray-400">No data</p>
          ) : (
            <div className="space-y-2">
              {stats.domains_by_status.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications by Status */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Applications by Status</h3>
          {stats.applications_by_status.length === 0 ? (
            <p className="text-xs text-gray-400">No data</p>
          ) : (
            <div className="space-y-2">
              {stats.applications_by_status.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
