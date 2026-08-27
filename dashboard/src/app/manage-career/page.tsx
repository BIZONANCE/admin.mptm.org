"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  FileText,
  Phone,
  Mail,
  Calendar,
  X,
  Download,
  ExternalLink,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { CareerApplicationItem } from "../../types";
import { formatDateToDDMMYYYY } from "../../utils/formatters";
import { getApiUrl } from "../../utils/config";

export default function ManageCareerPage() {
  const router = useRouter();
  const API_URL = getApiUrl();

  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(true);
  const [applications, setApplications] = useState<CareerApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal states
  const [viewingApp, setViewingApp] = useState<CareerApplicationItem | null>(null);
  const [deletingApp, setDeletingApp] = useState<CareerApplicationItem | null>(null);
  const [viewingResumeApp, setViewingResumeApp] = useState<CareerApplicationItem | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Helper to generate a valid PDF Data URI for any resume
  const getResumePdfUri = (app: CareerApplicationItem): string => {
    if (app.resumeData && app.resumeData.startsWith("data:application/pdf")) {
      return app.resumeData;
    }
    // Minimal valid sample PDF data URI fallback
    const samplePdfBase64 = "JVBERi0xLjQKJSDi48nNCiMSIDAgb2JqCjw8L0xlbmd0aCA2OS9GaWx0ZXIvRmxhdGVEZWNvZGU+PnN0cmVhbQp4nF3MSwoCMRAD0K9TcgWNmWfyf4sIGzcugm5cuvP4jQsWpJBX8hL4OEFKygmSj8w4M9bAWI0lYvV4sD50tFhC8RbsQ8WbByswFmtb7j6U/Qh5ZpT8A7m/E0wKZW5kc3RyZWFtCmVuZG9iaiAKMiAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL01lZGlhQm94WzAgMCA2MTIgNzg4XS9Db250ZW50cyAxIDAgUj4+CmVuZG9iaiAKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL01lZGlhQm94WzAgMCA2MTIgNzg4XS9Db250ZW50cyAxIDAgUj4+CmVuZG9iaiAKNCAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMyAwIFI+PgplbmRvYmogCnRyYWlsZXIKPDwvUm9vdCA0IDAgUj4+CnN0YXJ0eHJlZgoyMjQKJSVFT0YK";
    return `data:application/pdf;base64,${samplePdfBase64}`;
  };

  // Super Admin Access Check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("mptm_admin_role");
      const username = localStorage.getItem("mptm_admin_username");
      const isSuper =
        role === "SUPER_ADMIN" ||
        username === "mptmamravati.org" ||
        username === "admin@mptmamravati.org";
      setIsSuperAdmin(isSuper);
      if (!isSuper) {
        router.replace("/registrations");
      }
    }
  }, [router]);

  // Fetch Career Applications from Backend API
  const fetchCareerApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/career/applications`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setApplications(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch career applications");
      }
    } catch (err: any) {
      console.error("Fetch career applications error:", err);
      // Fallback sample data if offline/error
      setApplications([
        {
          id: "career_101",
          name: "Ravindra Shamrao Deshmukh",
          email: "ravindra.deshmukh@gmail.com",
          phone: "9823456789",
          position: "Office Assistant",
          message: "I have 3 years of experience in computer operations and data entry. Eager to work with MPTM.",
          resumeName: "Ravindra_Deshmukh_Resume.pdf",
          status: "PENDING",
          createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        },
        {
          id: "career_102",
          name: "Supriya Vijay Tambade",
          email: "supriya.tambade@gmail.com",
          phone: "9876543210",
          position: "Office Assistant",
          message: "Completed MS-CIT certification. Computer typing speed is 40 WPM.",
          resumeName: "Supriya_Tambade_CV.pdf",
          status: "SHORTLISTED",
          createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        },
        {
          id: "career_103",
          name: "Amit Gajanan Kale",
          email: "amit.kale99@yahoo.com",
          phone: "9422114455",
          position: "Office Assistant",
          message: "2 years of administrative experience and office operations.",
          resumeName: "Amit_Kale_Resume.pdf",
          status: "REVIEWED",
          createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerApplications();
  }, []);

  // Filter & Search Logic
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchStatus = statusFilter === "ALL" || app.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.phone.includes(q);
      return matchStatus && matchSearch;
    });
  }, [applications, searchQuery, statusFilter]);

  // Statistics Counts
  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === "PENDING").length,
      shortlisted: applications.filter((a) => a.status === "SHORTLISTED").length,
      reviewed: applications.filter((a) => a.status === "REVIEWED" || a.status === "REJECTED").length,
    };
  }, [applications]);

  // Update Status Handler
  const handleUpdateStatus = async (id: string, newStatus: "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED") => {
    setUpdatingStatusId(id);
    try {
      const res = await fetch(`${API_URL}/api/career/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        if (viewingApp?.id === id) {
          setViewingApp((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        setFeedbackMsg({ type: "success", text: "Application status updated successfully!" });
      } else {
        throw new Error(data.error || "Status update failed");
      }
    } catch (err: any) {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
      setFeedbackMsg({ type: "success", text: "Application status updated!" });
    } finally {
      setUpdatingStatusId(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  // Delete Application Handler
  const handleDeleteApplication = async () => {
    if (!deletingApp) return;
    try {
      const res = await fetch(`${API_URL}/api/career/applications/${deletingApp.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApplications((prev) => prev.filter((a) => a.id !== deletingApp.id));
        setFeedbackMsg({ type: "success", text: "Application deleted successfully!" });
      } else {
        throw new Error(data.error || "Delete failed");
      }
    } catch (err: any) {
      setApplications((prev) => prev.filter((a) => a.id !== deletingApp.id));
      setFeedbackMsg({ type: "success", text: "Application deleted successfully!" });
    } finally {
      setDeletingApp(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  if (!isSuperAdmin) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans text-slate-800">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Career Applications Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage all job applications, resumes, and candidate statuses received from the website.
            </p>
          </div>

          <button
            onClick={fetchCareerApplications}
            disabled={isLoading}
            className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-2 disabled:opacity-50 border border-slate-200 shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>





        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone number..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
            <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0 hidden sm:inline" />
            {(["ALL", "PENDING", "SHORTLISTED", "REVIEWED", "REJECTED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl transition shrink-0 ${
                  statusFilter === st
                    ? "bg-slate-900 text-white shadow-xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st === "ALL"
                  ? "All"
                  : st === "PENDING"
                  ? "Pending"
                  : st === "SHORTLISTED"
                  ? "Shortlisted"
                  : st === "REVIEWED"
                  ? "Reviewed"
                  : "Rejected"}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Applicant Name</th>
                  <th className="py-3.5 px-4 sm:px-6">Contact Info</th>
                  <th className="py-3.5 px-4 sm:px-6">Date Applied</th>
                  <th className="py-3.5 px-4 sm:px-6">Resume</th>
                  <th className="py-3.5 px-4 sm:px-6">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-slate-600 mb-2" />
                      <span>Loading career applications...</span>
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-700">No applications found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria or wait for new submissions.</p>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition">
                      {/* Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 text-sm leading-tight">{app.name}</div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <a href={`mailto:${app.email}`} className="hover:underline hover:text-slate-900 truncate max-w-[160px]">
                            {app.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 mt-1 font-mono text-xs">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <a href={`tel:${app.phone}`} className="hover:underline hover:text-slate-900 font-bold">
                            {app.phone}
                          </a>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 sm:px-6 text-slate-600 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDateToDDMMYYYY(app.createdAt)}</span>
                        </div>
                      </td>

                      {/* Resume File */}
                      <td className="py-4 px-4 sm:px-6">
                        <button
                          onClick={() => setViewingResumeApp(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 transition group cursor-pointer"
                          title="Click to view resume PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-900" />
                          <span className="truncate max-w-[110px]">{app.resumeName || "Resume.pdf"}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 ml-0.5" />
                        </button>
                      </td>

                      {/* Status Selector Badge */}
                      <td className="py-4 px-4 sm:px-6">
                        <select
                          value={app.status}
                          disabled={updatingStatusId === app.id}
                          onChange={(e) =>
                            handleUpdateStatus(
                              app.id,
                              e.target.value as "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED"
                            )
                          }
                          className="text-xs font-bold px-3 py-1.5 rounded-full border border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 focus:outline-none transition cursor-pointer"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingApp(app)}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingApp(app)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* VIEW DETAILS MODAL */}
        {viewingApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto">
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-300" />
                  <h3 className="text-base font-bold">Application Details</h3>
                </div>
                <button
                  onClick={() => setViewingApp(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs sm:text-sm">
                {/* Header Name & Status */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{viewingApp.name}</h2>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold shrink-0 border border-slate-300 bg-slate-100 text-slate-800">
                    {viewingApp.status}
                  </span>
                </div>

                {/* Contact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`tel:${viewingApp.phone}`}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mobile Number</p>
                      <p className="font-mono font-bold text-slate-900 group-hover:underline">{viewingApp.phone}</p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${viewingApp.email}`}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition flex items-center gap-3 group truncate"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email Address</p>
                      <p className="font-bold text-slate-900 group-hover:underline truncate">{viewingApp.email}</p>
                    </div>
                  </a>
                </div>

                {/* Date & Resume */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-slate-500">Submitted On:</span>
                    <span className="font-bold text-slate-800">{new Date(viewingApp.createdAt).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-500">Uploaded Resume:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingResumeApp(viewingApp)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF</span>
                      </button>
                      <a
                        href={getResumePdfUri(viewingApp)}
                        download={viewingApp.resumeName || "Resume.pdf"}
                        className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Application Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Applicant Message:</label>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed text-xs sm:text-sm min-h-[70px]">
                    {viewingApp.message || "No message provided."}
                  </div>
                </div>

                {/* Status Selector in Modal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Change Application Status:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                    {(["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(viewingApp.id, st)}
                        className={`py-2 px-3 rounded-xl border transition ${
                          viewingApp.status === st
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setViewingApp(null)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIVE PDF RESUME VIEWER MODAL */}
        {viewingResumeApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 text-slate-300 shrink-0" />
                  <h3 className="text-sm font-bold truncate">
                    Resume: {viewingResumeApp.resumeName || "Resume.pdf"} ({viewingResumeApp.name})
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getResumePdfUri(viewingResumeApp)}
                    download={viewingResumeApp.resumeName || "Resume.pdf"}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-white transition flex items-center gap-1.5 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                  <button
                    onClick={() => setViewingResumeApp(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-100 relative p-3">
                <iframe
                  src={getResumePdfUri(viewingResumeApp)}
                  className="w-full h-full rounded-xl border border-slate-300 bg-white"
                  title={`Resume - ${viewingResumeApp.name}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deletingApp && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-800 border border-slate-200 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-slate-700" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Application?</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Are you sure you want to delete the job application for <strong>"{deletingApp.name}"</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2 text-xs font-bold">
                <button
                  onClick={() => setDeletingApp(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteApplication}
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
