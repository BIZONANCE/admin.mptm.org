"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  FileText,
  IndianRupee,
  Search,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Printer,
  X,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  ImageIcon,
  UserPlus,
  Filter,
  Menu,
  Bell,
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  Smartphone,
  ChevronRight,
  LogOut,
  User,
  Clock,
  CheckCheck,
  Globe,
  Check,
  CheckCircle2,
  Banknote,
  QrCode,
  Lock,
} from "lucide-react";

interface FamilyMember {
  id: string;
  registrationId: string;
  srNo: number;
  name: string;
  relation: string;
  dob: string;
  occupation: string;
  mobile: string;
}

interface MainMember {
  id: string;
  registrationId: string;
  srNo: number;
  memberNo: string;
  fullName: string;
  mobileNo: string;
  prabhagNo: string;
}

interface MemberRegistration {
  id: string;
  receiptNo: string;
  date: string;
  registrationFee: number;
  amountInWords: string;
  address: string;
  paymentMethod: string;
  paymentScreenshot?: string | null;
  createdAt: string;
  updatedAt: string;
  mainMembers: MainMember[];
  familyMembers: FamilyMember[];
}

export default function DashboardHome() {
  const router = useRouter();

  // Authentication State Check
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // App Navigation & Data State
  const [activeTab, setActiveTab] = useState<"dashboard" | "registrations">("dashboard");
  const [registrations, setRegistrations] = useState<MemberRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search Bar & Payment Filter State ("ALL" | "CASH" | "ONLINE")
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  
  const [selectedReg, setSelectedReg] = useState<MemberRegistration | null>(null);
  const [screenshotZoom, setScreenshotZoom] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState<boolean>(false);
  
  // Track read notification registration IDs
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Check login session on mount: if not logged in, redirect to /login
  useEffect(() => {
    const savedLogin = localStorage.getItem("mptm_admin_logged_in");
    if (savedLogin === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    document.cookie = "mptm_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("mptm_admin_logged_in");
    localStorage.removeItem("mptm_admin_username");
    setIsAuthenticated(false);
    setProfileDropdownOpen(false);
    router.push("/login");
  };


  const fetchRegistrations = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/register`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`सर्व्हर कडून प्रतिसाद मिळाला नाही (Status ${res.status})`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRegistrations(json.data);
      } else {
        throw new Error(json.error || "डेटा फॉरमॅट चुकीचा आहे");
      }
    } catch (err: any) {
      console.error("Fetch registrations error:", err);
      setError(err.message || "डेटा लोड करताना त्रुटी आली. बॅकएंड सर्व्हर (Port 5000) चालू असल्याची खात्री करा.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

  // Close dropdowns when clicking outside
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

  // Filter ONLY unread registrations for the notification list
  const unreadRegistrations = useMemo(() => {
    return registrations.filter((r) => !readNotificationIds.includes(r.id));
  }, [registrations, readNotificationIds]);

  const unreadCount = unreadRegistrations.length;

  // Mark single notification as read -> automatically removes it from notification popover
  const handleMarkAsRead = (regId: string) => {
    if (!readNotificationIds.includes(regId)) {
      setReadNotificationIds((prev) => [...prev, regId]);
    }
  };

  // Mark all notifications as read -> removes all items from notification popover
  const handleMarkAllAsRead = () => {
    const allIds = registrations.map((r) => r.id);
    setReadNotificationIds(allIds);
  };

  // Filtered registrations list with robust Cash vs Online/UPI matching logic
  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const query = searchQuery.trim().toLowerCase();
      const pMethod = (reg.paymentMethod || "").toLowerCase();

      // Payment method match logic
      let matchesPayment = true;
      if (paymentFilter === "CASH") {
        matchesPayment = pMethod.includes("रोख") || pMethod.includes("cash");
      } else if (paymentFilter === "ONLINE") {
        matchesPayment =
          pMethod.includes("upi") ||
          pMethod.includes("ऑनलाइन") ||
          pMethod.includes("online") ||
          pMethod.includes("phonepe") ||
          !pMethod.includes("रोख");
      }

      if (!matchesPayment) return false;

      if (!query) return true;

      if (
        reg.receiptNo.toLowerCase().includes(query) ||
        reg.address.toLowerCase().includes(query) ||
        reg.paymentMethod.toLowerCase().includes(query) ||
        reg.registrationFee.toString().includes(query)
      ) {
        return true;
      }

      const matchesMainMember = reg.mainMembers.some(
        (m) =>
          m.fullName.toLowerCase().includes(query) ||
          m.memberNo.toLowerCase().includes(query) ||
          m.mobileNo.toLowerCase().includes(query) ||
          m.prabhagNo.toLowerCase().includes(query)
      );
      if (matchesMainMember) return true;

      const matchesFamilyMember = reg.familyMembers.some(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.mobile.toLowerCase().includes(query) ||
          f.relation.toLowerCase().includes(query) ||
          f.occupation.toLowerCase().includes(query)
      );

      return matchesFamilyMember;
    });
  }, [registrations, searchQuery, paymentFilter]);

  // Statistics calculation for the 6 metric cards based on filtered data
  const stats = useMemo(() => {
    const totalRegs = filteredRegistrations.length;
    let totalFees = 0;
    let cashCount = 0;
    let onlineCount = 0;
    let cashFees = 0;
    let onlineFees = 0;

    filteredRegistrations.forEach((r) => {
      const fee = Number(r.registrationFee) || 0;
      totalFees += fee;

      const pMethod = (r.paymentMethod || "").toLowerCase();
      if (pMethod.includes("रोख") || pMethod.includes("cash")) {
        cashCount++;
        cashFees += fee;
      } else {
        onlineCount++;
        onlineFees += fee;
      }
    });

    return {
      totalRegs,
      totalFees,
      cashCount,
      onlineCount,
      cashFees,
      onlineFees,
    };
  }, [filteredRegistrations]);

  // Export to CSV with UTF-8 BOM
  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) return;

    const headers = [
      "पावती क्र (Receipt No)",
      "दिनांक (Date)",
      "मुख्य सदस्य नाव (Main Member Name)",
      "सदस्य क्र (Member No)",
      "प्रभाग क्र (Prabhag)",
      "मोबाइल क्र (Mobile)",
      "पत्ता (Address)",
      "नोंदणी शुल्क (Fee ₹)",
      "पेमेंट पद्धत (Payment Method)",
      "कुटुंब सदस्य संख्या (Family Count)",
      "कुटुंब सदस्यांची नावे (Family Names)",
    ];

    const rows = filteredRegistrations.map((r) => {
      const main = r.mainMembers[0] || { fullName: "-", memberNo: "-", prabhagNo: "-", mobileNo: "-" };
      const familyNames = r.familyMembers.map((f) => `${f.name} (${f.relation})`).join("; ");

      return [
        `"${r.receiptNo}"`,
        `"${r.date}"`,
        `"${main.fullName}"`,
        `"${main.memberNo}"`,
        `"${main.prabhagNo}"`,
        `"${main.mobileNo}"`,
        `"${r.address.replace(/"/g, '""')}"`,
        r.registrationFee,
        `"${r.paymentMethod}"`,
        r.familyMembers.length,
        `"${familyNames.replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `MPTM_Amravati_Registrations_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // While checking auth status, render a clean loading spinner
  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600">तपशीलांची तपासणी केली जात आहे...</p>
      </div>
    );
  }

  // IF LOGGED IN: RENDER MAIN ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* 1. TOP HEADER NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        <div className="px-4 sm:px-6 h-18 flex items-center justify-between py-2">
          {/* Left Header Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition"
              title="टॉग्ल सायडबार"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Brand Logo & 3-Line Title */}
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
              title="डेटा रिफ्रेश करा"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-red-600" : ""}`} />
            </button>

            {/* Notification Bell Icon */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition focus:outline-none relative"
                title="मुख्य वेबसाईट अर्ज सूचना"
              >
                <Bell className="w-5 h-5" />
                {/* Red Dot Badge - Visible ONLY when unread notifications exist */}
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
                        मुख्य वेबसाईट अर्ज सूचना
                      </h4>
                    </div>

                    {unreadCount > 0 ? (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 transition"
                      >
                        <CheckCheck className="w-3 h-3" />
                        सर्व वाचले ({unreadCount})
                      </button>
                    ) : (
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3" />
                        सर्व वाचलेले
                      </span>
                    )}
                  </div>

                  {/* List of UNREAD Form Submissions ONLY */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {unreadRegistrations.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <p className="font-semibold text-slate-700">कोणतीही प्रलंबित सूचना नाही</p>
                        <p className="text-[11px] text-slate-400">सर्व नवीन अर्ज वाचलेले आहेत.</p>
                      </div>
                    ) : (
                      unreadRegistrations.slice(0, 6).map((reg) => {
                        const main = reg.mainMembers[0] || { fullName: "नवीन सदस्य", memberNo: "" };

                        return (
                          <div
                            key={reg.id}
                            onClick={() => handleMarkAsRead(reg.id)}
                            className="p-3 bg-blue-50/40 hover:bg-blue-50/80 transition cursor-pointer flex items-start gap-3 group border-l-2 border-blue-500"
                            title="वाचलेले म्हणून चिन्हांकित करण्यासाठी क्लिक करा"
                          >
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                              🌐
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
                                मुख्य वेबसाईटवरून नवीन सदस्य नोंदणी अर्ज प्राप्त झाला.
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {reg.date}
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

                  {/* View All Registrations Button */}
                  <div className="p-2 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => {
                        setActiveTab("registrations");
                        setNotificationDropdownOpen(false);
                      }}
                      className="w-full text-center text-xs font-bold text-blue-700 hover:text-blue-900 py-1.5 rounded-lg hover:bg-blue-100/60 transition flex items-center justify-center gap-1"
                    >
                      <span>सर्व नोंदणी अर्ज पहा ({registrations.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Logo Avatar with Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 hover:ring-2 hover:ring-red-400 focus:outline-none transition shadow-2xs flex items-center justify-center bg-white"
                title="प्रोफाइल व सेटिंग्ज"
              >
                <Image
                  src="/bizonancelogo.png"
                  alt="Bizonance Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </button>

              {/* Profile Popup Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      प्रशासक (Admin)
                    </p>
                    <p className="text-[11px] text-slate-500">mptmamravati.org</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span>लॉगआउट (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Multi-color accent bar beneath header */}
        <div className="h-1 w-full flex">
          <div className="h-full bg-orange-500 flex-1" />
          <div className="h-full bg-blue-600 flex-1" />
          <div className="h-full bg-red-600 flex-1" />
        </div>
      </header>

      {/* 2. MAIN LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR NAVIGATION - EXPANDABLE (w-64) & COLLAPSIBLE (w-16 SLIM ICON MODE) */}
        <aside
          className={`bg-white border-r border-slate-200 shrink-0 transition-all duration-300 z-20 no-print ${
            sidebarOpen ? "w-64" : "w-16"
          }`}
        >
          <div className={`py-4 space-y-1.5 ${sidebarOpen ? "px-3" : "px-2 flex flex-col items-center"}`}>
            {/* Tab 1: Dashboard */}
            <button
              onClick={() => setActiveTab("dashboard")}
              title="Dashboard"
              className={`flex items-center transition ${
                sidebarOpen
                  ? `w-full gap-3 px-3.5 py-3 text-sm font-semibold rounded-r-xl ${
                      activeTab === "dashboard"
                        ? "text-blue-700 bg-blue-50 border-l-4 border-blue-600 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  : `w-12 h-12 justify-center rounded-2xl ${
                      activeTab === "dashboard"
                        ? "bg-blue-100 text-blue-700 shadow-2xs"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    }`
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${activeTab === "dashboard" ? "text-blue-600" : "text-slate-500"}`} />
              {sidebarOpen && <span>Dashboard</span>}
            </button>

            {/* Tab 2: सदस्य नोंदणी */}
            <button
              onClick={() => setActiveTab("registrations")}
              title="सदस्य नोंदणी"
              className={`flex items-center transition ${
                sidebarOpen
                  ? `w-full gap-3 px-3.5 py-3 text-sm font-semibold rounded-r-xl ${
                      activeTab === "registrations"
                        ? "text-blue-700 bg-blue-50 border-l-4 border-blue-600 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`
                  : `w-12 h-12 justify-center rounded-2xl ${
                      activeTab === "registrations"
                        ? "bg-blue-100 text-blue-700 shadow-2xs"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    }`
              }`}
            >
              <ClipboardList className={`w-5 h-5 ${activeTab === "registrations" ? "text-blue-600" : "text-slate-400"}`} />
              {sidebarOpen && <span>सदस्य नोंदणी</span>}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 no-print">
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <div>
              {/* Dashboard Title & Subtitle */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Overview of your platform activity
                </p>
              </div>

              {/* 6 METRIC CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {/* 1. एकूण नोंदणी अर्ज */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      एकूण नोंदणी अर्ज
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                      {stats.totalRegs}
                    </span>
                  </div>
                </div>

                {/* 2. ऑनलाइन/UPI देयक अर्ज (Upper Row) */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      ऑनलाइन/UPI देयक अर्ज
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                      {stats.onlineCount}
                    </span>
                  </div>
                </div>

                {/* 3. रोख (Cash) देयक अर्ज (Upper Row) */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      रोख (Cash) देयक अर्ज
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                      {stats.cashCount}
                    </span>
                  </div>
                </div>

                {/* 4. एकूण जमा शुल्क (Down Row) */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      एकूण जमा शुल्क
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                      ₹{stats.totalFees.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* 5. रोख जमा शुल्क (Down Row) */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      रोख (Cash) जमा शुल्क
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                      ₹{stats.cashFees.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* 6. ऑनलाइन/UPI जमा शुल्क (Down Row) */}
                <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      ऑनलाइन/UPI जमा शुल्क
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                      ₹{stats.onlineFees.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Card Callout */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    सदस्य नोंदणी फॉर्म डेटा पाहायचा आहे?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    सर्व नोंदणीकृत सदस्य, कुटुंब तपशील, शोध व फिल्टर करण्यासाठी खालील बटणावर किंवा सायडबार मधील &apos;सदस्य नोंदणी&apos; टॅबवर क्लिक करा.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("registrations")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs shadow-2xs transition shrink-0"
                >
                  <span>सदस्य नोंदणी पहा</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: सदस्य नोंदणी VIEW */}
          {activeTab === "registrations" && (
            <div>
              {/* Page Title & Subtitle */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  सदस्य नोंदणी डेटा
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  महाराष्ट्र प्रांतिक तैलिक महासभा - अमरावती विभाग (सर्व सदस्य नोंदणी फॉर्म डेटा)
                </p>
              </div>

              {/* EXACT SINGLE-LINE SEARCH & FILTER TOOLBAR MATCHING USER SCREENSHOT */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left Side: Search Bar Input */}
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="पावती क्र., नाव, फोन क्र., किंवा प्रभाग क्र. शोधा..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title="शोधा रिसेट करा"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Right Side: Payment Filter Dropdown & CSV Download Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-600 uppercase">पेमेंट:</span>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      <option value="ALL">सर्व (All)</option>
                      <option value="CASH">रोख (Cash)</option>
                      <option value="ONLINE">ऑनलाइन/UPI</option>
                    </select>
                  </div>

                  <button
                    onClick={exportToCSV}
                    disabled={filteredRegistrations.length === 0}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-2xs transition active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV एक्स्पोर्ट</span>
                  </button>
                </div>
              </div>

              {/* Connection Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-red-800">कनेक्शन त्रुटी (Connection Error)</h3>
                    <p className="text-xs text-red-700 mt-0.5">{error}</p>
                  </div>
                  <button
                    onClick={fetchRegistrations}
                    className="text-xs bg-red-600 text-white font-medium px-2.5 py-1 rounded hover:bg-red-700 transition"
                  >
                    पुन्हा प्रयत्न करा
                  </button>
                </div>
              )}

              {/* Data Table Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mb-3" />
                    <p className="text-xs font-medium text-slate-600">डेटा लोड होत आहे, कृपया वाट पहा...</p>
                  </div>
                ) : filteredRegistrations.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">कोणतीही नोंद सापडली नाही</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery || paymentFilter !== "ALL"
                        ? "निवडलेल्या शोधात/फिल्टरमध्ये एकही परिणाम आढळला नाही."
                        : "अद्याप एकही फॉर्म नोंदणी झालेली नाही."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                          <th className="py-3 px-4">पावती क्र. व दिनांक</th>
                          <th className="py-3 px-4">मुख्य सदस्य</th>
                          <th className="py-3 px-4">संपर्क व पत्ता</th>
                          <th className="py-3 px-4">प्रभाग क्र.</th>
                          <th className="py-3 px-4">शुल्क व देयक पद्धत</th>
                          <th className="py-3 px-4 text-center">कुटुंब सदस्य</th>
                          <th className="py-3 px-4 text-right">कृती (Action)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                        {filteredRegistrations.map((reg) => {
                          const main = reg.mainMembers[0] || {
                            fullName: "माहिती उपलब्ध नाही",
                            memberNo: "-",
                            mobileNo: "-",
                            prabhagNo: "-",
                          };

                          return (
                            <tr
                              key={reg.id}
                              className="hover:bg-blue-50/30 transition duration-150 group"
                            >
                              {/* Receipt & Date */}
                              <td className="py-3 px-4 align-top">
                                <div className="flex flex-col">
                                  <span className="font-bold text-blue-900 font-mono text-xs bg-blue-50 border border-blue-200 px-2 py-0.5 rounded w-max">
                                    {reg.receiptNo}
                                  </span>
                                  <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {reg.date}
                                  </span>
                                </div>
                              </td>

                              {/* Main Member Info */}
                              <td className="py-3 px-4 align-top">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                                    {main.fullName}
                                  </span>
                                  {main.memberNo && (
                                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 w-max mt-1">
                                      सदस्य क्र: {main.memberNo}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Mobile & Address */}
                              <td className="py-3 px-4 align-top max-w-xs">
                                <div className="flex flex-col gap-0.5">
                                  {main.mobileNo && (
                                    <a
                                      href={`tel:${main.mobileNo}`}
                                      className="text-xs font-semibold text-slate-800 hover:text-blue-600 flex items-center gap-1"
                                    >
                                      <Phone className="w-3 h-3 text-slate-400" />
                                      {main.mobileNo}
                                    </a>
                                  )}
                                  <span className="text-[11px] text-slate-600 line-clamp-2 flex items-start gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                                    {reg.address || "पत्ता दिलेला नाही"}
                                  </span>
                                </div>
                              </td>

                              {/* Prabhag */}
                              <td className="py-3 px-4 align-top">
                                <span className="inline-block text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                  प्रभाग {main.prabhagNo || "-"}
                                </span>
                              </td>

                              {/* Fee & Payment Method */}
                              <td className="py-3 px-4 align-top">
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-emerald-700 text-xs">
                                    ₹{reg.registrationFee}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                        reg.paymentMethod.toLowerCase().includes("रोख") ||
                                        reg.paymentMethod.toLowerCase().includes("cash")
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : "bg-purple-50 text-purple-700 border-purple-200"
                                      }`}
                                    >
                                      {reg.paymentMethod}
                                    </span>

                                    {reg.paymentScreenshot && (
                                      <button
                                        onClick={() => setScreenshotZoom(reg.paymentScreenshot || null)}
                                        className="text-[10px] text-blue-700 hover:text-blue-900 bg-blue-50 p-0.5 rounded border border-blue-200"
                                        title="स्क्रीनशॉट पहा"
                                      >
                                        <ImageIcon className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Family Members Count */}
                              <td className="py-3 px-4 align-top text-center">
                                <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                                  <UserPlus className="w-3 h-3" />
                                  {reg.familyMembers.length} सदस्य
                                </span>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3 px-4 align-top text-right">
                                <button
                                  onClick={() => setSelectedReg(reg)}
                                  className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-2xs"
                                >
                                  <Eye className="w-3.5 h-3.5 text-amber-700" />
                                  <span>सविस्तर</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* REGISTRATION DETAILS MODAL - STYLED EXACTLY LIKE THE FRONTEND FORM & RECEIPT */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
          <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border-2 border-amber-800/40 animate-in fade-in zoom-in-95 duration-200 my-auto font-sans">
            {/* Modal Header Banner with Form Maroon Gradient */}
            <div className="bg-gradient-to-r from-[#3A0202] via-[#7A0C0C] to-[#3A0202] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/40 text-amber-300 text-lg font-bold">
                  🚩
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-amber-200 tracking-wide drop-shadow-md">
                    सदस्य नोंदणी तपशील (Registration Details)
                  </h3>
                  <p className="text-xs text-amber-300 font-semibold mt-0.5">
                    पावती क्र: <span className="font-mono text-amber-100 font-bold">{selectedReg.receiptNo}</span> | नोंदणी दिनांक: <span className="text-amber-100">{selectedReg.date}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 flex items-center justify-center transition"
                title="बंद करा"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Form Styling */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-stone-900">
              {/* Payment & Receipt Info Header Box */}
              <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-300/80 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-2xs">
                <div>
                  <span className="text-xs font-bold text-stone-600 block uppercase">
                    नोंदणी शुल्क (FEE)
                  </span>
                  <span className="text-xl font-black text-[#7A0C0C]">
                    ₹{selectedReg.registrationFee}
                  </span>
                  <span className="text-xs text-stone-700 block mt-0.5 font-bold">
                    ({selectedReg.amountInWords || "अक्षरी नोंद नाही"})
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-stone-600 block uppercase">
                    देयक पद्धत (PAYMENT METHOD)
                  </span>
                  <span className="inline-block mt-1 font-bold text-xs bg-amber-100 text-amber-900 border border-amber-400 px-3 py-1 rounded-md shadow-2xs">
                    {selectedReg.paymentMethod}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-stone-600 block uppercase">
                    रहिवासी पत्ता (ADDRESS)
                  </span>
                  <span className="text-xs text-stone-900 font-bold block mt-1">
                    {selectedReg.address || "पत्ता भरलेला नाही"}
                  </span>
                </div>
              </div>

              {/* Main Members Section */}
              <div>
                <h4 className="text-sm font-extrabold text-amber-950 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-amber-800">👤</span>
                    <span>मुख्य सदस्य माहिती (MAIN MEMBERS)</span>
                  </span>
                  <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                    एकूण: {selectedReg.mainMembers.length}
                  </span>
                </h4>
                <div className="space-y-3">
                  {selectedReg.mainMembers.map((main) => (
                    <div
                      key={main.id}
                      className="bg-white border-2 border-amber-700/30 rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
                    >
                      <div>
                        <span className="text-stone-500 block font-semibold">पूर्ण नाव:</span>
                        <span className="font-bold text-stone-900 text-sm">{main.fullName}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block font-semibold">सदस्य क्र:</span>
                        <span className="font-extrabold text-stone-900 bg-amber-100/60 px-2 py-0.5 rounded border border-amber-300 inline-block mt-0.5">
                          {main.memberNo || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block font-semibold">मोबाइल क्र:</span>
                        <span className="font-bold text-stone-900">{main.mobileNo || "-"}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block font-semibold">प्रभाग क्र:</span>
                        <span className="font-bold text-red-700">प्रभाग {main.prabhagNo || "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Family Members Section */}
              <div>
                <div className="flex justify-center mb-3">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3A0202] via-[#7A0C0C] to-[#3A0202] text-amber-300 py-1.5 px-6 rounded-full border-2 border-amber-400/80 shadow-md">
                    <span className="text-amber-400 text-xs font-bold">❖</span>
                    <h4 className="text-xs sm:text-sm font-extrabold tracking-wide text-amber-200 whitespace-nowrap">
                      कौटुंबिक सदस्यांची माहिती (FAMILY MEMBERS)
                    </h4>
                    <span className="text-amber-400 text-xs font-bold">❖</span>
                    <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2 py-0.2 rounded-full ml-1">
                      {selectedReg.familyMembers.length}
                    </span>
                  </div>
                </div>

                {selectedReg.familyMembers.length === 0 ? (
                  <p className="text-xs text-stone-500 italic bg-amber-50/50 p-3 rounded-xl border border-amber-200 text-center">
                    कोणतेही कुटुंब सदस्य नोंदवलेले नाहीत.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border-2 border-amber-700/40 shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#6B0D0D] text-white text-xs font-bold text-center border-b border-amber-600">
                          <th className="p-2.5 border-r border-amber-700/60 w-10">अ.क्र</th>
                          <th className="p-2.5 border-r border-amber-700/60">सदस्याचे नाव</th>
                          <th className="p-2.5 border-r border-amber-700/60">नाते</th>
                          <th className="p-2.5 border-r border-amber-700/60">जन्मतारीख</th>
                          <th className="p-2.5 border-r border-amber-700/60">व्यवसाय</th>
                          <th className="p-2.5">मोबाइल</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-800/30 text-stone-900 bg-white">
                        {selectedReg.familyMembers.map((fam, idx) => (
                          <tr key={fam.id} className="hover:bg-amber-50/50 transition">
                            <td className="p-2.5 text-center font-bold text-stone-800 border-r border-amber-800/30">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-stone-900 border-r border-amber-800/30">{fam.name}</td>
                            <td className="p-2.5 font-medium text-stone-800 border-r border-amber-800/30">{fam.relation}</td>
                            <td className="p-2.5 text-stone-700 border-r border-amber-800/30">{fam.dob || "-"}</td>
                            <td className="p-2.5 text-stone-700 border-r border-amber-800/30">{fam.occupation || "-"}</td>
                            <td className="p-2.5 text-stone-900 font-medium">{fam.mobile || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payment Screenshot Section */}
              {selectedReg.paymentScreenshot && (
                <div>
                  <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-800" />
                    पेमेंट स्क्रीनशॉट (PAYMENT SCREENSHOT)
                  </h4>
                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-300/80 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-img-element */}
                      <img
                        src={selectedReg.paymentScreenshot}
                        alt="Payment Receipt"
                        className="w-14 h-14 object-cover rounded-lg border-2 border-amber-400 shadow-2xs"
                      />
                      <span className="text-xs font-bold text-stone-800">
                        ऑनलाइन पेमेंट पोच पावती स्क्रीनशॉट
                      </span>
                    </div>
                    <button
                      onClick={() => setScreenshotZoom(selectedReg.paymentScreenshot || null)}
                      className="bg-gradient-to-r from-[#4A0404] via-[#7A0C0C] to-[#4A0404] hover:brightness-110 text-amber-200 border border-amber-400 font-extrabold px-3.5 py-1.5 rounded-lg text-xs shadow-2xs transition"
                    >
                      झूम करा (Zoom)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Form Theme */}
            <div className="bg-amber-100/60 p-4 border-t border-amber-300/80 flex items-center justify-between">
              <button
                onClick={() => setSelectedReg(null)}
                className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                बंद करा
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gradient-to-r from-[#4A0404] via-[#7A0C0C] to-[#4A0404] hover:brightness-110 text-amber-200 border border-amber-500 font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition transform hover:scale-[1.02]"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                <span>पावती प्रिंट करा</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Zoom Modal */}
      {screenshotZoom && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 no-print">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl p-4 border border-slate-700 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setScreenshotZoom(null)}
              className="absolute top-4 right-4 text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-img-element */}
            <img
              src={screenshotZoom}
              alt="Payment Full View"
              className="max-h-[80vh] w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Printable Receipt Layout - Explicit Print Styles Matching Frontend Form.tsx */}
      {selectedReg && (
        <div className="hidden print-only font-sans">
          <div className="print-page-wrapper">
            <div
              className="rounded-2xl border-2 overflow-hidden"
              style={{
                backgroundColor: "#FFFDF9",
                borderColor: "rgba(146, 64, 14, 0.6)",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              }}
            >
              <table className="w-full border-collapse">
                <thead className="print-header-group">
                  <tr>
                    <th className="p-0 font-normal border-none text-left">
                      {/* Header Title Banner with explicit linear gradient & text colors */}
                      <div
                        className="py-3 px-6 relative flex items-center justify-between border-b-2"
                        style={{
                          background: "linear-gradient(to right, #3A0202, #7A0C0C, #3A0202)",
                          borderColor: "#FBBF24",
                          color: "#FFFFFF",
                          WebkitPrintColorAdjust: "exact",
                          printColorAdjust: "exact",
                        }}
                      >
                        <div className="hidden sm:flex items-center gap-1 text-amber-400 text-lg font-bold">
                          <span>❖</span>
                          <span className="w-6 h-[2px]" style={{ backgroundColor: "#FBBF24" }}></span>
                        </div>

                        <div className="text-center mx-auto space-y-0.5">
                          <p className="text-xs sm:text-sm font-bold" style={{ color: "#FBBF24" }}>
                            ❖ जय संताजी ❖
                          </p>
                          <h2 className="text-xl sm:text-2xl font-black drop-shadow-md" style={{ color: "#FDE68A" }}>
                            महाराष्ट्र प्रांतिक तैलिक महासभा
                          </h2>
                          <p className="text-xs sm:text-sm font-bold" style={{ color: "#BAE6FD" }}>
                            अमरावती विभाग, अमरावती
                          </p>
                          <div className="inline-block mt-1">
                            <span
                              className="font-extrabold text-xs sm:text-sm px-4 py-0.5 rounded-full border shadow-xs"
                              style={{
                                background: "linear-gradient(to right, #B45309, #D97706, #B45309)",
                                color: "#FEF3C7",
                                borderColor: "#FBBF24",
                                WebkitPrintColorAdjust: "exact",
                                printColorAdjust: "exact",
                              }}
                            >
                              प्राथमिक सदस्य नोंदणी पावती
                            </span>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-1 text-amber-400 text-lg font-bold">
                          <span className="w-6 h-[2px]" style={{ backgroundColor: "#FBBF24" }}></span>
                          <span>❖</span>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="p-0 border-none">
                      <div className="p-4 space-y-3 text-stone-900">
                        {/* Top Row: Receipt No, Date, & Registration Fee */}
                        <div
                          className="grid grid-cols-3 gap-3 p-2.5 rounded-xl border text-xs sm:text-sm"
                          style={{
                            backgroundColor: "rgba(254, 243, 199, 0.6)",
                            borderColor: "rgba(252, 211, 77, 0.6)",
                            WebkitPrintColorAdjust: "exact",
                            printColorAdjust: "exact",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-800">पावती क्र. :</span>
                            <span
                              className="font-extrabold border-b-2 px-2 py-0.5"
                              style={{
                                backgroundColor: "rgba(254, 243, 199, 0.8)",
                                borderColor: "#1C1917",
                                color: "#1C1917",
                                WebkitPrintColorAdjust: "exact",
                                printColorAdjust: "exact",
                              }}
                            >
                              {selectedReg.receiptNo}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-800">दिनांक :</span>
                            <span className="font-semibold text-stone-900 border-b-2 border-stone-800 px-2 py-0.5">{selectedReg.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-800">नोंदणी शुल्क: रु.</span>
                            <span className="font-extrabold border-b-2 border-stone-800 px-2 py-0.5" style={{ color: "#7A0C0C" }}>
                              {selectedReg.registrationFee}
                            </span>
                          </div>
                        </div>

                        {/* MAIN MEMBERS SECTION */}
                        <div className="space-y-2">
                          <div className="border-b pb-1 flex items-center justify-between" style={{ borderColor: "#FCD34D" }}>
                            <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2" style={{ color: "#451A03" }}>
                              <span>👤 मुख्य सदस्य माहिती</span>
                              <span
                                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: "#FDE68A",
                                  color: "#78350F",
                                  WebkitPrintColorAdjust: "exact",
                                  printColorAdjust: "exact",
                                }}
                              >
                                एकूण: {selectedReg.mainMembers.length}
                              </span>
                            </h3>
                          </div>

                          {selectedReg.mainMembers.map((member, index) => (
                            <div
                              key={member.id || index}
                              className="p-2.5 rounded-xl border-2 space-y-2 text-xs"
                              style={{
                                backgroundColor: "#FFFFFF",
                                borderColor: "rgba(180, 83, 9, 0.3)",
                                WebkitPrintColorAdjust: "exact",
                                printColorAdjust: "exact",
                              }}
                            >
                              <div className="flex items-center gap-2 border-b border-stone-200 pb-1">
                                <span
                                  className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                                  style={{
                                    backgroundColor: "#7A0C0C",
                                    color: "#FFFFFF",
                                    WebkitPrintColorAdjust: "exact",
                                    printColorAdjust: "exact",
                                  }}
                                >
                                  {member.srNo}
                                </span>
                                <h4 className="font-bold text-stone-900">
                                  {member.srNo === 1 ? "प्राथमिक सदस्य" : member.srNo === 2 ? "द्वितीय सदस्य" : member.srNo === 3 ? "तृतीय सदस्य" : `सदस्य ${member.srNo}`} माहिती
                                </h4>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="font-bold text-stone-800">सदस्य क्रमांक : </span>
                                  <span
                                    className="font-extrabold border-b px-1"
                                    style={{
                                      backgroundColor: "rgba(254, 243, 199, 0.4)",
                                      borderColor: "#1C1917",
                                      color: "#1C1917",
                                      WebkitPrintColorAdjust: "exact",
                                      printColorAdjust: "exact",
                                    }}
                                  >
                                    {member.memberNo || "-"}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-bold" style={{ color: "#B91C1C" }}>प्रभाग क्रमांक : </span>
                                  <span className="font-semibold text-stone-900 border-b border-stone-800 px-1">{member.prabhagNo || "-"}</span>
                                </div>
                                <div>
                                  <span className="font-bold text-stone-800">सदस्याचे पूर्णनाव : </span>
                                  <span className="font-semibold text-stone-900 border-b border-stone-800 px-1">{member.fullName}</span>
                                </div>
                                <div>
                                  <span className="font-bold text-stone-800">मोबाईल क्रमांक : </span>
                                  <span className="font-semibold text-stone-900 border-b border-stone-800 px-1">{member.mobileNo || "-"}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Common Address Field */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-stone-800 whitespace-nowrap">पत्ता :</span>
                          <span className="flex-1 border-b-2 border-stone-800 font-semibold text-stone-900 px-2 py-0.5">{selectedReg.address || "-"}</span>
                        </div>

                        {/* FAMILY MEMBERS TABLE SECTION */}
                        {selectedReg.familyMembers.length > 0 && (
                          <div className="my-2 space-y-2 family-table-section">
                            <div className="flex justify-center my-1">
                              <div
                                className="inline-flex items-center gap-2 py-1 px-5 rounded-full border-2 shadow-md"
                                style={{
                                  background: "linear-gradient(to right, #3A0202, #7A0C0C, #3A0202)",
                                  color: "#FDE68A",
                                  borderColor: "rgba(251, 191, 36, 0.8)",
                                  WebkitPrintColorAdjust: "exact",
                                  printColorAdjust: "exact",
                                }}
                              >
                                <span className="text-amber-400 text-xs font-bold">❖</span>
                                <h3 className="text-xs font-extrabold tracking-wide text-amber-200 whitespace-nowrap">
                                  कौटुंबिक सदस्यांची माहिती
                                </h3>
                                <span className="text-amber-400 text-xs font-bold">❖</span>
                              </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border-2" style={{ borderColor: "rgba(180, 83, 9, 0.4)" }}>
                              <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                  <tr
                                    className="text-white text-xs font-bold text-center border-b"
                                    style={{
                                      backgroundColor: "#6B0D0D",
                                      borderColor: "#D97706",
                                      color: "#FFFFFF",
                                      WebkitPrintColorAdjust: "exact",
                                      printColorAdjust: "exact",
                                    }}
                                  >
                                    <th className="py-1.5 px-2 border-r w-10" style={{ borderColor: "rgba(180, 83, 9, 0.6)" }}>अ. क्र.</th>
                                    <th className="py-1.5 px-3 border-r" style={{ borderColor: "rgba(180, 83, 9, 0.6)" }}>नाव</th>
                                    <th className="py-1.5 px-3 border-r" style={{ borderColor: "rgba(180, 83, 9, 0.6)" }}>नाते</th>
                                    <th className="py-1.5 px-3 border-r" style={{ borderColor: "rgba(180, 83, 9, 0.6)" }}>जन्म दिनांक</th>
                                    <th className="py-1.5 px-3 border-r" style={{ borderColor: "rgba(180, 83, 9, 0.6)" }}>व्यवसाय / शिक्षण</th>
                                    <th className="py-1.5 px-3">मोबाईल क्रमांक</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y text-stone-900 bg-white" style={{ borderColor: "rgba(146, 64, 14, 0.3)" }}>
                                  {selectedReg.familyMembers.map((fam, index) => (
                                    <tr key={fam.id || index}>
                                      <td className="py-1 px-2 text-center font-bold text-stone-800 border-r" style={{ borderColor: "rgba(146, 64, 14, 0.3)" }}>{fam.srNo || index + 1}.</td>
                                      <td className="py-1 px-2 border-r font-medium" style={{ borderColor: "rgba(146, 64, 14, 0.3)" }}>{fam.name}</td>
                                      <td className="py-1 px-2 border-r font-medium" style={{ borderColor: "rgba(146, 64, 14, 0.3)" }}>{fam.relation}</td>
                                      <td className="py-1 px-2 border-r font-medium" style={{ borderColor: "rgba(146, 64, 14, 0.3)" }}>{fam.dob || "-"}</td>
                                      <td className="py-1 px-2 border-r font-medium" style={{ borderColor: "rgba(146, 64, 14, 0.3)" }}>{fam.occupation || "-"}</td>
                                      <td className="py-1 px-2 font-medium">{fam.mobile || "-"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Amount in Words */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-stone-800 whitespace-nowrap">रक्कम अक्षरी :</span>
                          <span className="flex-1 border-b-2 border-stone-800 font-extrabold px-2 py-0.5" style={{ color: "#7A0C0C" }}>
                            {selectedReg.amountInWords || "अक्षरी नोंद नाही"}
                          </span>
                        </div>

                        {/* Payment Method */}
                        <div
                          className="p-2 rounded-xl border flex items-center justify-between text-xs font-bold text-stone-800"
                          style={{
                            backgroundColor: "rgba(254, 243, 199, 0.8)",
                            borderColor: "rgba(252, 211, 77, 0.8)",
                            WebkitPrintColorAdjust: "exact",
                            printColorAdjust: "exact",
                          }}
                        >
                          <div>
                            <span>देयक पद्धत : </span>
                            <span
                              className="px-2 py-0.5 rounded border font-bold"
                              style={{
                                backgroundColor: "rgba(253, 230, 138, 0.8)",
                                color: "#78350F",
                                borderColor: "#FBBF24",
                                WebkitPrintColorAdjust: "exact",
                                printColorAdjust: "exact",
                              }}
                            >
                              {selectedReg.paymentMethod}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 font-extrabold" style={{ color: "#065F46" }}>
                            <span>✓ रक्कम रु. {selectedReg.registrationFee} प्राप्त झाली (Payment Received)</span>
                          </div>
                        </div>

                        {/* Official Notice */}
                        <div className="text-center pt-2 border-t" style={{ borderColor: "#FDE68A" }}>
                          <p className="text-[11px] font-extrabold" style={{ color: "#7A0C0C" }}>
                            ही पावती सदस्य नोंदणीचा अधिकृत पुरावा म्हणून जतन करावी.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
