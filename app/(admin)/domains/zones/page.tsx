"use client";

import { useEffect, useState, useCallback } from "react";
import { domainsClient } from "@/lib/api/clients";
import type { DomainZoneDetail } from "@/lib/api/types";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Plus,
  Pencil,
  X,
  ShieldCheck,
  Globe,
} from "lucide-react";

const EMPTY_ZONE = {
  name: "",
  code: "",
  description: "",
  registration_fee: "0",
  renewal_fee: "0",
  fee_currency: "BWP",
  min_registration_years: 1,
  max_registration_years: 10,
  is_restricted: false,
  eligibility_criteria: "",
  is_active: true,
};

export default function DomainZonesPage() {
  const [zones, setZones] = useState<DomainZoneDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DomainZoneDetail | null>(null);
  const [formData, setFormData] = useState(EMPTY_ZONE);
  const [saving, setSaving] = useState(false);

  const fetchZones = useCallback(async () => {
    setIsLoading(true);
    const res = await domainsClient.staffZones(
      searchQuery ? { search: searchQuery } : undefined
    );
    if (res.success && res.data) {
      setZones(res.data);
    }
    setIsLoading(false);
  }, [searchQuery]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const openCreate = () => {
    setEditingZone(null);
    setFormData(EMPTY_ZONE);
    setFormOpen(true);
  };

  const openEdit = (zone: DomainZoneDetail) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      code: zone.code,
      description: zone.description,
      registration_fee: zone.registration_fee,
      renewal_fee: zone.renewal_fee,
      fee_currency: zone.fee_currency,
      min_registration_years: zone.min_registration_years,
      max_registration_years: zone.max_registration_years,
      is_restricted: zone.is_restricted,
      eligibility_criteria: zone.eligibility_criteria,
      is_active: zone.is_active,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...formData,
      registration_fee: formData.registration_fee,
      renewal_fee: formData.renewal_fee,
    };

    const res = editingZone
      ? await domainsClient.updateZone(editingZone.id, payload)
      : await domainsClient.createZone(payload);

    if (res.success) {
      toast.success(editingZone ? "Zone updated" : "Zone created");
      setFormOpen(false);
      fetchZones();
    } else {
      toast.error(res.message || "Failed to save zone");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search zones..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae] focus:border-transparent"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] transition-colors"
        >
          <Plus className="h-4 w-4" /> New Zone
        </button>
      </div>

      {/* Zone cards */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
        </div>
      ) : zones.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No zones found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-[#0073ae]" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                    <p className="text-xs text-gray-400 font-mono">{zone.code}</p>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(zone)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">{zone.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Registration</span>
                  <p className="font-medium text-gray-900">
                    {zone.fee_currency} {zone.registration_fee}/yr
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Renewal</span>
                  <p className="font-medium text-gray-900">
                    {zone.fee_currency} {zone.renewal_fee}/yr
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Domains</span>
                  <p className="font-medium text-gray-900">{zone.domain_count}</p>
                </div>
                <div>
                  <span className="text-gray-400">Period</span>
                  <p className="font-medium text-gray-900">
                    {zone.min_registration_years}–{zone.max_registration_years} yrs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {zone.is_restricted && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" /> Restricted
                  </span>
                )}
                <span
                  className={`inline-flex text-xs px-2 py-0.5 rounded-full ${
                    zone.is_active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {zone.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setFormOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {editingZone ? "Edit Zone" : "Create Zone"}
              </h3>
              <button onClick={() => setFormOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Zone Name</label>
                  <input
                    type="text"
                    placeholder=".co.bw"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Code</label>
                  <input
                    type="text"
                    placeholder="CO_BW"
                    value={formData.code}
                    onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                    className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500">Description</label>
                <textarea
                  placeholder="Who this zone is for..."
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Reg Fee ({formData.fee_currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.registration_fee}
                    onChange={(e) => setFormData((p) => ({ ...p, registration_fee: e.target.value }))}
                    className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Renewal Fee ({formData.fee_currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.renewal_fee}
                    onChange={(e) => setFormData((p) => ({ ...p, renewal_fee: e.target.value }))}
                    className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Currency</label>
                  <input
                    type="text"
                    value={formData.fee_currency}
                    onChange={(e) => setFormData((p) => ({ ...p, fee_currency: e.target.value }))}
                    className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Min Years</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.min_registration_years}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        min_registration_years: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Max Years</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.max_registration_years}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        max_registration_years: parseInt(e.target.value) || 10,
                      }))
                    }
                    className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.is_restricted}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, is_restricted: e.target.checked }))
                    }
                    className="rounded border-gray-300"
                  />
                  Restricted zone
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, is_active: e.target.checked }))
                    }
                    className="rounded border-gray-300"
                  />
                  Active
                </label>
              </div>

              {formData.is_restricted && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Eligibility Criteria</label>
                  <textarea
                    placeholder="Requirements for this restricted zone..."
                    value={formData.eligibility_criteria}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, eligibility_criteria: e.target.value }))
                    }
                    rows={2}
                    className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073ae]"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name || !formData.code}
                className="px-4 py-2 text-sm rounded-lg bg-[#0073ae] text-white hover:bg-[#005f8f] disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingZone ? "Update Zone" : "Create Zone"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
