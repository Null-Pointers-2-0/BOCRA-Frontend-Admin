import { apiClient } from "../client";
import type { PaginatedData } from "../types/common";
import type {
  AlertCategory,
  AlertLog,
  AlertLogParams,
  AlertStats,
  AlertSubscription,
} from "../types/alerts";

export const alertsClient = {
  // -- Public
  categories: () =>
    apiClient<AlertCategory[]>("/alerts/categories/"),

  // -- Authenticated
  subscriptions: () =>
    apiClient<AlertSubscription[]>("/alerts/subscriptions/"),

  updateSubscription: (data: { categories: string[]; operator_filter?: string }) =>
    apiClient<AlertSubscription>("/alerts/subscriptions/update/", {
      method: "PATCH",
      body: data,
    }),

  deleteSubscription: () =>
    apiClient<{ deleted: number }>("/alerts/subscriptions/delete/", {
      method: "DELETE",
    }),

  // -- Staff
  logs: (params?: AlertLogParams) =>
    apiClient<PaginatedData<AlertLog>>("/alerts/logs/", { params }),

  stats: (params?: { days?: number }) =>
    apiClient<AlertStats>("/alerts/stats/", { params }),
};
