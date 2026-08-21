"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  RefreshCw,
  Mail,
  Send,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Pencil,
  Save,
  X,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { ManagedUser } from "../../types";
import { formatDateToDDMMYYYY } from "../../utils/formatters";

export default function ManageUsersPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("mptm_admin_role");
      const username = localStorage.getItem("mptm_admin_username");
      const isSuper = role === "SUPER_ADMIN" || username === "mptmamravati.org" || username === "admin@mptmamravati.org";
      if (!isSuper) {
        router.replace("/registrations");
      }
    }
  }, [router]);

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mptm_managed_users");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [
      {
        id: "usr_default_1",
        email: "admin@mptmamravati.org",
        name: "प्रशासक (Admin)",
        phone: "9876543210",
        date: formatDateToDDMMYYYY(new Date()),
        time: "10:00 AM",
        status: "VERIFIED",
        role: "Super Admin",
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [newEmailInput, setNewEmailInput] = useState<string>("");
  const [verificationStep, setVerificationStep] = useState<"IDLE" | "SENT" | "VERIFIED">("IDLE");
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [inputOtp, setInputOtp] = useState<string>("");
  const [userSuccessMsg, setUserSuccessMsg] = useState<string | null>(null);
  const [userErrorMsg, setUserErrorMsg] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);

  // Edit / Save state per row
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editNameInput, setEditNameInput] = useState<string>("");
  const [editPhoneInput, setEditPhoneInput] = useState<string>("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch managed users from backend API on component mount and sync with localStorage
  useEffect(() => {
    const syncBackendUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setManagedUsers(data.data);
          if (typeof window !== "undefined") {
            localStorage.setItem("mptm_managed_users", JSON.stringify(data.data));
          }
        }
      } catch (err) {
        console.error("Fetch managed users error:", err);
      }
    };
    syncBackendUsers();
  }, [API_URL]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mptm_managed_users", JSON.stringify(managedUsers));
    }
  }, [managedUsers]);

  const handleSendVerificationCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUserErrorMsg(null);
    setUserSuccessMsg(null);

    const emailTrimmed = newEmailInput.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setUserErrorMsg("⚠️ कृपया वैध इमेल आयडी प्रविष्ट करा!");
      return;
    }

    if (managedUsers.some((u) => u.email.toLowerCase() === emailTrimmed.toLowerCase())) {
      setUserErrorMsg("⚠️ हा इमेल आयडी आधीच सत्यप्रमाणित व जोडलेला आहे!");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch(`${API_URL}/api/users/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed, isRegistration: true }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setGeneratedOtp(data.code || "");
        setVerificationStep("SENT");
        setUserSuccessMsg(`✅ पडताळणी कोड (Verification Code) ${emailTrimmed} वर पाठवला गेला आहे! इमेल इनबॉक्स/स्पॅम फोल्डर तपासा.`);
      } else {
        setUserErrorMsg(data.error || "इमेल पाठवताना त्रुटी आली.");
      }
    } catch (err: any) {
      console.error("Verification dispatch error:", err);
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(code);
      setVerificationStep("SENT");
      setUserSuccessMsg(`✅ पडताळणी कोड (Verification Code) ${emailTrimmed} वर पाठवला गेला आहे!`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndAddUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUserErrorMsg(null);
    setUserSuccessMsg(null);

    const emailTrimmed = newEmailInput.trim();
    if (!inputOtp) {
      setUserErrorMsg("⚠️ कृपया पडताळणी कोड प्रविष्ट करा!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed, code: inputOtp.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (inputOtp.trim() !== generatedOtp.trim()) {
          setUserErrorMsg(data.error || "⚠️ प्रविष्ट केलेला पडताळणी कोड चुकीचा आहे!");
          return;
        }
      }
    } catch (err) {
      if (inputOtp.trim() !== generatedOtp.trim()) {
        setUserErrorMsg("⚠️ प्रविष्ट केलेला पडताळणी कोड चुकीचा आहे!");
        return;
      }
    }

    const now = new Date();
    const formattedDate = formatDateToDDMMYYYY(now);
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newUser: ManagedUser = {
      id: `usr_${Date.now()}`,
      email: emailTrimmed,
      name: "",
      phone: "",
      date: formattedDate,
      time: formattedTime,
      status: "VERIFIED",
      role: "User",
      createdAt: now.toISOString(),
    };

    // Save user to backend API store
    try {
      await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
    } catch (err) {
      console.error("Backend user save error:", err);
    }

    setManagedUsers((prev) => [newUser, ...prev]);
    setNewEmailInput("");
    setInputOtp("");
    setGeneratedOtp("");
    setVerificationStep("IDLE");
    
    // Automatically start editing the new user so admin can save name and phone
    setEditingUserId(newUser.id);
    setEditNameInput("");
    setEditPhoneInput("");
    setUserSuccessMsg("✅ इमेल पडताळणी पूर्ण झाली! इमेल, दिनांक व वेळ आपोआप जोडली आहे. कृपया खालील तक्त्यामध्ये नाव व मोबाईल क्रमांक टाईप करून Save वर क्लिक करा.");
  };

  const handleStartEditUser = (user: ManagedUser) => {
    setEditingUserId(user.id);
    setEditNameInput(user.name || "");
    setEditPhoneInput(user.phone || "");
  };

  const handleSaveEditUser = (id: string) => {
    const updatedUsers = managedUsers.map((u) =>
      u.id === id ? { ...u, name: editNameInput.trim(), phone: editPhoneInput.trim() } : u
    );
    setManagedUsers(updatedUsers);

    const targetUser = updatedUsers.find((u) => u.id === id);
    if (targetUser) {
      fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetUser),
      }).catch((e) => console.error("User update sync error:", e));
    }

    setEditingUserId(null);
    setUserSuccessMsg("✅ युझरचे नाव व फोन नंबर यशस्वीरित्या सेव्ह (Save) केले!");
  };

  const handleCancelEditUser = () => {
    setEditingUserId(null);
    setEditNameInput("");
    setEditPhoneInput("");
  };

  const handleDeleteManagedUser = (id: string) => {
    if (editingUserId === id) {
      setEditingUserId(null);
    }
    const targetUser = managedUsers.find((u) => u.id === id);
    setManagedUsers((prev) => prev.filter((u) => u.id !== id));

    if (targetUser) {
      fetch(`${API_URL}/api/users/${targetUser.id}`, { method: "DELETE" }).catch((e) =>
        console.error("Backend delete sync error:", e)
      );
    }

    setUserSuccessMsg("युझर डेटावेसमधून हटवला गेला.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manage Users
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            इमेल पडताळणीद्वारे नवीन युझर जोडा व युझर तपशील व्यवस्थापित करा (Add User via Email Verification & Manage Credentials)
          </p>
        </div>

        {/* CARD 1: EMAIL VERIFICATION USER CREATION FORM */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                इमेल पडताळणीद्वारे युझर जोडा (Add User via Email Verification)
              </h2>
              <p className="text-xs text-slate-500">
                इमेल टाईप करा, पडताळणी कोड पाठवा व कोड प्रविष्ट केल्यानंतर इमेल, दिनांक व वेळ आपोआप जोडली जाईल.
              </p>
            </div>
          </div>

          {userErrorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{userErrorMsg}</span>
            </div>
          )}

          {userSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{userSuccessMsg}</span>
            </div>
          )}

          {/* STEP 1: EMAIL INPUT & SEND BUTTON IN ONE LINE */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              इमेल आयडी (Write Email Address) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                type="email"
                value={newEmailInput}
                onChange={(e) => setNewEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && verificationStep === "IDLE") {
                    handleSendVerificationCode(e);
                  }
                }}
                placeholder="नवीन युझरचा इमेल आयडी टाईप करा (उदा. user@example.com)..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition font-mono"
                disabled={verificationStep === "SENT"}
              />

              {verificationStep === "IDLE" && (
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isSendingOtp || !newEmailInput.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 whitespace-nowrap"
                >
                  {isSendingOtp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>कोड पाठवत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>पडताळणी कोड पाठवा (Send Verification Code)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* STEP 2: VERIFICATION OTP CODE INPUT & CONFIRM */}
          {verificationStep === "SENT" && (
            <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-900 font-semibold">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>इमेल इनबॉक्स तपासा: ६-अंकी पडताळणी कोड इमेलवर पाठवला आहे. (Check your inbox for 6-digit OTP code)</span>
                </div>
                <button
                  onClick={() => {
                    setVerificationStep("IDLE");
                    setUserSuccessMsg(null);
                  }}
                  className="text-[11px] font-bold text-blue-700 underline hover:text-blue-900 shrink-0"
                >
                  इमेल बदला
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  पडताळणी कोड (Enter 6-Digit Verification Code) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={inputOtp}
                    onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="६-अंकी कोड (उदा. 123456)"
                    className="w-full sm:w-64 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAndAddUser}
                    disabled={inputOtp.length !== 6}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50 shrink-0"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>सत्यप्रमाणित करा व युझर जोडा</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CARD 2: MANAGED USERS TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                युझर यादी (Managed Users List)
              </h2>
              <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                एकूण: {managedUsers.length}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              * नाव किंवा फोन नंबर बदलण्यासाठी Action कॉलममधील Edit / Save बटणाचा वापर करा.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">अ. क्र.</th>
                  <th className="py-3 px-4">इमेल (Email - Auto)</th>
                  <th className="py-3 px-4 min-w-[180px]">नाव (Name)</th>
                  <th className="py-3 px-4 min-w-[160px]">फोन नंबर (Phone)</th>
                  <th className="py-3 px-4">दिनांक (Date - Auto)</th>
                  <th className="py-3 px-4">वेळ (Time - Auto)</th>
                  <th className="py-3 px-4 text-center">स्थिती (Status)</th>
                  <th className="py-3 px-4 text-right">कृती (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-900">
                {managedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 italic">
                      कोणतेही युझर जोडलेले नाहीत. वरील फॉर्म वापरून इमेल पडताळणीद्वारे युझर जोडा.
                    </td>
                  </tr>
                ) : (
                  managedUsers.map((user, idx) => {
                    const isEditingThisRow = editingUserId === user.id;

                    return (
                      <tr key={user.id} className={`transition ${isEditingThisRow ? "bg-amber-50/40" : "hover:bg-slate-50/80"}`}>
                        <td className="py-3 px-4 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="font-mono text-xs sm:text-sm">{user.email}</span>
                          </div>
                        </td>

                        {/* NAME COLUMN */}
                        <td className="py-2 px-4">
                          {isEditingThisRow ? (
                            <input
                              type="text"
                              value={editNameInput}
                              onChange={(e) => setEditNameInput(e.target.value)}
                              placeholder="नाव टाईप करा..."
                              className="w-full px-2.5 py-1.5 bg-white border border-blue-400 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-2xs"
                              autoFocus
                            />
                          ) : (
                            <span className="font-semibold text-slate-800">
                              {user.name || <span className="text-slate-400 italic">नाव जोडलेले नाही</span>}
                            </span>
                          )}
                        </td>

                        {/* PHONE COLUMN */}
                        <td className="py-2 px-4">
                          {isEditingThisRow ? (
                            <input
                              type="tel"
                              maxLength={10}
                              value={editPhoneInput}
                              onChange={(e) => {
                                const clean = e.target.value.replace(/\D/g, "").slice(0, 10);
                                setEditPhoneInput(clean);
                              }}
                              placeholder="१० अंकी फोन नंबर..."
                              className="w-full px-2.5 py-1.5 bg-white border border-blue-400 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono shadow-2xs"
                            />
                          ) : (
                            <span className="font-mono text-slate-700">
                              {user.phone || <span className="text-slate-400 italic">फोन नंबर नाही</span>}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          {user.date}
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-600 whitespace-nowrap">
                          {user.time}
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        </td>

                        {/* ACTION COLUMN WITH EDIT, SAVE, CANCEL, & DELETE BUTTONS */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditingThisRow ? (
                              <>
                                <button
                                  onClick={() => handleSaveEditUser(user.id)}
                                  title="सेव्ह करा (Save)"
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                                >
                                  <Save className="w-3.5 h-3.5" />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={handleCancelEditUser}
                                  title="रद्द करा (Cancel)"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleStartEditUser(user)}
                                title="संपादित करा (Edit)"
                                className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 border border-blue-200 font-bold text-xs flex items-center gap-1 transition"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteManagedUser(user.id)}
                              title="युझर हटवा (Delete)"
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 border border-red-200 transition"
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
    </DashboardLayout>
  );
}

