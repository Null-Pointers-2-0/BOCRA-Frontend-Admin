"use client";

import { useEffect, useState, useCallback } from "react";
import { tendersClient } from "@/lib/api/clients";
import type { StaffTenderListItem, StaffTenderDetail, TenderCreateRequest } from "@/lib/api/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Eye,
  Pencil,
  Trash2,
  Plus,
  Globe,
  Lock,
  Award,
  X,
  FileText,
  Download,
  PlusCircle,
  Upload,
} from "lucide-react";

interface TenderFormData {
  title: string;
  description: string;
  reference_number: string;
  closing_date: string;
  category: string;
}

interface AddendumFormData {
  title: string;
  content: string;
}

const emptyForm: TenderFormData = { title: "", description: "", reference_number: "", closing_date: "", category: "" };
const emptyAddendum: AddendumFormData = { title: "", content: "" };

export default function TendersPage() {
  const [tenders, setTenders] = useState<StaffTenderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TenderFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [detailOpen, setDetailOpen] = useState<StaffTenderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Sub-action modals
  const [addendumModal, setAddendumModal] = useState<string | null>(null);
  const [addendumForm, setAddendumForm] = useState<AddendumFormData>(emptyAddendum);
  const [uploadModal, setUploadModal] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [awardModal, setAwardModal] = useState<string | null>(null);
  const [awardCompany, setAwardCompany] = useState("");
  const [subActionLoading, setSubActionLoading] = useState(false);

  const fetchTenders = useCallback(async () => {
    setIsLoading(true);
    const res = await tendersClient.list({ search: search || undefined });
    if (res.success && res.data) {
      setTenders(res.data);
    }
    setIsLoading(false);
  }, [search]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEdit = async (id: string) => {
    const res = await tendersClient.get(id);
    if (res.success && res.data) {
      setEditingId(id);
      setForm({
        title: res.data.title,
        description: res.data.description,
        reference_number: res.data.reference_number || "",
        closing_date: res.data.closing_date?.substring(0, 16) || "",
        category: res.data.category || "",
      });
      setEditorOpen(true);
    }
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetailOpen(null);
    const res = await tendersClient.get(id);
    if (res.success && res.data) setDetailOpen(res.data);
    setDetailLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const body = {
      title: form.title,
      description: form.description,
      reference_number: form.reference_number || undefined,
      closing_date: form.closing_date || undefined,
      category: (form.category || undefined) as TenderCreateRequest["category"],
    };

    const res = editingId
      ? await tendersClient.update(editingId, body)
      : await tendersClient.create(body as TenderCreateRequest);

    if (res.success) {
      toast.success(editingId ? "Tender updated" : "Tender created");
      setEditorOpen(false);
      setForm(emptyForm);
      fetchTenders();
    } else {
      toast.error(res.message || "Save failed");
    }
    setSaving(false);
  };

  const handlePublish = async (id: string) => {
    const res = await tendersClient.publish(id);
    if (res.success) { toast.success("Tender published"); fetchTenders(); }
    else toast.error(res.message || "Failed");
  };

  const handleClose = async (id: string) => {
    const res = await tendersClient.close(id);
    if (res.success) { toast.success("Tender closed"); fetchTenders(); }
    else toast.error(res.message || "Failed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tender?")) return;
    const res = await tendersClient.delete(id);
    if (res.success) { toast.success("Tender deleted"); fetchTenders(); }
    else toast.error(res.message || "Failed");
  };

  const handleAddAddendum = async () => {
    if (!addendumModal) return;
    setSubActionLoading(true);
    const res = await tendersClient.addAddendum(addendumModal, addendumForm);
    if (res.success) {
      toast.success("Addendum added");
      setAddendumModal(null);
      setAddendumForm(emptyAddendum);
      if (detailOpen?.id === addendumModal) openDetail(addendumModal);
    } else toast.error(res.message || "Failed");
    setSubActionLoading(false);
  };

  const handleUploadDocument = async () => {
    if (!uploadModal || !uploadFile) return;
    setSubActionLoading(true);
    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("title", uploadTitle || uploadFile.name);
    const res = await tendersClient.uploadDocument(uploadModal, fd);
    if (res.success) {
      toast.success("Document uploaded");
      setUploadModal(null);
      setUploadFile(null);
      setUploadTitle("");
      if (detailOpen?.id === uploadModal) openDetail(uploadModal);
    } else toast.error(res.message || "Failed");
    setSubActionLoading(false);
  };

  const handleAward = async () => {
    if (!awardModal) return;
    setSubActionLoading(true);
    const res = await tendersClient.award(awardModal, {
      awardee_name: awardCompany,
      award_date: new Date().toISOString().split("T")[0],
    });
    if (res.success) {
      toast.success("Tender awarded");
      setAwardModal(null);
      setAwardCompany("");
      fetchTenders();
    } else toast.error(res.message || "Failed");
    setSubActionLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tenders..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent"
            onChange={(e) => { setSearch(e.target.value); }}
          />
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0073ae] text-white text-sm hover:bg-[#005f8f] transition-colors">
          <Plus className="h-4 w-4" /> New Tender
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Reference</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Title</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Closing Date</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Created</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-[#0073ae] mx-auto" /></td></tr>
              ) : tenders.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No tenders found</td></tr>
              ) : (
                tenders.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#0073ae]">{t.reference_number || "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[250px] truncate">{t.title}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} display={t.status_display} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.closing_date ? formatDate(t.closing_date) : "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openDetail(t.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0073ae]" title="View"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openEdit(t.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0073ae]" title="Edit"><Pencil className="h-4 w-4" /></button>
                        {t.status === "DRAFT" && (
                          <button onClick={() => handlePublish(t.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600" title="Publish"><Globe className="h-4 w-4" /></button>
                        )}
                        {t.status === "OPEN" && (
                          <>
                            <button onClick={() => handleClose(t.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-600" title="Close"><Lock className="h-4 w-4" /></button>
                          </>
                        )}
                        {t.status === "CLOSED" && (
                          <button onClick={() => setAwardModal(t.id)} className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-500 hover:text-purple-600" title="Award"><Award className="h-4 w-4" /></button>
                        )}
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
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
      {(detailOpen || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailOpen(null)} />
          <div className="relative w-full max-w-xl bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">Tender Details</h3>
              <button onClick={() => setDetailOpen(null)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            {detailLoading ? (
              <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" /></div>
            ) : detailOpen ? (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <code className="text-sm text-[#0073ae]">{detailOpen.reference_number || "No reference"}</code>
                  <StatusBadge status={detailOpen.status} display={detailOpen.status_display} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{detailOpen.title}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="Created By" value={detailOpen.created_by_name} />
                  <Field label="Closing Date" value={detailOpen.closing_date ? formatDateTime(detailOpen.closing_date) : "—"} />
                  <Field label="Created" value={formatDateTime(detailOpen.created_at)} />
                  <Field label="Awarded To" value={detailOpen.award?.awardee_name || "—"} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{detailOpen.description}</p>
                </div>

                {/* Documents */}
                {detailOpen.documents && detailOpen.documents.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Documents</p>
                    <div className="space-y-2">
                      {detailOpen.documents.map((doc) => (
                        <a key={doc.id} href={doc.file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700 flex-1">{doc.title}</span>
                          <Download className="h-3 w-3 text-gray-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addenda */}
                {detailOpen.addenda && detailOpen.addenda.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Addenda</p>
                    <div className="space-y-2">
                      {detailOpen.addenda.map((add) => (
                        <div key={add.id} className="p-3 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{add.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{add.content}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(add.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick actions */}
                <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-200">
                  <button onClick={() => setUploadModal(detailOpen.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-50">
                    <Upload className="h-3 w-3" /> Upload Document
                  </button>
                  <button onClick={() => setAddendumModal(detailOpen.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 hover:bg-gray-50">
                    <PlusCircle className="h-3 w-3" /> Add Addendum
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Create/Edit modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditorOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{editingId ? "Edit Tender" : "New Tender"}</h3>
              <button onClick={() => setEditorOpen(false)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Reference Number</label>
                <input type="text" value={form.reference_number} onChange={(e) => setForm((f) => ({ ...f, reference_number: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" placeholder="e.g., BOCRA/TENDER/2025/001" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Closing Date</label>
                <input type="datetime-local" value={form.closing_date} onChange={(e) => setForm((f) => ({ ...f, closing_date: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={8} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button onClick={() => setEditorOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.description.trim()} className="px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Addendum modal */}
      {addendumModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAddendumModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Add Addendum</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Title" value={addendumForm.title} onChange={(e) => setAddendumForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
              <textarea placeholder="Content" value={addendumForm.content} onChange={(e) => setAddendumForm((f) => ({ ...f, content: e.target.value }))} rows={4} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAddendumModal(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddAddendum} disabled={subActionLoading || !addendumForm.title.trim()} className="px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] disabled:opacity-50 flex items-center gap-2">
                {subActionLoading && <Loader2 className="h-4 w-4 animate-spin" />} Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {uploadModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setUploadModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Upload Document</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Document title" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
              <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setUploadModal(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={handleUploadDocument} disabled={subActionLoading || !uploadFile} className="px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] disabled:opacity-50 flex items-center gap-2">
                {subActionLoading && <Loader2 className="h-4 w-4 animate-spin" />} Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Award modal */}
      {awardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setAwardModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Award Tender</h3>
            <input type="text" placeholder="Winning company name" value={awardCompany} onChange={(e) => setAwardCompany(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAwardModal(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAward} disabled={subActionLoading || !awardCompany.trim()} className="px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] disabled:opacity-50 flex items-center gap-2">
                {subActionLoading && <Loader2 className="h-4 w-4 animate-spin" />} Award
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
