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
} from "lucide-react";

export default function ManageDonationsPage() {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");

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
        setError(data.error || "Failed to load donation records.");
      }
    } catch (err: any) {
      console.error("Fetch donations error:", err);
      setError("Unable to connect to the backend server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [API_URL]);

  // Filtered donations
  const filteredDonations = useMemo(() => {
    return donations.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        item.receiptNo.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.mobileNo.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        String(item.amount).includes(q)
      );
    });
  }, [donations, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCount = donations.length;
    const totalAmount = donations.reduce((sum, item) => sum + (item.amount || 0), 0);
    return { totalCount, totalAmount };
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
        setActionSuccess(`Receipt ${deleteCandidate.receiptNo} successfully deleted.`);
        setDeleteCandidate(null);
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to delete donation record.");
      }
    } catch (err) {
      console.error("Delete donation error:", err);
      alert("Server Error: Could not remove donation entry.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-2xs">
                <Heart className="w-5 h-5 fill-indigo-600 text-indigo-600" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Donation Records Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              List of all voluntary donors, receipt details, and transaction proofs for Maharashtra Prantik Tailik Mahasabha
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
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white rounded-2xl shadow-md space-y-2 border border-indigo-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                TOTAL DONORS
              </span>
              <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center">
                <Heart className="w-4 h-4 text-indigo-200 fill-indigo-200" />
              </div>
            </div>
            <div className="text-3xl font-black">{stats.totalCount}</div>
            <p className="text-xs text-indigo-200/90 font-medium">Total registered contributors</p>
          </div>

          <div className="p-5 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white rounded-2xl shadow-md space-y-2 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                TOTAL AMOUNT COLLECTED
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-emerald-100" />
              </div>
            </div>
            <div className="text-3xl font-black">₹ {stats.totalAmount.toLocaleString("en-IN")}</div>
            <p className="text-xs text-emerald-100/90 font-medium">Total received voluntary funds</p>
          </div>
        </div>

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
                placeholder="Search by name, mobile, city, or receipt no..."
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

            <div className="text-xs font-bold text-slate-500">
              Showing: <span className="text-slate-900 font-extrabold">{filteredDonations.length}</span> of {donations.length}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">Loading donation records...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-600 font-bold text-sm">
                ⚠️ {error}
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No donation records found</p>
                <p className="text-xs text-slate-500">Please verify search criteria or wait for new submissions.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-4">Receipt No.</th>
                    <th className="py-3 px-4">Donor Name</th>
                    <th className="py-3 px-4">Mobile No.</th>
                    <th className="py-3 px-4">City / Town</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Receipt</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800 font-medium">
                  {filteredDonations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Receipt No */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        {item.receiptNo}
                      </td>

                      {/* Donor Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.name}</span>
                        </div>
                      </td>

                      {/* Mobile */}
                      <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <a href={`tel:${item.mobileNo}`} className="hover:underline">
                            {item.mobileNo}
                          </a>
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.city}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          ₹ {item.amount.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Payment Screenshot Thumbnail */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.paymentScreenshot ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedScreenshot(item.paymentScreenshot || null);
                              setSelectedDonation(item);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No Receipt</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{item.date}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(item)}
                          title="Delete Donation Record"
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100 transition cursor-pointer"
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

      {/* MODAL 1: Payment Screenshot View */}
      {selectedScreenshot && selectedDonation && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-5 relative border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Payment Screenshot Preview
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedDonation.name} ({selectedDonation.receiptNo}) — ₹{selectedDonation.amount}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedScreenshot(null);
                  setSelectedDonation(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full max-h-[60vh] overflow-y-auto bg-slate-100 rounded-2xl p-2 border border-slate-200 flex justify-center">
              <img
                src={selectedScreenshot}
                alt="Payment Screenshot"
                className="max-w-full h-auto object-contain rounded-xl shadow-sm"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setSelectedScreenshot(null);
                  setSelectedDonation(null);
                }}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-slate-900 text-lg">
                Delete Donation Record?
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Receipt <span className="font-bold text-red-700">{deleteCandidate.receiptNo}</span> (Donor: {deleteCandidate.name}, Amount: ₹{deleteCandidate.amount}) will be permanently deleted from the database.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
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
                onClick={handleDeleteDonation}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <span>Deleting...</span>
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
