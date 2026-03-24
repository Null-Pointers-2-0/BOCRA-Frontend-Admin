"use client";

import { useEffect, useState, useCallback } from "react";
import { newsClient } from "@/lib/api/clients";
import type { StaffArticleListItem, StaffArticleDetail } from "@/lib/api/types";
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
  Image as ImageIcon,
} from "lucide-react";

interface FormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  featured_image: File | null;
}

const emptyForm: FormData = { title: "", content: "", excerpt: "", category: "", featured_image: null };

export default function NewsPage() {
  const [articles, setArticles] = useState<StaffArticleListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [detailOpen, setDetailOpen] = useState<StaffArticleListItem | null>(null);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    const res = await newsClient.list({ search: search || undefined });
    if (res.success && res.data) {
      setArticles(res.data);
    }
    setIsLoading(false);
  }, [search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEdit = async (id: string) => {
    const res = await newsClient.get(id);
    if (res.success && res.data) {
      setEditingId(id);
      setForm({
        title: res.data.title,
        content: res.data.content,
        excerpt: res.data.excerpt || "",
        category: res.data.category || "",
        featured_image: null,
      });
      setEditorOpen(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      title: form.title,
      content: form.content,
      excerpt: form.excerpt,
      category: form.category as never,
      featured_image: form.featured_image ?? undefined,
    };

    const res = editingId
      ? await newsClient.update(editingId, data)
      : await newsClient.create(data as never);

    if (res.success) {
      toast.success(editingId ? "Article updated" : "Article created");
      setEditorOpen(false);
      setForm(emptyForm);
      fetchArticles();
    } else {
      toast.error(res.message || "Save failed");
    }
    setSaving(false);
  };

  const handlePublish = async (id: string) => {
    const res = await newsClient.publish(id);
    if (res.success) {
      toast.success("Article published");
      fetchArticles();
    } else {
      toast.error(res.message || "Publish failed");
    }
  };

  const handleArchive = async (id: string) => {
    const res = await newsClient.archive(id);
    if (res.success) {
      toast.success("Article archived");
      fetchArticles();
    } else {
      toast.error(res.message || "Archive failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    const res = await newsClient.delete(id);
    if (res.success) {
      toast.success("Article deleted");
      fetchArticles();
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
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent"
            onChange={(e) => { setSearch(e.target.value); }}
          />
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0073ae] text-white text-sm hover:bg-[#005f8f] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Article
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No articles found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-300" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={article.status} display={article.status_display} />
                  <span className="text-xs text-gray-400">{formatDate(article.created_at)}</span>
                </div>
                <h3 className="font-medium text-gray-900 line-clamp-2">{article.title}</h3>
                <p className="text-xs text-gray-400">{article.category_display} · {article.view_count} views</p>
                <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                  <button onClick={() => setDetailOpen(article)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0073ae]" title="Preview">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button onClick={() => openEdit(article.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0073ae]" title="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  {article.status === "DRAFT" && (
                    <button onClick={() => handlePublish(article.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600" title="Publish">
                      <Globe className="h-4 w-4" />
                    </button>
                  )}
                  {article.status === "PUBLISHED" && (
                    <button onClick={() => handleArchive(article.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-500 hover:text-amber-600" title="Archive">
                      <Archive className="h-4 w-4" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(article.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 ml-auto" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditorOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{editingId ? "Edit Article" : "New Article"}</h3>
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
                <label className="text-sm font-medium text-gray-700">Excerpt</label>
                <input
                  type="text"
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                  placeholder="Short description..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                  placeholder="e.g., GENERAL, REGULATORY, INDUSTRY..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={10}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae] font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Featured Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm((f) => ({ ...f, featured_image: e.target.files?.[0] || null }))}
                  className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button onClick={() => setEditorOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.content.trim()}
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
              <h3 className="font-semibold text-gray-900">Article Preview</h3>
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
              <p className="text-sm text-gray-500">By {detailOpen.author_name} · {detailOpen.category_display}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs font-medium text-gray-400">Views</p><p className="text-sm mt-0.5">{detailOpen.view_count}</p></div>
                <div><p className="text-xs font-medium text-gray-400">Featured</p><p className="text-sm mt-0.5">{detailOpen.is_featured ? "Yes" : "No"}</p></div>
                <div><p className="text-xs font-medium text-gray-400">Published</p><p className="text-sm mt-0.5">{detailOpen.published_at ? formatDate(detailOpen.published_at) : "Not published"}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
