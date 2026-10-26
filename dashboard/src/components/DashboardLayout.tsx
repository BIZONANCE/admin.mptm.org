"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Users,
  RefreshCw,
  Menu,
  Bell,
  LayoutDashboard,
  ClipboardList,
  ChevronRight,
  LogOut,
  User,
  Clock,
  CheckCheck,
  Globe,
  CheckCircle2,
  Briefcase,
  Mail,
  Heart,
  UserCheck,
  Megaphone,
  CreditCard,
  UserX,
} from "lucide-react";
import { MemberRegistration } from "../types";
import { getDatePart, getTimePart } from "../utils/formatters";
import { getApiUrl } from "../utils/config";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SidebarNavItem {
  title: string;
  path: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; className?: string }>;
  bg: string;
  fg: string;
  superAdminOnly?: boolean;
  exactMatch?: boolean;
}

const sidebarNavItems: SidebarNavItem[] = [
  {
    title: "Dashboard",
    path: "/",
    Icon: LayoutDashboard,
    bg: "#C2E7FF",
    fg: "#004A77",
    exactMatch: true,
  },
  {
    title: "Member Registrations",
    path: "/registrations",
    Icon: ClipboardList,
    bg: "#6DD58C",
    fg: "#0F5223",
  },
  {
    title: "Payments",
    path: "/payments",
    Icon: CreditCard,
    bg: "#D9BAFD",
    fg: "#5629A4",
  },
  {
    title: "Manage Users",
    path: "/manage-users",
    Icon: Users,
    bg: "#7FCFFF",
    fg: "#004A77",
    superAdminOnly: true,
  },
  {
    title: "Career Applications",
    path: "/manage-career",
    Icon: Briefcase,
    bg: "#FFE0B2",
    fg: "#8A5300",
    superAdminOnly: true,
  },
  {
    title: "Contact Messages",
    path: "/manage-contact",
    Icon: Mail,
    bg: "#FFAEE4",
    fg: "#8D0053",
    superAdminOnly: true,
  },
  {
    title: "Donations",
    path: "/manage-donations",
    Icon: Heart,
    bg: "#FFCDD2",
    fg: "#B71C1C",
    superAdminOnly: true,
  },
  {
    title: "Executive Members",
    path: "/manage-executives",
    Icon: UserCheck,
    bg: "#FDE68A",
    fg: "#7A5B00",
    superAdminOnly: true,
  },
  {
    title: "Ads Manager",
    path: "/manage-ads",
    Icon: Megaphone,
    bg: "#D1C4E9",
    fg: "#4527A0",
    superAdminOnly: true,
  },
  {
    title: "Deleted Members",
    path: "/deleted-members",
    Icon: UserX,
    bg: "#FFCDD2",
    fg: "#B71C1C",
    superAdminOnly: true,
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState<boolean>(false);

  const [registrations, setRegistrations] = useState<MemberRegistration[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  const [userRole, setUserRole] = useState<string>("USER");
  const [loggedUsername, setLoggedUsername] = useState<string>("");

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const API_URL = getApiUrl();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check login state and user role
  useEffect(() => {
    let queryRole: string | null = null;
    let queryUsername: string | null = null;

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      queryRole = params.get("role");
      queryUsername = params.get("username");

      if (queryRole && queryUsername) {
        localStorage.setItem("mptm_admin_logged_in", "true");
        localStorage.setItem("mptm_admin_username", queryUsername);
        localStorage.setItem("mptm_admin_role", queryRole);
        document.cookie = `mptm_admin_token=mptm_user_otp_token; path=/; max-age=86400; SameSite=Lax`;

        // Clean query params from URL bar
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    const savedLogin = localStorage.getItem("mptm_admin_logged_in");
    if (savedLogin !== "true") {
      setIsAuthenticated(false);
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      const uName = queryUsername || localStorage.getItem("mptm_admin_username") || "";
      const lowerUName = uName.toLowerCase();
      const isSuperCreds =
        lowerUName === "mptmamravati.org" ||
        lowerUName === "admin@mptmamravati.org" ||
        lowerUName === "admin" ||
        lowerUName === "superadmin";
      const savedRole = localStorage.getItem("mptm_admin_role");
      const role = queryRole || savedRole || (isSuperCreds ? "SUPER_ADMIN" : "USER");

      // Strictly enforce USER role if credentials are not super admin
      const finalRole = isSuperCreds ? "SUPER_ADMIN" : (role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "USER");
      setUserRole(finalRole);
      setLoggedUsername(uName);
    }
  }, [router]);

  const isSuperAdmin = useMemo(() => {
    const lower = loggedUsername.toLowerCase();
    if (
      lower === "mptmamravati.org" ||
      lower === "admin@mptmamravati.org" ||
      lower === "admin" ||
      lower === "superadmin"
    ) return true;
    if (userRole === "SUPER_ADMIN") return true;
    return false;
  }, [userRole, loggedUsername]);

  // Route protection for non-super-admin users (Dashboard "/" is accessible to all users)
  useEffect(() => {
    if (isAuthenticated && !isSuperAdmin) {
      if (
        pathname === "/manage-users" ||
        pathname === "/manage-career" ||
        pathname === "/manage-contact" ||
        pathname === "/manage-donations" ||
        pathname === "/manage-executives" ||
        pathname.startsWith("/manage-executives") ||
        pathname === "/manage-ads" ||
        pathname === "/deleted-members"
      ) {
        router.replace("/registrations");
      }
    }
  }, [isAuthenticated, isSuperAdmin, pathname, router]);

  // Fetch registrations for notification dropdown
  const fetchRegistrations = async () => {
    try {
      setIsRefreshing(true);
      const role = localStorage.getItem("mptm_admin_role") || "USER";
      const username = localStorage.getItem("mptm_admin_username") || "";
      const params = new URLSearchParams({
        userEmail: username,
        userRole: role,
      });
      const res = await fetch(`${API_URL}/api/register?${params.toString()}`, {
        headers: {
          "x-user-email": username,
          "x-user-role": role,
        },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setRegistrations(data.data);
      }
    } catch (err) {
      console.error("Layout notification fetch error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

  // Click outside listener for popups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    document.cookie = "mptm_admin_token=; path=/; max-age=0; SameSite=Lax";
    localStorage.removeItem("mptm_admin_logged_in");
    localStorage.removeItem("mptm_admin_username");
    localStorage.removeItem("mptm_admin_role");
    setIsAuthenticated(false);
    router.push("/login");
  };

  // Filter unread notifications (strictly scoped to user if not super admin)
  const scopedRegistrations = useMemo(() => {
    if (isSuperAdmin) return registrations;
    const userClean = (loggedUsername || "").trim().toLowerCase();
    return registrations.filter((r) => {
      const regRef = (r.referredBy || "").trim().toLowerCase();
      return regRef === userClean;
    });
  }, [registrations, isSuperAdmin, loggedUsername]);

  const unreadRegistrations = useMemo(() => {
    return scopedRegistrations.filter((r) => !readNotificationIds.includes(r.id));
  }, [scopedRegistrations, readNotificationIds]);

  const unreadCount = unreadRegistrations.length;

  const handleMarkAsRead = (id: string) => {
    if (!readNotificationIds.includes(id)) {
      setReadNotificationIds((prev) => [...prev, id]);
    }
    router.push("/registrations");
  };

  const handleMarkAllAsRead = () => {
    const allIds = registrations.map((r) => r.id);
    setReadNotificationIds(allIds);
  };

  const renderSidebarButton = (item: SidebarNavItem, index: number) => {
    const isActive = item.exactMatch
      ? pathname === item.path
      : pathname === item.path || pathname.startsWith(item.path + "/");

    return (
      <div key={index} className="w-full">
        <button
          onClick={() => {
            router.push(item.path);
            if (isMobile) setSidebarOpen(false);
          }}
          title={item.title}
          className={`flex items-center w-full ${
            sidebarOpen ? "justify-start gap-3 pl-2.5 pr-4" : "justify-center px-0"
          } py-2.5 rounded-full text-[14.5px] font-medium transition-colors duration-150 ease-in-out whitespace-nowrap text-[#1F1F1F] cursor-pointer ${
            isActive ? "bg-[#C2E7FF] font-semibold text-[#001D35]" : "hover:bg-[#E1E5EA]"
          }`}
        >
          <span
            className="shrink-0 w-[42px] h-[42px] rounded-full flex items-center justify-center"
            style={{ backgroundColor: item.bg }}
          >
            <item.Icon size={20} color={item.fg} strokeWidth={2.4} />
          </span>
          {sidebarOpen && <span className="truncate">{item.title}</span>}
        </button>
      </div>
    );
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-700 animate-spin" />
          <p className="text-xs font-bold text-stone-700">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-red-500 selection:text-white overflow-hidden">
      {/* 1. TOP HEADER NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        <div className="px-4 sm:px-6 h-18 flex items-center justify-between py-2">
          {/* Left Header Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-full bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center text-slate-700 transition"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            {/* Brand Logo & Title (Kept in Marathi as requested) */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full border-2 border-amber-500 bg-[#4A0404] p-0.5 flex items-center justify-center shadow-xs shrink-0">
                <div className="w-full h-full rounded-full flex items-center justify-center text-amber-400 text-sm font-bold">
                  🚩
                </div>
              </div>

              <div className="flex flex-col justify-center leading-tight">
                <span className="text-amber-600 font-bold text-[11px] tracking-wide">
                  जय संताजी
                </span>
                <span className="text-slate-900 font-extrabold text-sm sm:text-base tracking-tight">
                  महाराष्ट्र प्रांतिक तैलिक महासभा
                </span>
                <span className="text-amber-700 font-medium text-[11px]">
                  अमरावती विभाग, अमरावती
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={fetchRegistrations}
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-red-600" : ""}`} />
            </button>

            {/* Notification Bell Icon (Super Admin Only) */}
            {isSuperAdmin && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition focus:outline-none relative"
                  title="Website Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Popover Dropdown */}
                {notificationDropdownOpen && (
                  <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-bold text-slate-800">
                          Website Application Notifications
                        </h4>
                      </div>

                      {unreadCount > 0 ? (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 transition"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Mark All Read ({unreadCount})
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" />
                          All Read
                        </span>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {unreadRegistrations.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          <p className="font-semibold text-slate-700">No Pending Notifications</p>
                          <p className="text-[11px] text-slate-400">All new applications have been read.</p>
                        </div>
                      ) : (
                        unreadRegistrations.slice(0, 6).map((reg) => {
                          const main = reg.mainMembers[0] || { fullName: "New Member", memberNo: "" };
                          return (
                            <div
                              key={reg.id}
                              onClick={() => handleMarkAsRead(reg.id)}
                              className="p-3 bg-blue-50/40 hover:bg-blue-50/80 transition cursor-pointer flex items-start gap-3 group border-l-2 border-blue-500"
                            >
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 border border-amber-200">
                                <Globe className="w-4 h-4 text-amber-700" />
                              </div>
                              <div className="flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 group-hover:text-blue-700">
                                    {main.fullName}
                                  </span>
                                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                                    {reg.receiptNo}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5">
                                  New member registration application received from main website.
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {getDatePart(reg)} {getTimePart(reg)}
                                  </span>
                                  <span className="font-semibold text-emerald-700">
                                    ₹{reg.registrationFee} ({reg.paymentMethod})
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="p-2 border-t border-slate-100 bg-slate-50">
                      <button
                        onClick={() => {
                          router.push("/registrations");
                          setNotificationDropdownOpen(false);
                        }}
                        className="w-full text-center text-xs font-bold text-blue-700 hover:text-blue-900 py-1.5 rounded-lg hover:bg-blue-100/60 transition flex items-center justify-center gap-1"
                      >
                        <span>View All Registrations ({registrations.length})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Logo Avatar */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 hover:ring-2 hover:ring-red-400 focus:outline-none transition shadow-2xs flex items-center justify-center bg-white"
                title="Profile & Settings"
              >
                <Image
                  src="/bizonancelogo.png"
                  alt="Bizonance Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      {isSuperAdmin ? "Super Admin" : "User"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {loggedUsername || (isSuperAdmin ? "mptmamravati.org" : "user")}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accent Bar Beneath Header */}
        <div className="h-[4px] w-full bg-[#FFC107]" />
      </header>

      {/* 2. MAIN LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`bg-[#F0F4F9] h-full flex flex-col py-4 px-3 space-y-1.5 shrink-0 overflow-y-auto z-10 border-r border-gray-100 no-scrollbar transition-all duration-200 ease-in-out ${
            sidebarOpen ? "w-[18rem]" : "w-[6rem]"
          }`}
        >
          {sidebarNavItems
            .filter((item) => !item.superAdminOnly || isSuperAdmin)
            .map((item, index) => renderSidebarButton(item, index))}
        </aside>

        {/* Main Content Area */}
        <div className="content flex-1 bg-[#F0F4F9] overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
