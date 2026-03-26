"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { complaintsClient } from "@/lib/api/clients";
import {
  LayoutDashboard,
  FileCheck,
  MessageSquareWarning,
  Newspaper,
  FileText,
  Megaphone,
  Users,
  Bell,
  BellRing,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Globe,
  ListChecks,
  Server,
  BarChart3,
  ShieldCheck,
  Layers,
  ClipboardList,
  Award,
  Map,
  Activity,
  Trophy,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Licensing",
    icon: FileCheck,
    children: [
      { name: "Applications", href: "/licensing", icon: ClipboardList },
      { name: "Sectors & Types", href: "/licensing/types", icon: Layers },
      { name: "Issued Licences", href: "/licensing/licences", icon: Award },
    ],
  },
  { name: "Complaints", href: "/complaints", icon: MessageSquareWarning },
  {
    name: "Domains",
    icon: Globe,
    children: [
      { name: "Registry", href: "/domains", icon: Server },
      { name: "Applications", href: "/domains/applications", icon: ListChecks },
      { name: "Zones", href: "/domains/zones", icon: ShieldCheck },
      { name: "Statistics", href: "/domains/stats", icon: BarChart3 },
    ],
  },
  {
    name: "Content",
    icon: FolderOpen,
    children: [
      { name: "News", href: "/cms/news", icon: Newspaper },
      { name: "Publications", href: "/cms/publications", icon: FileText },
      { name: "Tenders", href: "/cms/tenders", icon: Megaphone },
    ],
  },
  { name: "Coverage Map", href: "/coverage", icon: Map },
  { name: "QoE Reporter", href: "/qoe", icon: Activity },
  { name: "Operator Scorecard", href: "/scorecard", icon: Trophy },
  { name: "Alert Subscriptions", href: "/alerts", icon: BellRing },
  { name: "Users", href: "/users", icon: Users },
  { name: "Notifications", href: "/notifications", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigation.forEach((item) => {
      if (item.children) {
        initial[item.name] = item.children.some((child) =>
          pathname.startsWith(child.href)
        );
      }
    });
    return initial;
  });

  const [complaintCount, setComplaintCount] = useState(0);

  useEffect(() => {
    complaintsClient.counts().then((res) => {
      if (res.success && res.data) setComplaintCount(res.data.active);
    });
  }, [pathname]);

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-gray-200 bg-white transition-all duration-300",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/bocra-logo.png" alt="BOCRA" width={120} height={40} />
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <Image src="/bocra-logo.png" alt="BOCRA" width={36} height={36} />
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          if (item.children) {
            const isChildActive = item.children.some((child) =>
              pathname.startsWith(child.href)
            );
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleGroup(item.name)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isChildActive
                      ? "text-[#0073ae]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openGroups[item.name] && "rotate-90"
                        )}
                      />
                    </>
                  )}
                </button>
                {openGroups[item.name] && !collapsed && (
                  <div className="ml-5 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-[#0073ae]/10 text-[#0073ae] font-medium"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          )}
                        >
                          <child.icon className="h-4 w-4 shrink-0" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#0073ae]/10 text-[#0073ae]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.name === "Complaints" && complaintCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c60751] px-1.5 text-[10px] font-bold text-white">
                      {complaintCount > 99 ? "99+" : complaintCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
