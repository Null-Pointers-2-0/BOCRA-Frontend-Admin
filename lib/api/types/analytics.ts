export type TrendItem = {
  month: string;
  count: number;
};

export type StaffDashboard = {
  users: {
    total: number;
    new_this_month: number;
    verified: number;
    verification_rate: number;
    by_role: Record<string, number>;
  };
  licensing: {
    total: number;
    active: number;
    expired: number;
    suspended: number;
    renewals_due_30d: number;
    renewals_due_60d: number;
    by_sector: Record<string, number>;
  };
  applications: {
    total: number;
    pending_review: number;
    under_review: number;
    info_requested: number;
    approved_total: number;
    rejected_total: number;
    approval_rate: number;
    avg_processing_days: number | null;
    recent_30d: number;
    trend_6m: TrendItem[];
  };
  domains: {
    total: number;
    active: number;
    expired: number;
    expiring_30d: number;
    by_zone: Record<string, number>;
    applications: {
      total: number;
      pending: number;
      under_review: number;
    };
  };
  complaints: {
    total: number;
    open: number;
    resolved: number;
    overdue: number;
    unassigned: number;
    resolution_rate: number;
    sla_compliance: number;
    avg_resolution_days: number | null;
    by_category: Record<string, number>;
    by_priority: Record<string, number>;
    trend_6m: TrendItem[];
  };
  telecoms: {
    total_subscribers: number;
    active_operators: number;
    latest_period: string | null;
    by_operator: {
      operator__name: string;
      operator__code: string;
      subscribers: number;
      share: number;
    }[];
  };
  coverage: {
    total_areas: number;
    avg_coverage_percent: number;
    by_operator: Record<string, number>;
    by_technology: Record<string, number>;
    pending_uploads: number;
  } | null;
  qoe: {
    total_reports: number;
    avg_rating: number | null;
    reports_last_30d: number;
    flagged_reports: number;
    by_operator: {
      operator__name: string;
      operator__code: string;
      avg_rating: number;
      report_count: number;
    }[];
  } | null;
  scorecard: {
    latest_scores: {
      operator__name: string;
      operator__code: string;
      composite_score: number;
      rank: number;
      coverage_score: number;
      qoe_score: number;
      complaints_score: number;
      qos_score: number;
    }[];
    latest_period: string | null;
  } | null;
  alerts: {
    total_subscribers: number;
    confirmed: number;
    active: number;
    alerts_sent_30d: number;
    alerts_failed_30d: number;
  } | null;
  content: {
    publications: { total: number; published: number; draft: number };
    tenders: { total: number; open: number; closing_soon: number; awarded: number };
    news: { total: number; published: number; draft: number };
  };
  notifications: {
    total_sent: number;
    unread: number;
  };
};
