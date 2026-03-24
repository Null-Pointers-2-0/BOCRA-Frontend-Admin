import type {
  ComplaintCategory,
  ComplaintStatus,
  ComplaintPriority,
} from "./common";

export type ComplaintDocument = {
  id: string;
  name: string;
  file: string;
  file_type: string;
  file_size: number;
  uploaded_by_name: string;
  created_at: string;
};

export type ComplaintStatusLog = {
  id: string;
  from_status: ComplaintStatus;
  from_status_display: string;
  to_status: ComplaintStatus;
  to_status_display: string;
  changed_by_name: string;
  reason: string;
  changed_at: string;
};

export type CaseNote = {
  id: string;
  content: string;
  is_internal: boolean;
  author_name: string;
  created_at: string;
};

export type StaffComplaintListItem = {
  id: string;
  reference_number: string;
  subject: string;
  category: ComplaintCategory;
  category_display: string;
  against_operator_name: string;
  status: ComplaintStatus;
  status_display: string;
  priority: ComplaintPriority;
  priority_display: string;
  is_overdue: boolean;
  sla_deadline: string | null;
  complainant_name_display: string;
  complainant_email_display: string;
  assigned_to_name: string | null;
  days_until_sla: number | null;
  created_at: string;
  resolved_at: string | null;
};

export type StaffComplaintDetail = {
  id: string;
  reference_number: string;
  complainant_name: string;
  complainant_email: string;
  complainant_phone: string;
  against_operator_name: string;
  against_licensee: string | null;
  category: ComplaintCategory;
  category_display: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  status_display: string;
  priority: ComplaintPriority;
  priority_display: string;
  assigned_to_name: string | null;
  resolution: string;
  resolved_at: string | null;
  is_overdue: boolean;
  days_until_sla: number | null;
  sla_deadline: string | null;
  documents: ComplaintDocument[];
  status_timeline: ComplaintStatusLog[];
  case_notes: CaseNote[];
  created_at: string;
  updated_at: string;
};

export type ComplaintStatusUpdateRequest = {
  status: ComplaintStatus;
  reason?: string;
};

export type ComplaintAssignRequest = {
  assigned_to: string;
};

export type ComplaintResolveRequest = {
  resolution: string;
};

export type CaseNoteCreateRequest = {
  content: string;
  is_internal?: boolean;
};

export type StaffComplaintListParams = {
  status?: ComplaintStatus;
  category?: ComplaintCategory;
  priority?: ComplaintPriority;
  assigned_to?: string;
  search?: string;
  ordering?: string;
};
