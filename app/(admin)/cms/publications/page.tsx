"use client";

import { useEffect, useState, useCallback } from "react";
import { publicationsClient } from "@/lib/api/clients";
import type { StaffPublicationListItem, StaffPublicationDetail } from "@/lib/api/types";
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
  Archive,
  X,
  FileText,
  Download,
} from "lucide-react";

interface FormData {
  title: string;
  description: string;
  category: string;
  document: File | null;
}

const emptyForm: FormData = { title: "", description: "", category: "", document: null };

export default function PublicationsPage() {
  const [publications, setPublications] = useState<StaffPublicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [detailOpen, setDetailOpen] = useState<StaffPublicationListItem | null>(null);

  const fetchPublications = useCallback(async () => {
    setIsLoading(true);
    const res = await publicationsClient.list({ search: search || undefined });
    if (res.success && res.data) {
      setPublications(res.data);
    }
    setIsLoading(false);
  }, [search]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEdit = async (id: string) => {
    const res = await publicationsClient.get(id);
    if (res.success && res.data) {
      setEditingId(id);
      setForm({
        title: res.data.title,
        description: res.data.summary || "",
        category: res.data.category || "",
        document: null,
      });
      setEditorOpen(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      title: form.title,
      summary: form.description,
      category: form.category as never,
      file: form.document ?? undefined,
    };

    const res = editingId
      ? await publicationsClient.update(editingId, data)
      : await publicationsClient.create(data as never);

    if (res.success) {
      toast.success(editingId ? "Publication updated" : "Publication created");
      setEditorOpen(false);
      setForm(emptyForm);
      fetchPublications();
    } else {
      toast.error(res.message || "Save failed");
    }
    setSaving(false);
  };

  const handlePublish = async (id: string) => {
    const res = await publicationsClient.publish(id);
    if (res.success) {
      toast.success("Publication published");
      fetchPublications();
    } else {
      toast.error(res.message || "Publish failed");
    }
  };

  const handleArchive = async (id: string) => {
    const res = await publicationsClient.archive(id);
    if (res.success) {
      toast.success("Publication archived");
      fetchPublications();
    } else {
      toast.error(res.message || "Archive failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this publication? This cannot be undone.")) return;
    const res = await publicationsClient.delete(id);
    if (res.success) {
      toast.success("Publication deleted");
      fetchPublications();
    } else {
      toast.error(res.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search publications..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent"
            onChange={(e) => { setSearch(e.target.value); }}
          />
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0073ae] text-white text-sm hover:bg-[#005f8f] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Publication
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Title</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Category</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Downloads</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Featured</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Created</th>
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
              ) : publications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">No publications found</td>
                </tr>
              ) : (
                publications.map((pub) => (
                  <tr key={pub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[250px] truncate">{pub.title}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{pub.category_display || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{pub.download_count} downloads</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={pub.status} display={pub.status_display} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-400 text-xs">{pub.is_featured ? "Featured" : "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(pub.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetailOpen(pub)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0073ae]" title="Preview">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(pub.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0073ae]" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        {pub.status === "DRAFT" && (
                          <button onClick={() => handlePublish(pub.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600" title="Publish">
                            <Globe className="h-4 w-4" />
                          </button>
                        )}
                        {pub.status === "PUBLISHED" && (
                          <button onClick={() => handleArchive(pub.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-600" title="Archive">
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(pub.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditorOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{editingId ? "Edit Publication" : "New Publication"}</h3>
              <button onClick={() => setEditorOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                  placeholder="e.g., Annual Report, Policy Document..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={5}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Document (PDF)</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setForm((f) => ({ ...f, document: e.target.files?.[0] || null }))}
                  className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button onClick={() => setEditorOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail preview */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailOpen(null)} />
          <div className="relative w-full max-w-xl bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">Publication Details</h3>
              <button onClick={() => setDetailOpen(null)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={detailOpen.status} display={detailOpen.status_display} />
                <span className="text-xs text-gray-400">{formatDateTime(detailOpen.created_at)}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{detailOpen.title}</h2>
              <p className="text-sm text-gray-500">Category: {detailOpen.category_display} {detailOpen.year && `· ${detailOpen.year}`}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs font-medium text-gray-400">Featured</p><p className="text-sm mt-0.5">{detailOpen.is_featured ? "Yes" : "No"}</p></div>
                <div><p className="text-xs font-medium text-gray-400">Downloads</p><p className="text-sm mt-0.5">{detailOpen.download_count}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
