"use client";

import { useEffect, useState, useCallback } from "react";
import { notificationsClient } from "@/lib/api/clients";
import type { Notification } from "@/lib/api/types";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import {
  Loader2,
  Bell,
  Check,
  CheckCheck,
  MailOpen,
  FileText,
  AlertTriangle,
  Info,
} from "lucide-react";

const relatedIcon = (relatedType: string | null) => {
  switch (relatedType) {
    case "complaint": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "licence":
    case "application": return <FileText className="h-4 w-4 text-blue-500" />;
    case "publication":
    case "tender":
    case "article": return <Info className="h-4 w-4 text-[#008265]" />;
    default: return <Bell className="h-4 w-4 text-gray-400" />;
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    const [listRes, countRes] = await Promise.all([
      notificationsClient.list(),
      notificationsClient.unreadCount(),
    ]);
    if (listRes.success && listRes.data) {
      const all = listRes.data;
      setNotifications(all);
      setTotal(all.length);
    }
    if (countRes.success && countRes.data) {
      setUnread(countRes.data.unread_count);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    const res = await notificationsClient.markRead(id);
    if (res.success) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnread((c) => Math.max(0, c - 1));
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    const res = await notificationsClient.markAllRead();
    if (res.success) {
      toast.success("All notifications marked as read");
      fetchNotifications();
    } else {
      toast.error(res.message || "Failed");
    }
    setMarkingAll(false);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#0073ae]" />
            <span className="text-sm text-gray-500">{total} total</span>
          </div>
          {unread > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0073ae] text-white">
              {unread} unread
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#0073ae]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  n.is_read ? "bg-white" : "bg-blue-50/50"
                } hover:bg-gray-50`}
              >
                <div className="flex-shrink-0 mt-0.5">{relatedIcon(n.related_object_type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${n.is_read ? "text-gray-700" : "text-gray-900 font-medium"}`}>
                      {n.title}
                    </p>
                    {!n.is_read && <span className="h-2 w-2 rounded-full bg-[#0073ae] flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-[#0073ae] transition-colors"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {n.is_read && (
                  <div className="flex-shrink-0 p-1.5 text-gray-300">
                    <MailOpen className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
