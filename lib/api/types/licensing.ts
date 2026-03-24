import type { ApplicationStatus } from "./common";
import { LicenceStatus } from "./common";
export type { LicenceStatus } from "./common";

// ── Licence Sector ───────────────────────────────────────────────────────────

export type LicenceSector = {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  type_count: number;
};

export type LicenceSectorDetail = LicenceSector & {
  licence_types: LicenceTypeListItem[];
  created_at: string;
  updated_at: string;
};

// ── Licence Type ─────────────────────────────────────────────────────────────

export type LicenceTypeListItem = {
  id: string;
  name: string;
  code: string;
  sector: string | null;
  sector_name: string | null;
  sector_code: string | null;
  description: string;
  fee_amount: string;
  annual_fee: string;
  renewal_fee: string;
  fee_currency: string;
  validity_period_months: number;
  is_domain_applicable: boolean;
  sort_order: number;
  is_active: boolean;
};

export type LicenceTypeDetail = LicenceTypeListItem & {
  requirements: string;
  eligibility_criteria: string;
  required_documents: { name: string; required: boolean }[];
  created_at: string;
  updated_at: string;
};

/** @deprecated use LicenceTypeListItem */
export type LicenceType = LicenceTypeListItem;

// ── Licence (issued) ─────────────────────────────────────────────────────────

export type LicenceListItem = {
  id: string;
  licence_number: string;
  licence_type_name: string;
  licence_type_code: string;
  organisation_name: string;
  issued_date: string;
  expiry_date: string;
  status: LicenceStatus;
  status_display: string;
  is_expired: boolean;
  days_until_expiry: number;
};

export type LicenceDetail = {
  id: string;
  licence_number: string;
  licence_type: LicenceTypeListItem;
  organisation_name: string;
  holder: string;
  issued_date: string;
  expiry_date: string;
  status: LicenceStatus;
  status_display: string;
  conditions: string;
  is_expired: boolean;
  days_until_expiry: number;
  has_certificate: boolean;
  application_reference: string;
  created_at: string;
  updated_at: string;
};

// ── Application Documents ────────────────────────────────────────────────────

export type ApplicationDocument = {
  id: string;
  name: string;
  file: string;
  file_type: string;
  file_size: number;
  uploaded_by_name: string;
  created_at: string;
};

export type ApplicationStatusLog = {
  id: string;
  from_status: ApplicationStatus;
  from_status_display: string;
  to_status: ApplicationStatus;
  to_status_display: string;
  changed_by_name: string;
  reason: string;
  changed_at: string;
};

// ── Staff Application ────────────────────────────────────────────────────────

export type StaffApplicationListItem = {
  id: string;
  reference_number: string;
  licence_type_name: string;
  licence_type_code: string;
  organisation_name: string;
  status: ApplicationStatus;
  status_display: string;
  submitted_at: string | null;
  decision_date: string | null;
  has_licence: boolean;
  applicant_name: string;
  applicant_email: string;
  created_at: string;
  updated_at: string;
};

export type StaffApplicationDetail = {
  id: string;
  reference_number: string;
  licence_type: LicenceTypeListItem;
  organisation_name: string;
  organisation_registration: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  description: string;
  status: ApplicationStatus;
  status_display: string;
  submitted_at: string | null;
  decision_date: string | null;
  decision_reason: string;
  info_request_message: string;
  notes: string;
  reviewed_by_name: string | null;
  can_cancel: boolean;
  has_licence: boolean;
  licence_id: string | null;
  documents: ApplicationDocument[];
  status_timeline: ApplicationStatusLog[];
  created_at: string;
  updated_at: string;
};

export type StatusUpdateRequest = {
  status: ApplicationStatus;
  reason?: string;
  info_request_message?: string;
  internal_notes?: string;
};

// ── Params ───────────────────────────────────────────────────────────────────

export type StaffApplicationListParams = {
  status?: ApplicationStatus;
  licence_type?: string;
  search?: string;
  ordering?: string;
};

export type StaffSectorListParams = {
  search?: string;
};

export type StaffLicenceTypeListParams = {
  sector?: string;
  search?: string;
  ordering?: string;
};
