"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import { DeletedMemberItem } from "@/types";
import { getApiUrl } from "@/utils/config";
import { formatDateToDDMMYYYY, formatPaymentMethod } from "@/utils/formatters";
import { formatDistrictInEnglish, formatCityInEnglish } from "@/utils/locationData";
import {
  UserX,
  Search,
  RefreshCw,
  Download,
  Eye,
  RotateCcw,
  Trash2,
  X,
  Phone,
  MapPin,
  Copy, Check,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Users,
  Columns3,
  SlidersHorizontal,
  Banknote,
  Briefcase,
  FileText,
  CreditCard,
  User,
  ShieldAlert,
  Wallet,
  Calendar,
} from "lucide-react";

function getInitials(name?: string): string {
  if (!name) return "M";
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    const f = parts[0][0] || "";
    const l = parts[parts.length - 1][0] || "";
    return (f + l).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

export default function DeletedMembersPage() {
  const [deletedMembers, setDeletedMembers] = useState<DeletedMemberItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Language state ("mr" | "en")
  const [lang, setLang] = useState<"mr" | "en">("mr");

  // View mode ("essential" | "all")
  const [viewMode, setViewMode] = useState<"essential" | "all">("essential");

  // Tab / Member Type Filter: "ALL" | "PRIMARY" | "EXECUTIVE"
  const [typeFilter, setTypeFilter] = useState<"ALL" | "PRIMARY" | "EXECUTIVE">("ALL");

  // Search & Location Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");

  // Selected Member for Full Details Modal
  const [selectedDetailsMember, setSelectedDetailsMember] = useState<DeletedMemberItem | null>(null);

  // Restore Modal State
  const [restoreCandidate, setRestoreCandidate] = useState<DeletedMemberItem | null>(null);
  const [restoring, setRestoring] = useState<boolean>(false);

  // Permanent Delete Modal State
  const [permanentDeleteCandidate, setPermanentDeleteCandidate] = useState<DeletedMemberItem | null>(null);
  const [permanentDeleting, setPermanentDeleting] = useState<boolean>(false);

  // Toast Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const API_URL = getApiUrl();

  const fetchDeletedMembers = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/deleted-members`);
      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDeletedMembers(data.data);
      } else {
        setError(data.error || (lang === "mr" ? "हटवलेल्या सदस्यांची माहिती आणता आली नाही." : "Failed to fetch deleted members."));
      }
    } catch (err: any) {
      console.error("Fetch deleted members error:", err);
      setError(lang === "mr" ? "सर्व्हरशी संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा." : "Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeletedMembers();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Unique Districts & Cities for dropdowns
  const uniqueDistrictsList = useMemo(() => {
    const distSet = new Set<string>();
    deletedMembers.forEach((m) => {
      const dist = m.district ? m.district.trim() : "";
      if (dist && dist !== "-") distSet.add(dist);
    });
    return Array.from(distSet).sort();
  }, [deletedMembers]);

  const uniqueCitiesList = useMemo(() => {
    const citySet = new Set<string>();
    deletedMembers.forEach((m) => {
      if (districtFilter !== "ALL" && m.district !== districtFilter) return;
      const c = m.city ? m.city.trim() : "";
      if (c && c !== "-") citySet.add(c);
    });
    return Array.from(citySet).sort();
  }, [deletedMembers, districtFilter]);

  // Compute Filter Counts
  const memberCounts = useMemo(() => {
    let all = 0;
    let primary = 0;
    let executive = 0;

    deletedMembers.forEach((m) => {
      all++;
      if (m.memberType === "PRIMARY") primary++;
      if (m.memberType === "EXECUTIVE") executive++;
    });

    return { all, primary, executive };
  }, [deletedMembers]);

  // Filtered List
  const filteredMembers = useMemo(() => {
    return deletedMembers.filter((m) => {
      // Type Filter
      if (typeFilter !== "ALL" && m.memberType !== typeFilter) {
        return false;
      }

      // District Filter
      if (districtFilter !== "ALL" && m.district !== districtFilter) {
        return false;
      }

      // City Filter
      if (cityFilter !== "ALL" && m.city !== cityFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (m.fullName || "").toLowerCase().includes(query);
        const mobileMatch = (m.mobileNo || "").toLowerCase().includes(query);
        const receiptMatch = (m.receiptNo || "").toLowerCase().includes(query);
        const memberNoMatch = (m.memberNo || "").toLowerCase().includes(query);
        const desigMatch = (m.designation || "").toLowerCase().includes(query);
        const addressMatch = (m.address || "").toLowerCase().includes(query);
        const cityMatch = (m.city || "").toLowerCase().includes(query);
        const districtMatch = (m.district || "").toLowerCase().includes(query);
        const reasonMatch = (m.reason || "").toLowerCase().includes(query);
        const byMatch = (m.deletedBy || "").toLowerCase().includes(query);

        if (
          !nameMatch &&
          !mobileMatch &&
          !receiptMatch &&
          !memberNoMatch &&
          !desigMatch &&
          !addressMatch &&
          !cityMatch &&
          !districtMatch &&
          !reasonMatch &&
          !byMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [deletedMembers, typeFilter, districtFilter, cityFilter, searchQuery]);

  // Handle Restore
  const handleConfirmRestore = async () => {
    if (!restoreCandidate) return;
    try {
      setRestoring(true);
      const res = await fetch(`${API_URL}/api/deleted-members/restore/${restoreCandidate.id}`, {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setToastMessage(`✅ ${data.message || (lang === "mr" ? "सदस्य यशस्वीरित्या मुख्य यादीमध्ये पूर्ववत (Restore) करण्यात आला आहे!" : "Member successfully restored!")}`);
        setRestoreCandidate(null);
        if (selectedDetailsMember?.id === restoreCandidate.id) setSelectedDetailsMember(null);
        await fetchDeletedMembers();
      } else {
        alert(data.error || (lang === "mr" ? "सदस्य पूर्ववत करताना त्रुटी झाली." : "Failed to restore member."));
      }
    } catch (err: any) {
      console.error("Restore error:", err);
      alert(lang === "mr" ? "सर्व्हरशी संपर्क होऊ शकला नाही." : "Server error.");
    } finally {
      setRestoring(false);
    }
  };

  // Handle Permanent Delete
  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteCandidate) return;
    try {
      setPermanentDeleting(true);
      const res = await fetch(`${API_URL}/api/deleted-members/${permanentDeleteCandidate.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setToastMessage(`🗑️ ${data.message || (lang === "mr" ? "सदस्य डेटाबेसमधून कायमचा हटवण्यात आला आहे." : "Member permanently deleted.")}`);
        setPermanentDeleteCandidate(null);
        if (selectedDetailsMember?.id === permanentDeleteCandidate.id) setSelectedDetailsMember(null);
        await fetchDeletedMembers();
      } else {
        alert(data.error || (lang === "mr" ? "सदस्य कायमचा हटवताना त्रुटी झाली." : "Failed to delete member."));
      }
    } catch (err: any) {
      console.error("Permanent delete error:", err);
      alert(lang === "mr" ? "सर्व्हरशी संपर्क होऊ शकला नाही." : "Server error.");
    } finally {
      setPermanentDeleting(false);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredMembers.length === 0) return;

    const headers = [
      "Member Type",
      "Full Name",
      "Designation",
      "Mobile No",
      "Receipt No",
      "Member ID",
      "Address",
      "City",
      "District",
      "State",
      "Pincode",
      "Registration Fee",
      "Payment Method",
      "Main Members Count",
      "Family Members Count",
      "Deleted Date",
      "Deleted By",
      "Deletion Reason",
    ];

    const rows = filteredMembers.map((m) => {
      const mainList = (Array.isArray(m.mainMembers) && m.mainMembers.length > 0)
        ? m.mainMembers
        : (m.fullData?.mainMembers && Array.isArray(m.fullData.mainMembers) && m.fullData.mainMembers.length > 0)
          ? m.fullData.mainMembers
          : [1];
      const mainCount = mainList.length;
      const familyCount = Array.isArray(m.familyMembers) && m.familyMembers.length > 0
        ? m.familyMembers.length
        : (m.fullData?.familyMembers && Array.isArray(m.fullData.familyMembers))
          ? m.fullData.familyMembers.length
          : 0;
      return [
        `"${m.memberType}"`,
        `"${m.fullName || ""}"`,
        `"${m.designation || ""}"`,
        `"${m.mobileNo || ""}"`,
        `"${m.receiptNo || ""}"`,
        `"${m.memberNo || ""}"`,
        `"${(m.address || "").replace(/"/g, '""')}"`,
        `"${m.city || ""}"`,
        `"${m.district || ""}"`,
        `"${m.state || "महाराष्ट्र"}"`,
        `"${m.pincode || ""}"`,
        `"${m.registrationFee || ""}"`,
        `"${m.paymentMethod || ""}"`,
        `"${mainCount}"`,
        `"${familyCount}"`,
        `"${m.deletedAt ? new Date(m.deletedAt).toLocaleString("mr-IN") : ""}"`,
        `"${m.deletedBy || ""}"`,
        `"${(m.reason || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MPTM_Deleted_Members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div>
        {/* Page Title & Subtitle Toolbar (Matching Member Registrations UI) */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserX className="w-6 h-6 text-slate-800" />
              <span>{lang === "mr" ? "हटवलेले सदस्य यादी" : "Deleted Members List"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {lang === "mr"
                ? "महाराष्ट्र प्रांतिक तैलिक महासभा - अमरावती विभाग (हटवलेले प्राथमिक व कार्यकारिणी सदस्य संग्रहालय)"
                : "Maharashtra Prantik Tailik Mahasabha - Amravati Division (Deleted Members Archive - Primary & Executive)"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
            {/* Marathi / English Language Toggle */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setLang("mr")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  lang === "mr"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>मराठी</span>
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  lang === "en"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>English</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchDeletedMembers}
              disabled={refreshing}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-amber-600" : ""}`} />
              <span>{lang === "mr" ? "रिफ्रेश" : "Refresh"}</span>
            </button>

            {/* CSV Export Button */}
            <button
              onClick={exportToCSV}
              disabled={filteredMembers.length === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{lang === "mr" ? "CSV निर्यात" : "Export CSV"}</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-4 p-3 bg-slate-100 border border-slate-300 text-slate-900 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-2xs">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-600 hover:text-slate-900 font-bold text-base cursor-pointer">×</button>
          </div>
        )}

        {/* SEARCH & FILTER TOOLBAR (Compact Single Row) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
              {/* Shortened Search Box */}
              <div className="relative w-full sm:w-80 md:w-96 shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === "mr" ? "पावती क्र., नाव, मोबाईल, गाव/शहर, पद किंवा कारण शोधा..." : "Search receipt no, name, mobile, city, designation or reason..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Member Type Filter Pills (सर्व, प्राथमिक, कार्यकारिणी) */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setTypeFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    typeFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{lang === "mr" ? "सर्व" : "All"}</span>
                  <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full text-[11px] font-mono">
                    {memberCounts.all}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTypeFilter("PRIMARY")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    typeFilter === "PRIMARY"
                      ? "bg-white text-emerald-800 shadow-2xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === "mr" ? "प्राथमिक सदस्य" : "Primary"}</span>
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[11px] font-mono">
                    {memberCounts.primary}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTypeFilter("EXECUTIVE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    typeFilter === "EXECUTIVE"
                      ? "bg-white text-amber-900 shadow-2xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                  <span>{lang === "mr" ? "कार्यकारिणी" : "Executive"}</span>
                  <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-full text-[11px] font-mono">
                    {memberCounts.executive}
                  </span>
                </button>
              </div>

              {/* District Filter Dropdown */}
              {uniqueDistrictsList.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                  <span className="text-xs font-bold text-slate-700 shrink-0">{lang === "mr" ? "जिल्हा:" : "District:"}</span>
                  <select
                    value={districtFilter}
                    onChange={(e) => {
                      setDistrictFilter(e.target.value);
                      setCityFilter("ALL");
                    }}
                    className="bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                  >
                    <option value="ALL">{lang === "mr" ? `सर्व जिल्हे (${uniqueDistrictsList.length})` : `All Districts (${uniqueDistrictsList.length})`}</option>
                    {uniqueDistrictsList.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* City Filter Dropdown */}
              {uniqueCitiesList.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                  <span className="text-xs font-bold text-slate-700 shrink-0">{lang === "mr" ? "गाव/शहर:" : "City:"}</span>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                  >
                    <option value="ALL">{lang === "mr" ? `सर्व शहरे (${uniqueCitiesList.length})` : `All Cities (${uniqueCitiesList.length})`}</option>
                    {uniqueCitiesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Essential / All Columns View Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("essential")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "essential"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title={lang === "mr" ? "केवळ आवश्यक स्तंभ दाखवा" : "Essential Columns View"}
              >
                <Columns3 className="w-3.5 h-3.5 text-slate-500" />
                <span>{lang === "mr" ? "आवश्यक" : "Essential"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "all"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title={lang === "mr" ? "सर्व स्तंभ दाखवा" : "All Columns View"}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>{lang === "mr" ? "सर्व स्तंभ" : "All Columns"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Helper Hint */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1 mb-2">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Eye className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {lang === "mr"
                ? "सदस्याचे संपूर्ण तपशील पाहण्यासाठी ओळीवर क्लिक करा • पूर्ववत करण्यासाठी 🔄 आयकॉन दाबा"
                : "Click on any row to view full details • Click 🔄 icon to restore"}
            </span>
          </span>
          <span className="text-[11px] text-slate-400 font-semibold inline-flex items-center gap-1">
            {loading ? (
              <span className="inline-block w-6 h-3 bg-slate-200 animate-pulse rounded" />
            ) : (
              filteredMembers.length
            )}{" "}
            {lang === "mr" ? "हटवलेले सदस्य" : "deleted members"}
          </span>
        </div>

        {/* DATA TABLE CARD (MATCHING REGISTRATIONS TABLE EXACTLY) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {error ? (
            <div className="p-8 text-center text-red-600 flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="font-bold">{error}</p>
              <button
                type="button"
                onClick={fetchDeletedMembers}
                className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                {lang === "mr" ? "पुन्हा प्रयत्न करा" : "Try Again"}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EBF1FA] text-slate-700 text-xs font-medium border-b border-slate-200 whitespace-nowrap">
                    <th className="py-2.5 px-2.5 w-8 text-center">{lang === "mr" ? "अ.क्र." : "#"}</th>
                    <th className="py-2.5 px-3">{lang === "mr" ? "हटवल्याचा दिनांक व वेळ" : "Deleted Date & Time"}</th>
                    <th className="py-2.5 px-3">{lang === "mr" ? "प्रकार" : "Type"}</th>
                    <th className="py-2.5 px-3">{lang === "mr" ? "पावती क्र." : "Receipt No."}</th>
                    <th className="py-2.5 px-3">{lang === "mr" ? "सदस्याचे नाव" : "Member Name"}</th>
                    <th className="py-2.5 px-3">{lang === "mr" ? "मोबाईल क्र." : "Mobile No."}</th>
                    {viewMode === "all" ? (
                      <>
                        <th className="py-2.5 px-3">{lang === "mr" ? "पत्ता" : "Address"}</th>
                        <th className="py-2.5 px-3">{lang === "mr" ? "गाव" : "Village/Town"}</th>
                        <th className="py-2.5 px-3">{lang === "mr" ? "तालुका" : "Taluka"}</th>
                        <th className="py-2.5 px-3">{lang === "mr" ? "जिल्हा" : "District"}</th>
                        <th className="py-2.5 px-3">{lang === "mr" ? "राज्य" : "State"}</th>
                      </>
                    ) : (
                      <th className="py-2.5 px-3">{lang === "mr" ? "स्थान (गाव/शहर)" : "Town/City"}</th>
                    )}
                    <th className="py-2.5 px-3">{lang === "mr" ? "शुल्क व पेमेंट" : "Fee & Payment"}</th>
                    <th className="py-2.5 px-2 text-center">{lang === "mr" ? "मुख्य" : "Main"}</th>
                    <th className="py-2.5 px-2 text-center">{lang === "mr" ? "कुटुंब" : "Family"}</th>
                    <th className="py-2.5 px-3">{lang === "mr" ? "हटवणारा व कारण" : "Deleted By & Reason"}</th>
                    <th className="py-2.5 px-3 text-right">{lang === "mr" ? "कृती" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, idx) => (
                      <tr key={`skel-del-${idx}`} className="animate-pulse">
                        <td className="py-2.5 px-2.5 text-center"><div className="h-3.5 w-4 bg-slate-200 rounded mx-auto" /></td>
                        <td className="py-2.5 px-3">
                          <div className="h-3.5 w-24 bg-slate-200 rounded mb-1" />
                          <div className="h-2.5 w-16 bg-slate-200 rounded" />
                        </td>
                        <td className="py-2.5 px-3"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
                        <td className="py-2.5 px-3"><div className="h-3.5 w-20 bg-slate-200 rounded" /></td>
                        <td className="py-2.5 px-3">
                          <div className="h-3.5 w-32 bg-slate-200 rounded mb-1" />
                          <div className="h-2.5 w-20 bg-slate-200 rounded" />
                        </td>
                        <td className="py-2.5 px-3"><div className="h-3.5 w-24 bg-slate-200 rounded" /></td>
                        {viewMode === "all" ? (
                          <>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-24 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-16 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-16 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-16 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-14 bg-slate-200 rounded" /></td>
                          </>
                        ) : (
                          <td className="py-2.5 px-3"><div className="h-3.5 w-20 bg-slate-200 rounded" /></td>
                        )}
                        <td className="py-2.5 px-3"><div className="h-3.5 w-20 bg-slate-200 rounded" /></td>
                        <td className="py-2.5 px-2 text-center"><div className="h-3.5 w-6 bg-slate-200 rounded mx-auto" /></td>
                        <td className="py-2.5 px-2 text-center"><div className="h-3.5 w-6 bg-slate-200 rounded mx-auto" /></td>
                        <td className="py-2.5 px-3">
                          <div className="h-3.5 w-24 bg-slate-200 rounded mb-1" />
                          <div className="h-2.5 w-32 bg-slate-200 rounded" />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={viewMode === "all" ? 16 : 12} className="p-12 text-center text-slate-500 italic">
                        {lang === "mr" ? "कोणतेही हटवलेले सदस्य सापडले नाहीत." : "No deleted members found."}
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((member, index) => {
                    const isPrimary = member.memberType === "PRIMARY";
                    const isExecutive = member.memberType === "EXECUTIVE";
                    const mainList = (Array.isArray(member.mainMembers) && member.mainMembers.length > 0)
                      ? member.mainMembers
                      : (member.fullData?.mainMembers && Array.isArray(member.fullData.mainMembers) && member.fullData.mainMembers.length > 0)
                        ? member.fullData.mainMembers
                        : [{ srNo: 1, fullName: member.fullName, memberNo: member.memberNo, mobileNo: member.mobileNo }];
                    const familyCount = Array.isArray(member.familyMembers) && member.familyMembers.length > 0
                      ? member.familyMembers.length
                      : (member.fullData?.familyMembers && Array.isArray(member.fullData.familyMembers))
                        ? member.fullData.familyMembers.length
                        : 0;

                    const dateObj = member.deletedAt ? new Date(member.deletedAt) : null;
                    const datePart = dateObj
                      ? dateObj.toLocaleDateString(lang === "mr" ? "mr-IN" : "en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "-";
                    const timePart = dateObj
                      ? dateObj.toLocaleTimeString(lang === "mr" ? "mr-IN" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        }).toLowerCase()
                      : "";

                    return (
                      <tr
                        key={member.id}
                        onClick={() => setSelectedDetailsMember(member)}
                        className="hover:bg-amber-50/70 transition cursor-pointer group border-b border-slate-100/80"
                        title={lang === "mr" ? "संपूर्ण तपशील पाहण्यासाठी क्लिक करा" : "Click to view full details"}
                      >
                        {/* 1. SR NO */}
                        <td className="align-top py-2.5 px-2.5 text-center text-slate-400 whitespace-nowrap text-xs font-normal">
                          {index + 1}
                        </td>

                        {/* 2. DELETED DATE & TIME (Stacked like registrations table, English/Marathi numbers per language) */}
                        <td className="align-top py-2.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col leading-tight">
                            <span className="text-slate-800 text-xs font-normal">{datePart}</span>
                            {timePart && (
                              <span className="text-[10px] font-normal text-slate-400 mt-0.5 leading-none">{timePart}</span>
                            )}
                          </div>
                        </td>

                        {/* 3. MEMBER TYPE */}
                        <td className="align-top py-2.5 px-3 whitespace-nowrap">
                          <span className="text-xs font-normal text-slate-700 leading-tight block">
                            {isPrimary ? (lang === "mr" ? "प्राथमिक" : "Primary") : (lang === "mr" ? "कार्यकारिणी" : "Executive")}
                          </span>
                        </td>

                        {/* 4. RECEIPT NO (Aligned copy button, simple font) */}
                        <td className="align-top py-2.5 px-3 whitespace-nowrap">
                          <div className="w-[170px] flex items-center justify-between gap-1 leading-tight">
                            <span className="font-mono text-xs text-slate-800 font-normal truncate" title={member.receiptNo || "-"}>
                              {member.receiptNo || "-"}
                            </span>
                            {member.receiptNo && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(member.receiptNo!, member.id + "-rec");
                                }}
                                className="text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer shrink-0"
                                title={lang === "mr" ? "पावती क्र. कॉपी करा" : "Copy Receipt No"}
                              >
                                {copiedId === member.id + "-rec" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 5. MEMBER NAME */}
                        <td className="align-top py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-800 text-xs font-normal truncate max-w-[190px] block" title={member.fullName}>
                              {member.fullName}
                            </span>
                            {mainList.length > 1 && (
                              <span
                                className="text-[11px] font-normal text-amber-800 shrink-0"
                                title={`एकूण ${mainList.length} मुख्य सदस्य: ${mainList.map((m: any) => m.fullName).join(", ")}`}
                              >
                                (+{mainList.length - 1} {lang === "mr" ? "मुख्य" : "Main"})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 6. MOBILE NO */}
                        <td className="align-top py-2.5 px-3 whitespace-nowrap">
                          {member.mobileNo ? (
                            <a
                              href={`tel:${member.mobileNo}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-normal font-mono text-slate-700 hover:text-slate-900 flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{member.mobileNo}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs font-normal">-</span>
                          )}
                        </td>

                        {/* 7. LOCATION / ADDRESS */}
                        {viewMode === "all" ? (
                          <>
                            <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700 truncate max-w-[150px]" title={member.address || ""}>
                              {member.address || "-"}
                            </td>
                            <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700">
                              {member.gaav || "-"}
                            </td>
                            <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700">
                              {member.taluka || "-"}
                            </td>
                            <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700">
                              {member.district || "-"}
                            </td>
                            <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700">
                              {member.state || "महाराष्ट्र"}
                            </td>
                          </>
                        ) : (
                          <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700 truncate max-w-[150px]" title={`${member.gaav || ""}, ${member.city || ""}, ${member.district || ""}`}>
                            {member.city || member.gaav || member.district || "-"}
                          </td>
                        )}

                        {/* 8. FEE & PAYMENT */}
                        <td className="align-top py-2.5 px-3 whitespace-nowrap">
                          <span className="text-slate-800 text-xs font-normal">
                            ₹{member.registrationFee || (isExecutive ? 1001 : 500)} • {formatPaymentMethod(member.paymentMethod)}
                          </span>
                        </td>

                        {/* 9. MUKHYA MEMBERS */}
                        <td className="align-top py-2.5 px-2 text-center whitespace-nowrap text-xs font-normal text-slate-800">
                          {mainList.length} {lang === "mr" ? "मुख्य" : "Main"}
                        </td>

                        {/* 10. KUTUMB MEMBERS */}
                        <td className="align-top py-2.5 px-2 text-center whitespace-nowrap text-xs font-normal text-slate-800">
                          {(isPrimary || familyCount > 0) && familyCount > 0 ? (
                            <span>{familyCount} {lang === "mr" ? "कुटुंब" : "Family"}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* 11. DELETED BY & REASON */}
                        <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal">
                          <div className="flex flex-col leading-tight max-w-[160px]">
                            <span className="text-slate-800 font-normal truncate" title={member.deletedBy || ""}>
                              {member.deletedBy || "Admin"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal italic truncate mt-0.5" title={member.reason || ""}>
                              {member.reason || (lang === "mr" ? "नोंद हटवली" : "Record deleted")}
                            </span>
                          </div>
                        </td>

                        {/* 12. ACTIONS */}
                        <td className="align-top py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {/* View Details */}
                            <button
                              type="button"
                              onClick={() => setSelectedDetailsMember(member)}
                              className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                              title={lang === "mr" ? "तपशील पहा (View Details)" : "View Details"}
                            >
                              <Eye className="w-4 h-4 text-amber-800" />
                            </button>

                            {/* Restore Button */}
                            <button
                              type="button"
                              onClick={() => setRestoreCandidate(member)}
                              className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                              title={lang === "mr" ? "सदस्य पूर्ववत करा (Restore Member)" : "Restore Member"}
                            >
                              <RotateCcw className="w-4 h-4 text-emerald-600" />
                            </button>

                            {/* Permanent Delete Button */}
                            <button
                              type="button"
                              onClick={() => setPermanentDeleteCandidate(member)}
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 transition flex items-center justify-center cursor-pointer"
                              title={lang === "mr" ? "कायमचे हटवा (Permanent Delete)" : "Permanent Delete"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* ENTRY DETAILS POPUP MODAL (MATCHING REGISTRATIONS MODAL) */}
        {/* ======================================================== */}
        {selectedDetailsMember && (() => {
          const isExec = selectedDetailsMember.memberType === "EXECUTIVE";
          const dateObj = selectedDetailsMember.deletedAt ? new Date(selectedDetailsMember.deletedAt) : null;
          const deletedDateTimeStr = dateObj
            ? `${dateObj.toLocaleDateString(lang === "mr" ? "mr-IN" : "en-GB")} • ${dateObj.toLocaleTimeString(lang === "mr" ? "mr-IN" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`
            : "-";
          const regDateStr = selectedDetailsMember.registrationDate || "-";
          const mainMembersList = (Array.isArray(selectedDetailsMember.mainMembers) && selectedDetailsMember.mainMembers.length > 0)
            ? selectedDetailsMember.mainMembers
            : (selectedDetailsMember.fullData?.mainMembers && Array.isArray(selectedDetailsMember.fullData.mainMembers) && selectedDetailsMember.fullData.mainMembers.length > 0)
              ? selectedDetailsMember.fullData.mainMembers
              : [{
                  srNo: 1,
                  fullName: selectedDetailsMember.fullName,
                  memberNo: selectedDetailsMember.memberNo || selectedDetailsMember.designation || "-",
                  mobileNo: selectedDetailsMember.mobileNo || "-",
                  prabhagNo: "-",
                }];
          const familyList = (Array.isArray(selectedDetailsMember.familyMembers) && selectedDetailsMember.familyMembers.length > 0)
            ? selectedDetailsMember.familyMembers
            : (selectedDetailsMember.fullData?.familyMembers && Array.isArray(selectedDetailsMember.fullData.familyMembers))
              ? selectedDetailsMember.fullData.familyMembers
              : [];

          return (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
              <div className="bg-[#FAF8F5] rounded-3xl shadow-2xl max-w-5xl w-full border border-amber-900/20 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200">
                
                {/* 1. TOP HEADER (Deep Maroon with Gold Accents & Navlogo) */}
                <div className="bg-gradient-to-r from-[#4A0303] via-[#650808] to-[#4A0303] px-5 sm:px-7 py-4 text-white flex items-center justify-between border-b-2 border-amber-500/40 shrink-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-amber-50/10 flex items-center justify-center shrink-0">
                      <Image
                        src="/Navlogo.png"
                        alt="MPTM Official Logo"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-amber-300 tracking-wider block">
                        जय संताजी
                      </span>
                      <h2 className="text-base sm:text-lg font-black tracking-wide text-white drop-shadow-xs leading-tight font-baloo">
                        महाराष्ट्र प्रांतिक तैलिक महासभा
                      </h2>
                      <p className="text-[11px] font-medium text-amber-200/90 leading-tight">
                        अमरावती विभाग, अमरावती • हटवलेले सदस्य संग्रहालय
                      </p>
                    </div>
                  </div>

                  {/* Header Badges & Close Button */}
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {selectedDetailsMember.receiptNo && (
                      <span className="bg-black/35 border border-amber-400/40 text-amber-100 font-mono text-xs font-semibold px-3 py-1 rounded-full shadow-inner hidden sm:inline-block">
                        पावती क्र. : {selectedDetailsMember.receiptNo}
                      </span>
                    )}
                    <span className="bg-red-700/90 text-white border border-red-400/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <UserX className="w-3.5 h-3.5" />
                      <span>{isExec ? "हटवलेली कार्यकारणी" : "हटवलेला प्राथमिक सदस्य"}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDetailsMember(null)}
                      className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white/90 hover:text-white flex items-center justify-center transition cursor-pointer border border-white/20 active:scale-95 ml-1"
                      title="बंद करा"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. MODAL BODY (Scrollable Container) */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
                  
                  {/* DELETION AUDIT ALERT BANNER */}
                  <div className="bg-red-50 border border-red-200/90 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-red-950 block">
                          ही नोंद डेटाबेसमधून हटवण्यात आलेली आहे (Archived Record)
                        </span>
                        <span className="text-[11px] text-red-700/90 block mt-0.5">
                          कारण: <em>&ldquo;{selectedDetailsMember.reason || "नोंद हटवली गेली"}&rdquo;</em> • हटवणारा: <strong>{selectedDetailsMember.deletedBy || "Admin"}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block">हटवल्याचा दिनांक व वेळ</span>
                      <span className="text-xs font-bold text-stone-800 font-mono">
                        {deletedDateTimeStr}
                      </span>
                    </div>
                  </div>

                  {/* TWO-COLUMN TOP SECTION */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    
                    {/* LEFT COLUMN: 8 COLS */}
                    <div className="lg:col-span-8 space-y-4">
                      
                      {/* Section Header: प्रमुख सदस्य */}
                      <div className="flex items-center justify-between pb-1 pt-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#7A0C0C]" />
                          <h3 className="text-xs font-black text-[#7A0C0C] uppercase tracking-wider">
                            प्रमुख सदस्य ({mainMembersList.length})
                          </h3>
                        </div>
                      </div>

                      {/* Main Members Cards */}
                      {mainMembersList.map((m: any, idx: number) => (
                        <div
                          key={m.id || idx}
                          className="bg-white border border-amber-200/90 rounded-2xl shadow-xs overflow-hidden"
                        >
                          {/* Card Sub-header */}
                          <div className="bg-gradient-to-r from-amber-50/90 to-amber-100/40 px-4 py-2.5 border-b border-amber-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-[#7A0C0C] text-white text-xs font-black flex items-center justify-center shadow-xs">
                                {m.srNo || idx + 1}
                              </span>
                              <span className="font-extrabold text-xs text-[#7A0C0C]">
                                मुख्य सदस्य - {idx + 1}
                              </span>
                              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                {isExec ? "कार्यकारिणी सदस्य (Executive Member)" : "प्राथमिक सदस्य (Primary Member)"}
                              </span>
                            </div>
                          </div>

                          {/* Card Content with Avatar and 6 Tiles */}
                          <div className="p-4">
                            {/* 6 Grid Tiles */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full text-xs">
                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">पूर्ण नाव</span>
                                <span className="font-bold text-stone-900 block truncate" title={m.fullName || selectedDetailsMember.fullName}>
                                  {m.fullName || selectedDetailsMember.fullName || "-"}
                                </span>
                              </div>

                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">सदस्य क्रमांक / पद</span>
                                <span className="font-extrabold text-[#7A0C0C] font-mono block">
                                  {m.memberNo || (isExec ? selectedDetailsMember.designation : selectedDetailsMember.memberNo) || "-"}
                                </span>
                              </div>

                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">मोबाईल क्रमांक</span>
                                <span className="font-bold text-stone-900 font-mono block">
                                  {m.mobileNo || (idx === 0 ? selectedDetailsMember.mobileNo : "-") || "-"}
                                </span>
                              </div>

                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">प्रभाग क्रमांक</span>
                                <span className="font-bold text-stone-900 block">
                                  {m.prabhagNo || "-"}
                                </span>
                              </div>

                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">गाव / शहर</span>
                                <span className="font-bold text-stone-900 block">
                                  {selectedDetailsMember.city || selectedDetailsMember.gaav || "-"}
                                </span>
                              </div>

                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">तालुका</span>
                                <span className="font-bold text-stone-900 block">
                                  {selectedDetailsMember.taluka || selectedDetailsMember.city || "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Box 2: पत्ता व इतर माहिती (Address Card) */}
                      <div className="bg-white border border-amber-200/90 rounded-2xl shadow-xs overflow-hidden">
                        <div className="bg-amber-50/60 px-4 py-2 border-b border-amber-200/80 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#7A0C0C]" />
                          <h4 className="text-xs font-black text-stone-900">
                            पत्ता व इतर माहिती
                          </h4>
                        </div>
                        <div className="p-3.5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                          <div className="sm:col-span-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                            <span className="text-[10px] text-stone-500 font-semibold block">पूर्ण पत्ता</span>
                            <span className="font-bold text-stone-900 block leading-snug">
                              {selectedDetailsMember.address || "-"}
                            </span>
                          </div>

                          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                            <span className="text-[10px] text-stone-500 font-semibold block">जिल्हा</span>
                            <span className="font-bold text-stone-900 block">
                              {selectedDetailsMember.district || "-"}
                            </span>
                          </div>

                          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                            <span className="text-[10px] text-stone-500 font-semibold block">पिनकोड</span>
                            <span className="font-bold text-stone-900 font-mono block">
                              {selectedDetailsMember.pincode || "-"}
                            </span>
                          </div>

                          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                            <span className="text-[10px] text-stone-500 font-semibold block">राज्य / देश</span>
                            <span className="font-bold text-stone-900 block">
                              {selectedDetailsMember.state || "महाराष्ट्र"}, {selectedDetailsMember.country || "भारत"}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: 4 COLS (नोंदणी व देयक माहिती) */}
                    <div className="lg:col-span-4">
                      <div className="bg-white border border-amber-200/90 rounded-2xl shadow-xs overflow-hidden sticky top-2">
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 px-4 py-3 border-b border-amber-200 flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-[#7A0C0C]" />
                          <h4 className="text-xs font-black text-stone-900">
                            नोंदणी व पेमेंट माहिती
                          </h4>
                        </div>

                        <div className="p-3.5 space-y-2.5 text-xs">
                          {/* 1. पावती क्रमांक */}
                          <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-amber-100/80 flex items-center justify-between">
                            <span className="text-[11px] text-stone-600 font-semibold">पावती क्रमांक</span>
                            <span className="font-mono font-black text-[#7A0C0C] bg-amber-100/80 px-2 py-0.5 rounded-md text-[11px] border border-amber-300">
                              {selectedDetailsMember.receiptNo || "-"}
                            </span>
                          </div>

                          {/* 2. नोंदणी दिनांक */}
                          <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-amber-100/80 flex items-center justify-between">
                            <span className="text-[11px] text-stone-600 font-semibold">नोंदणी दिनांक</span>
                            <span className="font-mono font-bold text-stone-800 text-[11px]">
                              {regDateStr}
                            </span>
                          </div>

                          {/* 3. नोंदणी शुल्क */}
                          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50/80 to-amber-100/50 border border-amber-300/80 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-stone-500 font-bold block uppercase tracking-wider">नोंदणी शुल्क</span>
                              <span className="text-[10px] text-stone-600">प्राप्त अधिकृत देयक</span>
                            </div>
                            <span className="text-xl font-black text-[#7A0C0C] tracking-tight">
                              ₹ {selectedDetailsMember.registrationFee || (isExec ? 1001 : 500)}
                            </span>
                          </div>

                          {/* 4. भरणा पद्धत */}
                          <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-amber-100/80 flex items-center justify-between">
                            <span className="text-[11px] text-stone-600 font-semibold">भरणा पद्धत</span>
                            <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[11px]">
                              {formatPaymentMethod(selectedDetailsMember.paymentMethod)}
                            </span>
                          </div>

                          {/* 5. व्यवहार संदर्भ क्रमांक */}
                          {selectedDetailsMember.paymentReference && (
                            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-amber-100/80">
                              <span className="text-[10px] text-stone-500 font-semibold block mb-0.5">व्यवहार संदर्भ क्रमांक (Txn ID)</span>
                              <span className="font-mono text-[11px] font-bold text-stone-800 break-all block">
                                {selectedDetailsMember.paymentReference}
                              </span>
                            </div>
                          )}

                          {/* 6. देयक स्रोत / Referrer */}
                          <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-amber-100/80">
                            <span className="text-[10px] text-stone-500 font-semibold block mb-0.5">नोंदणीकर्ता / Referrer</span>
                            <span className="font-bold text-stone-800 text-xs block truncate" title={selectedDetailsMember.referredBy || ""}>
                              {selectedDetailsMember.referredBy || "थेट वेबसाईट (Direct Website)"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* KUTUMB MEMBERS TABLE */}
                  {(selectedDetailsMember.memberType === "PRIMARY" || familyList.length > 0) && (
                    <div className="bg-white border border-amber-200/90 rounded-2xl shadow-xs overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 sm:px-5 py-3 border-b border-amber-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#7A0C0C]" />
                          <h4 className="text-xs sm:text-sm font-black text-stone-900">
                            कौटुंबिक सदस्य ({familyList.length})
                          </h4>
                        </div>
                      </div>

                      {familyList.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-[#FDF9F2] text-stone-700 font-bold border-b border-amber-200 text-[11px]">
                              <tr>
                                <th className="p-2.5 text-center w-12 border-r border-amber-100">अ. क्र.</th>
                                <th className="p-2.5 border-r border-amber-100">पूर्ण नाव</th>
                                <th className="p-2.5 border-r border-amber-100">नाते</th>
                                <th className="p-2.5 border-r border-amber-100">जन्म तारीख</th>
                                <th className="p-2.5 border-r border-amber-100">व्यवसाय</th>
                                <th className="p-2.5">मोबाईल</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100/80">
                              {familyList.map((fam: any, idx: number) => (
                                <tr key={fam.id || idx} className="hover:bg-amber-50/40 transition">
                                  <td className="p-2.5 text-center font-bold text-stone-600 border-r border-amber-100">
                                    {fam.srNo || idx + 1}
                                  </td>
                                  <td className="p-2.5 font-bold text-stone-900 border-r border-amber-100">
                                    {fam.name || fam.fullName || "-"}
                                  </td>
                                  <td className="p-2.5 font-medium text-stone-800 border-r border-amber-100">
                                    <span className="bg-amber-100/70 border border-amber-300/80 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                      {fam.relation || "-"}
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-mono text-stone-700 border-r border-amber-100">
                                    {fam.dob ? formatDateToDDMMYYYY(fam.dob) : "-"}
                                  </td>
                                  <td className="p-2.5 text-stone-700 border-r border-amber-100">
                                    {fam.occupation || "-"}
                                  </td>
                                  <td className="p-2.5 font-mono text-stone-700">{fam.mobile || fam.mobileNo || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-5 text-center text-xs text-stone-500 font-medium">
                          कोणतेही कौटुंबिक सदस्य नोंदवलेले नाहीत.
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* 3. MODAL FOOTER */}
                <div className="sticky bottom-0 bg-[#FAF8F5] px-6 py-3.5 border-t border-amber-900/10 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => setPermanentDeleteCandidate(selectedDetailsMember)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>कायमचे हटवा</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDetailsMember(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
                    >
                      बंद करा
                    </button>
                    <button
                      type="button"
                      onClick={() => setRestoreCandidate(selectedDetailsMember)}
                      className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>सदस्य पूर्ववत करा (Restore)</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* ======================================================== */}
        {/* RESTORE CONFIRMATION MODAL                               */}
        {/* ======================================================== */}
        {restoreCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center font-baloo">
                {lang === "mr" ? "सदस्य पूर्ववत (Restore) करायचा आहे का?" : "Restore this member?"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 text-center mt-2 leading-relaxed">
                {lang === "mr" ? (
                  <>
                    तुम्ही <strong>&ldquo;{restoreCandidate.fullName}&rdquo;</strong> यांची नोंद{" "}
                    {restoreCandidate.memberType === "PRIMARY" ? "मुख्य नोंदणी यादीत" : "कार्यकारिणी यादीत"}{" "}
                    पूर्ववत करत आहात. ही नोंद हटवलेल्या संग्रहातून काढून मूळ डेटाबेसमध्ये पुन्हा सक्रिय केली जाईल.
                  </>
                ) : (
                  <>
                    You are restoring <strong>&ldquo;{restoreCandidate.fullName}&rdquo;</strong> back to active{" "}
                    {restoreCandidate.memberType === "PRIMARY" ? "member registrations" : "executive members"}.
                  </>
                )}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  disabled={restoring}
                  onClick={() => setRestoreCandidate(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
                >
                  {lang === "mr" ? "रद्द करा" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={restoring}
                  onClick={handleConfirmRestore}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-60 active:scale-95"
                >
                  {restoring ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === "mr" ? "पूर्ववत होत आहे..." : "Restoring..."}</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>{lang === "mr" ? "होय, पूर्ववत करा" : "Yes, Restore"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PERMANENT DELETE CONFIRMATION MODAL                      */}
        {/* ======================================================== */}
        {permanentDeleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center font-baloo">
                {lang === "mr" ? "कायमचे हटवायचे आहे का? (Permanent Delete)" : "Permanently delete this record?"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 text-center mt-2 leading-relaxed">
                तुम्ही <strong>&ldquo;{permanentDeleteCandidate.fullName}&rdquo;</strong> यांची नोंद कायमस्वरूपी हटवत आहात.
              </p>
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 text-center">
                <strong>सावधान:</strong> ही कृती पूर्ववत (Undo) करता येणार नाही. डेटाबेसमधून हा डेटा कायमचा नष्ट होईल!
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  disabled={permanentDeleting}
                  onClick={() => setPermanentDeleteCandidate(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
                >
                  {lang === "mr" ? "रद्द करा" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={permanentDeleting}
                  onClick={handleConfirmPermanentDelete}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-60 active:scale-95"
                >
                  {permanentDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{lang === "mr" ? "हटवत आहे..." : "Deleting..."}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{lang === "mr" ? "कायमचे हटवा" : "Delete Forever"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
