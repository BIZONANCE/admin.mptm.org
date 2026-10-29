"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  IndianRupee,
  RefreshCw,
  Phone,
  MapPin,
  ChevronRight,
  Clock,
  Banknote,
  QrCode,
  AlertTriangle,
  Zap,
  Users,
  Briefcase,
  Mail,
  UserCheck,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { MemberRegistration } from "../types";
import { getDatePart, getTimePart, formatPaymentMethod } from "../utils/formatters";
import { getApiUrl } from "../utils/config";

function isExecutiveRegistration(reg: MemberRegistration): boolean {
  const receipt = (reg.receiptNo || "").toUpperCase();
  if (receipt.startsWith("MPTM-EM-") || receipt.includes("EM-R")) return true;
  if (reg.mainMembers && Array.isArray(reg.mainMembers)) {
    if (reg.mainMembers.some((m) => (m.memberNo || "").toUpperCase().includes("EM-S"))) {
      return true;
    }
  }
  return false;
}

export default function DashboardHome() {
  const router = useRouter();

  const [registrations, setRegistrations] = useState<MemberRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(true);
  const [loggedUserEmail, setLoggedUserEmail] = useState<string>("");

  const API_URL = getApiUrl();

  const [managedUsersCount, setManagedUsersCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mptm_managed_users");
      if (saved) {
        try {
          return JSON.parse(saved).length;
        } catch (e) {}
      }
    }
    return 1;
  });

  const [careerAppsCount, setCareerAppsCount] = useState<number>(0);
  const [contactMsgsCount, setContactMsgsCount] = useState<number>(0);
  const [executiveMembersCount, setExecutiveMembersCount] = useState<number>(0);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const fetchCounts = async () => {
      try {
        const resUsers = await fetch(`${API_URL}/api/users`);
        if (resUsers.ok) {
          const dataUsers = await resUsers.json();
          if (dataUsers.success && Array.isArray(dataUsers.data)) {
            setManagedUsersCount(dataUsers.data.length);
          }
        }
      } catch (e) {
        console.error("Fetch users count error:", e);
      }

      try {
        const resCareer = await fetch(`${API_URL}/api/career/applications`);
        if (resCareer.ok) {
          const dataCareer = await resCareer.json();
          if (dataCareer.success && typeof dataCareer.count === "number") {
            setCareerAppsCount(dataCareer.count);
          }
        }
      } catch (e) {
        console.error("Fetch career apps count error:", e);
      }

      try {
        const resContact = await fetch(`${API_URL}/api/contact/messages`);
        if (resContact.ok) {
          const dataContact = await resContact.json();
          if (dataContact.success && typeof dataContact.count === "number") {
            setContactMsgsCount(dataContact.count);
          }
        }
      } catch (e) {
        console.error("Fetch contact msgs count error:", e);
      }

      try {
        const resExec = await fetch(`${API_URL}/api/executives`);
        if (resExec.ok) {
          const dataExec = await resExec.json();
          if (dataExec.success && Array.isArray(dataExec.data)) {
            setExecutiveMembersCount(dataExec.data.length);
          }
        }
      } catch (e) {
        console.error("Fetch executives count error:", e);
      }
    };
    fetchCounts();
  }, [API_URL, isSuperAdmin]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
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
      } else {
        setError(data.error || "Error loading dashboard data.");
      }
    } catch (err: any) {
      console.error("Fetch registrations error:", err);
      setError(err.message || "Error loading dashboard data. Please check backend server status.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("mptm_admin_logged_in");
      if (!loggedIn) {
        router.replace("/login");
        return;
      }

      const role = localStorage.getItem("mptm_admin_role");
      const username = localStorage.getItem("mptm_admin_username") || "";
      const superAdminStatus =
        role === "SUPER_ADMIN" ||
        username === "mptmamravati.org" ||
        username === "admin@mptmamravati.org" ||
        username === "mptmamravati@gmail.com";

      setIsSuperAdmin(superAdminStatus);
      setLoggedUserEmail(username);
    }
    fetchRegistrations();
  }, [router]);

  const primaryRegistrations = useMemo(() => {
    const userEmailClean = loggedUserEmail.trim().toLowerCase();
    return registrations.filter((r) => {
      if (isExecutiveRegistration(r)) return false;
      if (!isSuperAdmin) {
        const regRef = (r.referredBy || "").trim().toLowerCase();
        if (!userEmailClean || regRef !== userEmailClean) {
          return false;
        }
      }
      return true;
    });
  }, [registrations, isSuperAdmin, loggedUserEmail]);

  const stats = useMemo(() => {
    const totalRegs = primaryRegistrations.length;
    let totalFees = 0;
    let cashCount = 0;
    let onlineCount = 0;
    let cashFees = 0;
    let onlineFees = 0;

    primaryRegistrations.forEach((r) => {
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
  }, [primaryRegistrations]);

  const executiveRegistrations = useMemo(() => {
    return registrations.filter((r) => isExecutiveRegistration(r));
  }, [registrations]);

  const executiveStats = useMemo(() => {
    const totalRegs = Math.max(executiveRegistrations.length, executiveMembersCount);
    let totalFees = 0;
    executiveRegistrations.forEach((r) => {
      totalFees += Number(r.registrationFee) || 0;
    });
    return {
      totalRegs,
      totalFees,
    };
  }, [executiveRegistrations, executiveMembersCount]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                Dashboard
              </h1>
              {isSuperAdmin ? (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-blue-600 fill-blue-600" />
                  <span>Super Admin</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-600" />
                  <span>{loggedUserEmail || "Executive Dashboard"}</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isSuperAdmin
                ? "Overview of platform registrations and fee collections"
                : "Overview of your own member registrations and fee collections"}
            </p>
          </div>

          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchRegistrations();
            }}
            disabled={isRefreshing || loading}
            className="self-start sm:self-auto px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 bg-white border border-slate-200 rounded-lg transition shadow-2xs disabled:opacity-50 flex items-center gap-2 text-xs font-medium cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing ? "animate-spin text-blue-600" : "text-slate-500"
              }`}
            />
            <span>Refresh Data</span>
          </button>
        </div>

        {error ? (
          <div className="p-8 text-center text-slate-700 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-red-200">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="font-semibold text-sm text-slate-900 mt-1">{error}</p>
            <button
              onClick={fetchRegistrations}
              className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ROW 1: REGISTRATION & FINANCIAL METRICS */}
            <div
              className={`grid gap-4 ${
                isSuperAdmin
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-3"
              }`}
            >
              {/* Card 1: Overall Registrations & Fees */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">
                      Total Members Registration
                    </span>
                    {loading ? (
                      <div className="h-7 w-16 bg-slate-100 animate-pulse rounded mt-1.5" />
                    ) : (
                      <span className="text-2xl font-bold text-slate-900 tracking-tight mt-1 block">
                        {stats.totalRegs.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">
                      Total Registration Fees Collected
                    </span>
                    {loading ? (
                      <div className="h-6 w-24 bg-slate-100 animate-pulse rounded mt-1" />
                    ) : (
                      <span className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5 block">
                        ₹{stats.totalFees.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Card 2: UPI Registrations & UPI Payment Received */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">
                      Total UPI Registrations
                    </span>
                    {loading ? (
                      <div className="h-7 w-16 bg-slate-100 animate-pulse rounded mt-1.5" />
                    ) : (
                      <span className="text-2xl font-bold text-slate-900 tracking-tight mt-1 block">
                        {stats.onlineCount.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">
                      Total UPI Payment Received
                    </span>
                    {loading ? (
                      <div className="h-6 w-24 bg-slate-100 animate-pulse rounded mt-1" />
                    ) : (
                      <span className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5 block">
                        ₹{stats.onlineFees.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Card 3: Cash Registrations & Cash Payment Received */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">
                      Total Cash Registrations
                    </span>
                    {loading ? (
                      <div className="h-7 w-16 bg-slate-100 animate-pulse rounded mt-1.5" />
                    ) : (
                      <span className="text-2xl font-bold text-slate-900 tracking-tight mt-1 block">
                        {stats.cashCount.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                    <Banknote className="w-4 h-4" />
                  </div>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block">
                      Total Cash Payment Received
                    </span>
                    {loading ? (
                      <div className="h-6 w-24 bg-slate-100 animate-pulse rounded mt-1" />
                    ) : (
                      <span className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5 block">
                        ₹{stats.cashFees.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Card 4 (Super Admin Only): Executive Member Registration & Fees */}
              {isSuperAdmin && (
                <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between gap-4">
                  <div
                    onClick={() => router.push("/manage-executives")}
                    className="flex items-start justify-between gap-3 cursor-pointer group"
                    title="Manage Executive Members"
                  >
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-slate-500 group-hover:text-slate-900 transition">
                          Executive Registrations
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      {loading ? (
                        <div className="h-7 w-16 bg-slate-100 animate-pulse rounded mt-1.5" />
                      ) : (
                        <span className="text-2xl font-bold text-slate-900 tracking-tight mt-1 block">
                          {executiveStats.totalRegs.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-slate-100" />

                  <div
                    onClick={() => router.push("/payments")}
                    className="flex items-center justify-between gap-3 cursor-pointer group"
                    title="View Executive Payments"
                  >
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-slate-500 group-hover:text-slate-900 transition">
                          Executive Fees Collected
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      {loading ? (
                        <div className="h-6 w-24 bg-slate-100 animate-pulse rounded mt-1" />
                      ) : (
                        <span className="text-lg font-semibold text-slate-900 tracking-tight mt-0.5 block">
                          ₹{executiveStats.totalFees.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ROW 2: MANAGEMENT SHORTCUTS (3 balanced columns for Super Admin) */}
            {isSuperAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Managed Users */}
                <div
                  onClick={() => router.push("/manage-users")}
                  className="bg-white rounded-xl p-5 border border-slate-200/90 hover:border-slate-300 shadow-2xs flex items-center justify-between gap-4 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">
                        Total Managed Users
                      </span>
                      {loading ? (
                        <div className="h-6 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                      ) : (
                        <span className="text-xl font-bold text-slate-900 tracking-tight block mt-0.5">
                          {managedUsersCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-slate-900 transition">
                    <span className="hidden md:inline">Manage</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Total Career Applications */}
                <div
                  onClick={() => router.push("/manage-career")}
                  className="bg-white rounded-xl p-5 border border-slate-200/90 hover:border-slate-300 shadow-2xs flex items-center justify-between gap-4 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">
                        Career Applications
                      </span>
                      {loading ? (
                        <div className="h-6 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                      ) : (
                        <span className="text-xl font-bold text-slate-900 tracking-tight block mt-0.5">
                          {careerAppsCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-slate-900 transition">
                    <span className="hidden md:inline">View</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Total Contact Messages */}
                <div
                  onClick={() => router.push("/manage-contact")}
                  className="bg-white rounded-xl p-5 border border-slate-200/90 hover:border-slate-300 shadow-2xs flex items-center justify-between gap-4 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">
                        Contact Messages
                      </span>
                      {loading ? (
                        <div className="h-6 w-12 bg-slate-100 animate-pulse rounded mt-1" />
                      ) : (
                        <span className="text-xl font-bold text-slate-900 tracking-tight block mt-0.5">
                          {contactMsgsCount}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-slate-900 transition">
                    <span className="hidden md:inline">View</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            )}

            {/* RECENT REGISTRATIONS QUICK VIEW */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Recent Member Registrations
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isSuperAdmin
                      ? "Latest member registration applications received"
                      : "Latest member registration applications referred by you"}
                  </p>
                </div>

                <button
                  onClick={() => router.push("/memberregistration")}
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs border border-slate-200 transition cursor-pointer"
                >
                  <span>
                    View All{" "}
                    {loading ? (
                      <span className="inline-block h-3 w-5 bg-slate-100 animate-pulse rounded align-middle ml-1" />
                    ) : (
                      `(${primaryRegistrations.length})`
                    )}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="p-4 bg-slate-50/60 border border-slate-200/70 rounded-lg space-y-3 animate-pulse"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-28 bg-slate-200 rounded" />
                          <div className="h-4 w-20 bg-slate-200 rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 w-24 bg-slate-200 rounded" />
                          <div className="h-3 w-16 bg-slate-200 rounded" />
                        </div>
                        <div className="pt-2 border-t border-slate-200/50">
                          <div className="h-3 w-20 bg-slate-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : primaryRegistrations.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-8">
                    No registrations received yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {primaryRegistrations.slice(0, 3).map((reg) => {
                      const main = reg.mainMembers[0] || {
                        fullName: "New Member",
                        memberNo: "",
                      };
                      return (
                        <div
                          key={reg.id}
                          onClick={() => router.push("/memberregistration")}
                          className="p-4 bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 rounded-lg transition cursor-pointer flex flex-col justify-between gap-3 group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-slate-900 text-sm truncate">
                                {main.fullName}
                              </span>
                              <span className="font-mono text-[11px] text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded font-medium shrink-0">
                                {reg.receiptNo}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                {getDatePart(reg)} {getTimePart(reg)}
                              </span>
                              <span className="font-semibold text-slate-900">
                                ₹{reg.registrationFee}{" "}
                                <span className="font-normal text-slate-500">
                                  ({formatPaymentMethod(reg.paymentMethod)})
                                </span>
                              </span>
                            </div>
                          </div>

                          {main.mobileNo && (
                            <div className="flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
                              <span className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                <span>{main.mobileNo}</span>
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}