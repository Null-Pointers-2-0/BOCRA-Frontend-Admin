import type { ApplicationStatus } from "./common";

export type LicenceType = {
  id: string;
  name: string;
  code: string;
  description: string;
  fee_amount: string;
  fee_currency: string;
  validity_period_months: number;
  is_active: boolean;
};

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
  licence_type: LicenceType;
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

export type StaffApplicationListParams = {
  status?: ApplicationStatus;
  licence_type?: string;
  search?: string;
  ordering?: string;
};
