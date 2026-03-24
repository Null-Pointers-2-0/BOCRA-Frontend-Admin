"use client";

import { useEffect, useState, useCallback } from "react";
import { complaintsClient } from "@/lib/api/clients";
import type { StaffComplaintListItem, StaffComplaintDetail, StaffComplaintListParams } from "@/lib/api/types";
import { ComplaintStatus, ComplaintPriority } from "@/lib/api/types";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Loader2,
  Eye,
  X,
  UserCheck,
  CheckCircle,
  FileText,
  ExternalLink,
  AlertTriangle,
  Send,
} from "lucide-react";

const STATUS_OPTIONS = Object.entries(ComplaintStatus).map(([key, value]) => ({
  label: key.replace(/_/g, " "),
  value,
}));

const PRIORITY_OPTIONS = Object.entries(ComplaintPriority).map(([key, value]) => ({
  label: key,
  value,
}));

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<StaffComplaintListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<StaffComplaintListParams>({});
  const [selectedComplaint, setSelectedComplaint] = useState<StaffComplaintDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action modal state
  const [actionModal, setActionModal] = useState<{ type: string; complaintId: string } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    const res = await complaintsClient.list(params);
    if (res.success && res.data) {
      setComplaints(res.data);
    }
    setIsLoading(false);
  }, [params]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelectedComplaint(null);
    const res = await complaintsClient.get(id);
    if (res.success && res.data) setSelectedComplaint(res.data);
    setDetailLoading(false);
  };

  const handleStatusUpdate = async () => {
    if (!actionModal) return;
    setActionLoading(true);

    let res;
    const { type, complaintId } = actionModal;

    if (type === "assign") {
      res = await complaintsClient.assign(complaintId, { assigned_to: "self" });
    } else if (type === "resolve") {
      res = await complaintsClient.resolve(complaintId, { resolution: actionNote });
    } else if (type === "note") {
      res = await complaintsClient.addNote(complaintId, { content: actionNote });
    } else {
      res = await complaintsClient.updateStatus(complaintId, {
        status: type as ComplaintStatus,
        reason: actionNote || undefined,
      });
    }

    if (res.success) {
      toast.success(
        type === "assign"
          ? "Complaint assigned to you"
          : type === "note"
          ? "Case note added"
          : `Complaint ${type.toLowerCase().replace(/_/g, " ")} successfully`
      );
      setActionModal(null);
      setActionNote("");
      fetchComplaints();
      if (selectedComplaint?.id === complaintId) openDetail(complaintId);
    } else {
      toast.error(res.message || "Action failed");
    }
    setActionLoading(false);
  };

  const isOverdue = (sla: string | null) => {
    if (!sla) return false;
    return new Date(sla) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference, subject, complainant..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent"
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value || undefined }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
            value={params.status ?? ""}
            onChange={(e) => setParams((p) => ({ ...p, status: (e.target.value || undefined) as StaffComplaintListParams["status"] }))}
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
            value={params.priority ?? ""}
            onChange={(e) => setParams((p) => ({ ...p, priority: (e.target.value || undefined) as StaffComplaintListParams["priority"] }))}
          >
            <option value="">All Priorities</option>
            {PRIORITY_OPTIONS.map((opt) => (
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
                <th className="text-left font-medium text-gray-500 px-4 py-3">Subject</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Complainant</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Priority</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Assigned</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">SLA</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#0073ae] mx-auto" />
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No complaints found
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#0073ae]">{c.reference_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{c.subject}</td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 text-xs">{c.complainant_name_display}</div>
                      <div className="text-gray-400 text-xs">{c.complainant_email_display}</div>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} display={c.status_display} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{c.assigned_to_name || "Unassigned"}</td>
                    <td className="px-4 py-3">
                      {c.sla_deadline ? (
                        <span
                          className={`inline-flex items-center gap-1 text-xs ${
                            isOverdue(c.sla_deadline) ? "text-red-600 font-medium" : "text-gray-500"
                          }`}
                        >
                          {isOverdue(c.sla_deadline) && <AlertTriangle className="h-3 w-3" />}
                          {timeAgo(c.sla_deadline)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDetail(c.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0073ae] transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!c.assigned_to_name && (
                          <button
                            onClick={() => { setActionModal({ type: "assign", complaintId: c.id }); }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Assign to me"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        {c.status === "INVESTIGATING" && (
                          <button
                            onClick={() => setActionModal({ type: "resolve", complaintId: c.id })}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors"
                            title="Resolve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
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
      {(selectedComplaint || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedComplaint(null)} />
          <div className="relative w-full max-w-xl bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">Complaint Details</h3>
              <button onClick={() => setSelectedComplaint(null)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {detailLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
              </div>
            ) : selectedComplaint ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <code className="text-sm text-[#0073ae]">{selectedComplaint.reference_number}</code>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={selectedComplaint.priority} />
                    <StatusBadge status={selectedComplaint.status} display={selectedComplaint.status_display} />
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-900">{selectedComplaint.subject}</p>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Complainant" value={selectedComplaint.complainant_name} />
                  <Field label="Email" value={selectedComplaint.complainant_email} />
                  <Field label="Phone" value={selectedComplaint.complainant_phone} />
                  <Field label="Category" value={selectedComplaint.category_display} />
                  <Field label="Operator" value={selectedComplaint.against_operator_name || "—"} />
                  <Field label="Assigned To" value={selectedComplaint.assigned_to_name || "Unassigned"} />
                  <Field label="Submitted" value={formatDateTime(selectedComplaint.created_at)} />
                  <Field label="SLA Deadline" value={selectedComplaint.sla_deadline ? formatDateTime(selectedComplaint.sla_deadline) : "—"} />
                </div>

                {selectedComplaint.resolution && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Resolution</p>
                    <p className="text-sm text-gray-700 bg-green-50 rounded-lg p-3">{selectedComplaint.resolution}</p>
                  </div>
                )}

                {/* Attachments */}
                {(selectedComplaint.documents?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Attachments</p>
                    <div className="space-y-2">
                      {selectedComplaint.documents.map((att) => (
                        <a
                          key={att.id}
                          href={att.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700 flex-1">{att.name}</span>
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Case Notes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-500">Case Notes</p>
                    <button
                      onClick={() => setActionModal({ type: "note", complaintId: selectedComplaint.id })}
                      className="text-xs text-[#0073ae] hover:underline"
                    >
                      + Add Note
                    </button>
                  </div>
                  {(selectedComplaint.case_notes?.length ?? 0) === 0 ? (
                    <p className="text-xs text-gray-400">No case notes yet</p>
                  ) : (
                    <div className="space-y-3 border-l-2 border-gray-200 pl-4">
                      {selectedComplaint.case_notes.map((note) => (
                        <div key={note.id}>
                          <p className="text-sm text-gray-700">{note.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {note.author_name} &middot; {timeAgo(note.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Timeline */}
                {(selectedComplaint.status_timeline?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Status Timeline</p>
                    <div className="space-y-3 border-l-2 border-gray-200 pl-4">
                      {selectedComplaint.status_timeline.map((log) => (
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
          <div className="absolute inset-0 bg-black/30" onClick={() => { setActionModal(null); setActionNote(""); }} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">
              {actionModal.type === "assign" && "Assign to Yourself"}
              {actionModal.type === "resolve" && "Resolve Complaint"}
              {actionModal.type === "note" && "Add Case Note"}
            </h3>
            {actionModal.type === "assign" ? (
              <p className="text-sm text-gray-600">
                This complaint will be assigned to you and moved to &quot;Investigating&quot; status.
              </p>
            ) : (
              <textarea
                placeholder={actionModal.type === "resolve" ? "Resolution notes..." : "Write your case note..."}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
              />
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setActionModal(null); setActionNote(""); }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={actionLoading || (actionModal.type !== "assign" && !actionNote.trim())}
                className="px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {actionModal.type === "assign" && <UserCheck className="h-4 w-4" />}
                {actionModal.type === "note" && <Send className="h-4 w-4" />}
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
