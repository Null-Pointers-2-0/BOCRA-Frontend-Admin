"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { notificationsClient } from "@/lib/api/clients";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/licensing": "Licensing Applications",
  "/licensing/types": "Sectors & Licence Types",
  "/licensing/licences": "Issued Licences",
  "/complaints": "Complaints Management",
  "/domains": "Domain Registry",
  "/domains/applications": "Domain Applications",
  "/domains/zones": "Domain Zones",
  "/domains/stats": "Domain Statistics",
  "/cms/news": "News Articles",
  "/cms/publications": "Publications",
  "/cms/tenders": "Tenders",
  "/users": "User Management",
  "/notifications": "Notifications",
};

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pageTitle = pageTitles[pathname] || "Admin Portal";

  useEffect(() => {
    notificationsClient.unreadCount().then((res) => {
      if (res.success && res.data) setUnreadCount(res.data.unread_count);
    });
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#c60751] text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0073ae] text-white text-sm font-medium">
              {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs text-gray-500">{user?.role_display}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
