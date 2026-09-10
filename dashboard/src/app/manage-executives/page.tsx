"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { ExecutiveMemberItem } from "@/types";
import { getApiUrl } from "@/utils/config";
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
} from "lucide-react";

export default function ManageExecutivesPage() {
  const [executives, setExecutives] = useState<ExecutiveMemberItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [designationFilter, setDesignationFilter] = useState<string>("ALL");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<ExecutiveMemberItem | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    designation: "कार्यकारिणी सदस्य",
    mobileNo: "",
    city: "अमरावती",
    district: "अमरावती",
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
      const res = await fetch(`${API_URL}/api/executives`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setExecutives(data.data);
      } else {
        setError(data.error || "Failed to load executive members.");
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
      const matchesSearch =
        !q ||
        item.fullName.toLowerCase().includes(q) ||
        item.designation.toLowerCase().includes(q) ||
        item.mobileNo.includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q);

      const matchesDesignation =
        designationFilter === "ALL" ||
        item.designation.trim().toLowerCase() === designationFilter.toLowerCase();

      return matchesSearch && matchesDesignation;
    });
  }, [executives, searchQuery, designationFilter]);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      fullName: "",
      designation: "कार्यकारिणी सदस्य",
      mobileNo: "",
      city: "अमरावती",
      district: "अमरावती",
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
              <span>Executive Members (कार्यकारिणी)</span>
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
                        {desig}
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
                  <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Designation (पदभार)</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">City / District</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
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
                          <span>{item.designation}</span>
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
                          <span>{item.city}{item.district ? `, ${item.district}` : ""}</span>
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
                        <div className="flex items-center justify-center gap-1">
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
                <span>{editingMember ? "Edit Executive Member" : "Add Executive Member (कार्यकारिणी सदस्य)"}</span>
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
                  Full Name (पूर्ण नाव) <span className="text-red-600">*</span> :
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="उदा. राजस बाळकृष्ण गुळवाडे"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Designation */}
              <div className="space-y-1">
                <label className="block">
                  Designation (पदनाम) <span className="text-red-600">*</span> :
                </label>
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="विभागीय अध्यक्ष">विभागीय अध्यक्ष (Regional President)</option>
                  <option value="विभागीय उपाध्यक्ष">विभागीय उपाध्यक्ष (Vice President)</option>
                  <option value="विभागीय सचिव">विभागीय सचिव (Secretary)</option>
                  <option value="विभागीय सहसचिव">विभागीय सहसचिव (Joint Secretary)</option>
                  <option value="कोषाध्यक्ष">कोषाध्यक्ष (Treasurer)</option>
                  <option value="संघटक">संघटक (Organizer)</option>
                  <option value="कार्यकारिणी सदस्य">कार्यकारिणी सदस्य (Executive Member)</option>
                  <option value="सल्लागार">सल्लागार (Advisor)</option>
                </select>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="block">
                  Mobile Number (मोबाईल क्र.) <span className="text-red-600">*</span> :
                </label>
                <input
                  type="tel"
                  value={formData.mobileNo}
                  onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  required
                  maxLength={10}
                  placeholder="१० अंकी मोबाईल नंबर"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono"
                />
              </div>

              {/* City & District */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block">City / Town (शहर/गाव):</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="उदा. अमरावती"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">District (जिल्हा):</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="उदा. अमरावती"
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
                  <option value="ACTIVE">ACTIVE (सक्रिय)</option>
                  <option value="INACTIVE">INACTIVE (निष्क्रिय)</option>
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
                <span className="font-bold text-slate-900">{deleteCandidate.fullName}</span> ({deleteCandidate.designation}) will be permanently removed from the committee list.
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

    </DashboardLayout>
  );
}
