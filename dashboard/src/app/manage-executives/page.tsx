"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import { ExecutiveMemberItem, MemberRegistration } from "@/types";
import { getApiUrl } from "@/utils/config";
import { formatDateToDDMMYYYY, getDatePart, formatPaymentMethod } from "@/utils/formatters";
import {
  UserCheck,
  Search,
  RefreshCw,
  Trash2,
  Edit,
  Plus,
  X,
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
  const trimmed = text.trim();
  if (trimmed === "अमरावती") return "Amravati";
  return trimmed;
}

function convertNumberToEnglishWords(amountStr: string | number): string {
  const num = typeof amountStr === "number" ? amountStr : parseInt(String(amountStr), 10);
  if (isNaN(num) || num <= 0) return "Zero Rupees Only";
  if (num === 1001) return "One Thousand One Rupees Only";
  if (num === 101) return "One Hundred One Rupees Only";
  return `${num} Rupees Only`;
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
    city: "Amravati",
    district: "Amravati",
    photoUrl: "",
    status: "ACTIVE",
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

  // Filtered list
  const filteredExecutives = useMemo(() => {
    return executives.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const desigEng = formatDesignationInEnglish(item.designation).toLowerCase();
      const cityEng = formatEnglishText(item.city).toLowerCase();
      const distEng = formatEnglishText(item.district).toLowerCase();

      const matchesSearch =
        !q ||
        item.fullName.toLowerCase().includes(q) ||
        item.designation.toLowerCase().includes(q) ||
        desigEng.includes(q) ||
        item.mobileNo.includes(q) ||
        item.city.toLowerCase().includes(q) ||
        cityEng.includes(q) ||
        item.district.toLowerCase().includes(q) ||
        distEng.includes(q);

      const matchesDesignation =
        designationFilter === "ALL" ||
        item.designation.trim().toLowerCase() === designationFilter.toLowerCase();

      return matchesSearch && matchesDesignation;
    });
  }, [executives, searchQuery, designationFilter]);

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
    const receiptNo = regMatch?.receiptNo || exec.receiptNo || `MPTM-EM-${exec.id.replace(/\D/g, "").slice(-4) || "101"}`;
    const dateStr = regMatch ? getDatePart(regMatch) : formatDateToDDMMYYYY(exec.createdAt);
    const fee = regMatch?.registrationFee || exec.registrationFee || 1001;
    const payMethod = regMatch ? formatPaymentMethod(regMatch.paymentMethod) : (exec.paymentMethod || "Cash");

    const textMessage = `🚩 *Maharashtra Prantik Tailik Mahasabha (Amravati)* 🚩
★ *Executive Member Registration Receipt* ★

----------------------------------
📄 *Receipt No.* : ${receiptNo}
📅 *Date* : ${dateStr}
👤 *Member Name* : ${exec.fullName}
🏅 *Designation* : ${formatDesignationInEnglish(exec.designation)}
📱 *Mobile No.* : ${exec.mobileNo}
📍 *City/District* : ${formatEnglishText(exec.city)}${exec.district ? `, ${formatEnglishText(exec.district)}` : ""}
💰 *Registration Fee* : ₹${fee}/- (One Thousand One Rupees Only)
💳 *Payment Method* : ${payMethod}
✅ *Status* : Payment Verified
----------------------------------

Message: The above amount was received as registration fee for Executive Member of Maharashtra Prantik Tailik Mahasabha.

_This receipt serves as official proof of member registration._
mptmamravati.org`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      fullName: "",
      designation: "Executive Member",
      mobileNo: "",
      city: "Amravati",
      district: "Amravati",
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
      city: member.city,
      district: member.district,
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
      <div className="space-y-6 max-w-7xl mx-auto pb-10">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
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
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Search & Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">

          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, designation, city, mobile..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {uniqueDesignations.length > 0 && (
                <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Designation:</span>
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

              <div className="text-xs font-bold text-slate-500 whitespace-nowrap">
                Showing: <span className="text-slate-900 font-extrabold">{filteredExecutives.length}</span> of {executives.length}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">Loading executive members...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-600 font-bold text-sm">
                ⚠️ {error}
              </div>
            ) : filteredExecutives.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No executive members found</p>
                <p className="text-xs text-slate-500">Click "Add Executive Member" to create new committee entries.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-[#DCE6FA] text-slate-800 text-xs font-bold border-b border-slate-300">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">City / District</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
                  {filteredExecutives.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">

                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200">
                            {item.fullName.charAt(0).toUpperCase()}
                          </div>
                          <span>{item.fullName}</span>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                          <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{formatDesignationInEnglish(item.designation)}</span>
                        </span>
                      </td>

                      {/* Mobile */}
                      <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a href={`tel:${item.mobileNo}`} className="hover:underline font-mono">
                            {item.mobileNo}
                          </a>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatEnglishText(item.city)}{item.district ? `, ${formatEnglishText(item.district)}` : ""}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${item.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}>
                          ● {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedViewExec(item)}
                            title="View Detailed Receipt & Payment Proof"
                            className="p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const match = registrations.find((r) => r.mainMembers[0]?.mobileNo?.replace(/\D/g, "") === item.mobileNo.replace(/\D/g, ""));
                              handleSendWhatsApp(item, match);
                            }}
                            title="Send Receipt on WhatsApp"
                            className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Member"
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(item)}
                            title="Delete Member"
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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

              {/* City & District */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block">City / Town:</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Amravati"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600"
                  />
                </div>
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
      {selectedViewExec && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
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
                  <p className="text-xs text-amber-300 font-bold">
                    Receipt No: <span className="font-mono text-amber-100 font-bold">{matchedReg?.receiptNo || selectedViewExec.receiptNo || `MPTM-EM-${selectedViewExec.id.replace(/\D/g, "").slice(-4) || "101"}`}</span> | Date: <span className="text-amber-100">{matchedReg ? getDatePart(matchedReg) : formatDateToDDMMYYYY(selectedViewExec.createdAt)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendWhatsApp(selectedViewExec, matchedReg)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  title="Send Receipt to WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-amber-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
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
            <div id="printable-receipt-card" className="p-4 sm:p-6 space-y-4 text-stone-900 text-xs sm:text-sm">

              {/* Header Title Banner */}
              <div className="bg-gradient-to-r from-[#3A0202] via-[#7A0C0C] to-[#3A0202] text-white py-3 px-4 text-center rounded-xl border-b-2 border-amber-400 shadow-xs">
                <p className="text-xs font-bold text-amber-400">❖ Jai Santaji ❖</p>
                <h2 className="text-base sm:text-2xl font-black text-amber-200 tracking-wide">
                  Maharashtra Prantik Tailik Mahasabha
                </h2>
                <p className="text-xs text-sky-200 font-bold">Amravati Division, Amravati.</p>
                <div className="inline-block mt-1">
                  <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-100 font-extrabold text-xs px-4 py-0.5 rounded-full border border-amber-400 shadow-xs">
                    ★ Executive Member Registration Receipt
                  </span>
                </div>
              </div>

              {/* Top Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-300">
                <div>
                  <span className="font-bold text-stone-700 text-xs">Receipt No. : </span>
                  <span className="font-mono font-black text-stone-900 text-sm">
                    {matchedReg?.receiptNo || selectedViewExec.receiptNo || `MPTM-EM-${selectedViewExec.id.replace(/\D/g, "").slice(-4) || "101"}`}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-stone-700 text-xs">Date : </span>
                  <span className="font-bold text-stone-900 text-xs">
                    {matchedReg ? getDatePart(matchedReg) : formatDateToDDMMYYYY(selectedViewExec.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-stone-700 text-xs">Registration Fee : </span>
                  <span className="font-black text-[#7A0C0C] text-sm">
                    ₹{matchedReg?.registrationFee || selectedViewExec.registrationFee || "1001"}
                  </span>
                </div>
              </div>

              {/* Member Details */}
              <div className="p-4 rounded-xl bg-white border border-amber-300 space-y-3">
                <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider border-b border-amber-300 pb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-800" />
                  <span>Executive Member Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-stone-600">Full Name : </span>
                    <span className="font-black text-stone-900 text-sm">{selectedViewExec.fullName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-600">Designation : </span>
                    <span className="font-extrabold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full inline-block">
                      {formatDesignationInEnglish(selectedViewExec.designation)}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-600">Mobile Number : </span>
                    <a href={`tel:${selectedViewExec.mobileNo}`} className="font-mono font-bold text-stone-900 hover:underline">
                      {selectedViewExec.mobileNo}
                    </a>
                  </div>
                  <div>
                    <span className="font-bold text-stone-600">City / District : </span>
                    <span className="font-bold text-stone-900">
                      {formatEnglishText(selectedViewExec.city)}{selectedViewExec.district ? `, ${formatEnglishText(selectedViewExec.district)}` : ""}
                    </span>
                  </div>
                  {matchedReg?.address && (
                    <div className="sm:col-span-2">
                      <span className="font-bold text-stone-600">Full Address : </span>
                      <span className="font-semibold text-stone-900">{matchedReg.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount in Words */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-300 text-xs">
                <span className="font-bold text-stone-800">Amount in Words : </span>
                <span className="font-extrabold text-[#7A0C0C]">
                  {matchedReg?.amountInWords || convertNumberToEnglishWords(matchedReg?.registrationFee || selectedViewExec.registrationFee || 1001)}
                </span>
              </div>

              {/* Payment Details & Proof Section */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 pb-2">
                  <div>
                    <span className="font-bold text-stone-800">Payment Method : </span>
                    <span className="font-extrabold text-stone-900">
                      {matchedReg ? formatPaymentMethod(matchedReg.paymentMethod) : (selectedViewExec.paymentMethod || "Cash")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-full">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">✓</span>
                    <span>Amount Rs. {matchedReg?.registrationFee || selectedViewExec.registrationFee || "1001"} Received (Payment Verified)</span>
                  </div>
                </div>

                {/* Proof of Payment Screenshot Thumbnail */}
                {(matchedReg?.paymentScreenshot || selectedViewExec.paymentScreenshot) ? (
                  <div className="space-y-1.5 pt-1">
                    <span className="font-bold text-stone-800 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      <span>Proof of Payment :</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => setScreenshotZoom(matchedReg?.paymentScreenshot || selectedViewExec.paymentScreenshot || null)}
                        className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-indigo-400 shadow-sm cursor-zoom-in group hover:opacity-90 transition"
                      >
                        <Image
                          src={matchedReg?.paymentScreenshot || selectedViewExec.paymentScreenshot || ""}
                          alt="Payment Screenshot"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition flex items-center justify-center text-white text-[10px] font-bold">
                          Click Zoom
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setScreenshotZoom(matchedReg?.paymentScreenshot || selectedViewExec.paymentScreenshot || null)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Screenshot</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-600 italic text-[11px] flex items-center gap-1 pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Payment Method: Cash - Registration and fee collected directly by Admin.</span>
                  </div>
                )}
              </div>

              {/* Sandesh Declaration Box */}
              <div className="p-3.5 rounded-xl bg-amber-100/90 border-2 border-amber-400 text-stone-900">
                <p className="text-xs sm:text-sm font-extrabold text-[#7A0C0C] flex items-start gap-1.5">
                  <span className="whitespace-nowrap">Message :</span>
                  <span className="text-stone-900 font-bold">
                    The above amount was received as registration fee for Executive Member of Maharashtra Prantik Tailik Mahasabha.
                  </span>
                </p>
              </div>

              {/* Footer Signature Block */}
              <div className="pt-6 border-t border-amber-300 flex items-end justify-between text-xs">
                <div className="text-stone-600 font-semibold italic">
                  This receipt should be preserved as official proof of member registration.
                </div>
                <div className="text-center space-y-1">
                  <div className="w-36 h-8 border-b-2 border-stone-800 border-dashed mx-auto"></div>
                  <p className="font-extrabold text-[#7A0C0C]">Issuer Signature / Stamp</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

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
