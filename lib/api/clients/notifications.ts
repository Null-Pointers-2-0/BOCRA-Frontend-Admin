import { apiClient } from "../client";
import type { Notification, UnreadCount, NotificationListParams } from "../types";

export const notificationsClient = {
  list: (params?: NotificationListParams) =>
    apiClient<Notification[]>("/notifications/", {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  unreadCount: () =>
    apiClient<UnreadCount>("/notifications/unread-count/"),

  markRead: (id: string) =>
    apiClient<Notification>(`/notifications/${id}/read/`, { method: "PATCH" }),

  markAllRead: () =>
    apiClient<{ marked_read: number }>("/notifications/read-all/", { method: "PATCH" }),
};
