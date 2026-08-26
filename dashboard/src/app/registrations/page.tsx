"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  RefreshCw,
  Download,
  Eye,
  Printer,
  X,
  Phone,
  MapPin,
  ImageIcon,
  UserPlus,
  ChevronRight,
  Trash2,
  AlertTriangle,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Banknote,
  QrCode,
  User,
  Globe,
  Users,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { MemberRegistration } from "../../types";
import { formatDateToDDMMYYYY, getDatePart, getTimePart, formatPaymentMethod } from "../../utils/formatters";
import { getApiUrl, getMainSiteUrl } from "../../utils/config";

export default function RegistrationsPage() {
  const router = useRouter();

  const [registrations, setRegistrations] = useState<MemberRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [referrerFilter, setReferrerFilter] = useState<string>("ALL");

  const [selectedReg, setSelectedReg] = useState<MemberRegistration | null>(null);
  const [deleteConfirmReg, setDeleteConfirmReg] = useState<MemberRegistration | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [screenshotZoom, setScreenshotZoom] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // User & Super Admin session state
  const [loggedUserEmail, setLoggedUserEmail] = useState<string>("");
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [managedUsers, setManagedUsers] = useState<any[]>([]);

  // Modal for Link Generation
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [selectedUserForLink, setSelectedUserForLink] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const API_URL = getApiUrl();
  const MAIN_SITE_URL = getMainSiteUrl();

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/register`);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.data)) {
        setRegistrations(data.data);
      } else {
        setError(data.error || "Failed to load registrations.");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load registrations. Ensure backend server is running.");
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

      const superAdminStatus = role === "SUPER_ADMIN" || username === "mptmamravati.org" || username === "admin@mptmamravati.org";
      setIsSuperAdmin(superAdminStatus);
      setLoggedUserEmail(username);

      const savedUsers = localStorage.getItem("mptm_managed_users");
      if (savedUsers) {
        try {
          setManagedUsers(JSON.parse(savedUsers));
        } catch (e) {}
      }
    }

    fetchRegistrations();
  }, [router]);

  const uniqueReferrersList = useMemo(() => {
    const refsSet = new Set<string>();
    registrations.forEach((r) => {
      const ref = (r.referredBy || "").trim();
      if (ref && ref !== "Direct Website" && ref !== "Direct") {
        refsSet.add(ref);
      }
    });
    managedUsers.forEach((u) => {
      if (u.email) refsSet.add(u.email);
    });
    return Array.from(refsSet);
  }, [registrations, managedUsers]);

  const handleDeleteRegistration = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/register/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
        setToastMessage("✅ Registration record deleted successfully.");
        setDeleteConfirmReg(null);
      } else {
        alert(data.error || "Failed to delete record.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not connect to server. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Payment Filter Counts computation
  const paymentCounts = useMemo(() => {
    const userEmailClean = loggedUserEmail.trim().toLowerCase();
    let all = 0;
    let cash = 0;
    let online = 0;

    registrations.forEach((reg) => {
      // 1. Role Scoping
      if (!isSuperAdmin) {
        const regRef = (reg.referredBy || "").trim().toLowerCase();
        if (!userEmailClean || regRef !== userEmailClean) return;
      }

      // 2. Referrer Filter
      if (isSuperAdmin && referrerFilter !== "ALL") {
        const regRef = (reg.referredBy || "").trim().toLowerCase();
        const targetRef = referrerFilter.trim().toLowerCase();
        if (targetRef === "direct") {
          if (regRef && regRef !== "direct website" && regRef !== "direct" && regRef !== "") return;
        } else {
          if (regRef !== targetRef) return;
        }
      }

      // 3. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const matchesGeneral =
          reg.receiptNo.toLowerCase().includes(query) ||
          reg.address.toLowerCase().includes(query) ||
          reg.paymentMethod.toLowerCase().includes(query) ||
          reg.registrationFee.toString().includes(query) ||
          (reg.referredBy || "").toLowerCase().includes(query) ||
          getDatePart(reg).toLowerCase().includes(query);

        const matchesMainMember = reg.mainMembers.some(
          (m) =>
            m.fullName.toLowerCase().includes(query) ||
            m.memberNo.toLowerCase().includes(query) ||
            m.mobileNo.toLowerCase().includes(query) ||
            m.prabhagNo.toLowerCase().includes(query)
        );

        const matchesFamilyMember = reg.familyMembers.some(
          (f) =>
            f.name.toLowerCase().includes(query) ||
            f.mobile.toLowerCase().includes(query) ||
            f.relation.toLowerCase().includes(query) ||
            f.occupation.toLowerCase().includes(query)
        );

        if (!matchesGeneral && !matchesMainMember && !matchesFamilyMember) return;
      }

      all++;
      const pMethod = (reg.paymentMethod || "").toLowerCase();
      if (pMethod.includes("रोख") || pMethod.includes("cash")) {
        cash++;
      } else {
        online++;
      }
    });

    return { all, cash, online };
  }, [registrations, isSuperAdmin, loggedUserEmail, referrerFilter, searchQuery]);

  // Referrer Name & Email resolver
  const getReferrerDetails = (ref: string | null | undefined) => {
    if (!ref || ref === "Direct Website" || ref === "Direct") {
      return { isDirect: true, name: "Direct Website", email: "" };
    }
    const cleanRef = ref.trim().toLowerCase();
    const matched = managedUsers.find((u) => (u.email || "").trim().toLowerCase() === cleanRef);
    if (matched && matched.name && matched.name.trim()) {
      return { isDirect: false, name: matched.name.trim(), email: matched.email.trim() };
    }
    return { isDirect: false, name: "", email: ref.trim() };
  };

  const filteredRegistrations = useMemo(() => {
    const userEmailClean = loggedUserEmail.trim().toLowerCase();

    return registrations.filter((reg) => {
      // 1. Role Scoping: Regular users ONLY see registrations referred by them
      if (!isSuperAdmin) {
        const regRef = (reg.referredBy || "").trim().toLowerCase();
        if (!userEmailClean || regRef !== userEmailClean) {
          return false;
        }
      }

      // 2. Payment Method Filter
      const pMethod = (reg.paymentMethod || "").toLowerCase();
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

      // 3. Referrer User Filter (for Super Admin dropdown selection)
      if (isSuperAdmin && referrerFilter !== "ALL") {
        const regRef = (reg.referredBy || "").trim().toLowerCase();
        const targetRef = referrerFilter.trim().toLowerCase();

        if (targetRef === "direct") {
          if (regRef && regRef !== "direct website" && regRef !== "direct" && regRef !== "") return false;
        } else {
          if (regRef !== targetRef) return false;
        }
      }

      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase().trim();

      if (
        reg.receiptNo.toLowerCase().includes(query) ||
        reg.address.toLowerCase().includes(query) ||
        reg.paymentMethod.toLowerCase().includes(query) ||
        reg.registrationFee.toString().includes(query) ||
        (reg.referredBy || "").toLowerCase().includes(query) ||
        getDatePart(reg).toLowerCase().includes(query)
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
  }, [registrations, searchQuery, paymentFilter, referrerFilter, isSuperAdmin, loggedUserEmail]);

  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) return;

    const headers = [
      "Receipt No",
      "Date",
      "Main Member Name",
      "Member No",
      "Prabhag No",
      "Mobile No",
      "Address",
      "Referrer",
      "Payment Method",
      "Registration Fee",
      "Family Members Count",
      "Family Members List",
    ];

    const rows = filteredRegistrations.map((reg) => {
      const main = reg.mainMembers[0] || {};
      const familyListStr = reg.familyMembers
        .map((f) => `${f.name} (${f.relation})`)
        .join(" | ");

      return [
        `"${reg.receiptNo}"`,
        `"${getDatePart(reg)} ${getTimePart(reg)}"`,
        `"${main.fullName || ""}"`,
        `"${main.memberNo || ""}"`,
        `"${main.prabhagNo || ""}"`,
        `"${main.mobileNo || ""}"`,
        `"${reg.address.replace(/"/g, '""')}"`,
        `"${reg.referredBy || "Direct Website"}"`,
        `"${formatPaymentMethod(reg.paymentMethod)}"`,
        `"${reg.registrationFee}"`,
        `"${reg.familyMembers.length}"`,
        `"${familyListStr.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MPTM_Registrations_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActiveFormLink = () => {
    const baseUrl = `${MAIN_SITE_URL}/register`;
    const targetRef = isSuperAdmin ? selectedUserForLink : loggedUserEmail;
    if (targetRef && targetRef.trim()) {
      return `${baseUrl}?ref=${encodeURIComponent(targetRef.trim())}`;
    }
    return baseUrl;
  };

  const handleCopyFormLink = () => {
    const link = getActiveFormLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const link = getActiveFormLink();
    const message = `जय संताजी! महाराष्ट्र प्रांतिक तैलिक महासभा (अमरावती विभाग) ऑनलाईन सदस्य नोंदणी फॉर्म भरण्यासाठी खालील लिंकवर क्लिक करा:\n\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div>
        {/* Page Title & Subtitle Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-slate-800" />
              <span>Member Registrations</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isSuperAdmin
                ? "Maharashtra Prantik Tailik Mahasabha - Amravati Division (All Member Registrations)"
                : `Maharashtra Prantik Tailik Mahasabha (Registrations Referred by ${loggedUserEmail})`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
            {!isSuperAdmin && (
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-2 shrink-0"
                title="Generate & Share Registration Form Link"
              >
                <LinkIcon className="w-4 h-4" />
                <span>Generate Link</span>
              </button>
            )}

            <button
              onClick={exportToCSV}
              disabled={filteredRegistrations.length === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-4 p-3 bg-slate-100 border border-slate-300 text-slate-900 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-2xs">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-600 hover:text-slate-900 font-bold text-base">×</button>
          </div>
        )}

        {/* SEARCH & FILTER TOOLBAR */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Bar Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search receipt no, name, mobile, or prabhag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills & Referrer Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Referrer Filter Dropdown */}
            {isSuperAdmin && (
              <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                <span className="text-xs font-bold text-slate-700 shrink-0">Referrer:</span>
                <select
                  value={referrerFilter}
                  onChange={(e) => setReferrerFilter(e.target.value)}
                  className="bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                >
                  <option value="ALL">All Referrers</option>
                  <option value="DIRECT">Direct Website</option>
                  {uniqueReferrersList.map((refEmail) => {
                    const matchedUser = managedUsers.find((u) => u.email.toLowerCase() === refEmail.toLowerCase());
                    const labelName = matchedUser && matchedUser.name && matchedUser.name.trim() 
                      ? `${matchedUser.name.trim()} (${refEmail})` 
                      : refEmail;
                    return (
                      <option key={refEmail} value={refEmail}>
                        {labelName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Payment Method Filter Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setPaymentFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial text-center flex items-center justify-center gap-1.5 ${
                  paymentFilter === "ALL"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>All</span>
                <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full text-[11px] font-mono">
                  {paymentCounts.all}
                </span>
              </button>

              <button
                onClick={() => setPaymentFilter("CASH")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial text-center flex items-center justify-center gap-1.5 ${
                  paymentFilter === "CASH"
                    ? "bg-white text-emerald-800 shadow-2xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                <span>Cash</span>
                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[11px] font-mono">
                  {paymentCounts.cash}
                </span>
              </button>

              <button
                onClick={() => setPaymentFilter("ONLINE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial text-center flex items-center justify-center gap-1.5 ${
                  paymentFilter === "ONLINE"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-slate-700" />
                <span>Online UPI</span>
                <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full text-[11px] font-mono">
                  {paymentCounts.online}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* REGISTRATION DATA TABLE CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-slate-600 animate-spin" />
              <p className="font-semibold text-sm">Loading registration data...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="font-bold">{error}</p>
              <button
                onClick={fetchRegistrations}
                className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition"
              >
                Try Again
              </button>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-slate-500 italic">
              No matching registrations found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1050px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4 w-12 text-center">Sr. No.</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Receipt No.</th>
                    <th className="py-3.5 px-4">Main Member & Member No.</th>
                    <th className="py-3.5 px-4">Mobile & Address</th>
                    <th className="py-3.5 px-4">Prabhag</th>
                    <th className="py-3.5 px-4">Referrer</th>
                    <th className="py-3.5 px-4">Fee & Payment</th>
                    <th className="py-3.5 px-4 text-center">Family</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-900">
                  {filteredRegistrations.map((reg, index) => {
                    const main = reg.mainMembers[0] || {
                      fullName: "No Details Available",
                      memberNo: "-",
                      mobileNo: "",
                      prabhagNo: "-",
                    };
                    const timeString = getTimePart(reg);

                    return (
                      <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-500 align-top">
                          {index + 1}
                        </td>

                        {/* 1. DATE & TIME COLUMN */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {getDatePart(reg)}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              {timeString || "-"}
                            </span>
                          </div>
                        </td>

                        {/* 2. RECEIPT NO COLUMN (BESIDE DATE) */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs inline-block">
                            {reg.receiptNo}
                          </span>
                        </td>

                        {/* 3. MAIN MEMBER & MEMBER NO COLUMN (BESIDE RECEIPT NO) */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                              {main.fullName}
                            </span>
                            {main.memberNo && main.memberNo !== "-" && (
                              <span className="font-mono text-[11px] text-slate-600 font-semibold bg-slate-50 border border-slate-200 px-1.5 py-0.2 rounded w-max">
                                {main.memberNo}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top max-w-xs">
                          <div className="flex flex-col gap-0.5">
                            {main.mobileNo && (
                              <a
                                href={`tel:${main.mobileNo}`}
                                className="text-xs font-semibold text-slate-800 hover:text-slate-900 flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3 text-slate-400" />
                                {main.mobileNo}
                              </a>
                            )}
                            <span className="text-[11px] text-slate-600 line-clamp-2 flex items-start gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                              {reg.address || "Address not provided"}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <span className="inline-block text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                            {main.prabhagNo || "-"}
                          </span>
                        </td>

                        {/* REFERRER COLUMN (SHOWING NAME + EMAIL) */}
                        <td className="py-3.5 px-4 align-top min-w-[170px]">
                          {(() => {
                            const refInfo = getReferrerDetails(reg.referredBy);
                            if (refInfo.isDirect) {
                              return (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Direct Website</span>
                                </span>
                              );
                            }
                            return (
                              <div className="flex flex-col gap-0.5">
                                {refInfo.name ? (
                                  <>
                                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      {refInfo.name}
                                    </span>
                                    <span className="font-mono text-[11px] text-slate-500 pl-4">
                                      {refInfo.email}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-mono font-bold text-slate-800 text-xs flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    {refInfo.email}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-slate-900 text-xs">
                              ₹{reg.registrationFee}
                            </span>
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                                  reg.paymentMethod.toLowerCase().includes("रोख") ||
                                  reg.paymentMethod.toLowerCase().includes("cash")
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-slate-100 text-slate-800 border-slate-200"
                                }`}
                              >
                                {formatPaymentMethod(reg.paymentMethod)}
                              </span>

                              {reg.paymentScreenshot && (
                                <button
                                  onClick={() => setScreenshotZoom(reg.paymentScreenshot || null)}
                                  className="text-slate-600 hover:text-slate-900 bg-slate-100 p-1 rounded-md border border-slate-200 transition"
                                  title="View Screenshot"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                            {reg.familyMembers.length} {reg.familyMembers.length === 1 ? "Member" : "Members"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedReg(reg)}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition shadow-2xs active:scale-95"
                              title="View Detailed Receipt"
                            >
                              <Eye className="w-4 h-4 text-slate-600" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirmReg(reg)}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 transition flex items-center justify-center"
                              title="Delete Application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* REGISTRATION DETAILS RECEIPT MODAL */}
        {selectedReg && (
          <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
            <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border-2 border-amber-800/40 animate-in fade-in zoom-in-95 duration-200 my-auto font-sans">
              <div className="bg-gradient-to-r from-[#3A0202] via-[#7A0C0C] to-[#3A0202] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/40 text-amber-300 text-lg font-bold">
                    🚩
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-amber-200 tracking-wide drop-shadow-md">
                      Maharashtra Prantik Tailik Mahasabha (Amravati)
                    </h3>
                    <p className="text-xs text-amber-300 font-bold">
                      Receipt No: <span className="font-mono text-amber-100 font-bold">{selectedReg.receiptNo}</span> | Date: <span className="text-amber-100">{getDatePart(selectedReg)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    onClick={() => setSelectedReg(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body Receipt */}
              <div className="p-4 sm:p-6 space-y-4 text-stone-900 text-xs sm:text-sm">
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-300/60">
                  <div>
                    <span className="font-bold text-stone-700">Receipt No: </span>
                    <span className="font-mono font-extrabold text-stone-900 text-sm">{selectedReg.receiptNo}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-700">Registration Date: </span>
                    <span className="font-bold text-stone-900">{getDatePart(selectedReg)}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-700">Total Fee: </span>
                    <span className="font-extrabold text-[#7A0C0C] text-sm">₹{selectedReg.registrationFee}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider border-b border-amber-300 pb-1 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-800" />
                    <span>Main Member Details ({selectedReg.mainMembers.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedReg.mainMembers.map((m) => (
                      <div key={m.id} className="p-3 rounded-xl bg-white border border-amber-700/30 space-y-1.5">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-1 font-bold text-stone-900 text-xs">
                          <span>{m.memberNo}</span>
                          <span className="text-amber-800">Prabhag No: {m.prabhagNo}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-semibold text-stone-600">Member Name: </span>
                            <span className="font-bold text-stone-900">{m.fullName}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-stone-600">Mobile: </span>
                            <span className="font-bold text-stone-900">{m.mobileNo}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-stone-800">Address: </span>
                  <span className="font-semibold text-stone-900 border-b border-stone-800 pb-0.5">{selectedReg.address}</span>
                </div>

                {selectedReg.familyMembers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider border-b border-amber-300 pb-1 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-800" />
                      <span>Family Member Details ({selectedReg.familyMembers.length})</span>
                    </h4>
                    <div className="overflow-x-auto rounded-lg border border-amber-800/30">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#7A0C0C] text-white font-bold text-center">
                            <th className="p-2 border-r border-amber-700/60">Sr. No.</th>
                            <th className="p-2 border-r border-amber-700/60">Name</th>
                            <th className="p-2 border-r border-amber-700/60">Relation</th>
                            <th className="p-2 border-r border-amber-700/60">Date of Birth</th>
                            <th className="p-2 border-r border-amber-700/60">Occupation</th>
                            <th className="p-2">Mobile</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-800/30 text-stone-900 bg-white">
                          {selectedReg.familyMembers.map((fam, idx) => (
                            <tr key={fam.id}>
                              <td className="p-2.5 text-center font-bold border-r border-amber-800/30">{idx + 1}</td>
                              <td className="p-2.5 font-bold border-r border-amber-800/30">{fam.name}</td>
                              <td className="p-2.5 font-medium border-r border-amber-800/30">{fam.relation}</td>
                              <td className="p-2.5 border-r border-amber-800/30">{formatDateToDDMMYYYY(fam.dob)}</td>
                              <td className="p-2.5 border-r border-amber-800/30">{fam.occupation || "-"}</td>
                              <td className="p-2.5 font-medium">{fam.mobile || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmReg && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-200 text-center space-y-4 font-sans">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Delete Registration Application?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Receipt No. <strong className="text-slate-900">{deleteConfirmReg.receiptNo}</strong> will be permanently removed from database. This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmReg(null)}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRegistration(deleteConfirmReg.id)}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GENERATE FORM LINK MODAL */}
        {isLinkModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Member Registration Form Link
                    </h3>
                    <p className="text-xs text-slate-500">
                      Copy this form link or share directly with members on WhatsApp. (User links enable Cash payment option).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Super Admin User Selector for Referral Link */}
              {isSuperAdmin && (
                <div className="space-y-1 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <label className="block text-xs font-bold text-amber-900">
                    Select User to generate unique link:
                  </label>
                  <select
                    value={selectedUserForLink}
                    onChange={(e) => setSelectedUserForLink(e.target.value)}
                    className="w-full bg-white text-xs font-bold text-slate-800 py-2 px-3 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="">Default Direct Link</option>
                    {managedUsers.map((u) => (
                      <option key={u.id} value={u.email}>
                        {u.name || u.email} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Unique Referral Form URL
                  </label>
                  {(isSuperAdmin ? selectedUserForLink || loggedUserEmail : loggedUserEmail) && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                      User: {isSuperAdmin ? selectedUserForLink || loggedUserEmail : loggedUserEmail}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getActiveFormLink()}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyFormLink}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0 ${
                      copiedLink
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    }`}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
                {copiedLink && (
                  <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Unique link successfully copied to clipboard!</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>

                <a
                  href={getActiveFormLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Form</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ZOOMED PAYMENT SCREENSHOT MODAL */}
        {screenshotZoom && (
          <div
            onClick={() => setScreenshotZoom(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          >
            <div className="relative max-w-2xl max-h-[90vh] bg-white p-2 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={screenshotZoom}
                alt="Payment Screenshot Zoom"
                width={800}
                height={1000}
                className="w-full h-full object-contain max-h-[85vh] rounded-xl"
              />
              <button
                onClick={() => setScreenshotZoom(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center font-bold hover:bg-black transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
