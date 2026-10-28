"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";

const WhatsappIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);
import { ExecutiveMemberItem, MemberRegistration } from "@/types";
import { getApiUrl, getMainSiteUrl } from "@/utils/config";
import { formatDateToDDMMYYYY, getDatePart, formatPaymentMethod, convertNumberToMarathiWords } from "@/utils/formatters";
import { downloadReceiptAsPdf } from "@/utils/pdfUtils";
import { formatDistrictInEnglish, formatCityInEnglish, formatAddressInEnglish } from "@/utils/locationData";
import {
  UserCheck,
  Search,
  RefreshCw,
  Trash2,
  UserX,
  Edit,
  Plus,
  X,
  Copy,
  Check,
  Phone,
  Building2,
  MapPin,
  CheckCircle2,
  Award,
  User,
  ShieldCheck,
  Filter,
  FileText,
  Eye,
  Printer,
  ImageIcon,
  MessageSquare,
  Download,
} from "lucide-react";

const designationMap: Record<string, string> = {
  "विभागीय अध्यक्ष": "Regional President",
  "विभागीय उपाध्यक्ष": "Vice President",
  "विभागीय सचिव": "Secretary",
  "विभागीय सहसचिव": "Joint Secretary",
  "कोषाध्यक्ष": "Treasurer",
  "संघटक": "Organizer",
  "कार्यकारिणी सदस्य": "Executive Member",
  "सल्लागार": "Advisor",
};

function formatDesignationInEnglish(desig: string | null | undefined): string {
  if (!desig) return "";
  const trimmed = desig.trim();
  return designationMap[trimmed] || trimmed;
}

function formatEnglishText(text: string | null | undefined): string {
  if (!text) return "";
  return formatCityInEnglish(text);
}

function convertNumberToEnglishWords(amountStr: string | number): string {
  const num = typeof amountStr === "number" ? amountStr : parseInt(String(amountStr), 10);
  if (isNaN(num) || num <= 0) return "Zero Rupees Only";
  if (num === 1001) return "One Thousand One Rupees Only";
  if (num === 101) return "One Hundred One Rupees Only";
  return `${num} Rupees Only`;
}


// ── Official Organization Seal (मुद्रा / शिक्का with Navbar Logo) ──
function OfficialSeal({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none w-28 h-28 sm:w-32 sm:h-32 ${className}`}>
      <svg
        viewBox="0 0 160 160"
        className="absolute inset-0 w-full h-full text-[#7A0C0C] drop-shadow-xs transform -rotate-3"
      >
        <circle cx="80" cy="80" r="76" fill="#FFFDF9" stroke="#7A0C0C" strokeWidth="2.5" />
        <circle cx="80" cy="80" r="71" fill="none" stroke="#7A0C0C" strokeWidth="1" strokeDasharray="3,2" />
        <circle cx="80" cy="80" r="50" fill="none" stroke="#7A0C0C" strokeWidth="1.5" />
        <defs>
          <path id="sealTopArc" d="M 22,80 A 58,58 0 1,1 138,80" fill="none" />
          <path id="sealBottomArc" d="M 138,80 A 58,58 0 0,1 22,80" fill="none" />
        </defs>
        <text fontSize="7.5" fontWeight="900" fill="#7A0C0C" letterSpacing="0.4">
          <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
            ★ महाराष्ट्र प्रांतिक तैलिक महासभा ★
          </textPath>
        </text>
        <text fontSize="7" fontWeight="800" fill="#7A0C0C" letterSpacing="0.3">
          <textPath href="#sealBottomArc" startOffset="50%" textAnchor="middle">
            • अमरावती विभाग, अमरावती •
          </textPath>
        </text>
      </svg>
      <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-amber-500 shadow-sm bg-[#4A0404]">
        <img
          src="/Navlogo.png"
          alt="महाराष्ट्र प्रांतिक तैलिक महासभा मुद्रा"
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    </div>
  );
}

export default function ManageExecutivesPage() {
  const [executives, setExecutives] = useState<ExecutiveMemberItem[]>([]);
  const [registrations, setRegistrations] = useState<MemberRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [designationFilter, setDesignationFilter] = useState<string>("ALL");
  const [districtFilter, setDistrictFilter] = useState<string>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");

  // Modal State for View Details & Receipt
  const [selectedViewExec, setSelectedViewExec] = useState<ExecutiveMemberItem | null>(null);
  const [screenshotZoom, setScreenshotZoom] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<ExecutiveMemberItem | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    designation: "Executive Member",
    mobileNo: "",
    address: "",
    gaav: "",
    taluka: "",
    city: "Amravati",
    district: "Amravati",
    state: "Maharashtra",
    country: "India",
    pincode: "",
    photoUrl: "",
    status: "ACTIVE",
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Modal State for Delete
  const [deleteCandidate, setDeleteCandidate] = useState<ExecutiveMemberItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const API_URL = getApiUrl();

  const fetchExecutives = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const [resExec, resReg] = await Promise.all([
        fetch(`${API_URL}/api/executives`),
        fetch(`${API_URL}/api/register`),
      ]);

      const dataExec = await resExec.json();
      const dataReg = await resReg.json();

      if (resExec.ok && dataExec.success && Array.isArray(dataExec.data)) {
        setExecutives(dataExec.data);
      } else {
        setError(dataExec.error || "Failed to load executive members.");
      }

      if (resReg.ok && dataReg.success && Array.isArray(dataReg.data)) {
        setRegistrations(dataReg.data);
      }
    } catch (err: any) {
      console.error("Fetch executives error:", err);
      setError("Unable to connect to backend server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchExecutives();
  }, [API_URL]);

  // Unique designations for filter
  const uniqueDesignations = useMemo(() => {
    const set = new Set<string>();
    executives.forEach((e) => {
      if (e.designation) set.add(e.designation.trim());
    });
    return Array.from(set).sort();
  }, [executives]);

  const uniqueDistricts = useMemo(() => {
    const set = new Set<string>();
    executives.forEach((e) => {
      const distEng = formatDistrictInEnglish(e.district, e.city);
      if (distEng && distEng !== "-") set.add(distEng);
    });
    return Array.from(set).sort();
  }, [executives]);

  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    executives.forEach((e) => {
      if (districtFilter !== "ALL") {
        const distEng = formatDistrictInEnglish(e.district, e.city);
        if (distEng !== districtFilter) return;
      }
      const cityEng = formatCityInEnglish(e.city);
      if (cityEng && cityEng !== "-") set.add(cityEng);
    });
    return Array.from(set).sort();
  }, [executives, districtFilter]);

  // Filtered list
  const filteredExecutives = useMemo(() => {
    return executives.filter((item, index) => {
      const q = searchQuery.toLowerCase().trim();
      const desigEng = formatDesignationInEnglish(item.designation).toLowerCase();
      const cityEng = formatCityInEnglish(item.city).toLowerCase();
      const distEng = formatDistrictInEnglish(item.district, item.city).toLowerCase();

      const match = registrations.find((r) => {
        const main = r.mainMembers[0];
        if (!main) return false;
        const cleanMob = item.mobileNo.replace(/\D/g, "");
        const regMob = (main.mobileNo || "").replace(/\D/g, "");
        return (
          (cleanMob && regMob && cleanMob === regMob) ||
          (main.fullName && main.fullName.trim().toLowerCase() === item.fullName.trim().toLowerCase())
        );
      });

      const execIdx = executives.findIndex((e) => e.id === item.id);
      const seqNum = execIdx >= 0 ? execIdx + 1 : index + 1;
      const recNo = item.receiptNo || match?.receiptNo || `MPTM-EM-R${String(seqNum).padStart(3, "0")}`;
      const serNo = item.memberNo || item.seriesNo || match?.mainMembers[0]?.memberNo || `MPTM-EM-S${String(seqNum).padStart(3, "0")}`;

      const matchesSearch =
        !q ||
        item.fullName.toLowerCase().includes(q) ||
        item.designation.toLowerCase().includes(q) ||
        desigEng.includes(q) ||
        item.mobileNo.includes(q) ||
        (item.address || "").toLowerCase().includes(q) ||
        (item.gaav || "").toLowerCase().includes(q) ||
        (item.taluka || "").toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        cityEng.includes(q) ||
        item.district.toLowerCase().includes(q) ||
        distEng.includes(q) ||
        (item.state || "").toLowerCase().includes(q) ||
        (item.country || "").toLowerCase().includes(q) ||
        (item.pincode || "").toLowerCase().includes(q) ||
        recNo.toLowerCase().includes(q) ||
        serNo.toLowerCase().includes(q);

      const matchesDesignation =
        designationFilter === "ALL" ||
        item.designation.trim().toLowerCase() === designationFilter.toLowerCase();

      const matchesDistrict =
        districtFilter === "ALL" ||
        distEng === districtFilter.toLowerCase();

      const matchesCity =
        cityFilter === "ALL" ||
        formatCityInEnglish(item.city).toLowerCase() === cityFilter.toLowerCase();

      return matchesSearch && matchesDesignation && matchesDistrict && matchesCity;
    });
  }, [executives, registrations, searchQuery, designationFilter, districtFilter, cityFilter]);

  // Find matching registration for view modal
  const matchedReg = useMemo(() => {
    if (!selectedViewExec) return null;
    const cleanMob = selectedViewExec.mobileNo.replace(/\D/g, "");
    return registrations.find((r) => {
      const main = r.mainMembers[0];
      if (!main) return false;
      const regMob = (main.mobileNo || "").replace(/\D/g, "");
      return (
        (cleanMob && regMob && cleanMob === regMob) ||
        (main.fullName && main.fullName.trim().toLowerCase() === selectedViewExec.fullName.trim().toLowerCase())
      );
    }) || null;
  }, [selectedViewExec, registrations]);

  const handleSendWhatsApp = (exec: ExecutiveMemberItem, regMatch?: MemberRegistration | null) => {
    const mobile = exec.mobileNo.replace(/\D/g, "");
    const cleanPhone = mobile.length === 10 ? `91${mobile}` : mobile;
    const execIdx = executives.findIndex((e) => e.id === exec.id);
    const idx = execIdx >= 0 ? execIdx : 0;
    const receiptNo = regMatch?.receiptNo || exec.receiptNo || `MPTM-EM-R${String(idx + 1).padStart(3, "0")}`;
    const seriesNo = regMatch?.mainMembers[0]?.memberNo || exec.memberNo || exec.seriesNo || `MPTM-EM-S${String(idx + 1).padStart(3, "0")}`;
    const dateStr = regMatch ? getDatePart(regMatch) : formatDateToDDMMYYYY(exec.createdAt);
    const fee = regMatch?.registrationFee || exec.registrationFee || 1001;
    const payMethod = regMatch ? formatPaymentMethod(regMatch.paymentMethod) : (exec.paymentMethod || "Cash");

    const siteUrl = getMainSiteUrl();
    const receiptPdfUrl = `${siteUrl}/executives?receiptNo=${encodeURIComponent(receiptNo)}&id=${encodeURIComponent(exec.id)}`;

    const textMessage = `🚩 *MAHARASHTRA PRANTIK TAILIK MAHASABHA (AMRAVATI)* 🚩
★ *EXECUTIVE MEMBER REGISTRATION RECEIPT* ★

----------------------------------
📄 *Receipt No.* : ${receiptNo}
🔢 *Series No.* : ${seriesNo}
📅 *Date* : ${dateStr}
👤 *Member Name* : ${exec.fullName}
🏅 *Designation* : ${formatDesignationInEnglish(exec.designation)}
📱 *Mobile No.* : ${exec.mobileNo}
📍 *City/District* : ${formatEnglishText(exec.city)}${exec.district ? `, ${formatEnglishText(exec.district)}` : ""}
💰 *Registration Fee* : ₹${fee}/- (One Thousand One Rupees Only)
💳 *Payment Method* : ${payMethod}
✅ *Status* : Executive Registration Verified & Active
----------------------------------

🔗 *Download & Print Official Executive Receipt PDF Link:*
${receiptPdfUrl}

_This receipt serves as official proof of Executive Member Registration of Maharashtra Prantik Tailik Mahasabha (Amravati Division)._
mptmamravati.org`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, "_blank");
  };

  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  const handlePrint = () => {
    const originalTitle = document.title;
    const receiptNo = matchedReg?.receiptNo || selectedViewExec?.receiptNo || (selectedViewExec ? `MPTM-EM-${selectedViewExec.id.replace(/\D/g, "").slice(-4) || "101"}` : "");
    if (receiptNo) {
      document.title = receiptNo.trim().replace(/[/\\?%*:|"<>]/g, "-");
    }
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleDownloadPdf = async () => {
    if (!selectedViewExec) return;
    try {
      setDownloadingPdf(true);
      const receiptNo = matchedReg?.receiptNo || selectedViewExec.receiptNo || `MPTM-EM-${selectedViewExec.id.replace(/\D/g, "").slice(-4) || "101"}`;
      const safeReceiptId = receiptNo.trim().replace(/[/\\?%*:|"<>]/g, "-");
      await downloadReceiptAsPdf("printable-receipt-card", `${safeReceiptId}.pdf`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      fullName: "",
      designation: "Executive Member",
      mobileNo: "",
      address: "",
      gaav: "",
      taluka: "",
      city: "Amravati",
      district: "Amravati",
      state: "Maharashtra",
      country: "India",
      pincode: "",
      photoUrl: "",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: ExecutiveMemberItem) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      designation: member.designation,
      mobileNo: member.mobileNo,
      address: member.address || "",
      gaav: member.gaav || "",
      taluka: member.taluka || "",
      city: member.city,
      district: member.district,
      state: member.state || "Maharashtra",
      country: member.country || "India",
      pincode: member.pincode || "",
      photoUrl: member.photoUrl || "",
      status: member.status || "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.designation.trim() || !formData.mobileNo.trim()) {
      alert("Please fill in all required fields (Full Name, Designation, Mobile).");
      return;
    }

    try {
      setSaving(true);
      const isEdit = !!editingMember;
      const url = isEdit ? `${API_URL}/api/executives/${editingMember.id}` : `${API_URL}/api/executives`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(
          isEdit
            ? `Executive Member ${formData.fullName} updated successfully!`
            : `Executive Member ${formData.fullName} added successfully!`
        );
        setIsModalOpen(false);
        fetchExecutives();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to save executive member.");
      }
    } catch (err) {
      console.error("Save executive error:", err);
      alert("Server Error: Could not save executive member details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!deleteCandidate) return;
    try {
      setDeleting(true);
      const res = await fetch(`${API_URL}/api/executives/${deleteCandidate.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExecutives((prev) => prev.filter((e) => e.id !== deleteCandidate.id));
        setActionSuccess(`Executive Member ${deleteCandidate.fullName} removed.`);
        setDeleteCandidate(null);
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to delete executive member.");
      }
    } catch (err) {
      console.error("Delete executive error:", err);
      alert("Server Error: Could not delete record.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={`space-y-6 max-w-7xl mx-auto pb-10 ${selectedViewExec ? "no-print" : ""}`}>

        {/* Page Header */}
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 ${selectedViewExec ? "no-print" : ""}`}>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-indigo-600" />
              <span>Executive Members</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage committee members, designations, contact details, and executive team hierarchy
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/deleted-members"
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
              title="View Deleted Members"
            >
              <UserX className="w-4 h-4 text-red-600" />
              <span>Deleted Members</span>
            </Link>

            <Link
              href="/manage-executives/register"
              className="px-4 py-2 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-800 hover:to-amber-900 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer border border-amber-400/60"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Add Executive Member</span>
            </Link>

            <button
              onClick={fetchExecutives}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {actionSuccess && (
          <div className={`p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs animate-in fade-in ${selectedViewExec ? "no-print" : ""}`}>
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Search & Table Card */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 ${selectedViewExec ? "no-print" : ""}`}>

          {/* Filter Bar (Compact Single Row) */}
          <div className="p-3.5 border-b border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                {/* Shortened Search Box */}
                <div className="relative w-full sm:w-80 md:w-96 shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, designation, city, mobile, prabhag..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
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

                {/* Designation Filter */}
                {uniqueDesignations.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 shrink-0">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Designation:</span>
                    <select
                      value={designationFilter}
                      onChange={(e) => setDesignationFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="ALL">All ({executives.length})</option>
                      {uniqueDesignations.map((desig) => (
                        <option key={desig} value={desig}>
                          {formatDesignationInEnglish(desig)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* District Filter */}
                {uniqueDistricts.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">District:</span>
                    <select
                      value={districtFilter}
                      onChange={(e) => {
                        setDistrictFilter(e.target.value);
                        setCityFilter("ALL");
                      }}
                      className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="ALL">All Districts ({uniqueDistricts.length})</option>
                      {uniqueDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* City Filter */}
                {uniqueCities.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">City:</span>
                    <select
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="ALL">All Cities ({uniqueCities.length})</option>
                      {uniqueCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="text-xs font-normal text-slate-500 whitespace-nowrap px-3 py-1 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
                {loading ? (
                  <>Showing: <span className="inline-block w-8 h-3 bg-slate-200 animate-pulse rounded" /> Records</>
                ) : (
                  <>Showing: <span className="text-slate-800 font-semibold">{filteredExecutives.length}</span> of {executives.length} Records</>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-[#EBF1FA] text-slate-700 text-xs font-medium border-b border-slate-200 whitespace-nowrap">
                  <th className="py-2.5 px-2.5 w-8 text-center">#</th>
                  <th className="py-2.5 px-3 text-left">Date &amp; Time</th>
                  <th className="py-2.5 px-4 text-left">Member Name</th>
                  <th className="py-2.5 px-4 text-left">Receipt &amp; Series No.</th>
                  <th className="py-2.5 px-4 text-left">Designation</th>
                  <th className="py-2.5 px-4 text-left">Mobile Number</th>
                  <th className="py-2.5 px-4 text-left">Address</th>
                  <th className="py-2.5 px-4 text-left">Village / Taluka</th>
                  <th className="py-2.5 px-4 text-left">District</th>
                  <th className="py-2.5 px-4 text-left">State / Pin</th>
                  <th className="py-2.5 px-4 text-left">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
                {loading ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <tr key={`skel-exec-${idx}`} className="animate-pulse">
                      <td className="py-3 px-2.5 text-center"><div className="h-3.5 w-4 bg-slate-200 rounded mx-auto" /></td>
                      <td className="py-3 px-3">
                        <div className="h-3.5 w-20 bg-slate-200 rounded mb-1" />
                        <div className="h-2.5 w-14 bg-slate-200 rounded" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0" />
                          <div className="h-4 w-32 bg-slate-200 rounded" />
                        </div>
                      </td>
                      <td className="py-3 px-4"><div className="h-5 w-24 bg-slate-200 rounded-lg" /></td>
                      <td className="py-3 px-4"><div className="h-5 w-28 bg-slate-200 rounded-full" /></td>
                      <td className="py-3 px-4"><div className="h-3.5 w-24 bg-slate-200 rounded" /></td>
                      <td className="py-3 px-4"><div className="h-3.5 w-32 bg-slate-200 rounded" /></td>
                      <td className="py-3 px-4"><div className="h-3.5 w-24 bg-slate-200 rounded" /></td>
                      <td className="py-3 px-4"><div className="h-3.5 w-20 bg-slate-200 rounded" /></td>
                      <td className="py-3 px-4"><div className="h-3.5 w-20 bg-slate-200 rounded" /></td>
                      <td className="py-3 px-4"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-7 h-7 bg-slate-200 rounded-lg" />
                          <div className="w-7 h-7 bg-slate-200 rounded-lg" />
                          <div className="w-7 h-7 bg-slate-200 rounded-lg" />
                          <div className="w-7 h-7 bg-slate-200 rounded-lg" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-red-600 font-bold text-sm">
                      ⚠️ {error}
                    </td>
                  </tr>
                ) : filteredExecutives.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center space-y-2">
                      <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm font-bold text-slate-700">No executive members found</p>
                      <p className="text-xs text-slate-500">Click "Add Executive Member" to create new committee entries.</p>
                    </td>
                  </tr>
                ) : (
                  filteredExecutives.map((item, index) => {
                    const match = registrations.find((r) => {
                      const main = r.mainMembers[0];
                      if (!main) return false;
                      const cleanMob = item.mobileNo.replace(/\D/g, "");
                      const regMob = (main.mobileNo || "").replace(/\D/g, "");
                      return (
                        (cleanMob && regMob && cleanMob === regMob) ||
                        (main.fullName && main.fullName.trim().toLowerCase() === item.fullName.trim().toLowerCase())
                      );
                    });
                    const execIdx = executives.findIndex((e) => e.id === item.id);
                    const seqNum = execIdx >= 0 ? execIdx + 1 : index + 1;
                    const receiptNo = item.receiptNo || match?.receiptNo || `MPTM-EM-R${String(seqNum).padStart(3, "0")}`;
                    const seriesNo = item.memberNo || item.seriesNo || match?.mainMembers[0]?.memberNo || `MPTM-EM-S${String(seqNum).padStart(3, "0")}`;

                    const rawDate = match?.createdAt || item.createdAt;
                    let timeStr = "";
                    if (rawDate) {
                      try {
                        const d = new Date(rawDate);
                        if (!isNaN(d.getTime())) {
                          timeStr = d.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          }).toLowerCase();
                        }
                      } catch {}
                    }
                    const dateStr = match ? getDatePart(match) : formatDateToDDMMYYYY(item.createdAt);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">

                        {/* 1. Sr No */}
                        <td className="align-top py-2.5 px-2.5 text-center text-slate-400 whitespace-nowrap text-xs font-normal">
                          {index + 1}
                        </td>

                        {/* 2. Date & Time */}
                        <td className="align-top py-2.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col leading-tight">
                            <span className="text-slate-800 text-xs font-normal">{dateStr}</span>
                            {timeStr && (
                              <span className="text-[10px] font-normal text-slate-400 mt-0.5 leading-none">{timeStr}</span>
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="align-top py-2.5 px-4 whitespace-nowrap">
                          <span className="text-slate-800 text-xs font-normal truncate max-w-[190px] block" title={item.fullName}>
                            {item.fullName}
                          </span>
                        </td>

                        {/* Receipt & Series No. */}
                        <td className="align-top py-2.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5 text-xs">
                            <div className="w-[170px] flex items-center justify-between gap-1 leading-tight">
                              <span className="font-mono text-xs text-slate-800 font-normal truncate" title={receiptNo}>
                                {receiptNo}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(receiptNo, item.id + "-rec");
                                }}
                                className="text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer shrink-0"
                                title="Copy Receipt No"
                              >
                                {copiedId === item.id + "-rec" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="w-[170px] flex items-center justify-between gap-1 leading-tight">
                              <span className="font-mono text-[11px] text-slate-500 font-normal truncate" title={seriesNo}>
                                {seriesNo}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(seriesNo, item.id + "-ser");
                                }}
                                className="text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer shrink-0"
                                title="Copy Series No"
                              >
                                {copiedId === item.id + "-ser" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Designation */}
                        <td className="align-top py-2.5 px-4 whitespace-nowrap">
                          <span className="text-xs font-normal text-slate-700 leading-tight block">
                            {formatDesignationInEnglish(item.designation)}
                          </span>
                        </td>

                        {/* Mobile */}
                        <td className="align-top py-2.5 px-4 whitespace-nowrap">
                          <a href={`tel:${item.mobileNo}`} className="hover:underline font-mono text-xs font-normal text-slate-700">
                            {item.mobileNo}
                          </a>
                        </td>

                        {/* Address */}
                        <td className="align-top py-2.5 px-4 text-slate-700 text-xs font-normal max-w-[180px] truncate" title={item.address || "-"}>
                          {item.address || <span className="text-slate-400">-</span>}
                        </td>

                        {/* Village / Taluka */}
                        <td className="align-top py-2.5 px-4 text-slate-700 text-xs font-normal whitespace-nowrap">
                          {[item.gaav, item.taluka].filter(Boolean).join(" / ") || <span className="text-slate-400">-</span>}
                        </td>

                        {/* District */}
                        <td className="align-top py-2.5 px-4 text-slate-700 text-xs font-normal whitespace-nowrap">
                          {formatDistrictInEnglish(item.district, item.city)}
                        </td>

                        {/* State & Pincode */}
                        <td className="align-top py-2.5 px-4 text-slate-700 text-xs font-normal whitespace-nowrap">
                          {[item.state, item.pincode].filter(Boolean).join(" - ") || <span className="text-slate-400">-</span>}
                        </td>

                        {/* Status */}
                        <td className="align-top py-2.5 px-4 whitespace-nowrap">
                          <span className="text-xs font-normal text-emerald-600 leading-tight block">
                            {item.status || "Active"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="align-top py-2.5 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedViewExec(item)}
                              title="View Executive Receipt"
                              className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-amber-800" />
                            </button>

                            <button
                              onClick={() => handleSendWhatsApp(item, match)}
                              title="Send WhatsApp"
                              className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                            >
                              <WhatsappIcon className="w-4 h-4 text-emerald-600" />
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit"
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeleteCandidate(item)}
                              title="Delete"
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 transition flex items-center justify-center cursor-pointer"
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

        </div>

      </div>

      {/* MODAL 1: Add / Edit Member */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <span>{editingMember ? "Edit Executive Member" : "Add Executive Member"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs font-bold text-slate-700">

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block">
                  Full Name <span className="text-red-600">*</span> :
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="e.g. Rajas Balkrishna Gulwade"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Designation */}
              <div className="space-y-1">
                <label className="block">
                  Designation <span className="text-red-600">*</span> :
                </label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="Executive Member">Executive Member</option>
                  <option value="Regional President">Regional President</option>
                  <option value="Vice President">Vice President</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Joint Secretary">Joint Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Advisor">Advisor</option>
                </select>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="block">
                  Mobile Number <span className="text-red-600">*</span> :
                </label>
                <input
                  type="tel"
                  value={formData.mobileNo}
                  onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  required
                  maxLength={10}
                  placeholder="10 digit mobile number"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="block">Address:</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 text-xs resize-none"
                />
              </div>

              {/* Gaav & Taluka */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block">Village / Gaav:</label>
                  <input
                    type="text"
                    value={formData.gaav}
                    onChange={(e) => setFormData({ ...formData, gaav: e.target.value })}
                    placeholder="Village name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">Taluka:</label>
                  <input
                    type="text"
                    value={formData.taluka}
                    onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                    placeholder="Taluka name"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* District */}
              <div className="space-y-1">
                <label className="block">District:</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Amravati"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600"
                />
              </div>

              {/* State, Country & Pincode */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block">State:</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">Country:</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Country"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">Pincode:</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="Pincode"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block">Status:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : editingMember ? "Update Member" : "Save Member"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Member Confirmation */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-lg">
                Delete Executive Member?
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                <span className="font-bold text-slate-900">{deleteCandidate.fullName}</span> ({formatDesignationInEnglish(deleteCandidate.designation)}) will be permanently removed from the committee list.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMember}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: View Executive Details & Official Receipt */}
      {selectedViewExec && (() => {
        const match = matchedReg;
        const execIdx = executives.findIndex((e) => e.id === selectedViewExec.id);
        const idx = execIdx >= 0 ? execIdx : 0;
        const receiptNo = selectedViewExec.receiptNo || match?.receiptNo || `MPTM-EM-R${String(idx + 1).padStart(3, "0")}`;
        const seriesNo = selectedViewExec.memberNo || selectedViewExec.seriesNo || match?.mainMembers[0]?.memberNo || `MPTM-EM-S${String(idx + 1).padStart(3, "0")}`;
        const dateStr = match ? getDatePart(match) : formatDateToDDMMYYYY(selectedViewExec.createdAt);
        const fee = match?.registrationFee || selectedViewExec.registrationFee || "1001";

        return (
          <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border-2 border-amber-800/40 animate-in fade-in zoom-in-95 duration-200 my-auto font-sans">

              {/* Modal Top Header */}
              <div className="bg-gradient-to-r from-[#3A0202] via-[#7A0C0C] to-[#3A0202] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400 no-print">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center border border-amber-400/40 text-amber-300 text-lg font-bold">
                    🚩
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-amber-200 tracking-wide drop-shadow-md">
                      Maharashtra Prantik Tailik Mahasabha (Amravati)
                    </h3>
                    <p className="text-xs text-amber-300 font-bold flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>Receipt: <span className="font-mono text-amber-100 font-bold">{receiptNo}</span></span>
                      <span>•</span>
                      <span>Series: <span className="font-mono text-amber-100 font-bold">{seriesNo}</span></span>
                      <span>•</span>
                      <span>Date: <span className="text-amber-100">{dateStr}</span></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendWhatsApp(selectedViewExec, match)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    title="Send Receipt to WhatsApp"
                  >
                    <WhatsappIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-50"
                    title="Download Receipt PDF file"
                  >
                    <Download className={`w-4 h-4 ${downloadingPdf ? "animate-bounce" : ""}`} />
                    <span>{downloadingPdf ? "Downloading..." : "Download PDF"}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print Receipt</span>
                  </button>

                  <button
                    onClick={() => setSelectedViewExec(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body Printable Official Receipt */}
                            {/* Modal Body Printable Official Receipt */}
              <div
                id="printable-receipt-card"
                style={{ fontFamily: "'Baloo 2', 'Tiro Devanagari Marathi', 'Noto Sans Devanagari', system-ui, sans-serif" }}
                className="p-5 sm:p-7 space-y-4 text-stone-900 text-xs sm:text-sm bg-white"
              >
                {/* 1. Header Title Banner */}
                <div className="bg-gradient-to-r from-[#3A0202] via-[#7A0C0C] to-[#3A0202] text-white py-3 px-3 sm:px-6 relative flex items-center justify-between border-b-2 border-amber-400 rounded-xl shadow-xs">
                  <div className="hidden sm:flex items-center gap-1 text-amber-400 text-lg font-bold">
                    <span>❖</span>
                    <span className="w-6 h-[2px] bg-amber-400"></span>
                  </div>

                  <div className="text-center mx-auto space-y-0.5">
                    <p className="text-[11px] sm:text-sm font-bold text-amber-400">❖ जय संताजी ❖</p>
                    <h2 className="text-base sm:text-2xl font-black text-amber-200 drop-shadow-md leading-tight">
                      महाराष्ट्र प्रांतिक तैलिक महासभा
                    </h2>
                    <p className="text-[11px] sm:text-sm text-sky-200 font-bold">अमरावती विभाग, अमरावती.</p>
                    <div className="inline-block mt-1">
                      <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-100 font-extrabold text-[10px] sm:text-sm px-3 sm:px-4 py-0.5 rounded-full border border-amber-400 shadow-xs">
                        ★ कार्यकारिणी सदस्य नोंदणी पावती ★
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-amber-400 text-lg font-bold">
                    <span className="w-6 h-[2px] bg-amber-400"></span>
                    <span>❖</span>
                  </div>
                </div>

                {/* 2. Top Meta Row: पावती क्र. | दिनांक | नोंदणी शुल्क */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3 rounded-xl bg-amber-50/70 border border-amber-300">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-stone-600 text-xs sm:text-sm whitespace-nowrap">पावती क्र. :</span>
                    <span className="font-mono font-black text-stone-900 text-sm sm:text-base">{receiptNo}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-stone-600 text-xs sm:text-sm whitespace-nowrap">दिनांक :</span>
                    <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm">{dateStr}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-stone-600 text-xs sm:text-sm whitespace-nowrap">नोंदणी शुल्क :</span>
                    <span className="font-mono font-black text-[#7A0C0C] text-sm sm:text-base">
                      ₹{fee}/-
                    </span>
                  </div>
                </div>

                {/* 3. EXECUTIVE MEMBER & ADDRESS CONTAINER BOX (Form Style without underlines) */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between border-b border-amber-300 pb-1.5">
                    <h3 className="text-sm sm:text-base font-extrabold text-amber-950 flex items-center gap-2">
                      <span>👤 कार्यकारिणी सदस्य माहिती</span>
                    </h3>
                  </div>

                  <div className="p-3.5 sm:p-4 rounded-xl bg-white border-2 border-amber-700/30 shadow-xs space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 border-b border-stone-200 pb-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#7A0C0C] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          1
                        </span>
                        <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                          सदस्य माहिती
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:text-sm">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-stone-600 whitespace-nowrap">सदस्य मालिका / क्र. :</span>
                          <span className="font-mono font-black text-[#7A0C0C] text-sm">
                            {seriesNo}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-stone-600 whitespace-nowrap">पद / हुद्दा :</span>
                          <span className="font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                            {selectedViewExec.designation || "-"}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-stone-600 whitespace-nowrap">सदस्याचे पूर्णनाव :</span>
                          <span className="font-extrabold text-stone-950 text-sm sm:text-base">
                            {selectedViewExec.fullName}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-stone-600 whitespace-nowrap">मोबाईल क्रमांक :</span>
                          <span className="font-mono font-bold text-stone-900">
                            {selectedViewExec.mobileNo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Address & Location (No underlines) */}
                    <div className="space-y-2.5 pt-3 border-t-2 border-amber-200 text-xs sm:text-sm">
                      {matchedReg?.address && (
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-stone-600 whitespace-nowrap">पत्ता :</span>
                          <span className="font-semibold text-stone-900 leading-relaxed">
                            {matchedReg.address}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-stone-600 whitespace-nowrap">शहर / गाव :</span>
                          <span className="font-semibold text-stone-900">
                            {selectedViewExec.city || matchedReg?.city || matchedReg?.gaav || "-"}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-stone-600 whitespace-nowrap">जिल्हा :</span>
                          <span className="font-semibold text-stone-900">
                            {selectedViewExec.district || matchedReg?.district || "अमरावती"}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-stone-600 whitespace-nowrap">राज्य :</span>
                          <span className="font-semibold text-stone-900">
                            {matchedReg?.state || "महाराष्ट्र"}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-stone-600 whitespace-nowrap">पिनकोड :</span>
                          <span className="font-mono font-bold text-stone-900">
                            {matchedReg?.pincode || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Family Members (if present in matchedReg) */}
                {matchedReg?.familyMembers && matchedReg.familyMembers.length > 0 && (
                  <div className="my-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-center gap-2 my-2">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3A0202] via-[#7A0C0C] to-[#3A0202] text-amber-300 py-1 px-4 sm:px-5 rounded-full border-2 border-amber-400/80 shadow-md">
                        <span className="text-amber-400 text-xs font-bold">❖</span>
                        <h3 className="text-xs sm:text-sm font-extrabold tracking-wide text-amber-200 whitespace-nowrap">
                          कौटुंबिक सदस्यांची माहिती
                        </h3>
                        <span className="text-amber-400 text-xs font-bold">❖</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border-2 border-amber-700/40 shadow-xs">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#6B0D0D] text-white font-bold text-center border-b border-amber-600">
                            <th className="py-1.5 px-2 border-r border-amber-700/60 w-12">अ. क्र.</th>
                            <th className="py-1.5 px-3 border-r border-amber-700/60">नाव</th>
                            <th className="py-1.5 px-3 border-r border-amber-700/60">नाते</th>
                            <th className="py-1.5 px-3 border-r border-amber-700/60">जन्म दिनांक</th>
                            <th className="py-1.5 px-3 border-r border-amber-700/60">व्यवसाय / शिक्षण</th>
                            <th className="py-1.5 px-3">मोबाईल क्रमांक</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-800/30 text-stone-900 bg-white">
                          {matchedReg.familyMembers.map((fm: any, i: number) => (
                            <tr key={fm.id || i} className="hover:bg-amber-50/50">
                              <td className="py-1.5 px-2 text-center font-bold text-stone-800 border-r border-amber-800/30">
                                {fm.srNo || i + 1}.
                              </td>
                              <td className="py-1.5 px-3 font-bold border-r border-amber-800/30">{fm.name}</td>
                              <td className="py-1.5 px-3 border-r border-amber-800/30">{fm.relation}</td>
                              <td className="py-1.5 px-3 border-r border-amber-800/30 font-mono">{formatDateToDDMMYYYY(fm.dob) || fm.dob || "-"}</td>
                              <td className="py-1.5 px-3 border-r border-amber-800/30">{fm.occupation || "-"}</td>
                              <td className="py-1.5 px-3 font-mono">{fm.mobile || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. Amount in Words */}
                <div className="flex items-baseline gap-2 pt-1 text-xs sm:text-sm">
                  <span className="font-bold text-stone-700 whitespace-nowrap">रक्कम अक्षरी :</span>
                  <span className="font-extrabold text-[#7A0C0C] text-sm">
                    {matchedReg?.amountInWords || convertNumberToMarathiWords(fee)}
                  </span>
                </div>

                {/* 6. PAYMENT DETAILS BOX AT BOTTOM (As currently doing) */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-50/90 via-amber-100/40 to-amber-50/90 border-2 border-amber-400/80 space-y-2.5 text-xs sm:text-sm shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-stone-800 text-xs sm:text-sm">भरणा केलेली एकूण रक्कम :</span>
                      <span className="font-mono text-xl sm:text-2xl font-black text-[#7A0C0C]">₹{fee}/-</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-900 font-extrabold text-xs">
                      <span>✓</span>
                      <span>पेमेंट पुष्टी (Payment Confirmed)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 text-xs">
                    <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                      <span className="font-bold text-stone-600 shrink-0">पेमेंट पद्धत : </span>
                      <span className="font-bold text-stone-900">
                        {matchedReg ? formatPaymentMethod(matchedReg.paymentMethod) : formatPaymentMethod(selectedViewExec.paymentMethod || "Cash")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                      <span className="font-bold text-stone-600 shrink-0">व्यवहार संदर्भ : </span>
                      <span className="font-mono font-bold text-stone-900 text-[11px] sm:text-xs truncate">
                        {(matchedReg as any)?.paymentTransactionId || matchedReg?.paymentReference || "Direct / Admin"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0 sm:justify-end">
                      <span className="font-bold text-stone-600 shrink-0">पावती दिनांक : </span>
                      <span className="font-mono font-bold text-stone-900">{dateStr}</span>
                    </div>
                  </div>

                  {/* Payment Screenshot Proof in Admin preview */}
                  {(matchedReg?.paymentScreenshot || selectedViewExec.paymentScreenshot) && (
                    <div className="pt-2 border-t border-amber-300 flex items-center justify-between no-print">
                      <span className="font-bold text-stone-700 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>पेमेंट स्क्रीनशॉट पुरावा :</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setScreenshotZoom(matchedReg?.paymentScreenshot || selectedViewExec.paymentScreenshot || null)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>स्क्रीनशॉट पहा (View Screenshot)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 7. Declaration / Sandesh Box */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border-l-4 border-l-[#7A0C0C] border border-amber-200/80 text-stone-900 shadow-2xs">
                  <p className="text-xs font-extrabold text-[#7A0C0C] flex items-start gap-1.5">
                    <span className="whitespace-nowrap">संदेश :</span>
                    <span className="text-stone-800 font-medium leading-relaxed">
                      वरील रक्कम महाराष्ट्र प्रांतिक तैलिक महासभेच्या कार्यकारिणी सदस्य नोंदणी शुल्क म्हणून प्राप्त झाली.
                    </span>
                  </p>
                </div>

                {/* 8. AUTHORIZATION: QR CODE + OFFICIAL SEAL + SIGNATURE BLOCK */}
                <div className="pt-3 border-t-2 border-amber-300/80 grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
                  {/* Left: QR Code Verification */}
                  <div className="flex items-center gap-2.5">
                    {(() => {
                      const token = matchedReg?.publicToken || selectedViewExec.receiptNo || receiptNo;
                      const mainUrl = getMainSiteUrl() || "https://mptm.org";
                      const qrData = matchedReg?.publicToken ? `${mainUrl}/receipt/${matchedReg.publicToken}?scan=1` : `${mainUrl}/receipt/${receiptNo}?scan=1`;
                      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrData)}`;
                      return (
                        <>
                          <div className="p-1 bg-white border border-amber-400 rounded-xl shadow-2xs shrink-0 text-center">
                            <img src={qrUrl} alt="Receipt QR" className="w-18 h-18 sm:w-20 sm:h-20 object-contain mx-auto" />
                            <span className="text-[8px] font-bold text-stone-600 block leading-tight mt-0.5">
                              स्कॅन व पडताळा
                            </span>
                          </div>
                          <div className="space-y-0.5 text-stone-700 text-left">
                            <p className="font-bold text-[11px] text-[#7A0C0C] flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>डिजिटल सत्यता हमी</span>
                            </p>
                            <p className="text-[9.5px] text-stone-500 leading-tight">
                              मोबाईलने स्कॅन करून पावतीची थेट पोर्टलवर सत्यता तपासा.
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Center: Official Seal (मुद्रा / शिक्का with Navbar Logo) */}
                  <div className="flex justify-center">
                    <OfficialSeal />
                  </div>

                  {/* Right: Signature & Approval Block */}
                  <div className="flex flex-col items-center sm:items-end justify-center text-center sm:text-right space-y-1">
                    <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Digitally Certified & Approved</span>
                    </div>
                    
                  </div>
                </div>

                {/* 9. Clean Footer Note */}
                <div className="pt-2 border-t border-amber-200 text-center">
                  <p className="text-[10px] text-stone-600 font-semibold">
                    ही पावती संगणकीय प्रणालीद्वारे तयार करण्यात आलेली अधिकृत डिजिटल पावती आहे. (Computer-Generated Official Receipt)
                  </p>
                </div>
              </div>
            </div>
          </div>
      ); })()}

      {/* ZOOMED PAYMENT SCREENSHOT MODAL */}
      {screenshotZoom && (
        <div
          onClick={() => setScreenshotZoom(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200 no-print"
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
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center font-bold hover:bg-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
