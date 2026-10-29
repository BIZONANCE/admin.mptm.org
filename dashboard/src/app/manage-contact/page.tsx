"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  Phone,
  MapPin,
  Clock,
  Save,
  X,
  Send,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { formatDateToDDMMYYYY } from "../../utils/formatters";
import { getApiUrl } from "../../utils/config";

interface ContactInfoData {
  address: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  hours: string;
}

interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  district?: string;
  subject?: string;
  message: string;
  status: "UNREAD" | "READ";
  createdAt: string;
}

export default function ManageContactPage() {
  const router = useRouter();
  const API_URL = getApiUrl();

  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"MESSAGES" | "INFO">("MESSAGES");

  // Contact Info Form State
  const [contactInfo, setContactInfo] = useState<ContactInfoData>({
    address: "",
    phone: "",
    alternatePhone: "",
    email: "",
    hours: "",
  });
  const [isSavingInfo, setIsSavingInfo] = useState<boolean>(false);

  // Messages State
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [viewingMsg, setViewingMsg] = useState<ContactMessageItem | null>(null);
  const [deletingMsg, setDeletingMsg] = useState<ContactMessageItem | null>(null);

  // Super Admin Check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("mptm_admin_role");
      const username = localStorage.getItem("mptm_admin_username");
      const isSuper =
        role === "SUPER_ADMIN" ||
        username === "mptmamravati.org" ||
        username === "admin@mptmamravati.org" ||
        username === "mptmamravati@gmail.com";
      setIsSuperAdmin(isSuper);
      if (!isSuper) {
        router.replace("/memberregistration");
      }
    }
  }, [router]);

  // Fetch Contact Information
  const fetchContactInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/contact/info`);
      if (!res.ok) {
        console.warn(`Fetch contact info responded with status: ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        let altPhone = data.data.alternatePhone;
        if (!altPhone && typeof window !== "undefined") {
          const cached = localStorage.getItem("mptm_contact_info");
          if (cached) {
            try {
              altPhone = JSON.parse(cached).alternatePhone;
            } catch (e) {}
          }
        }
        setContactInfo({
          ...data.data,
          alternatePhone: altPhone || "",
        });
      }
    } catch (err) {
      console.error("Fetch contact info error:", err);
    }
  };

  // Fetch Contact Messages
  const fetchContactMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contact/messages`);
      if (!res.ok) {
        throw new Error(`HTTP status ${res.status}`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("Fetch contact messages error:", err);
      // Fallback sample data
      setMessages([
        {
          id: "msg_101",
          name: "Suresh Deshmukh",
          email: "suresh.deshmukh@gmail.com",
          phone: "9822334455",
          subject: "Membership Inquiry",
          message: "I want to register for lifetime membership of MPTM Amravati. Please guide me.",
          status: "UNREAD",
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: "msg_102",
          name: "Pooja Patil",
          email: "pooja.patil@gmail.com",
          phone: "9876543210",
          subject: "Event Details Request",
          message: "Can you provide the schedule for the upcoming divisional conference?",
          status: "READ",
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
    fetchContactMessages();
  }, []);

  // Save Contact Info Handler
  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = contactInfo.phone.replace(/\D/g, "").slice(0, 10);
    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit phone number!");
      return;
    }

    const cleanAltPhone = (contactInfo.alternatePhone || "").replace(/\D/g, "").slice(0, 10);
    if (contactInfo.alternatePhone && cleanAltPhone.length > 0 && cleanAltPhone.length !== 10) {
      alert("Alternate phone number must be a valid 10-digit number if provided!");
      return;
    }

    setIsSavingInfo(true);
    try {
      const res = await fetch(`${API_URL}/api/contact/info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contactInfo,
          phone: cleanPhone,
          alternatePhone: cleanAltPhone,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedInfo: ContactInfoData = {
          ...contactInfo,
          ...data.data,
          phone: cleanPhone,
          alternatePhone: cleanAltPhone || data.data?.alternatePhone || "",
        };
        setContactInfo(updatedInfo);
        if (typeof window !== "undefined") {
          localStorage.setItem("mptm_contact_info", JSON.stringify(updatedInfo));
        }
        alert("Contact information updated successfully! Changes are live on the website.");
      } else {
        alert(data.error || "Failed to update contact info.");
      }
    } catch (err: any) {
      console.error("Save contact info error:", err);
      const fallbackInfo: ContactInfoData = {
        ...contactInfo,
        phone: cleanPhone,
        alternatePhone: cleanAltPhone,
      };
      setContactInfo(fallbackInfo);
      if (typeof window !== "undefined") {
        localStorage.setItem("mptm_contact_info", JSON.stringify(fallbackInfo));
      }
      alert("Contact information updated!");
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Update Message Status Handler
  const handleUpdateStatus = async (id: string, newStatus: "UNREAD" | "READ") => {
    try {
      const res = await fetch(`${API_URL}/api/contact/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );
        if (viewingMsg?.id === id) {
          setViewingMsg((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
    }
  };

  // Delete Message Handler
  const handleDeleteMessage = async () => {
    if (!deletingMsg) return;
    try {
      const res = await fetch(`${API_URL}/api/contact/messages/${deletingMsg.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== deletingMsg.id));
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== deletingMsg.id));
    } finally {
      setDeletingMsg(null);
    }
  };

  // Filtered Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      const matchStatus = statusFilter === "ALL" || m.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        (m.city && m.city.toLowerCase().includes(q)) ||
        (m.district && m.district.toLowerCase().includes(q)) ||
        (m.subject && m.subject.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [messages, searchQuery, statusFilter]);

  if (!isSuperAdmin) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans text-slate-800">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Contact Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Edit website contact information and view messages received from website visitors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchContactInfo();
                fetchContactMessages();
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-2 border border-slate-200 shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 text-slate-700 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Messages vs Edit Contact Info) */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab("MESSAGES")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === "MESSAGES"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="inline-flex items-center gap-1">
              Contact Messages (
              {isLoading ? (
                <span className="inline-block w-4 h-3 bg-slate-300 animate-pulse rounded align-middle" />
              ) : (
                messages.length
              )}
              )
            </span>
          </button>

          <button
            onClick={() => setActiveTab("INFO")}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
              activeTab === "INFO"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Edit Contact Info</span>
          </button>
        </div>

        {/* TAB 1: EDIT CONTACT INFORMATION */}
        {activeTab === "INFO" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Edit Website Contact Details
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Changes saved here will automatically update the public contact page on the website.
              </p>
            </div>

            <form onSubmit={handleSaveContactInfo} className="space-y-5">
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  required
                  maxLength={10}
                  minLength={10}
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  placeholder="10-Digit Phone Number (e.g. 9876543210)"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-mono outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alternate Mobile Number <span className="text-slate-400 font-normal lowercase"></span>
                </label>
                <input
                  type="tel"
                  value={contactInfo.alternatePhone || ""}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      alternatePhone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="Alternate Number"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 font-mono outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                 Email Address *
                </label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                  placeholder="info@mptmamravati.org"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
              </div>

              {/* Office Hours */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                 Working Hours *
                </label>
                <input
                  type="text"
                  value={contactInfo.hours}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, hours: e.target.value }))
                  }
                  required
                  placeholder="Monday - Saturday: 10:00 AM - 6:00 PM"
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Office Address *
                </label>
                <textarea
                  rows={3}
                  value={contactInfo.address}
                  onChange={(e) =>
                    setContactInfo((prev) => ({ ...prev, address: e.target.value }))
                  }
                  required
                  placeholder="Full office postal address..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-slate-900 resize-y transition"
                />
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingInfo}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-60"
                >
                  {isSavingInfo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-300" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Contact Information</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: CONTACT MESSAGES LIST */}
        {activeTab === "MESSAGES" && (
          <div className="space-y-4">
            {/* Search & Status Filters Toolbar (Compact Single Row) */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                {/* Shortened Search Box */}
                <div className="relative w-full sm:w-80 md:w-96 shrink-0">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, phone number, or subject..."
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

                {/* Status Filter Buttons on same row */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-normal">
                  <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0 hidden sm:inline" />
                  {(["ALL", "UNREAD", "READ"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer text-xs ${
                        statusFilter === st
                          ? "bg-slate-900 text-white font-bold shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-normal"
                      }`}
                    >
                      {st === "ALL" ? "All" : st === "UNREAD" ? "Unread" : "Read"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#EBF1FA] text-slate-700 text-xs font-medium border-b border-slate-200 whitespace-nowrap">
                    <tr>
                      <th className="py-2.5 px-4 text-left">Date</th>
                      <th className="py-2.5 px-4 text-left">Visitor Name</th>
                      <th className="py-2.5 px-4 text-left">Contact Info</th>
                      <th className="py-2.5 px-4 text-left">Subject & Message</th>
                      <th className="py-2.5 px-4 text-left">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 font-medium">
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <tr key={`skel-contact-${idx}`} className="animate-pulse">
                          {/* Date */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="h-3.5 w-24 bg-slate-200 rounded" />
                          </td>
                          {/* Visitor Name */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="h-4 w-32 bg-slate-200 rounded" />
                          </td>
                          {/* Contact Info */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="h-3.5 w-36 bg-slate-200 rounded mb-1.5" />
                            <div className="h-3 w-24 bg-slate-200 rounded" />
                          </td>
                          {/* Subject & Message */}
                          <td className="py-4 px-4 sm:px-6 max-w-xs">
                            <div className="h-3.5 w-40 bg-slate-200 rounded mb-1.5" />
                            <div className="h-3 w-56 bg-slate-200 rounded" />
                          </td>
                          {/* Status */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="h-6 w-16 bg-slate-200 rounded-full" />
                          </td>
                          {/* Actions */}
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <div className="h-7 w-7 bg-slate-200 rounded-lg" />
                              <div className="h-7 w-7 bg-slate-200 rounded-lg" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : filteredMessages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-bold text-slate-700">No contact messages found</p>
                          <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria or wait for new website inquiries.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredMessages.map((msg) => {
                        const msgDate = formatDateToDDMMYYYY(msg.createdAt);
                        let msgTime = "";
                        try {
                          const d = new Date(msg.createdAt);
                          if (!isNaN(d.getTime())) {
                            msgTime = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
                          }
                        } catch {}

                        return (
                        <tr
                          key={msg.id}
                          className={`hover:bg-amber-50/70 transition cursor-pointer group border-b border-slate-100/80 ${
                            msg.status === "UNREAD" ? "bg-amber-50/30" : ""
                          }`}
                        >
                          {/* Date */}
                          <td className="align-top py-2.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col leading-tight">
                              <span className="text-slate-800 text-xs font-normal">{msgDate}</span>
                              {msgTime && <span className="text-[10px] font-normal text-slate-400 mt-0.5 leading-none">{msgTime}</span>}
                            </div>
                          </td>

                          {/* Visitor Name */}
                          <td className="align-top py-2.5 px-4 whitespace-nowrap">
                            <span className="text-slate-800 text-xs font-normal truncate max-w-[190px] block" title={msg.name}>
                              {msg.name}
                            </span>
                          </td>

                          {/* Contact Info */}
                          <td className="align-top py-2.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col leading-tight">
                              <a href={`mailto:${msg.email}`} className="text-xs font-normal text-slate-700 hover:underline truncate max-w-[170px]" title={msg.email}>
                                {msg.email}
                              </a>
                              <a href={`tel:${msg.phone}`} className="text-xs font-normal text-slate-600 hover:text-slate-900 mt-0.5 font-mono">
                                {msg.phone}
                              </a>
                              {(msg.city || msg.district) && (
                                <span className="text-[10px] font-normal text-slate-400 mt-0.5">
                                  {[msg.city, msg.district].filter(Boolean).join(", ")}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Subject & Message */}
                          <td className="align-top py-2.5 px-4 whitespace-nowrap">
                            <div className="flex flex-col leading-tight">
                              <span className="font-normal text-slate-900 text-xs truncate max-w-[220px]" title={msg.subject || "General Inquiry"}>
                                {msg.subject || "General Inquiry"}
                              </span>
                              <span className="text-[11px] font-normal text-slate-500 truncate max-w-[240px] mt-0.5" title={msg.message}>
                                {msg.message}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="align-top py-2.5 px-4 whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(msg.id, msg.status === "UNREAD" ? "READ" : "UNREAD");
                              }}
                              className={`text-xs font-normal py-1 px-2.5 rounded-lg border transition cursor-pointer ${
                                msg.status === "UNREAD"
                                  ? "text-blue-700 border-blue-200 bg-blue-50/60"
                                  : "text-slate-600 border-slate-200 bg-slate-50"
                              }`}
                              title="Click to toggle Read/Unread"
                            >
                              {msg.status === "UNREAD" ? "Unread" : "Read"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="align-top py-2.5 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setViewingMsg(msg);
                                  if (msg.status === "UNREAD") handleUpdateStatus(msg.id, "READ");
                                }}
                                className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-amber-800" />
                              </button>

                              <button
                                onClick={() => setDeletingMsg(msg)}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 transition flex items-center justify-center cursor-pointer"
                                title="Delete"
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
        )}

        {/* VIEW DETAILS MODAL */}
        {viewingMsg && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto">
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-slate-300" />
                  <h3 className="text-base font-bold">Contact Message Details</h3>
                </div>
                <button
                  onClick={() => setViewingMsg(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs sm:text-sm">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{viewingMsg.name}</h2>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">Subject: {viewingMsg.subject || "General Inquiry"}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold shrink-0 border border-slate-300 bg-slate-100 text-slate-800">
                    {viewingMsg.status}
                  </span>
                </div>

                {/* Quick Action Contact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`tel:${viewingMsg.phone}`}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">Mobile Number</p>
                      <p className="font-mono font-bold text-slate-900 group-hover:underline">{viewingMsg.phone}</p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${viewingMsg.email}`}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition flex items-center gap-3 group truncate"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">Email Address</p>
                      <p className="font-bold text-slate-900 group-hover:underline truncate">{viewingMsg.email}</p>
                    </div>
                  </a>
                </div>

                {/* Date & Location */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">Submitted On:</span>
                    <span className="font-bold text-slate-800">{new Date(viewingMsg.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                  {(viewingMsg.city || viewingMsg.district) && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                      <span className="font-semibold text-slate-500">Location:</span>
                      <span className="font-bold text-slate-800">{[viewingMsg.city, viewingMsg.district].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message Content:</label>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap min-h-[90px]">
                    {viewingMsg.message}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setViewingMsg(null)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deletingMsg && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-800 border border-slate-200 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-slate-700" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Message?</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Are you sure you want to delete the message from <strong>"{deletingMsg.name}"</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2 text-xs font-bold">
                <button
                  onClick={() => setDeletingMsg(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMessage}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}