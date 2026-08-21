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
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { MemberRegistration } from "../../types";
import { formatDateToDDMMYYYY, getDatePart } from "../../utils/formatters";

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
  const [loggedUserRole, setLoggedUserRole] = useState<string>("USER");
  const [managedUsers, setManagedUsers] = useState<any[]>([]);
  const [selectedUserForLink, setSelectedUserForLink] = useState<string>("");

  // Generate Link Modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "http://localhost:3001";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("mptm_admin_username") || "";
      const role = localStorage.getItem("mptm_admin_role") || "USER";
      setLoggedUserEmail(email);
      setLoggedUserRole(role);
      setSelectedUserForLink(email);
    }

    const fetchManagedUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setManagedUsers(data.data);
        }
      } catch (err) {}
    };
    fetchManagedUsers();
  }, [API_URL]);

  const isSuperAdmin = useMemo(() => {
    const cleanEmail = loggedUserEmail.toLowerCase();
    return cleanEmail === "mptmamravati.org" || cleanEmail === "admin@mptmamravati.org" || loggedUserRole === "SUPER_ADMIN";
  }, [loggedUserEmail, loggedUserRole]);

  // Compute active unique referral link for logged in user or Super Admin selection
  const activeReferralUser = isSuperAdmin ? (selectedUserForLink || loggedUserEmail) : loggedUserEmail;
  const REGISTRATION_FORM_LINK = activeReferralUser
    ? `${MAIN_SITE_URL}/registration?ref=${encodeURIComponent(activeReferralUser)}`
    : `${MAIN_SITE_URL}/registration`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(REGISTRATION_FORM_LINK);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/register`);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.data)) {
        setRegistrations(data.data);
      } else {
        setError(data.error || "डेटा लोड करताना त्रुटी आली.");
      }
    } catch (err: any) {
      console.error("Fetch registrations error:", err);
      setError(err.message || "डेटा लोड करताना त्रुटी आली. बॅकएंड सर्व्हर चालू असल्याची खात्री करा.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Compute unique referrers list for filter dropdown
  const uniqueReferrersList = useMemo(() => {
    const refsSet = new Set<string>();
    registrations.forEach((r) => {
      if (r.referredBy && r.referredBy !== "Direct Website" && r.referredBy !== "Direct") {
        refsSet.add(r.referredBy);
      }
    });
    managedUsers.forEach((u) => {
      if (u.email && u.email !== "admin@mptmamravati.org" && u.email !== "mptmamravati.org") {
        refsSet.add(u.email);
      }
    });
    return Array.from(refsSet);
  }, [registrations, managedUsers]);

  const handleDeleteRegistration = async (id: string) => {
    if (!id) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`${API_URL}/api/register/delete/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
        if (selectedReg?.id === id) {
          setSelectedReg(null);
        }
        setDeleteConfirmReg(null);
        setToastMessage("अर्ज यशस्वीरित्या डेटाबेसमधून हटवला गेला.");
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert(data.error || "हटवताना त्रुटी आली!");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("सर्व्हरशी संपर्क होऊ शकला नाही. पुन्हा प्रयत्न करा.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
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

      // Filter by Referrer User for Super Admin
      if (referrerFilter !== "ALL") {
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
  }, [registrations, searchQuery, paymentFilter, referrerFilter]);

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
      "रेफरल (Referred By)",
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
        `"${formatDateToDDMMYYYY(r.date)}"`,
        `"${main.fullName}"`,
        `"${main.memberNo}"`,
        `"${main.prabhagNo}"`,
        `"${main.mobileNo}"`,
        `"${r.address.replace(/"/g, '""')}"`,
        `"${r.referredBy || "Direct Website"}"`,
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

  return (
    <DashboardLayout>
      <div>
        {/* Page Title & Subtitle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              सदस्य नोंदणी डेटा
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              महाराष्ट्र प्रांतिक तैलिक महासभा - अमरावती विभाग (सर्व सदस्य नोंदणी फॉर्म डेटा)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 shrink-0"
              title="सदस्य नोंदणी फॉर्मची लिंक तयार करा व शेअर करा"
            >
              <LinkIcon className="w-4 h-4" />
              <span>फॉर्म लिंक तयार करा (Generate Link)</span>
            </button>

            <button
              onClick={exportToCSV}
              disabled={filteredRegistrations.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>CSV डाउनलोड करा (Export CSV)</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-2xs">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-emerald-800 hover:text-emerald-950 font-bold text-base">×</button>
          </div>
        )}

        {/* SEARCH & FILTER TOOLBAR */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Bar Input */}
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
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills & Referrer Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Referrer Filter Dropdown (Visible for Super Admin or when multiple referrers exist) */}
            {isSuperAdmin && (
              <div className="flex items-center gap-1.5 bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                <span className="text-xs font-bold text-amber-900 shrink-0 px-1">👤 रेफरल:</span>
                <select
                  value={referrerFilter}
                  onChange={(e) => setReferrerFilter(e.target.value)}
                  className="bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="ALL">सर्व रेफरल्स (All Referrers)</option>
                  <option value="DIRECT">🌐 थेट वेबसाइट (Direct Website)</option>
                  {uniqueReferrersList.map((refEmail) => {
                    const matchedUser = managedUsers.find((u) => u.email.toLowerCase() === refEmail.toLowerCase());
                    const labelName = matchedUser ? `${matchedUser.name || refEmail} (${refEmail})` : refEmail;
                    return (
                      <option key={refEmail} value={refEmail}>
                        👤 {labelName}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Payment Method Filter Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setPaymentFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial text-center ${
                  paymentFilter === "ALL"
                    ? "bg-white text-blue-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                सर्व ({filteredRegistrations.length})
              </button>
              <button
                onClick={() => setPaymentFilter("CASH")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial text-center ${
                  paymentFilter === "CASH"
                    ? "bg-white text-emerald-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                💵 रोख
              </button>
              <button
                onClick={() => setPaymentFilter("ONLINE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial text-center ${
                  paymentFilter === "ONLINE"
                    ? "bg-white text-purple-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📲 ऑनलाइन UPI
              </button>
            </div>
          </div>
        </div>

        {/* REGISTRATION DATA TABLE CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="font-semibold text-sm">नोंदणी डेटा लोड होत आहे...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="font-bold">{error}</p>
              <button
                onClick={fetchRegistrations}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
              >
                पुन्हा प्रयत्न करा
              </button>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-slate-500 italic">
              कोणतीही जुळणारी नोंदणी आढळली नाही.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 w-12 text-center">अ.क्र.</th>
                    <th className="py-3 px-4">पावती क्र. & दिनांक</th>
                    <th className="py-3 px-4">मुख्य सदस्य नाव & क्रमांक</th>
                    <th className="py-3 px-4">मोबाईल & पत्ता</th>
                    <th className="py-3 px-4">प्रभाग</th>
                    <th className="py-3 px-4">रेफरल (Referrer)</th>
                    <th className="py-3 px-4">शुल्क & पेमेंट</th>
                    <th className="py-3 px-4 text-center">कुटुंब</th>
                    <th className="py-3 px-4 text-right">कृती</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-900">
                  {filteredRegistrations.map((reg, index) => {
                    const main = reg.mainMembers[0] || {
                      fullName: "माहिती उपलब्ध नाही",
                      memberNo: "-",
                      mobileNo: "",
                      prabhagNo: "-",
                    };

                    return (
                      <tr key={reg.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 text-center font-bold text-slate-500 align-top">
                          {index + 1}
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono font-extrabold text-blue-700 text-xs sm:text-sm">
                              {reg.receiptNo}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              📅 {getDatePart(reg)}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 align-top">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-extrabold text-slate-900">
                              {main.fullName}
                            </span>
                            <span className="font-mono text-[11px] text-amber-700 font-bold">
                              {main.memberNo}
                            </span>
                          </div>
                        </td>

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

                        <td className="py-3 px-4 align-top">
                          <span className="inline-block text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            प्रभाग {main.prabhagNo || "-"}
                          </span>
                        </td>

                        <td className="py-3 px-4 align-top">
                          {reg.referredBy && reg.referredBy !== "Direct Website" && reg.referredBy !== "Direct" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200" title={`रेफरल युझर: ${reg.referredBy}`}>
                              👤 {reg.referredBy}
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">
                              🌐 थेट वेबसाइट (Direct)
                            </span>
                          )}
                        </td>

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

                        <td className="py-3 px-4 align-top text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                            <UserPlus className="w-3 h-3" />
                            {reg.familyMembers.length} सदस्य
                          </span>
                        </td>

                        <td className="py-3 px-4 align-top text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedReg(reg)}
                              className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center transition shadow-2xs active:scale-95"
                              title="सविस्तर पावती पहा"
                            >
                              <Eye className="w-4 h-4 text-amber-700" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirmReg(reg)}
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center justify-center transition shadow-2xs active:scale-95"
                              title="अर्ज हटवा"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
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
                      महाराष्ट्र प्रांतिक तैलिक महासभा (अमरावती)
                    </h3>
                    <p className="text-xs text-amber-300 font-bold">
                      पावती क्र: <span className="font-mono text-amber-100 font-bold">{selectedReg.receiptNo}</span> | नोंदणी दिनांक: <span className="text-amber-100">{getDatePart(selectedReg)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>पावती प्रिंट काढा</span>
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
                    <span className="font-bold text-stone-700">पावती क्रमांक: </span>
                    <span className="font-mono font-extrabold text-stone-900 text-sm">{selectedReg.receiptNo}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-700">नोंदणी दिनांक: </span>
                    <span className="font-bold text-stone-900">{getDatePart(selectedReg)}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-700">एकूण शुल्क: </span>
                    <span className="font-extrabold text-[#7A0C0C] text-sm">₹{selectedReg.registrationFee}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider border-b border-amber-300 pb-1">
                    👤 मुख्य सदस्य माहिती ({selectedReg.mainMembers.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedReg.mainMembers.map((m) => (
                      <div key={m.id} className="p-3 rounded-xl bg-white border border-amber-700/30 space-y-1.5">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-1 font-bold text-stone-900 text-xs">
                          <span>{m.memberNo}</span>
                          <span className="text-amber-800">प्रभाग क्रमांक: {m.prabhagNo}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-semibold text-stone-600">सदस्याचे नाव: </span>
                            <span className="font-bold text-stone-900">{m.fullName}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-stone-600">मोबाईल: </span>
                            <span className="font-bold text-stone-900">{m.mobileNo}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-stone-800">रहिवासी पत्ता: </span>
                  <span className="font-semibold text-stone-900 border-b border-stone-800 pb-0.5">{selectedReg.address}</span>
                </div>

                {selectedReg.familyMembers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider border-b border-amber-300 pb-1">
                      👨‍👩‍👧‍👦 कौटुंबिक सदस्य माहिती ({selectedReg.familyMembers.length})
                    </h4>
                    <div className="overflow-x-auto rounded-lg border border-amber-800/30">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#7A0C0C] text-white font-bold text-center">
                            <th className="p-2 border-r border-amber-700/60">अ.क्र.</th>
                            <th className="p-2 border-r border-amber-700/60">नाव</th>
                            <th className="p-2 border-r border-amber-700/60">नाते</th>
                            <th className="p-2 border-r border-amber-700/60">जन्म दिनांक</th>
                            <th className="p-2 border-r border-amber-700/60">व्यवसाय</th>
                            <th className="p-2">मोबाईल</th>
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
                  अर्ज हटवण्याची खात्री करा?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  पावती क्र. <strong className="text-slate-900">{deleteConfirmReg.receiptNo}</strong> डेटाबेसमधून पूर्णपणे हटवला जाईल. ही क्रिया परत करता येणार नाही.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmReg(null)}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  रद्द करा
                </button>
                <button
                  onClick={() => handleDeleteRegistration(deleteConfirmReg.id)}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md"
                >
                  {isDeleting ? "हटवत आहे..." : "होय, हटवा"}
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
                      सदस्य नोंदणी फॉर्म लिंक (Registration Link)
                    </h3>
                    <p className="text-xs text-slate-500">
                      हा फॉर्म लिंक कॉपी करून किंवा WhatsApp वर सदस्यांना पाठवा.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  title="बंद करा"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Super Admin User Selector for Referral Link */}
              {isSuperAdmin && (
                <div className="space-y-1 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <label className="block text-xs font-bold text-amber-900">
                    युझर निवड (Select User to generate unique link):
                  </label>
                  <select
                    value={selectedUserForLink}
                    onChange={(e) => setSelectedUserForLink(e.target.value)}
                    className="w-full bg-white text-xs font-bold text-slate-800 py-2 px-3 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="">🌐 मूळ फॉर्म लिंक (Default Direct Link)</option>
                    {managedUsers.map((u) => (
                      <option key={u.id} value={u.email}>
                        👤 {u.name || u.email} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    सदस्य नोंदणी युनिक फॉर्म URL (Unique Referral Form URL)
                  </label>
                  {activeReferralUser && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                      युझर: {activeReferralUser}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={REGISTRATION_FORM_LINK}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0 ${
                      isCopied
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                    }`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? "कॉपी झाले!" : "कॉपी करा"}</span>
                  </button>
                </div>
                {isCopied && (
                  <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>युनिक लिंक यशस्वीरित्या क्लिपबोर्डवर कॉपी झाली आहे!</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `🚩 *महाराष्ट्र प्रांतिक तैलिक महासभा, अमरावती*\n\nसदस्य नोंदणी फॉर्म भरण्यासाठी खालील लिंकवर क्लिक करा:\n👉 ${REGISTRATION_FORM_LINK}\n\nजय संताजी! 🚩`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>WhatsApp वर शेअर करा</span>
                </a>

                <a
                  href={REGISTRATION_FORM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>फॉर्म उघडा (Open Form)</span>
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
