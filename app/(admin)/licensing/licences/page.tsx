"use client";

import { useEffect, useState, useCallback } from "react";
import { licensingClient } from "@/lib/api/clients";
import type { LicenceListItem } from "@/lib/api/types";
import { LicenceStatus } from "@/lib/api/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const STATUS_OPTIONS = Object.entries(LicenceStatus).map(([key, value]) => ({
  label: key.replace(/_/g, " "),
  value,
}));

export default function IssuedLicencesPage() {
  const [licences, setLicences] = useState<LicenceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchLicences = useCallback(async () => {
    setIsLoading(true);
    const res = await licensingClient.listLicences();
    if (res.success && res.data) {
      setLicences(res.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLicences();
  }, [fetchLicences]);

  const filtered = licences.filter((lic) => {
    const matchesSearch =
      !searchQuery ||
      lic.licence_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.organisation_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lic.licence_type_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || lic.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const expiringCount = licences.filter((l) => l.days_until_expiry >= 0 && l.days_until_expiry <= 90).length;
  const activeCount = licences.filter((l) => l.status === "ACTIVE").length;
  const expiredCount = licences.filter((l) => l.status === "EXPIRED" || l.is_expired).length;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-400">Active Licences</p>
          <p className="text-2xl font-semibold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-400">Expiring (90 days)</p>
          <p className="text-2xl font-semibold text-amber-600 mt-1">{expiringCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-400">Expired</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{expiredCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by licence number, organisation, type..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Licence Number</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Organisation</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Licence Type</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Issued</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Expiry</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0073ae] mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No licences found
                  </td>
                </tr>
              ) : (
                filtered.map((lic) => (
                  <tr key={lic.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#0073ae]">{lic.licence_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{lic.organisation_name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="text-xs font-mono text-gray-400 mr-1">{lic.licence_type_code}</span>
                      {lic.licence_type_name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(lic.issued_date)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(lic.expiry_date)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lic.status} display={lic.status_display} />
                    </td>
                    <td className="px-4 py-3">
                      {lic.is_expired ? (
                        <span className="text-xs text-red-600 font-medium">Expired</span>
                      ) : lic.days_until_expiry <= 90 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          {lic.days_until_expiry}d
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">{lic.days_until_expiry}d</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
