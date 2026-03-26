// -- Coverage Map Types -------------------------------------------------------

export type District = {
  id: string;
  name: string;
  code: string;
  region: string;
  population: number;
  area_sq_km: string;
  center_lat: string;
  center_lng: string;
  is_active: boolean;
};

export type DistrictDetail = District & {
  boundary_geojson: GeoJSON.Geometry | null;
  coverage: CoverageArea[];
  coverage_period: string;
};

export type CoverageArea = {
  id: string;
  operator: string;
  operator_name: string;
  operator_code: string;
  district: string;
  district_name: string;
  district_code: string;
  technology: string;
  coverage_level: CoverageLevel;
  coverage_level_display: string;
  coverage_percentage: string;
  population_covered: number;
  signal_strength_avg: string;
  period: string;
  source: string;
  notes: string;
};

export type CoverageOperator = {
  id: string;
  name: string;
  code: string;
  logo: string | null;
  districts_covered: number;
  technologies: string[];
};

export type CoverageSummary = {
  period: string;
  technology: string;
  national_avg_coverage: number;
  total_districts: number;
  by_operator: OperatorSummary[];
  white_spots: WhiteSpot[];
  white_spot_count: number;
};

export type OperatorSummary = {
  operator: string;
  operator_name: string;
  avg_coverage_percentage: number;
  districts_covered: number;
  total_districts: number;
  population_covered: number;
};

export type WhiteSpot = {
  district: string;
  district_code: string;
  district_id: string;
};

export type DistrictCoverageSummary = {
  district: {
    id: string;
    name: string;
    code: string;
    population: number;
  };
  period: string;
  operators: DistrictOperatorCoverage[];
};

export type DistrictOperatorCoverage = {
  operator: string;
  operator_name: string;
  technologies: Record<
    string,
    {
      coverage_level: CoverageLevel;
      coverage_percentage: number;
      population_covered: number;
      signal_strength_avg: number;
    }
  >;
};

export type CoverageComparison = {
  period: string;
  technology: string;
  operators: { code: string; name: string }[];
  comparison: ComparisonRow[];
};

export type ComparisonRow = {
  district: string;
  district_code: string;
  district_id: string;
  operators: Record<
    string,
    { coverage_level: CoverageLevel; coverage_percentage: number }
  >;
};

export type CoverageUpload = {
  id: string;
  operator: string;
  operator_name: string;
  operator_code: string;
  technology: string;
  file: string;
  file_name: string;
  file_size: number;
  period: string;
  status: string;
  status_display: string;
  records_created: number;
  error_message: string;
  processed_at: string | null;
  created_at: string;
  created_by: string;
};

export type CoverageStats = {
  technology: string;
  trends: {
    period: string;
    operators: Record<string, number>;
  }[];
  district_ranking: {
    district: string;
    code: string;
    avg_coverage: number;
  }[];
  total_records: number;
  periods_available: string[];
};

export type CoverageLevel = "FULL" | "PARTIAL" | "MINIMAL" | "NONE";

export type CoverageAreaListParams = {
  operator?: string;
  technology?: string;
  district?: string;
  period?: string;
  coverage_level?: string;
  ordering?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export type CoverageGeoJSONParams = {
  operator?: string;
  technology?: string;
  period?: string;
};
