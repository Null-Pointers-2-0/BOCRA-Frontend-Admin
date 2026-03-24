import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  // Application
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-50 text-blue-700",
  UNDER_REVIEW: "bg-amber-50 text-amber-700",
  INFO_REQUESTED: "bg-orange-50 text-orange-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  // Complaint
  ASSIGNED: "bg-indigo-50 text-indigo-700",
  INVESTIGATING: "bg-purple-50 text-purple-700",
  AWAITING_RESPONSE: "bg-amber-50 text-amber-700",
  RESOLVED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-gray-100 text-gray-600",
  REOPENED: "bg-red-50 text-red-600",
  // Publication / Tender
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
  OPEN: "bg-emerald-50 text-emerald-700",
  CLOSING_SOON: "bg-amber-50 text-amber-700",
  AWARDED: "bg-blue-50 text-blue-700",
  // Licence / Domain
  ACTIVE: "bg-emerald-50 text-emerald-700",
  SUSPENDED: "bg-amber-50 text-amber-700",
  EXPIRED: "bg-red-50 text-red-600",
  REVOKED: "bg-red-50 text-red-700",
  PENDING_DELETE: "bg-orange-50 text-orange-700",
  DELETED: "bg-gray-100 text-gray-500",
};

const priorityColors: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700",
  HIGH: "bg-orange-50 text-orange-700",
  MEDIUM: "bg-blue-50 text-blue-700",
  LOW: "bg-gray-100 text-gray-600",
};

export function StatusBadge({
  status,
  display,
  className,
}: {
  status: string;
  display?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        statusColors[status] || "bg-gray-100 text-gray-700",
        className
      )}
    >
      {display || formatStatus(status)}
    </span>
  );
}

export function PriorityBadge({
  priority,
  display,
  className,
}: {
  priority: string;
  display?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        priorityColors[priority] || "bg-gray-100 text-gray-700",
        className
      )}
    >
      {display || priority}
    </span>
  );
}

function formatStatus(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
