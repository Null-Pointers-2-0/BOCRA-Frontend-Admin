"use client";

import { useEffect, useState, useCallback } from "react";
import { licensingClient } from "@/lib/api/clients";
import type { StaffApplicationListItem, StaffApplicationDetail, StaffApplicationListParams } from "@/lib/api/types";
import { ApplicationStatus } from "@/lib/api/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Loader2,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  FileText,
  ExternalLink,
} from "lucide-react";

const STATUS_OPTIONS = Object.entries(ApplicationStatus).map(([key, value]) => ({
  label: key.replace(/_/g, " "),
  value,
}));

export default function LicensingPage() {
  const [applications, setApplications] = useState<StaffApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<StaffApplicationListParams>({});
  const [selectedApp, setSelectedApp] = useState<StaffApplicationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionModal, setActionModal] = useState<{ type: string; appId: string } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    const res = await licensingClient.listApplications(params);
    if (res.success && res.data) {
      setApplications(res.data);
    }
    setIsLoading(false);
  }, [params]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    const res = await licensingClient.getApplication(id);
    if (res.success && res.data) setSelectedApp(res.data);
    setDetailLoading(false);
  };

  const handleAction = async (status: string) => {
    if (!actionModal) return;
    setActionLoading(true);

    const body: Record<string, string> = { status };
    if (actionReason) body.reason = actionReason;
    if (status === "INFO_REQUESTED") body.info_request_message = actionReason;

    const res = await licensingClient.updateStatus(actionModal.appId, body as never);
    if (res.success) {
      toast.success(`Application ${status.toLowerCase().replace(/_/g, " ")} successfully`);
      setActionModal(null);
      setActionReason("");
      fetchApplications();
      if (selectedApp?.id === actionModal.appId) {
        openDetail(actionModal.appId);
      }
    } else {
      toast.error(res.message || "Action failed");
    }
    setActionLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference, organisation, email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent"
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value || undefined, page: 1 }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
            value={params.status ?? ""}
            onChange={(e) => setParams((p) => ({ ...p, status: (e.target.value || undefined) as StaffApplicationListParams["status"], page: 1 }))}
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
                <th className="text-left font-medium text-gray-500 px-4 py-3">Reference</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Organisation</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Licence Type</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Applicant</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Submitted</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0073ae] mx-auto" />
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#0073ae]">{app.reference_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{app.organisation_name}</td>
                    <td className="px-4 py-3 text-gray-600">{app.licence_type_name}</td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 text-xs">{app.applicant_name}</div>
                      <div className="text-gray-400 text-xs">{app.applicant_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} display={app.status_display} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(app.submitted_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDetail(app.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0073ae] transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {app.status === "SUBMITTED" && (
                          <button
                            onClick={() => setActionModal({ type: "UNDER_REVIEW", appId: app.id })}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Start review"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                        {(app.status === "UNDER_REVIEW" || app.status === "INFO_REQUESTED") && (
                          <>
                            <button
                              onClick={() => setActionModal({ type: "APPROVED", appId: app.id })}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setActionModal({ type: "REJECTED", appId: app.id })}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setActionModal({ type: "INFO_REQUESTED", appId: app.id })}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-600 transition-colors"
                              title="Request info"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel (slide-over) */}
      {(selectedApp || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedApp(null)} />
          <div className="relative w-full max-w-xl bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">Application Details</h3>
              <button onClick={() => setSelectedApp(null)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {detailLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
              </div>
            ) : selectedApp ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-[#0073ae]">{selectedApp.reference_number}</code>
                  <StatusBadge status={selectedApp.status} display={selectedApp.status_display} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Organisation" value={selectedApp.organisation_name} />
                  <Field label="Registration" value={selectedApp.organisation_registration} />
                  <Field label="Contact Person" value={selectedApp.contact_person} />
                  <Field label="Contact Email" value={selectedApp.contact_email} />
                  <Field label="Contact Phone" value={selectedApp.contact_phone} />
                  <Field label="Licence Type" value={selectedApp.licence_type.name} />
                  <Field label="Submitted" value={formatDateTime(selectedApp.submitted_at)} />
                  <Field label="Reviewed By" value={selectedApp.reviewed_by_name || "—"} />
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedApp.description || "—"}</p>
                </div>

                {selectedApp.decision_reason && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Decision Reason</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedApp.decision_reason}</p>
                  </div>
                )}

                {/* Documents */}
                {(selectedApp.documents?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Documents</p>
                    <div className="space-y-2">
                      {selectedApp.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700 flex-1">{doc.name}</span>
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {(selectedApp.status_timeline?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Status Timeline</p>
                    <div className="space-y-3 border-l-2 border-gray-200 pl-4">
                      {selectedApp.status_timeline.map((log) => (
                        <div key={log.id}>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={log.to_status} display={log.to_status_display} />
                            <span className="text-xs text-gray-400">{formatDateTime(log.changed_at)}</span>
                          </div>
                          {log.reason && <p className="text-xs text-gray-500 mt-1">{log.reason}</p>}
                          <p className="text-xs text-gray-400">by {log.changed_by_name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Action modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setActionModal(null); setActionReason(""); }} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">
              {actionModal.type === "APPROVED" && "Approve Application"}
              {actionModal.type === "REJECTED" && "Reject Application"}
              {actionModal.type === "UNDER_REVIEW" && "Start Review"}
              {actionModal.type === "INFO_REQUESTED" && "Request Information"}
            </h3>
            <textarea
              placeholder={
                actionModal.type === "INFO_REQUESTED"
                  ? "What information do you need from the applicant?"
                  : "Reason (optional)"
              }
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setActionModal(null); setActionReason(""); }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(actionModal.type)}
                disabled={actionLoading || (actionModal.type === "INFO_REQUESTED" && !actionReason.trim())}
                className="px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value || "—"}</p>
    </div>
  );
}
