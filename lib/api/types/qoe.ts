// -- QoE Reporter Types -------------------------------------------------------

export type QoEReport = {
  id: string;
  operator: string;
  operator_name: string;
  operator_code: string;
  service_type: ServiceType;
  service_type_display: string;
  connection_type: ConnectionType;
  connection_type_display: string;
  rating: number;
  download_speed: string | null;
  upload_speed: string | null;
  latency_ms: number | null;
  latitude: string | null;
  longitude: string | null;
  district: string | null;
  district_name: string | null;
  district_code: string | null;
  description: string;
  submitted_by: string | null;
  submitted_by_email: string | null;
  submitted_at: string;
  ip_hash: string;
  is_verified: boolean;
  is_flagged: boolean;
  created_at: string;
};

export type ServiceType = "DATA" | "VOICE" | "SMS" | "FIXED";
export type ConnectionType = "2G" | "3G" | "4G" | "5G";

export type QoEReportListParams = {
  operator?: string;
  district?: string;
  connection_type?: string;
  service_type?: string;
  rating?: number;
  is_flagged?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

// -- Heatmap ------------------------------------------------------------------

export type QoEHeatmapData = {
  days: number;
  districts: QoEHeatmapDistrict[];
};

export type QoEHeatmapDistrict = {
  district_id: string;
  district_name: string;
  district_code: string;
  center_lat: number;
  center_lng: number;
  report_count: number;
  avg_rating: number;
  avg_download_mbps: number;
  avg_upload_mbps: number;
  avg_latency_ms: number;
};

export type QoEHeatmapParams = {
  operator?: string;
  connection_type?: string;
  days?: number;
};

// -- Summary ------------------------------------------------------------------

export type QoESummary = {
  days: number;
  total_reports: number;
  avg_rating: number;
  avg_download_mbps: number;
  avg_upload_mbps: number;
  avg_latency_ms: number;
  rating_distribution: Record<string, number>;
  by_operator: QoEOperatorSummary[];
};

export type QoEOperatorSummary = {
  operator: string;
  operator_name: string;
  report_count: number;
  avg_rating: number;
  avg_download_mbps: number;
  avg_upload_mbps: number;
  avg_latency_ms: number;
};

// -- Trends -------------------------------------------------------------------

export type QoETrendsData = {
  months: number;
  trends: QoETrendMonth[];
};

export type QoETrendMonth = {
  month: string;
  operators: Record<
    string,
    {
      operator_name: string;
      avg_rating: number;
      avg_download_mbps: number;
      report_count: number;
    }
  >;
};

// -- Speeds -------------------------------------------------------------------

export type QoESpeedData = {
  days: number;
  operators: QoEOperatorSpeed[];
};

export type QoEOperatorSpeed = {
  operator: string;
  operator_name: string;
  sample_count: number;
  download: { avg_mbps: number; min_mbps: number; max_mbps: number };
  upload: { avg_mbps: number; min_mbps: number; max_mbps: number };
  latency: { avg_ms: number; min_ms: number; max_ms: number };
  by_connection_type: {
    connection_type: string;
    sample_count: number;
    avg_download_mbps: number;
    avg_upload_mbps: number;
    avg_latency_ms: number;
  }[];
};

// -- Districts ----------------------------------------------------------------

export type QoEDistrictItem = {
  district_id: string;
  district_name: string;
  district_code: string;
  center_lat: number;
  center_lng: number;
  report_count: number;
  avg_rating: number;
};

// -- Analytics (Staff) --------------------------------------------------------

export type QoEAnalytics = {
  days: number;
  total_reports: number;
  flagged_reports: number;
  verified_reports: number;
  reports_with_speed_test: number;
  reports_with_location: number;
  overall: {
    avg_rating: number;
    avg_download_mbps: number;
    avg_upload_mbps: number;
    avg_latency_ms: number;
  };
  by_operator: {
    operator__code: string;
    operator__name: string;
    report_count: number;
    avg_rating: number;
    avg_download: number;
    avg_upload: number;
    avg_latency: number;
  }[];
  by_service_type: {
    service_type: string;
    count: number;
    avg_rating: number;
  }[];
  by_connection_type: {
    connection_type: string;
    count: number;
    avg_rating: number;
    avg_download: number;
  }[];
  top_districts: {
    district__name: string;
    district__code: string;
    report_count: number;
    avg_rating: number;
  }[];
};

// -- Compare (Staff) ----------------------------------------------------------

export type QoECompareData = {
  qoe_window_days: number;
  qos_period: string;
  comparison: QoECompareOperator[];
};

export type QoECompareOperator = {
  operator: string;
  operator_name: string;
  citizen_qoe: {
    report_count: number;
    avg_rating: number;
    avg_download_mbps: number;
    avg_upload_mbps: number;
    avg_latency_ms: number;
  };
  operator_qos: {
    period: string;
    metrics: Record<
      string,
      { value: number; unit: string; benchmark: number }
    >;
  };
};
