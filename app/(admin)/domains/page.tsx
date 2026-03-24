"use client";

import { useEffect, useState, useCallback } from "react";
import { domainsClient } from "@/lib/api/clients";
import type {
  StaffDomainListItem,
  StaffDomainDetail,
  DomainListParams,
} from "@/lib/api/types";
import { DomainStatus } from "@/lib/api/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDateTime, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Loader2,
  Eye,
  X,
  Ban,
  PlayCircle,
  Trash2,
  AlertTriangle,
  Globe,
  Server,
} from "lucide-react";

const STATUS_OPTIONS = Object.entries(DomainStatus).map(([key, value]) => ({
  label: key.replace(/_/g, " "),
  value,
}));

export default function DomainsPage() {
  const [domains, setDomains] = useState<StaffDomainListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<DomainListParams>({});
  const [selectedDomain, setSelectedDomain] = useState<StaffDomainDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action modal state
  const [actionModal, setActionModal] = useState<{
    type: "suspend" | "unsuspend" | "delete";
    domainId: string;
    domainName: string;
  } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDomains = useCallback(async () => {
    setIsLoading(true);
    const res = await domainsClient.listDomains(params);
    if (res.success && res.data) {
      setDomains(res.data);
    }
    setIsLoading(false);
  }, [params]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelectedDomain(null);
    const res = await domainsClient.getDomain(id);
    if (res.success && res.data) setSelectedDomain(res.data);
    setDetailLoading(false);
  };

  const handleAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);

    let res;
    const { type, domainId } = actionModal;

    if (type === "suspend") {
      res = await domainsClient.suspendDomain(domainId, actionNote);
    } else if (type === "unsuspend") {
      res = await domainsClient.unsuspendDomain(domainId);
    } else if (type === "delete") {
      res = await domainsClient.deleteDomain(domainId);
    }

    if (res?.success) {
      toast.success(
        type === "suspend"
          ? "Domain suspended"
          : type === "unsuspend"
          ? "Domain reactivated"
          : "Domain deleted"
      );
      setActionModal(null);
      setActionNote("");
      fetchDomains();
      if (selectedDomain?.id === domainId) {
        openDetail(domainId);
      }
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
            placeholder="Search by domain, organisation, registrant..."
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
                status: (e.target.value || undefined) as DomainListParams["status"],
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
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Domain</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Zone</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Registrant</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Registered</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Expires</th>
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
              ) : domains.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No domains found
                  </td>
                </tr>
              ) : (
                domains.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-900">{d.domain_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{d.zone_name}</td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900 text-xs">{d.registrant_name}</div>
                      <div className="text-gray-400 text-xs">{d.registrant_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} display={d.status_display} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatDate(d.registered_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs ${
                          d.is_expired ? "text-red-600" : d.days_until_expiry <= 30 ? "text-amber-600" : "text-gray-500"
                        }`}
                      >
                        {d.is_expired && <AlertTriangle className="h-3 w-3" />}
                        {formatDate(d.expires_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDetail(d.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0073ae] transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {d.status === "ACTIVE" && (
                          <button
                            onClick={() =>
                              setActionModal({
                                type: "suspend",
                                domainId: d.id,
                                domainName: d.domain_name,
                              })
                            }
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-600 transition-colors"
                            title="Suspend"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        {d.status === "SUSPENDED" && (
                          <button
                            onClick={() =>
                              setActionModal({
                                type: "unsuspend",
                                domainId: d.id,
                                domainName: d.domain_name,
                              })
                            }
                            className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors"
                            title="Reactivate"
                          >
                            <PlayCircle className="h-4 w-4" />
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
      {(selectedDomain || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelectedDomain(null)}
          />
          <div className="relative w-full max-w-xl bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">Domain Details</h3>
              <button
                onClick={() => setSelectedDomain(null)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {detailLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
              </div>
            ) : selectedDomain ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#0073ae]" />
                    <span className="font-semibold text-gray-900 text-lg">
                      {selectedDomain.domain_name}
                    </span>
                  </div>
                  <StatusBadge
                    status={selectedDomain.status}
                    display={selectedDomain.status_display}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Zone" value={selectedDomain.zone.name} />
                  <Field label="Status" value={selectedDomain.status_display} />
                  <Field label="Registrant" value={selectedDomain.registrant_name} />
                  <Field label="Email" value={selectedDomain.registrant_email} />
                  <Field label="Phone" value={selectedDomain.registrant_phone} />
                  <Field label="Organisation" value={selectedDomain.organisation_name} />
                  <Field label="Registered" value={formatDateTime(selectedDomain.registered_at)} />
                  <Field label="Expires" value={formatDateTime(selectedDomain.expires_at)} />
                  {selectedDomain.last_renewed_at && (
                    <Field label="Last Renewed" value={formatDateTime(selectedDomain.last_renewed_at)} />
                  )}
                  {selectedDomain.created_from_application_ref && (
                    <Field label="Application Ref" value={selectedDomain.created_from_application_ref} />
                  )}
                </div>

                {selectedDomain.registrant_address && (
                  <div>
                    <p className="text-xs font-medium text-gray-400">Address</p>
                    <p className="text-sm text-gray-900 mt-0.5 whitespace-pre-wrap">
                      {selectedDomain.registrant_address}
                    </p>
                  </div>
                )}

                {/* Nameservers */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Nameservers</p>
                  <div className="space-y-1">
                    {[
                      selectedDomain.nameserver_1,
                      selectedDomain.nameserver_2,
                      selectedDomain.nameserver_3,
                      selectedDomain.nameserver_4,
                    ]
                      .filter(Boolean)
                      .map((ns, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg"
                        >
                          <Server className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-mono text-gray-700">{ns}</span>
                        </div>
                      ))}
                    {![
                      selectedDomain.nameserver_1,
                      selectedDomain.nameserver_2,
                      selectedDomain.nameserver_3,
                      selectedDomain.nameserver_4,
                    ].some(Boolean) && (
                      <p className="text-xs text-gray-400">No nameservers configured</p>
                    )}
                  </div>
                </div>

                {/* Tech Contact */}
                {(selectedDomain.tech_contact_name || selectedDomain.tech_contact_email) && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Field label="Tech Contact" value={selectedDomain.tech_contact_name} />
                    <Field label="Tech Email" value={selectedDomain.tech_contact_email} />
                  </div>
                )}

                {/* Domain Events */}
                {(selectedDomain.events?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Event History</p>
                    <div className="space-y-3 border-l-2 border-gray-200 pl-4">
                      {selectedDomain.events.map((evt) => (
                        <div key={evt.id}>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={evt.event_type} display={evt.event_type_display} />
                            <span className="text-xs text-gray-400">
                              {timeAgo(evt.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{evt.description}</p>
                          <p className="text-xs text-gray-400">by {evt.performed_by_name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {selectedDomain.status === "ACTIVE" && (
                    <button
                      onClick={() =>
                        setActionModal({
                          type: "suspend",
                          domainId: selectedDomain.id,
                          domainName: selectedDomain.domain_name,
                        })
                      }
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Ban className="h-4 w-4" /> Suspend
                    </button>
                  )}
                  {selectedDomain.status === "SUSPENDED" && (
                    <button
                      onClick={() =>
                        setActionModal({
                          type: "unsuspend",
                          domainId: selectedDomain.id,
                          domainName: selectedDomain.domain_name,
                        })
                      }
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <PlayCircle className="h-4 w-4" /> Reactivate
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setActionModal({
                        type: "delete",
                        domainId: selectedDomain.id,
                        domainName: selectedDomain.domain_name,
                      })
                    }
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
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
              {actionModal.type === "suspend" && "Suspend Domain"}
              {actionModal.type === "unsuspend" && "Reactivate Domain"}
              {actionModal.type === "delete" && "Delete Domain"}
            </h3>
            <p className="text-sm text-gray-600">
              {actionModal.type === "suspend" &&
                `Suspending ${actionModal.domainName} will disable DNS resolution.`}
              {actionModal.type === "unsuspend" &&
                `Reactivate ${actionModal.domainName}? It will resume normal DNS resolution.`}
              {actionModal.type === "delete" &&
                `Permanently delete ${actionModal.domainName}? This action cannot be undone.`}
            </p>
            {actionModal.type === "suspend" && (
              <textarea
                placeholder="Reason for suspension..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={3}
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
                  (actionModal.type === "suspend" && !actionNote.trim())
                }
                className={`px-4 py-2 text-sm rounded-lg text-white flex items-center gap-2 disabled:opacity-50 ${
                  actionModal.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#0073ae] hover:bg-[#005f8f]"
                }`}
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
