// ── Response Envelope ──
export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
};

// ── Pagination ──
export type PaginatedData<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type PaginationParams = {
  page?: number;
  page_size?: number;
};

// ── Common Query Params ──
export type SearchParams = {
  search?: string;
  ordering?: string;
};

// ── Enums ──

export const UserRole = {
  CITIZEN: "CITIZEN",
  REGISTERED: "REGISTERED",
  LICENSEE: "LICENSEE",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
  SUPERADMIN: "SUPERADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ApplicationStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  INFO_REQUESTED: "INFO_REQUESTED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const LicenceStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  EXPIRED: "EXPIRED",
  REVOKED: "REVOKED",
} as const;
export type LicenceStatus = (typeof LicenceStatus)[keyof typeof LicenceStatus];

export const ComplaintCategory = {
  SERVICE_QUALITY: "SERVICE_QUALITY",
  BILLING: "BILLING",
  COVERAGE: "COVERAGE",
  CONDUCT: "CONDUCT",
  INTERNET: "INTERNET",
  BROADCASTING: "BROADCASTING",
  POSTAL: "POSTAL",
  OTHER: "OTHER",
} as const;
export type ComplaintCategory =
  (typeof ComplaintCategory)[keyof typeof ComplaintCategory];

export const ComplaintStatus = {
  SUBMITTED: "SUBMITTED",
  ASSIGNED: "ASSIGNED",
  INVESTIGATING: "INVESTIGATING",
  AWAITING_RESPONSE: "AWAITING_RESPONSE",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
  REOPENED: "REOPENED",
} as const;
export type ComplaintStatus =
  (typeof ComplaintStatus)[keyof typeof ComplaintStatus];

export const ComplaintPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;
export type ComplaintPriority =
  (typeof ComplaintPriority)[keyof typeof ComplaintPriority];

export const PublicationCategory = {
  REGULATION: "REGULATION",
  POLICY: "POLICY",
  REPORT: "REPORT",
  GUIDELINE: "GUIDELINE",
  CONSULTATION: "CONSULTATION",
  ANNUAL_REPORT: "ANNUAL_REPORT",
  STRATEGY: "STRATEGY",
  OTHER: "OTHER",
} as const;
export type PublicationCategory =
  (typeof PublicationCategory)[keyof typeof PublicationCategory];

export const PublicationStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;
export type PublicationStatus =
  (typeof PublicationStatus)[keyof typeof PublicationStatus];

export const TenderCategory = {
  IT_SERVICES: "IT_SERVICES",
  CONSULTING: "CONSULTING",
  CONSTRUCTION: "CONSTRUCTION",
  EQUIPMENT: "EQUIPMENT",
  PROFESSIONAL: "PROFESSIONAL",
  MAINTENANCE: "MAINTENANCE",
  OTHER: "OTHER",
} as const;
export type TenderCategory =
  (typeof TenderCategory)[keyof typeof TenderCategory];

export const TenderStatus = {
  DRAFT: "DRAFT",
  OPEN: "OPEN",
  CLOSING_SOON: "CLOSING_SOON",
  CLOSED: "CLOSED",
  AWARDED: "AWARDED",
  CANCELLED: "CANCELLED",
} as const;
export type TenderStatus = (typeof TenderStatus)[keyof typeof TenderStatus];

export const NewsCategory = {
  PRESS_RELEASE: "PRESS_RELEASE",
  ANNOUNCEMENT: "ANNOUNCEMENT",
  EVENT: "EVENT",
  REGULATORY_UPDATE: "REGULATORY_UPDATE",
  OTHER: "OTHER",
} as const;
export type NewsCategory = (typeof NewsCategory)[keyof typeof NewsCategory];

export const ArticleStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;
export type ArticleStatus =
  (typeof ArticleStatus)[keyof typeof ArticleStatus];

export const NotificationType = {
  IN_APP: "IN_APP",
  EMAIL: "EMAIL",
  SMS: "SMS",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const Gender = {
  M: "M",
  F: "F",
  O: "O",
  N: "N",
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];
