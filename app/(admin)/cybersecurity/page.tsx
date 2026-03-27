"use client";

import { useEffect, useState, useCallback } from "react";
import { cybersecurityClient } from "@/lib/api/clients";
import type {
  AuditRequest,
  AuditRequestListItem,
  AuditRequestCounts,
  AuditRequestParams,
  AuditRequestStatus,
  AuditType,
} from "@/lib/api/types";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Loader2,
  Eye,
  X,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  CalendarCheck,
  ClipboardList,
  Send,
  ChevronLeft,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  User,
  FileText,
  AlertTriangle,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AuditRequestStatus,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  SUBMITTED:    { label: "Submitted",    color: "text-blue-700",   bg: "bg-blue-50",   icon: Send },
  UNDER_REVIEW: { label: "Under Review", color: "text-amber-700",  bg: "bg-amber-50",  icon: Eye },
  SCHEDULED:    { label: "Scheduled",    color: "text-purple-700", bg: "bg-purple-50", icon: CalendarCheck },
  IN_PROGRESS:  { label: "In Progress",  color: "text-orange-700", bg: "bg-orange-50", icon: Play },
  COMPLETED:    { label: "Completed",    color: "text-green-700",  bg: "bg-green-50",  icon: CheckCircle2 },
  REJECTED:     { label: "Rejected",     color: "text-red-700",    bg: "bg-red-50",    icon: XCircle },
};

const AUDIT_TYPE_CONFIG: Record<AuditType, { label: string; icon: typeof ShieldCheck }> = {
  VULNERABILITY_ASSESSMENT: { label: "Vulnerability Assessment", icon: ShieldAlert },
  PENETRATION_TEST:         { label: "Penetration Test",         icon: ShieldCheck },
  COMPLIANCE_AUDIT:         { label: "Compliance Audit",         icon: ClipboardList },
  INCIDENT_RESPONSE:        { label: "Incident Response",        icon: AlertTriangle },
  GENERAL:                  { label: "General Inquiry",          icon: ShieldQuestion },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CybersecurityPage() {
  const [requests, setRequests] = useState<AuditRequestListItem[]>([]);
  const [counts, setCounts] = useState<AuditRequestCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [params, setParams] = useState<AuditRequestParams>({ page: 1, page_size: 20 });

  // Detail panel
  const [selectedRequest, setSelectedRequest] = useState<AuditRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action modal
  const [actionModal, setActionModal] = useState<{
    type: "status" | "assign";
    requestId: string;
    currentStatus?: AuditRequestStatus;
  } | null>(null);
  const [actionStatus, setActionStatus] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [actionResolution, setActionResolution] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const [listRes, countsRes] = await Promise.all([
      cybersecurityClient.list(params),
      cybersecurityClient.counts(),
    ]);
    if (listRes.success && listRes.data) {
      setRequests(listRes.data.results);
      setTotalCount(listRes.data.count);
    }
    if (countsRes.success && countsRes.data) {
      setCounts(countsRes.data);
    }
    setIsLoading(false);
  }, [params]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelectedRequest(null);
    const res = await cybersecurityClient.detail(id);
    if (res.success && res.data) setSelectedRequest(res.data);
    setDetailLoading(false);
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);

    let res;
    if (actionModal.type === "status" && actionStatus) {
      res = await cybersecurityClient.updateStatus(actionModal.requestId, {
        status: actionStatus,
        staff_notes: actionNotes || undefined,
        resolution: actionResolution || undefined,
      });
    }

    if (res?.success) {
      toast.success(`Status updated to ${actionStatus.replace(/_/g, " ").toLowerCase()}`);
      setActionModal(null);
      setActionStatus("");
      setActionNotes("");
      setActionResolution("");
      fetchRequests();
      if (selectedRequest?.id === actionModal.requestId) openDetail(actionModal.requestId);
    } else {
      toast.error(res?.message || "Action failed");
    }
    setActionLoading(false);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(totalCount / (params.page_size || 20));

  const getValidTransitions = (status: AuditRequestStatus): AuditRequestStatus[] => {
    const map: Record<AuditRequestStatus, AuditRequestStatus[]> = {
      SUBMITTED:    ["UNDER_REVIEW", "REJECTED"],
      UNDER_REVIEW: ["SCHEDULED", "REJECTED"],
      SCHEDULED:    ["IN_PROGRESS", "REJECTED"],
      IN_PROGRESS:  ["COMPLETED"],
      COMPLETED:    [],
      REJECTED:     [],
    };
    return map[status] || [];
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cybersecurity Audit Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage COMM-CIRT cybersecurity audit requests from organizations
        </p>
      </div>

      {/* KPI Cards */}
      {counts && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {([
            { key: "total",        label: "Total",        color: "bg-gray-50 text-gray-700" },
            { key: "submitted",    label: "Submitted",    color: "bg-blue-50 text-blue-700" },
            { key: "under_review", label: "Under Review", color: "bg-amber-50 text-amber-700" },
            { key: "scheduled",    label: "Scheduled",    color: "bg-purple-50 text-purple-700" },
            { key: "in_progress",  label: "In Progress",  color: "bg-orange-50 text-orange-700" },
            { key: "completed",    label: "Completed",    color: "bg-green-50 text-green-700" },
          ] as const).map((card) => (
            <button
              key={card.key}
              onClick={() =>
                card.key === "total"
                  ? setParams((p) => ({ ...p, status: undefined, page: 1 }))
                  : setParams((p) => ({ ...p, status: card.key.toUpperCase() as AuditRequestStatus, page: 1 }))
              }
              className={`rounded-xl border px-4 py-3 text-left transition-shadow hover:shadow-md ${card.color}`}
            >
              <p className="text-xs font-medium opacity-70">{card.label}</p>
              <p className="text-2xl font-bold">{counts[card.key as keyof AuditRequestCounts]}</p>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reference, organization, email…"
            value={params.search || ""}
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-[#0073ae] focus:outline-none focus:ring-1 focus:ring-[#0073ae]"
          />
        </div>

        <select
          value={params.status || ""}
          onChange={(e) =>
            setParams((p) => ({
              ...p,
              status: (e.target.value || undefined) as AuditRequestStatus | undefined,
              page: 1,
            }))
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:outline-none"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.label}</option>
          ))}
        </select>

        <select
          value={params.audit_type || ""}
          onChange={(e) =>
            setParams((p) => ({
              ...p,
              audit_type: (e.target.value || undefined) as AuditType | undefined,
              page: 1,
            }))
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:outline-none"
        >
          <option value="">All Types</option>
          {Object.entries(AUDIT_TYPE_CONFIG).map(([val, cfg]) => (
            <option key={val} value={val}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0073ae]" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-400">
            <ShieldCheck className="mb-3 h-12 w-12" />
            <p className="text-lg font-medium">No audit requests found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Requester</th>
                    <th className="px-4 py-3">Audit Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requests.map((req) => {
                    const st = STATUS_CONFIG[req.status];
                    const at = AUDIT_TYPE_CONFIG[req.audit_type];
                    const StIcon = st.icon;
                    return (
                      <tr
                        key={req.id}
                        className="transition-colors hover:bg-gray-50 cursor-pointer"
                        onClick={() => openDetail(req.id)}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-medium text-[#0073ae]">
                          {req.reference_number}
                        </td>
                        <td className="px-4 py-3 font-medium">{req.organization}</td>
                        <td className="px-4 py-3">
                          <div>{req.requester_name}</div>
                          <div className="text-xs text-gray-400">{req.requester_email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <at.icon className="h-3.5 w-3.5" />
                            {at.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${st.bg} ${st.color}`}>
                            <StIcon className="h-3.5 w-3.5" />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500" title={formatDateTime(req.created_at)}>
                          {timeAgo(req.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(req.id);
                            }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#0073ae]"
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-gray-500">
                  Showing {((params.page || 1) - 1) * (params.page_size || 20) + 1}–
                  {Math.min((params.page || 1) * (params.page_size || 20), totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={(params.page || 1) <= 1}
                    onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                    className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {params.page || 1} of {totalPages}
                  </span>
                  <button
                    disabled={(params.page || 1) >= totalPages}
                    onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                    className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Side Panel ─────────────────────────────────────────────── */}
      {(selectedRequest || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setSelectedRequest(null)}>
          <div
            className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0073ae]" />
              </div>
            ) : selectedRequest ? (
              <div className="p-6 space-y-6">
                {/* Panel header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-sm text-[#0073ae]">{selectedRequest.reference_number}</p>
                    <h2 className="mt-1 text-xl font-bold text-gray-900">{selectedRequest.organization}</h2>
                  </div>
                  <button onClick={() => setSelectedRequest(null)} className="rounded-lg p-2 hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Status */}
                {(() => {
                  const st = STATUS_CONFIG[selectedRequest.status];
                  const StIcon = st.icon;
                  return (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${st.bg} ${st.color}`}>
                      <StIcon className="h-4 w-4" />
                      {st.label}
                    </span>
                  );
                })()}

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4 rounded-xl border p-4">
                  <InfoItem icon={User} label="Requester" value={selectedRequest.requester_name} />
                  <InfoItem icon={Mail} label="Email" value={selectedRequest.requester_email} />
                  <InfoItem icon={Phone} label="Phone" value={selectedRequest.requester_phone || "—"} />
                  <InfoItem icon={Building2} label="Organization" value={selectedRequest.organization} />
                  <InfoItem
                    icon={AUDIT_TYPE_CONFIG[selectedRequest.audit_type].icon}
                    label="Audit Type"
                    value={selectedRequest.audit_type_display}
                  />
                  <InfoItem icon={CalendarCheck} label="Preferred Date" value={selectedRequest.preferred_date || "Not specified"} />
                  <InfoItem icon={UserCheck} label="Assigned To" value={selectedRequest.assigned_to_name || "Unassigned"} />
                  <InfoItem icon={Clock} label="Submitted" value={formatDateTime(selectedRequest.created_at)} />
                </div>

                {/* Description */}
                <div className="rounded-xl border p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="h-4 w-4" />
                    Description
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-gray-600">{selectedRequest.description}</p>
                </div>

                {/* Staff Notes */}
                {selectedRequest.staff_notes && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-amber-800">Staff Notes</h3>
                    <p className="whitespace-pre-wrap text-sm text-amber-700">{selectedRequest.staff_notes}</p>
                  </div>
                )}

                {/* Resolution */}
                {selectedRequest.resolution && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-green-800">Resolution</h3>
                    <p className="whitespace-pre-wrap text-sm text-green-700">{selectedRequest.resolution}</p>
                    {selectedRequest.completed_at && (
                      <p className="mt-2 text-xs text-green-600">Completed: {formatDateTime(selectedRequest.completed_at)}</p>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                {getValidTransitions(selectedRequest.status).length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      {getValidTransitions(selectedRequest.status).map((nextStatus) => {
                        const cfg = STATUS_CONFIG[nextStatus];
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={nextStatus}
                            onClick={() => {
                              setActionModal({ type: "status", requestId: selectedRequest.id, currentStatus: selectedRequest.status });
                              setActionStatus(nextStatus);
                            }}
                            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:shadow-sm ${cfg.bg} ${cfg.color}`}
                          >
                            <Icon className="h-4 w-4" />
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Status Action Modal ───────────────────────────────────────────── */}
      {actionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setActionModal(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">
              Update Status → {STATUS_CONFIG[actionStatus as AuditRequestStatus]?.label}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Staff Notes (optional)</label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:outline-none focus:ring-1 focus:ring-[#0073ae]"
                  placeholder="Add internal notes about this action…"
                />
              </div>
              {(actionStatus === "COMPLETED" || actionStatus === "REJECTED") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {actionStatus === "COMPLETED" ? "Resolution" : "Rejection Reason"}
                  </label>
                  <textarea
                    value={actionResolution}
                    onChange={(e) => setActionResolution(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#0073ae] focus:outline-none focus:ring-1 focus:ring-[#0073ae]"
                    placeholder={actionStatus === "COMPLETED" ? "Describe the audit outcome…" : "Reason for rejection…"}
                  />
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setActionModal(null); setActionStatus(""); setActionNotes(""); setActionResolution(""); }}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0073ae] px-4 py-2 text-sm font-medium text-white hover:bg-[#005f8f] disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── InfoItem helper ─────────────────────────────────────────────────────────

function InfoItem({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-gray-400" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}
