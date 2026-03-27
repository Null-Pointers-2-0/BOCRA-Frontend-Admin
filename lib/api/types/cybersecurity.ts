// -- Cybersecurity Types ------------------------------------------------------

export type AuditType =
  | "VULNERABILITY_ASSESSMENT"
  | "PENETRATION_TEST"
  | "COMPLIANCE_AUDIT"
  | "INCIDENT_RESPONSE"
  | "GENERAL";

export type AuditRequestStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED";

export type AuditRequest = {
  id: string;
  reference_number: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string;
  organization: string;
  audit_type: AuditType;
  audit_type_display: string;
  description: string;
  preferred_date: string | null;
  status: AuditRequestStatus;
  status_display: string;
  assigned_to: string | null;
  assigned_to_name: string | null;
  staff_notes: string;
  resolution: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditRequestListItem = Omit<
  AuditRequest,
  "description" | "assigned_to" | "assigned_to_name" | "staff_notes" | "resolution" | "completed_at" | "requester_phone"
>;

export type AuditRequestCounts = {
  total: number;
  submitted: number;
  under_review: number;
  scheduled: number;
  in_progress: number;
  completed: number;
  rejected: number;
};

export type AuditRequestParams = {
  status?: AuditRequestStatus;
  audit_type?: AuditType;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
};
