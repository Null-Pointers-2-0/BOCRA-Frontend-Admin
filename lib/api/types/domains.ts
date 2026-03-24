// ── Enums ────────────────────────────────────────────────────────────────────

export const DomainApplicationStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  INFO_REQUESTED: "INFO_REQUESTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type DomainApplicationStatus =
  (typeof DomainApplicationStatus)[keyof typeof DomainApplicationStatus];

export const DomainApplicationType = {
  REGISTRATION: "REGISTRATION",
  RENEWAL: "RENEWAL",
  TRANSFER: "TRANSFER",
} as const;
export type DomainApplicationType =
  (typeof DomainApplicationType)[keyof typeof DomainApplicationType];

export const DomainStatus = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  SUSPENDED: "SUSPENDED",
  PENDING_DELETE: "PENDING_DELETE",
  DELETED: "DELETED",
} as const;
export type DomainStatus = (typeof DomainStatus)[keyof typeof DomainStatus];

// ── Zone ─────────────────────────────────────────────────────────────────────

export type DomainZone = {
  id: string;
  name: string;
  code: string;
  description: string;
  registration_fee: string;
  renewal_fee: string;
  fee_currency: string;
  min_registration_years: number;
  max_registration_years: number;
  is_restricted: boolean;
  eligibility_criteria: string;
  is_active: boolean;
};

export type DomainZoneDetail = DomainZone & {
  domain_count: number;
  created_at: string;
  updated_at: string;
};

// ── Application Document ─────────────────────────────────────────────────────

export type DomainApplicationDocument = {
  id: string;
  name: string;
  file: string;
  file_type: string;
  file_size: number;
  uploaded_by_name: string | null;
  created_at: string;
};

// ── Application Status Log ───────────────────────────────────────────────────

export type DomainApplicationStatusLog = {
  id: string;
  from_status: DomainApplicationStatus;
  from_status_display: string;
  to_status: DomainApplicationStatus;
  to_status_display: string;
  changed_by_name: string;
  reason: string;
  changed_at: string;
};

// ── Staff Application List ───────────────────────────────────────────────────

export type StaffDomainApplicationListItem = {
  id: string;
  reference_number: string;
  application_type: DomainApplicationType;
  application_type_display: string;
  domain_name: string;
  zone: string;
  zone_name: string;
  organisation_name: string;
  status: DomainApplicationStatus;
  status_display: string;
  submitted_at: string | null;
  decision_date: string | null;
  applicant_name: string;
  applicant_email: string;
  created_at: string;
  updated_at: string;
};

// ── Staff Application Detail ─────────────────────────────────────────────────

export type StaffDomainApplicationDetail = {
  id: string;
  reference_number: string;
  application_type: DomainApplicationType;
  application_type_display: string;
  domain_name: string;
  zone: DomainZone;
  status: DomainApplicationStatus;
  status_display: string;
  registration_period_years: number;
  organisation_name: string;
  organisation_registration_number: string;
  registrant_name: string;
  registrant_email: string;
  registrant_phone: string;
  registrant_address: string;
  nameserver_1: string;
  nameserver_2: string;
  nameserver_3: string;
  nameserver_4: string;
  tech_contact_name: string;
  tech_contact_email: string;
  transfer_from_registrant: string;
  transfer_auth_code: string;
  justification: string;
  submitted_at: string | null;
  decision_date: string | null;
  decision_reason: string;
  info_request_message: string;
  reviewed_by_name: string | null;
  applicant_name: string;
  applicant_email: string;
  can_cancel: boolean;
  has_domain: boolean;
  domain_id: string | null;
  documents: DomainApplicationDocument[];
  status_timeline: DomainApplicationStatusLog[];
  created_at: string;
  updated_at: string;
};

// ── Staff Domain List ────────────────────────────────────────────────────────

export type StaffDomainListItem = {
  id: string;
  domain_name: string;
  zone: string;
  zone_name: string;
  status: DomainStatus;
  status_display: string;
  organisation_name: string;
  registrant_name: string;
  registrant_email: string;
  registered_at: string;
  expires_at: string;
  is_expired: boolean;
  days_until_expiry: number;
  is_seeded: boolean;
};

// ── Staff Domain Detail ──────────────────────────────────────────────────────

export type DomainEvent = {
  id: string;
  event_type: string;
  event_type_display: string;
  description: string;
  performed_by_name: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type StaffDomainDetail = {
  id: string;
  domain_name: string;
  zone: DomainZone;
  status: DomainStatus;
  status_display: string;
  registrant_name: string;
  registrant_email: string;
  registrant_phone: string;
  registrant_address: string;
  organisation_name: string;
  nameserver_1: string;
  nameserver_2: string;
  nameserver_3: string;
  nameserver_4: string;
  tech_contact_name: string;
  tech_contact_email: string;
  registered_at: string;
  expires_at: string;
  last_renewed_at: string | null;
  is_expired: boolean;
  days_until_expiry: number;
  is_seeded: boolean;
  created_from_application_ref: string | null;
  events: DomainEvent[];
  created_at: string;
  updated_at: string;
};

// ── Stats ────────────────────────────────────────────────────────────────────

export type DomainStats = {
  total_domains: number;
  active_domains: number;
  expired_domains: number;
  suspended_domains: number;
  expiring_soon: number;
  pending_applications: number;
  domains_by_zone: { zone__name: string; zone__code: string; count: number }[];
  domains_by_status: { status: string; count: number }[];
  applications_by_status: { status: string; count: number }[];
};

// ── Request params ───────────────────────────────────────────────────────────

export type DomainApplicationListParams = {
  status?: DomainApplicationStatus;
  application_type?: DomainApplicationType;
  zone?: string;
  search?: string;
  ordering?: string;
};

export type DomainListParams = {
  status?: DomainStatus;
  zone?: string;
  is_seeded?: boolean;
  search?: string;
  ordering?: string;
};
