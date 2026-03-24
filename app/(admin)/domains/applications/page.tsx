"use client";

import { useEffect, useState, useCallback } from "react";
import { domainsClient } from "@/lib/api/clients";
import type {
  StaffDomainApplicationListItem,
  StaffDomainApplicationDetail,
  DomainApplicationListParams,
} from "@/lib/api/types";
import { DomainApplicationStatus, DomainApplicationType } from "@/lib/api/types";
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
  HelpCircle,
  PlayCircle,
  FileText,
  ExternalLink,
  Send,
} from "lucide-react";

const STATUS_OPTIONS = Object.entries(DomainApplicationStatus).map(([key, value]) => ({
  label: key.replace(/_/g, " "),
  value,
}));

const TYPE_OPTIONS = Object.entries(DomainApplicationType).map(([key, value]) => ({
  label: key,
  value,
}));

type ActionType = "review" | "approve" | "reject" | "request-info";

export default function DomainApplicationsPage() {
  const [applications, setApplications] = useState<StaffDomainApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<DomainApplicationListParams>({});
  const [selected, setSelected] = useState<StaffDomainApplicationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [actionModal, setActionModal] = useState<{
    type: ActionType;
    applicationId: string;
    refNumber: string;
  } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    const res = await domainsClient.listApplications(params);
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
    setSelected(null);
    const res = await domainsClient.getApplication(id);
    if (res.success && res.data) setSelected(res.data);
    setDetailLoading(false);
  };

  const handleAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);

    let res;
    const { type, applicationId } = actionModal;

    if (type === "review") {
      res = await domainsClient.reviewApplication(applicationId);
    } else if (type === "approve") {
      res = await domainsClient.approveApplication(applicationId, actionNote || undefined);
    } else if (type === "reject") {
      res = await domainsClient.rejectApplication(applicationId, actionNote);
    } else if (type === "request-info") {
      res = await domainsClient.requestInfo(applicationId, actionNote);
    }

    if (res?.success) {
      toast.success(
        type === "review"
          ? "Application moved to review"
          : type === "approve"
          ? "Application approved — domain created!"
          : type === "reject"
          ? "Application rejected"
          : "Information requested from applicant"
      );
      setActionModal(null);
      setActionNote("");
      fetchApplications();
      if (selected?.id === applicationId) openDetail(applicationId);
    } else {
      toast.error(res?.message || "Action failed");
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
            placeholder="Search by reference, domain, organisation..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent"
            onChange={(e) =>
              setParams((p) => ({ ...p, search: e.target.value || undefined }))
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
            value={params.status ?? ""}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                status: (e.target.value || undefined) as DomainApplicationListParams["status"],
              }))
            }
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
            value={params.application_type ?? ""}
            onChange={(e) =>
              setParams((p) => ({
                ...p,
                application_type: (e.target.value || undefined) as DomainApplicationListParams["application_type"],
              }))
            }
          >
            <option value="">All Types</option>
            {TYPE_OPTIONS.map((opt) => (
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
                <th className="text-left font-medium text-gray-500 px-4 py-3">Domain</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Type</th>
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
                    <td className="px-4 py-3 font-mono text-xs text-[#0073ae]">
                      {app.reference_number}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{app.domain_name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {app.application_type_display}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 text-xs">{app.applicant_name}</div>
                      <div className="text-gray-400 text-xs">{app.applicant_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} display={app.status_display} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {app.submitted_at ? formatDate(app.submitted_at) : "—"}
                    </td>
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
                            onClick={() =>
                              setActionModal({
                                type: "review",
                                applicationId: app.id,
                                refNumber: app.reference_number,
                              })
                            }
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Begin review"
                          >
                            <PlayCircle className="h-4 w-4" />
                          </button>
                        )}
                        {app.status === "UNDER_REVIEW" && (
                          <>
                            <button
                              onClick={() =>
                                setActionModal({
                                  type: "approve",
                                  applicationId: app.id,
                                  refNumber: app.reference_number,
                                })
                              }
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                setActionModal({
                                  type: "reject",
                                  applicationId: app.id,
                                  refNumber: app.reference_number,
                                })
                              }
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                setActionModal({
                                  type: "request-info",
                                  applicationId: app.id,
                                  refNumber: app.reference_number,
                                })
                              }
                              className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-colors"
                              title="Request info"
                            >
                              <HelpCircle className="h-4 w-4" />
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

      {/* Detail slide-over */}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-xl bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">Application Details</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {detailLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
              </div>
            ) : selected ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <code className="text-sm text-[#0073ae]">{selected.reference_number}</code>
                  <StatusBadge status={selected.status} display={selected.status_display} />
                </div>

                <div>
                  <p className="font-medium text-gray-900">{selected.domain_name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selected.application_type_display} &middot; Zone: {selected.zone.name} &middot;{" "}
                    {selected.registration_period_years} year(s)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Applicant" value={selected.applicant_name} />
                  <Field label="Applicant Email" value={selected.applicant_email} />
                  <Field label="Organisation" value={selected.organisation_name} />
                  <Field label="Reg Number" value={selected.organisation_registration_number} />
                  <Field label="Registrant" value={selected.registrant_name} />
                  <Field label="Registrant Email" value={selected.registrant_email} />
                  <Field label="Phone" value={selected.registrant_phone} />
                  <Field label="Submitted" value={selected.submitted_at ? formatDateTime(selected.submitted_at) : "—"} />
                  <Field label="Decision" value={selected.decision_date ? formatDateTime(selected.decision_date) : "—"} />
                  <Field label="Reviewed By" value={selected.reviewed_by_name || "—"} />
                </div>

                {selected.registrant_address && (
                  <div>
                    <p className="text-xs font-medium text-gray-400">Address</p>
                    <p className="text-sm text-gray-900 mt-0.5 whitespace-pre-wrap">
                      {selected.registrant_address}
                    </p>
                  </div>
                )}

                {selected.justification && (
                  <div>
                    <p className="text-xs font-medium text-gray-400">Justification</p>
                    <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3 mt-1">
                      {selected.justification}
                    </p>
                  </div>
                )}

                {selected.decision_reason && (
                  <div>
                    <p className="text-xs font-medium text-gray-400">Decision Reason</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mt-1">
                      {selected.decision_reason}
                    </p>
                  </div>
                )}

                {selected.info_request_message && (
                  <div>
                    <p className="text-xs font-medium text-gray-400">Information Requested</p>
                    <p className="text-sm text-gray-700 bg-orange-50 rounded-lg p-3 mt-1">
                      {selected.info_request_message}
                    </p>
                  </div>
                )}

                {/* Nameservers */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="NS 1" value={selected.nameserver_1} />
                  <Field label="NS 2" value={selected.nameserver_2} />
                  {selected.nameserver_3 && <Field label="NS 3" value={selected.nameserver_3} />}
                  {selected.nameserver_4 && <Field label="NS 4" value={selected.nameserver_4} />}
                  <Field label="Tech Contact" value={selected.tech_contact_name} />
                  <Field label="Tech Email" value={selected.tech_contact_email} />
                </div>

                {/* Transfer details */}
                {selected.application_type === "TRANSFER" && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Field label="Transfer From" value={selected.transfer_from_registrant} />
                    <Field label="Auth Code" value={selected.transfer_auth_code ? "••••••" : "—"} />
                  </div>
                )}

                {/* Documents */}
                {(selected.documents?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Documents</p>
                    <div className="space-y-2">
                      {selected.documents.map((doc) => (
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

                {/* Status Timeline */}
                {(selected.status_timeline?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Status Timeline</p>
                    <div className="space-y-3 border-l-2 border-gray-200 pl-4">
                      {selected.status_timeline.map((log) => (
                        <div key={log.id}>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={log.to_status} display={log.to_status_display} />
                            <span className="text-xs text-gray-400">
                              {formatDateTime(log.changed_at)}
                            </span>
                          </div>
                          {log.reason && (
                            <p className="text-xs text-gray-500 mt-1">{log.reason}</p>
                          )}
                          <p className="text-xs text-gray-400">by {log.changed_by_name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {(selected.status === "SUBMITTED" || selected.status === "UNDER_REVIEW") && (
                  <div className="flex gap-2 pt-2 border-t border-gray-200 flex-wrap">
                    {selected.status === "SUBMITTED" && (
                      <button
                        onClick={() =>
                          setActionModal({
                            type: "review",
                            applicationId: selected.id,
                            refNumber: selected.reference_number,
                          })
                        }
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f]"
                      >
                        <PlayCircle className="h-4 w-4" /> Begin Review
                      </button>
                    )}
                    {selected.status === "UNDER_REVIEW" && (
                      <>
                        <button
                          onClick={() =>
                            setActionModal({
                              type: "approve",
                              applicationId: selected.id,
                              refNumber: selected.reference_number,
                            })
                          }
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <CheckCircle className="h-4 w-4" /> Approve
                        </button>
                        <button
                          onClick={() =>
                            setActionModal({
                              type: "reject",
                              applicationId: selected.id,
                              refNumber: selected.reference_number,
                            })
                          }
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" /> Reject
                        </button>
                        <button
                          onClick={() =>
                            setActionModal({
                              type: "request-info",
                              applicationId: selected.id,
                              refNumber: selected.reference_number,
                            })
                          }
                          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <HelpCircle className="h-4 w-4" /> Request Info
                        </button>
                      </>
                    )}
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
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              setActionModal(null);
              setActionNote("");
            }}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">
              {actionModal.type === "review" && "Begin Review"}
              {actionModal.type === "approve" && "Approve Application"}
              {actionModal.type === "reject" && "Reject Application"}
              {actionModal.type === "request-info" && "Request Information"}
            </h3>
            <p className="text-sm text-gray-500">
              Application: <code className="text-[#0073ae]">{actionModal.refNumber}</code>
            </p>
            {actionModal.type === "review" ? (
              <p className="text-sm text-gray-600">
                This will move the application to &ldquo;Under Review&rdquo; status.
              </p>
            ) : (
              <textarea
                placeholder={
                  actionModal.type === "approve"
                    ? "Optional approval notes..."
                    : actionModal.type === "reject"
                    ? "Reason for rejection (required)..."
                    : "Describe what information is needed (required)..."
                }
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
              />
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setActionModal(null);
                  setActionNote("");
                }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={
                  actionLoading ||
                  (actionModal.type === "reject" && !actionNote.trim()) ||
                  (actionModal.type === "request-info" && !actionNote.trim())
                }
                className={`px-4 py-2 text-sm rounded-lg text-white flex items-center gap-2 disabled:opacity-50 ${
                  actionModal.type === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : actionModal.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-[#0073ae] hover:bg-[#005f8f]"
                }`}
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {actionModal.type === "approve" && <CheckCircle className="h-4 w-4" />}
                {actionModal.type === "reject" && <XCircle className="h-4 w-4" />}
                {actionModal.type === "request-info" && <Send className="h-4 w-4" />}
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
