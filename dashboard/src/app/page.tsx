"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  IndianRupee,
  RefreshCw,
  Phone,
  MapPin,
  ChevronRight,
  Clock,
  Banknote,
  QrCode,
  AlertTriangle,
  Zap,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { MemberRegistration } from "../types";
import { getDatePart, getTimePart, formatPaymentMethod } from "../utils/formatters";

export default function DashboardHome() {
  const router = useRouter();

  const [registrations, setRegistrations] = useState<MemberRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5007";

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/register`);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.data)) {
        setRegistrations(data.data);
      } else {
        setError(data.error || "Error loading dashboard data.");
      }
    } catch (err: any) {
      console.error("Fetch registrations error:", err);
      setError(err.message || "Error loading dashboard data. Please check backend server status.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("mptm_admin_role");
      const username = localStorage.getItem("mptm_admin_username");
      const isSuper = role === "SUPER_ADMIN" || username === "mptmamravati.org" || username === "admin@mptmamravati.org";
      if (!isSuper) {
        router.replace("/registrations");
        return;
      }
    }
    fetchRegistrations();
  }, [router]);

  const stats = useMemo(() => {
    const totalRegs = registrations.length;
    let totalFees = 0;
    let cashCount = 0;
    let onlineCount = 0;
    let cashFees = 0;
    let onlineFees = 0;

    registrations.forEach((r) => {
      const fee = Number(r.registrationFee) || 0;
      totalFees += fee;

      const pMethod = (r.paymentMethod || "").toLowerCase();
      if (pMethod.includes("रोख") || pMethod.includes("cash")) {
        cashCount++;
        cashFees += fee;
      } else {
        onlineCount++;
        onlineFees += fee;
      }
    });

    return {
      totalRegs,
      totalFees,
      cashCount,
      onlineCount,
      cashFees,
      onlineFees,
    };
  }, [registrations]);

  return (
    <DashboardLayout>
      <div>
        {/* Dashboard Title & Subtitle */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Dashboard
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs flex items-center gap-1">
                <Zap className="w-3 h-3 text-blue-700 fill-blue-700" />
                <span>Super Admin</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Overview of platform registrations and fee collections
            </p>
          </div>

          <button
            onClick={fetchRegistrations}
            disabled={isRefreshing}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition shadow-2xs disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="font-semibold text-sm">Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-red-200 shadow-2xs">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="font-bold">{error}</p>
            <button
              onClick={fetchRegistrations}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* 3 MERGED METRIC CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {/* Card 1: Overall Registrations & Fees */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col gap-4 hover:shadow-md transition">
                {/* Top: Total Members Registration */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Total Members Registration
                    </span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {stats.totalRegs}
                    </span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                {/* Below: Total Registration Fees Collected */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Total Registration Fees Collected
                    </span>
                    <span className="text-2xl font-black text-emerald-600 tracking-tight">
                      ₹{stats.totalFees}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: UPI Registrations & UPI Payment Received */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col gap-4 hover:shadow-md transition">
                {/* Top: Total UPI Registrations */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Total UPI Registrations
                    </span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {stats.onlineCount}
                    </span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                {/* Below: Total UPI Payment Received */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Total UPI Payment Received
                    </span>
                    <span className="text-2xl font-black text-purple-600 tracking-tight">
                      ₹{stats.onlineFees}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Cash Registrations & Cash Payment Received */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col gap-4 hover:shadow-md transition">
                {/* Top: Total Cash Registrations */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Total Cash Registrations
                    </span>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {stats.cashCount}
                    </span>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-slate-100" />

                {/* Below: Total Cash Payment Received */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">
                      Total Cash Payment Received
                    </span>
                    <span className="text-2xl font-black text-amber-600 tracking-tight">
                      ₹{stats.cashFees}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT REGISTRATIONS QUICK VIEW */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Recent Member Registrations
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Latest member registration applications received
                  </p>
                </div>

                <button
                  onClick={() => router.push("/registrations")}
                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3.5 py-2 rounded-xl text-xs border border-blue-200 transition"
                >
                  <span>View All ({registrations.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {registrations.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-6 italic">
                  No registrations received yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {registrations.slice(0, 6).map((reg) => {
                    const main = reg.mainMembers[0] || { fullName: "New Member", memberNo: "" };
                    return (
                      <div
                        key={reg.id}
                        onClick={() => router.push("/registrations")}
                        className="p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl transition cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-blue-700 transition">
                            {main.fullName}
                          </span>
                          <span className="font-mono text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                            {reg.receiptNo}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {getDatePart(reg)} {getTimePart(reg)}
                          </span>
                          <span className="font-bold text-emerald-700">
                            ₹{reg.registrationFee} ({formatPaymentMethod(reg.paymentMethod)})
                          </span>
                        </div>

                        {main.mobileNo && (
                          <div className="flex items-center gap-1 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{main.mobileNo}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}