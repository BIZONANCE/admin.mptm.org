"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { DonationItem } from "@/types";
import { getApiUrl } from "@/utils/config";
import {
  Heart,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  X,
  IndianRupee,
  Calendar,
  Building2,
  Phone,
  User,
  CheckCircle2,
  FileText,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Download,
  Filter,
  ArrowUpRight,
} from "lucide-react";

export default function ManageDonationsPage() {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>("ALL");

  // Modal State for Viewing Payment Screenshot
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);

  // Modal State for Delete Confirmation
  const [deleteCandidate, setDeleteCandidate] = useState<DonationItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const API_URL = getApiUrl();

  const fetchDonations = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/donation/all`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setDonations(data.data);
      } else {
        setError(data.error || "Failed to load donation records from the server.");
      }
    } catch (err: any) {
      console.error("Fetch donations error:", err);
      setError("Unable to connect to the backend server. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [API_URL]);

  // Unique cities for filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    donations.forEach((item) => {
      if (item.city) cities.add(item.city.trim());
    });
    return Array.from(cities).sort();
  }, [donations]);

  // Filtered donations
  const filteredDonations = useMemo(() => {
    return donations.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.receiptNo.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.mobileNo.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        String(item.amount).includes(q);

      const matchesCity =
        selectedCityFilter === "ALL" ||
        item.city.trim().toLowerCase() === selectedCityFilter.toLowerCase();

      return matchesSearch && matchesCity;
    });
  }, [donations, searchQuery, selectedCityFilter]);

  // Calculate premium statistics
  const stats = useMemo(() => {
    const totalCount = donations.length;
    const totalAmount = donations.reduce((sum, item) => sum + (item.amount || 0), 0);
    const avgAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
    const verifiedReceipts = donations.filter((item) => !!item.paymentScreenshot).length;
    return { totalCount, totalAmount, avgAmount, verifiedReceipts };
  }, [donations]);

  // Handle Delete Donation
  const handleDeleteDonation = async () => {
    if (!deleteCandidate) return;
    try {
      setDeleting(true);
      const res = await fetch(`${API_URL}/api/donation/${deleteCandidate.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDonations((prev) => prev.filter((d) => d.id !== deleteCandidate.id));
        setActionSuccess(`Donation receipt ${deleteCandidate.receiptNo} successfully removed.`);
        setDeleteCandidate(null);
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to remove donation record.");
      }
    } catch (err) {
      console.error("Delete donation error:", err);
      alert("Server Error: Could not delete donation entry.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Donations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              List of all voluntary donors, receipt details, and transaction proofs
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDonations}
              disabled={refreshing}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Action Success Alert */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span>{actionSuccess}</span>
          </div>
        )}



        {/* SEARCH, FILTER & TABLE CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
          
          {/* FILTER TOOLBAR */}
          <div className="p-5 sm:p-6 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search donor name, receipt no, mobile, city..."
                className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-inner font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 w-5 h-5 rounded-full flex items-center justify-center hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* City Filter Dropdown */}
              {uniqueCities.length > 0 && (
                <div className="flex items-center gap-2 bg-white border border-slate-300/80 rounded-2xl px-3 py-1.5 shadow-2xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">City:</span>
                  <select
                    value={selectedCityFilter}
                    onChange={(e) => setSelectedCityFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer pr-1"
                  >
                    <option value="ALL">All Cities ({donations.length})</option>
                    {uniqueCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Records Counter Badge */}
              <div className="px-4 py-2 bg-indigo-50/80 border border-indigo-100 rounded-2xl text-xs font-bold text-indigo-900 shrink-0">
                Showing <span className="text-indigo-600 font-extrabold">{filteredDonations.length}</span> of {donations.length} Records
              </div>
            </div>

          </div>

          {/* TABLE AREA */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <p className="text-sm font-bold text-slate-700">Loading donation records...</p>
                <p className="text-xs text-slate-400">Connecting securely to database server</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <X className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-red-600">{error}</p>
                <button
                  onClick={fetchDonations}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <p className="text-base font-extrabold text-slate-800">No donation records found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || selectedCityFilter !== "ALL"
                    ? "No records match your active search filter criteria. Try clearing search filters."
                    : "No voluntary contributions recorded in the database yet."}
                </p>
                {(searchQuery || selectedCityFilter !== "ALL") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCityFilter("ALL");
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-100 transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#DCE6FA] text-slate-800 text-xs font-extrabold border-b border-slate-300">
                    <th className="py-4 px-5">Receipt No.</th>
                    <th className="py-4 px-5">Donor Name</th>
                    <th className="py-4 px-5">Mobile Number</th>
                    <th className="py-4 px-5">City / Location</th>
                    <th className="py-4 px-5">Amount</th>
                    <th className="py-4 px-5">Payment Proof</th>
                    <th className="py-4 px-5">Date</th>
                    <th className="py-4 px-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
                  {filteredDonations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors duration-150 group">
                      
                      {/* Receipt No */}
                      <td className="py-4 px-5 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        <span className="bg-indigo-50/90 text-indigo-800 px-3 py-1 rounded-xl border border-indigo-200/80 shadow-2xs">
                          {item.receiptNo}
                        </span>
                      </td>

                      {/* Donor Name */}
                      <td className="py-4 px-5 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-slate-900 group-hover:text-indigo-900 transition-colors">
                            {item.name}
                          </span>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="py-4 px-5 font-bold text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a
                            href={`tel:${item.mobileNo}`}
                            className="text-slate-700 hover:text-emerald-700 hover:underline font-mono"
                          >
                            {item.mobileNo}
                          </a>
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold">{item.city}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300 shadow-2xs">
                          ₹ {item.amount.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Payment Screenshot Thumbnail */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {item.paymentScreenshot ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedScreenshot(item.paymentScreenshot || null);
                              setSelectedDonation(item);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-900 px-3 py-1.5 rounded-xl border border-indigo-200/80 transition-all duration-200 shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Proof</span>
                            <ArrowUpRight className="w-3 h-3 opacity-60" />
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px] px-2 py-0.5 bg-slate-100 rounded-md">
                            No Receipt Attached
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5 text-slate-600 whitespace-nowrap font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-700">{item.date}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(item)}
                          title="Delete Donation Record"
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 active:bg-red-100 transition-all duration-200 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>

      </div>

      {/* MODAL 1: Payment Proof Screenshot View */}
      {selectedScreenshot && selectedDonation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl space-y-4 p-6 relative border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Payment Screenshot & Proof</span>
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Receipt: <span className="text-indigo-700 font-mono font-bold">{selectedDonation.receiptNo}</span> — Donor: {selectedDonation.name} (₹{selectedDonation.amount.toLocaleString("en-IN")})
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedScreenshot(null);
                  setSelectedDonation(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview Container */}
            <div className="relative w-full max-h-[65vh] overflow-y-auto bg-slate-900 rounded-2xl p-3 border border-slate-800 flex justify-center items-center shadow-inner">
              <img
                src={selectedScreenshot}
                alt="Payment Proof Screenshot"
                className="max-w-full h-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-2">
              <a
                href={selectedScreenshot}
                download={`Donation_Proof_${selectedDonation.receiptNo}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open Full Image</span>
              </a>

              <button
                onClick={() => {
                  setSelectedScreenshot(null);
                  setSelectedDonation(null);
                }}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer shadow-md"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-black text-slate-900 text-xl">
                Delete Donation Record?
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Receipt <span className="font-bold text-red-700 font-mono">{deleteCandidate.receiptNo}</span> belonging to <span className="font-bold text-slate-900">{deleteCandidate.name}</span> (Amount: <span className="font-bold text-emerald-800">₹{deleteCandidate.amount.toLocaleString("en-IN")}</span>) will be permanently deleted from the database.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={deleting}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteDonation}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <span>Removing Record...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
