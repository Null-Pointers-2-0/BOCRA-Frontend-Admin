"use client";

import { useEffect, useState, useCallback } from "react";
import { licensingClient } from "@/lib/api/clients";
import type {
  LicenceSector,
  LicenceTypeListItem,
  LicenceTypeDetail,
} from "@/lib/api/types";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  RadioTower,
  Mail,
  Tv,
  Shield,
  Globe,
} from "lucide-react";

const SECTOR_ICONS: Record<string, React.ElementType> = {
  "radio-tower": RadioTower,
  mail: Mail,
  tv: Tv,
  shield: Shield,
};

const EMPTY_SECTOR = {
  name: "",
  code: "",
  description: "",
  icon: "",
  sort_order: 0,
  is_active: true,
};

const EMPTY_TYPE = {
  name: "",
  code: "",
  sector: "",
  description: "",
  requirements: "",
  eligibility_criteria: "",
  required_documents: [] as { name: string; required: boolean }[],
  fee_amount: "0",
  annual_fee: "0",
  renewal_fee: "0",
  fee_currency: "BWP",
  validity_period_months: 12,
  is_domain_applicable: false,
  sort_order: 0,
  is_active: true,
};

export default function SectorsTypesPage() {
  const [sectors, setSectors] = useState<LicenceSector[]>([]);
  const [types, setTypes] = useState<LicenceTypeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({});

  // Sector form
  const [sectorFormOpen, setSectorFormOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<LicenceSector | null>(null);
  const [sectorForm, setSectorForm] = useState(EMPTY_SECTOR);
  const [sectorSaving, setSectorSaving] = useState(false);

  // Type form
  const [typeFormOpen, setTypeFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<LicenceTypeDetail | null>(null);
  const [typeForm, setTypeForm] = useState(EMPTY_TYPE);
  const [typeSaving, setTypeSaving] = useState(false);

  // New document input
  const [newDocName, setNewDocName] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [sectorsRes, typesRes] = await Promise.all([
      licensingClient.staffSectors(searchQuery ? { search: searchQuery } : undefined),
      licensingClient.staffTypes(searchQuery ? { search: searchQuery } : undefined),
    ]);
    if (sectorsRes.success && sectorsRes.data) setSectors(sectorsRes.data);
    if (typesRes.success && typesRes.data) setTypes(typesRes.data);
    setIsLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group types by sector
  const typesBySector = sectors.reduce<Record<string, LicenceTypeListItem[]>>((acc, s) => {
    acc[s.id] = types.filter((t) => t.sector === s.id);
    return acc;
  }, {});
  const unsectoredTypes = types.filter((t) => !t.sector);

  const toggleSector = (id: string) => {
    setExpandedSectors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Sector CRUD ────────────────────────────────────────────────────────
  const openCreateSector = () => {
    setEditingSector(null);
    setSectorForm(EMPTY_SECTOR);
    setSectorFormOpen(true);
  };

  const openEditSector = (sector: LicenceSector) => {
    setEditingSector(sector);
    setSectorForm({
      name: sector.name,
      code: sector.code,
      description: sector.description,
      icon: sector.icon,
      sort_order: sector.sort_order,
      is_active: sector.is_active,
    });
    setSectorFormOpen(true);
  };

  const handleSaveSector = async () => {
    setSectorSaving(true);
    const res = editingSector
      ? await licensingClient.updateSector(editingSector.id, sectorForm)
      : await licensingClient.createSector(sectorForm);
    if (res.success) {
      toast.success(editingSector ? "Sector updated" : "Sector created");
      setSectorFormOpen(false);
      fetchData();
    } else {
      toast.error(res.message || "Failed to save sector");
    }
    setSectorSaving(false);
  };

  const handleDeleteSector = async (sector: LicenceSector) => {
    if (!confirm(`Delete sector "${sector.name}"? This cannot be undone.`)) return;
    const res = await licensingClient.deleteSector(sector.id);
    if (res.success) {
      toast.success("Sector deleted");
      fetchData();
    } else {
      toast.error(res.message || "Cannot delete sector with active types");
    }
  };

  // ── Type CRUD ──────────────────────────────────────────────────────────
  const openCreateType = (sectorId?: string) => {
    setEditingType(null);
    setTypeForm({ ...EMPTY_TYPE, sector: sectorId || "" });
    setTypeFormOpen(true);
  };

  const openEditType = async (typeItem: LicenceTypeListItem) => {
    const res = await licensingClient.staffTypeDetail(typeItem.id);
    if (res.success && res.data) {
      setEditingType(res.data);
      setTypeForm({
        name: res.data.name,
        code: res.data.code,
        sector: res.data.sector || "",
        description: res.data.description,
        requirements: res.data.requirements,
        eligibility_criteria: res.data.eligibility_criteria,
        required_documents: res.data.required_documents || [],
        fee_amount: res.data.fee_amount,
        annual_fee: res.data.annual_fee,
        renewal_fee: res.data.renewal_fee,
        fee_currency: res.data.fee_currency,
        validity_period_months: res.data.validity_period_months,
        is_domain_applicable: res.data.is_domain_applicable,
        sort_order: res.data.sort_order,
        is_active: res.data.is_active,
      });
      setTypeFormOpen(true);
    }
  };

  const handleSaveType = async () => {
    setTypeSaving(true);
    const payload = {
      ...typeForm,
      sector: typeForm.sector || null,
    };
    const res = editingType
      ? await licensingClient.updateType(editingType.id, payload)
      : await licensingClient.createType(payload);
    if (res.success) {
      toast.success(editingType ? "Licence type updated" : "Licence type created");
      setTypeFormOpen(false);
      fetchData();
    } else {
      toast.error(res.message || "Failed to save licence type");
    }
    setTypeSaving(false);
  };

  const handleDeleteType = async (typeItem: LicenceTypeListItem) => {
    if (!confirm(`Delete licence type "${typeItem.name}"? This cannot be undone.`)) return;
    const res = await licensingClient.deleteType(typeItem.id);
    if (res.success) {
      toast.success("Licence type deleted");
      fetchData();
    } else {
      toast.error(res.message || "Cannot delete type with active applications");
    }
  };

  const addDocument = () => {
    if (!newDocName.trim()) return;
    setTypeForm((prev) => ({
      ...prev,
      required_documents: [...prev.required_documents, { name: newDocName.trim(), required: true }],
    }));
    setNewDocName("");
  };

  const removeDocument = (index: number) => {
    setTypeForm((prev) => ({
      ...prev,
      required_documents: prev.required_documents.filter((_, i) => i !== index),
    }));
  };

  const toggleDocRequired = (index: number) => {
    setTypeForm((prev) => ({
      ...prev,
      required_documents: prev.required_documents.map((d, i) =>
        i === index ? { ...d, required: !d.required } : d
      ),
    }));
  };

  const renderTypeRow = (t: LicenceTypeListItem) => (
    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900 text-sm">{t.name}</div>
        <div className="text-xs text-gray-400 font-mono">{t.code}</div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{t.fee_currency} {Number(t.fee_amount).toLocaleString()}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{t.fee_currency} {Number(t.annual_fee).toLocaleString()}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{t.validity_period_months} months</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {t.is_domain_applicable && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              <Globe className="h-3 w-3" /> Domain
            </span>
          )}
          <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${t.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
            {t.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button onClick={() => openEditType(t)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => handleDeleteType(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600" title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sectors and types..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openCreateSector} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            <Plus className="h-4 w-4" /> New Sector
          </button>
          <button onClick={() => openCreateType()} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] transition-colors">
            <Plus className="h-4 w-4" /> New Type
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
        </div>
      ) : (
        <div className="space-y-4">
          {sectors.map((sector) => {
            const Icon = SECTOR_ICONS[sector.icon] || Shield;
            const sectorTypes = typesBySector[sector.id] || [];
            const isExpanded = expandedSectors[sector.id] !== false; // default open

            return (
              <div key={sector.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {/* Sector header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gray-50 border-b border-gray-200">
                  <button onClick={() => toggleSector(sector.id)} className="flex items-center gap-3 flex-1 text-left">
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <Icon className="h-5 w-5 text-[#0073ae]" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{sector.name}</h3>
                      <p className="text-xs text-gray-500">{sector.code} &middot; {sectorTypes.length} type{sectorTypes.length !== 1 ? "s" : ""}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${sector.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {sector.is_active ? "Active" : "Inactive"}
                    </span>
                    <button onClick={() => openEditSector(sector)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Edit sector">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteSector(sector)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600" title="Delete sector">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => openCreateType(sector.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600" title="Add type to sector">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Types table */}
                {isExpanded && (
                  sectorTypes.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white border-b border-gray-100">
                          <tr>
                            <th className="text-left font-medium text-gray-500 px-4 py-2.5">Licence Type</th>
                            <th className="text-left font-medium text-gray-500 px-4 py-2.5">Application Fee</th>
                            <th className="text-left font-medium text-gray-500 px-4 py-2.5">Annual Fee</th>
                            <th className="text-left font-medium text-gray-500 px-4 py-2.5">Validity</th>
                            <th className="text-left font-medium text-gray-500 px-4 py-2.5">Flags</th>
                            <th className="text-left font-medium text-gray-500 px-4 py-2.5">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {sectorTypes.map(renderTypeRow)}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">No licence types in this sector</div>
                  )
                )}
              </div>
            );
          })}

          {/* Unsectored types */}
          {unsectoredTypes.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Unassigned Types</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white border-b border-gray-100">
                    <tr>
                      <th className="text-left font-medium text-gray-500 px-4 py-2.5">Licence Type</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-2.5">Application Fee</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-2.5">Annual Fee</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-2.5">Validity</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-2.5">Flags</th>
                      <th className="text-left font-medium text-gray-500 px-4 py-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {unsectoredTypes.map(renderTypeRow)}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Sector Create/Edit Modal ──────────────────────────────────────── */}
      {sectorFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSectorFormOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{editingSector ? "Edit Sector" : "Create Sector"}</h3>
              <button onClick={() => setSectorFormOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Name</label>
                  <input type="text" value={sectorForm.name} onChange={(e) => setSectorForm((p) => ({ ...p, name: e.target.value }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Code</label>
                  <input type="text" value={sectorForm.code} onChange={(e) => setSectorForm((p) => ({ ...p, code: e.target.value }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Description</label>
                <textarea value={sectorForm.description} onChange={(e) => setSectorForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Icon</label>
                  <select value={sectorForm.icon} onChange={(e) => setSectorForm((p) => ({ ...p, icon: e.target.value }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]">
                    <option value="">None</option>
                    <option value="radio-tower">Radio Tower (ICT)</option>
                    <option value="mail">Mail (Postal)</option>
                    <option value="tv">TV (Broadcasting)</option>
                    <option value="shield">Shield (General)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Sort Order</label>
                  <input type="number" value={sectorForm.sort_order} onChange={(e) => setSectorForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={sectorForm.is_active} onChange={(e) => setSectorForm((p) => ({ ...p, is_active: e.target.checked }))} className="rounded border-gray-300" />
                Active
              </label>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSectorFormOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveSector} disabled={sectorSaving || !sectorForm.name || !sectorForm.code} className="px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] disabled:opacity-50 flex items-center gap-2">
                {sectorSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingSector ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Type Create/Edit Modal ────────────────────────────────────────── */}
      {typeFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setTypeFormOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{editingType ? "Edit Licence Type" : "Create Licence Type"}</h3>
              <button onClick={() => setTypeFormOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Name</label>
                  <input type="text" value={typeForm.name} onChange={(e) => setTypeForm((p) => ({ ...p, name: e.target.value }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Code</label>
                  <input type="text" value={typeForm.code} onChange={(e) => setTypeForm((p) => ({ ...p, code: e.target.value }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Sector</label>
                  <select value={typeForm.sector} onChange={(e) => setTypeForm((p) => ({ ...p, sector: e.target.value }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]">
                    <option value="">— No sector —</option>
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500">Description</label>
                <textarea value={typeForm.description} onChange={(e) => setTypeForm((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500">Requirements</label>
                <textarea value={typeForm.requirements} onChange={(e) => setTypeForm((p) => ({ ...p, requirements: e.target.value }))} rows={3} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500">Eligibility Criteria</label>
                <textarea value={typeForm.eligibility_criteria} onChange={(e) => setTypeForm((p) => ({ ...p, eligibility_criteria: e.target.value }))} rows={2} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
              </div>

              {/* Fees */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Application Fee</label>
                  <input type="number" step="0.01" value={typeForm.fee_amount} onChange={(e) => setTypeForm((p) => ({ ...p, fee_amount: e.target.value }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Annual Fee</label>
                  <input type="number" step="0.01" value={typeForm.annual_fee} onChange={(e) => setTypeForm((p) => ({ ...p, annual_fee: e.target.value }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Renewal Fee</label>
                  <input type="number" step="0.01" value={typeForm.renewal_fee} onChange={(e) => setTypeForm((p) => ({ ...p, renewal_fee: e.target.value }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Validity (months)</label>
                  <input type="number" min={1} value={typeForm.validity_period_months} onChange={(e) => setTypeForm((p) => ({ ...p, validity_period_months: parseInt(e.target.value) || 12 }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Currency</label>
                  <input type="text" value={typeForm.fee_currency} onChange={(e) => setTypeForm((p) => ({ ...p, fee_currency: e.target.value }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Sort Order</label>
                  <input type="number" value={typeForm.sort_order} onChange={(e) => setTypeForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                </div>
                <div className="flex items-end gap-4 pb-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={typeForm.is_domain_applicable} onChange={(e) => setTypeForm((p) => ({ ...p, is_domain_applicable: e.target.checked }))} className="rounded border-gray-300" />
                    Domain applicable
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={typeForm.is_active} onChange={(e) => setTypeForm((p) => ({ ...p, is_active: e.target.checked }))} className="rounded border-gray-300" />
                    Active
                  </label>
                </div>
              </div>

              {/* Required documents */}
              <div>
                <label className="text-xs font-medium text-gray-500">Required Documents</label>
                <div className="mt-1 space-y-1">
                  {typeForm.required_documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={doc.required} onChange={() => toggleDocRequired(i)} className="rounded border-gray-300" title="Required?" />
                      <span className="flex-1 text-gray-700">{doc.name}</span>
                      <span className="text-xs text-gray-400">{doc.required ? "Required" : "Optional"}</span>
                      <button onClick={() => removeDocument(i)} className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="text" placeholder="Document name..." value={newDocName} onChange={(e) => setNewDocName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDocument()} className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]" />
                  <button onClick={addDocument} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Add</button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setTypeFormOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveType} disabled={typeSaving || !typeForm.name || !typeForm.code} className="px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] disabled:opacity-50 flex items-center gap-2">
                {typeSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingType ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
