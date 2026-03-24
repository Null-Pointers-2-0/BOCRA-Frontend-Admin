export type Notification = {
  id: string;
  notification_type: "IN_APP" | "EMAIL" | "SMS";
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  status: "PENDING" | "SENT" | "READ" | "FAILED";
  related_object_type: string | null;
  related_object_id: string | null;
  created_at: string;
};

export type UnreadCount = {
  unread_count: number;
};

export type NotificationListParams = {
  is_read?: boolean;
};
