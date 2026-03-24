"use client";

import { useEffect, useState, useCallback } from "react";
import { usersClient } from "@/lib/api/clients";
import type { UserListItem, UserListParams, AdminUserUpdateRequest } from "@/lib/api/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  X,
  Shield,
  ShieldCheck,
  User,
  Lock,
  Unlock,
} from "lucide-react";

import { UserRole } from "@/lib/api/types";

const ROLE_OPTIONS = Object.entries(UserRole).map(([key, value]) => ({
  label: key.charAt(0) + key.slice(1).toLowerCase(),
  value,
}));

const roleIcon = (role: string) => {
  switch (role) {
    case "SUPERADMIN": return <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />;
    case "ADMIN": return <Shield className="h-3.5 w-3.5 text-blue-600" />;
    case "STAFF": return <Shield className="h-3.5 w-3.5 text-green-600" />;
    default: return <User className="h-3.5 w-3.5 text-gray-400" />;
  }
};

const roleBadge = (role: string) => {
  const colors: Record<string, string> = {
    SUPERADMIN: "bg-purple-100 text-purple-700",
    ADMIN: "bg-blue-100 text-blue-700",
    STAFF: "bg-green-100 text-green-700",
    PUBLIC: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[role] || colors.PUBLIC}`}>
      {roleIcon(role)}
      {role}
    </span>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState<UserListParams>({ page: 1 });
  const [editModal, setEditModal] = useState<UserListItem | null>(null);
  const [editForm, setEditForm] = useState<AdminUserUpdateRequest>({});
  const [saving, setSaving] = useState(false);
  const [detailUser, setDetailUser] = useState<UserListItem | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const res = await usersClient.list(params);
    if (res.success && res.data) {
      setUsers(res.data.results);
      setTotal(res.data.count);
    }
    setIsLoading(false);
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openEdit = (user: UserListItem) => {
    setEditModal(user);
    setEditForm({
      role: user.role as UserRole,
      is_active: user.is_active,
    });
  };

  const handleSave = async () => {
    if (!editModal) return;
    setSaving(true);
    const res = await usersClient.update(editModal.id, editForm);
    if (res.success) {
      toast.success("User updated");
      setEditModal(null);
      fetchUsers();
    } else {
      toast.error(res.message || "Update failed");
    }
    setSaving(false);
  };

  const toggleActive = async (user: UserListItem) => {
    const res = await usersClient.update(user.id, { is_active: !user.is_active });
    if (res.success) {
      toast.success(user.is_active ? "User deactivated" : "User activated");
      fetchUsers();
    } else {
      toast.error(res.message || "Failed");
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent"
            onChange={(e) => setParams((p) => ({ ...p, search: e.target.value || undefined, page: 1 }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
            value={params.role ?? ""}
            onChange={(e) => setParams((p) => ({ ...p, role: (e.target.value || undefined) as UserListParams["role"], page: 1 }))}
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="rounded-lg border border-gray-300 bg-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
            value={params.is_active === undefined ? "" : String(params.is_active)}
            onChange={(e) => setParams((p) => ({ ...p, is_active: e.target.value === "" ? undefined : e.target.value === "true", page: 1 }))}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: total, color: "text-gray-900" },
          { label: "Active", value: users.filter((u) => u.is_active).length, color: "text-green-600" },
          { label: "Staff+", value: users.filter((u) => ["STAFF", "ADMIN", "SUPERADMIN"].includes(u.role)).length, color: "text-blue-600" },
          { label: "Inactive", value: users.filter((u) => !u.is_active).length, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-medium text-gray-500 px-4 py-3">User</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Email</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Role</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Status</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Joined</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Last Login</th>
                <th className="text-left font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-[#0073ae] mx-auto" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#0073ae]/10 flex items-center justify-center text-[#0073ae] font-medium text-xs">
                          {user.full_name?.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{user.email}</td>
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`} />
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.date_joined)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">—</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetailUser(user)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0073ae]" title="View details">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0073ae]" title="Edit role">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => toggleActive(user)} className={`p-1.5 rounded-lg ${user.is_active ? "hover:bg-red-50 text-gray-500 hover:text-red-600" : "hover:bg-green-50 text-gray-500 hover:text-green-600"}`} title={user.is_active ? "Deactivate" : "Activate"}>
                          {user.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray-500">Page {params.page} of {totalPages} ({total} total)</p>
            <div className="flex items-center gap-1">
              <button disabled={params.page === 1} onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) - 1 }))} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></button>
              <button disabled={params.page === totalPages} onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))} className="p-1.5 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail slide-over */}
      {detailUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailUser(null)} />
          <div className="relative w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-semibold text-gray-900">User Details</h3>
              <button onClick={() => setDetailUser(null)} className="p-1 rounded hover:bg-gray-100"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[#0073ae]/10 flex items-center justify-center text-[#0073ae] font-bold text-xl">
                  {detailUser.full_name?.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{detailUser.full_name}</p>
                  <p className="text-sm text-gray-500">{detailUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs font-medium text-gray-400">Role</p><div className="mt-1">{roleBadge(detailUser.role)}</div></div>
                <div><p className="text-xs font-medium text-gray-400">Status</p><p className="text-sm mt-1">{detailUser.is_active ? "Active" : "Inactive"}</p></div>
                <div><p className="text-xs font-medium text-gray-400">Email Verified</p><p className="text-sm text-gray-900 mt-0.5">{detailUser.email_verified ? "Yes" : "No"}</p></div>
                <div><p className="text-xs font-medium text-gray-400">Date Joined</p><p className="text-sm text-gray-900 mt-0.5">{formatDateTime(detailUser.date_joined)}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setEditModal(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Edit User: {editModal.full_name}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  value={editForm.role || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Active</label>
                <button
                  onClick={() => setEditForm((f) => ({ ...f, is_active: !f.is_active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.is_active ? "bg-[#0073ae]" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.is_active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
