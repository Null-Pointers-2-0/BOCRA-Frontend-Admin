export type StaffDashboard = {
  users: {
    total: number;
    new_this_month: number;
    by_role: Record<string, number>;
  };
  licensing: {
    active: number;
    expired: number;
    suspended: number;
    renewals_due_30d: number;
  };
  applications: {
    pending_review: number;
    under_review: number;
    info_requested: number;
    approved_total: number;
    rejected_total: number;
  };
  complaints: {
    open: number;
    resolved: number;
    overdue: number;
    unassigned: number;
    by_category: Record<string, number>;
  };
  telecoms: {
    total_subscribers: number;
    active_operators: number;
    latest_period: string | null;
  };
  content: {
    publications: { total: number; published: number; draft: number };
    tenders: { total: number; open: number; awarded: number };
    news: { total: number; published: number; draft: number };
  };
  notifications: {
    total_sent: number;
    unread: number;
  };
};

export type UserSummary = {
  total: number;
  by_role: Record<string, number>;
  email_verified: number;
  verification_rate_percent: number;
  locked_accounts: number;
  new_last_7_days: number;
  new_last_30_days: number;
  registration_trend: { month: string; count: number }[];
};

export type ComplaintSummary = {
  total: number;
  open: number;
  resolved: number;
  resolution_rate_percent: number;
  avg_resolution_days: number;
  overdue: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
};

export type LicensingSummary = {
  licences: {
    total: number;
    active: number;
    expired: number;
    suspended: number;
    by_type: Record<string, number>;
  };
  renewals_due: {
    "30_days": number;
    "60_days": number;
    "90_days": number;
  };
  applications: {
    total: number;
    by_status: Record<string, number>;
  };
};

export type TrendItem = {
  month: string;
  count: number;
};

export type ApplicationsTrendResponse = {
  total: number;
  by_licence_type: Record<string, number>;
  approved: number;
  rejected: number;
  approval_rate_percent: number;
  avg_processing_days: number | null;
  volume_trend: TrendItem[];
};

export type ComplaintsTrendResponse = {
  volume_trend: TrendItem[];
  resolution_trend: TrendItem[];
  top_targeted_operators: { against_operator_name: string; count: number }[];
  staff_workload: { assigned_to__email: string; assigned_to__first_name: string; assigned_to__last_name: string; assigned: number; resolved: number }[];
};

export type ContentOverview = {
  publications: { total: number; published: number; draft: number; archived: number };
  tenders: { total: number; draft: number; open: number; closed: number; awarded: number; cancelled: number };
  news: { total: number; published: number; draft: number; archived: number };
};
