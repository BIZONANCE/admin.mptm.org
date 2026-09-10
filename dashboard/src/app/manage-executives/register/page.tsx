"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getApiUrl } from "@/utils/config";
import { convertNumberToMarathiWords } from "@/utils/formatters";
import {
  ArrowLeft,
  UserCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  QrCode,
  Phone,
  Award,
  RefreshCw,
  FileText,
  X,
} from "lucide-react";

interface MainMember {
  srNo: number;
  memberNo: string;
  fullName: string;
  mobileNo: string;
  prabhagNo: string;
}

interface FamilyMember {
  srNo: number;
  name: string;
  relation: string;
  dob: string;
  occupation: string;
  mobile: string;
}

function formatDateToDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return "";
    const day = String(dateInput.getDate()).padStart(2, "0");
    const month = String(dateInput.getMonth() + 1).padStart(2, "0");
    const year = dateInput.getFullYear();
    return `${day}/${month}/${year}`;
  }
  const str = String(dateInput).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return str;
}

function formatExecutiveReceiptNo(seq: number): string {
  return `MPTM-EM-R${String(seq).padStart(3, "0")}`;
}

function formatExecutiveMemberNo(seq: number): string {
  return `MPTM-EM-S${String(seq).padStart(3, "0")}`;
}

export default function ExecutiveMemberRegisterPage() {
  const router = useRouter();
  const API_URL = getApiUrl();

  const [receiptSeq, setReceiptSeq] = useState(1);
  const [baseMemberSeq, setBaseMemberSeq] = useState(1);

  const [formData, setFormData] = useState({
    receiptNo: formatExecutiveReceiptNo(1),
    date: formatDateToDDMMYYYY(new Date()),
    registrationFee: "1001", // Strictly locked to 1001
    amountInWords: "एक हजार एक रुपये फक्त",
    address: "",
    paymentMethod: "UPI",
    otherPaymentMethod: "",
    referredBy: "Super Admin",
  });

  const [mainMembers, setMainMembers] = useState<MainMember[]>([
    {
      srNo: 1,
      memberNo: formatExecutiveMemberNo(1),
      fullName: "",
      mobileNo: "",
      prabhagNo: "",
    },
  ]);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { srNo: 1, name: "", relation: "", dob: "", occupation: "", mobile: "" },
  ]);

  const FULL_SANDESH_MESSAGE = "वरील रक्कम महाराष्ट्र प्रांतिक तैलिक महासभेच्या कार्यकारिणी सदस्य नोंदणी शुल्क म्हणून प्राप्त झाली.";

  const [cashPaidStatus, setCashPaidStatus] = useState<"yes" | "no" | "">("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string>("");
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string>("");
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string>("");
  const [submittedReceipt, setSubmittedReceipt] = useState<any | null>(null);

  const isPaymentVerified =
    (formData.paymentMethod === "रोख" && cashPaidStatus === "yes") ||
    (formData.paymentMethod === "UPI" && Boolean(paymentScreenshot));

  useEffect(() => {
    if (isPaymentVerified) {
      setTypedMessage("");
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < FULL_SANDESH_MESSAGE.length) {
          setTypedMessage(FULL_SANDESH_MESSAGE.slice(0, idx + 1));
          idx++;
        } else {
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    } else {
      setTypedMessage("");
    }
  }, [isPaymentVerified, paymentScreenshot, formData.paymentMethod]);

  const handlePaymentMethodChange = (method: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
    setCashPaidStatus("");
    setScreenshotError("");
  };

  const fetchNextNumbers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/next-numbers`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const rSeq = data.nextReceiptSeq || 1;
          const mSeq = data.nextMemberSeq || 1;
          setReceiptSeq(rSeq);
          setBaseMemberSeq(mSeq);
          setFormData((prev) => ({
            ...prev,
            receiptNo: formatExecutiveReceiptNo(rSeq),
          }));
          setMainMembers((prev) =>
            prev.map((m, idx) => ({
              ...m,
              memberNo: formatExecutiveMemberNo(mSeq + idx),
            }))
          );
        }
      }
    } catch (err) {
      console.error("Fetch next numbers error:", err);
    }
  };

  useEffect(() => {
    fetchNextNumbers();
  }, []);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
      setScreenshotError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMainMemberChange = (index: number, field: keyof MainMember, value: string) => {
    setMainMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addMainMember = () => {
    setMainMembers((prev) => [
      ...prev,
      {
        srNo: prev.length + 1,
        memberNo: formatExecutiveMemberNo(baseMemberSeq + prev.length),
        fullName: "",
        mobileNo: "",
        prabhagNo: "",
      },
    ]);
    // Fee stays strictly 1001, no change!
  };

  const deleteMainMember = (indexToDelete: number) => {
    setMainMembers((prev) => {
      if (prev.length <= 1) return prev;
      const updated = prev.filter((_, idx) => idx !== indexToDelete);
      return updated.map((m, idx) => ({
        ...m,
        srNo: idx + 1,
        memberNo: formatExecutiveMemberNo(baseMemberSeq + idx),
      }));
    });
    // Fee stays strictly 1001, no change!
  };

  const handleFamilyMemberChange = (index: number, field: keyof FamilyMember, value: string) => {
    setFamilyMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addFamilyMemberRow = () => {
    setFamilyMembers((prev) => [
      ...prev,
      { srNo: prev.length + 1, name: "", relation: "", dob: "", occupation: "", mobile: "" },
    ]);
  };

  const deleteFamilyMemberRow = (indexToDelete: number) => {
    setFamilyMembers((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToDelete);
      return updated.map((m, idx) => ({ ...m, srNo: idx + 1 }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.address.trim()) {
      setScreenshotError("⚠️ कृपया संपूर्ण पत्ता प्रविष्ट करा!");
      return;
    }

    for (let i = 0; i < mainMembers.length; i++) {
      const m = mainMembers[i];
      if (!m.fullName.trim() || !m.mobileNo || m.mobileNo.length !== 10 || !m.prabhagNo.trim()) {
        setScreenshotError("⚠️ कृपया मुख्य सदस्याचे पूर्ण नाव, १० अंकी मोबाईल नंबर व प्रभाग नंबर भरा!");
        return;
      }
    }

    if (formData.paymentMethod === "UPI" && !paymentScreenshot) {
      setScreenshotError("⚠️ ऑनलाईन देयकासाठी ट्रान्सअॅक्शनचा स्क्रीनशॉट अपलोड करणे अनिवार्य आहे!");
      return;
    }

    if (formData.paymentMethod === "रोख" && cashPaidStatus !== "yes") {
      setScreenshotError("⚠️ कृपया रोख रक्कम प्राप्त झाल्याची खात्री (होय) निवडा!");
      return;
    }

    setSubmitting(true);
    setSubmitErrorMsg("");
    setSubmitSuccessMsg("");

    try {
      // Register executive member registration record
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: {
            ...formData,
            registrationFee: "1001",
            amountInWords: "एक हजार एक रुपये फक्त",
          },
          mainMembers,
          familyMembers: familyMembers.filter((f) => f.name.trim() !== ""),
          paymentScreenshot: screenshotPreview,
          referredBy: "Super Admin",
        }),
      });

      const result = await res.json();

      if (result.success) {
        // Sync primary main member to Executive Members table
        const primaryMain = mainMembers[0];
        if (primaryMain && primaryMain.fullName) {
          try {
            await fetch(`${API_URL}/api/executives`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fullName: primaryMain.fullName,
                designation: "कार्यकारिणी सदस्य",
                mobileNo: primaryMain.mobileNo,
                city: "अमरावती",
                district: "अमरावती",
                status: "ACTIVE",
              }),
            });
          } catch (e) {
            console.warn("Auto-sync to executive members skipped:", e);
          }
        }

        setSubmittedReceipt({
          receiptNo: formData.receiptNo,
          date: formData.date,
          registrationFee: "1001",
          amountInWords: "एक हजार एक रुपये फक्त",
          address: formData.address,
          paymentMethod: formData.paymentMethod,
          mainMembers: [...mainMembers],
          familyMembers: familyMembers.filter((f) => f.name.trim() !== ""),
        });
        setSubmitSuccessMsg("✅ कार्यकारिणी सदस्य नोंदणी यशस्वीरित्या जतन झाली!");
      } else {
        setSubmitErrorMsg(result.error || "❌ डेटाबेसमध्ये जतन करताना त्रुटी आली.");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitErrorMsg("❌ सर्व्हरशी संपर्क साधताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    "flex-1 w-full bg-transparent border-b-2 border-stone-800 focus:border-amber-700 outline-none px-2 py-1.5 text-sm font-semibold text-stone-900 placeholder:text-stone-400";
  const inputReadOnly =
    "flex-1 w-full bg-amber-100/50 border-b-2 border-stone-800 outline-none px-2 py-1.5 text-sm font-extrabold text-stone-900 cursor-not-allowed select-none";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12 print:p-0 font-sans">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              href="/manage-executives"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-amber-800" />
                <span>Executive Member Registration Form</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                कार्यकारिणी सदस्य ऑनलाईन नोंदणी पावती (पावती क्र. {formData.receiptNo})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-950 border border-amber-400 px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-2xs">
              <Award className="w-4 h-4 text-amber-800" />
              <span>Series: MPTM-EM-R / MPTM-EM-S</span>
            </span>
          </div>
        </div>

        {/* Outer Receipt Form Card */}
        <div className="bg-[#FFFDF9] border-2 border-amber-800/40 rounded-2xl shadow-xl overflow-hidden print:border-none print:shadow-none">
          <form onSubmit={handleSubmit}>
            {/* Header Title Banner */}
            <div className="bg-gradient-to-r from-[#3A0202] via-[#7A0C0C] to-[#3A0202] text-white py-4 px-4 sm:px-6 relative text-center border-b-2 border-amber-400">
              <p className="text-xs font-bold text-amber-400">❖ जय संताजी ❖</p>
              <h2 className="text-lg sm:text-2xl font-black text-amber-200 tracking-wide">
                महाराष्ट्र प्रांतिक तैलिक महासभा
              </h2>
              <p className="text-xs sm:text-sm text-sky-200 font-bold">अमरावती विभाग, अमरावती.</p>
              <div className="inline-block mt-1.5">
                <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-100 font-extrabold text-xs px-4 py-1 rounded-full border border-amber-400 shadow-xs">
                  ★ कार्यकारिणी सदस्य नोंदणी पावती
                </span>
              </div>
            </div>

            {/* Form Body Container */}
            <div className="p-4 sm:p-6 space-y-6 text-stone-900">
              
              {/* SECTION BOX 1: RECEIPT NUMBER & DATE HEADER */}
              <div className="bg-white border-2 border-amber-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                  <FileText className="w-4 h-4 text-amber-800" />
                  <h3 className="font-extrabold text-amber-950 text-xs sm:text-sm">
                    पावती व नोंदणी तपशील (Receipt Series Information)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-stone-800 whitespace-nowrap text-sm">
                      पावती क्र. :
                    </label>
                    <input
                      type="text"
                      value={formData.receiptNo}
                      readOnly
                      className={`${inputReadOnly} font-mono text-amber-950`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="font-bold text-stone-800 whitespace-nowrap text-sm">
                      दिनांक :
                    </label>
                    <input type="text" value={formData.date} readOnly className={inputReadOnly} />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="font-bold text-stone-800 whitespace-nowrap text-sm">
                      नोंदणी शुल्क: रु.
                    </label>
                    <input
                      type="text"
                      value="1001"
                      readOnly
                      className="flex-1 w-full bg-amber-200/80 border-b-2 border-stone-800 outline-none px-2 py-1 text-sm font-black text-[#7A0C0C] cursor-not-allowed select-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION BOX 2: MAIN EXECUTIVE MEMBERS */}
              <div className="bg-white border-2 border-amber-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-amber-950 flex items-center gap-2">
                    <span>👤 मुख्य कार्यकारिणी सदस्य माहिती (Executive Member Series: MPTM-EM-S)</span>
                    <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                      एकूण: {mainMembers.length}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={addMainMember}
                    className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer print:hidden"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ नवीन मुख्य सदस्य जोडा</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {mainMembers.map((member, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-300/80 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-extrabold text-xs text-amber-950 bg-amber-200/90 px-3 py-1 rounded-md border border-amber-300">
                          सदस्य क्रमांक {index + 1} : {member.memberNo}
                        </span>
                        {mainMembers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteMainMember(index)}
                            className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1 cursor-pointer print:hidden"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>हटवा</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            संपूर्ण नाव <span className="text-red-600">*</span>:
                          </label>
                          <input
                            type="text"
                            required
                            value={member.fullName}
                            onChange={(e) => handleMainMemberChange(index, "fullName", e.target.value)}
                            placeholder="उदा. राजस बाळकृष्ण गुळवाडे"
                            className={inputBase}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            मोबाईल क्र. (१० अंकी) <span className="text-red-600">*</span>:
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            value={member.mobileNo}
                            onChange={(e) =>
                              handleMainMemberChange(
                                index,
                                "mobileNo",
                                e.target.value.replace(/\D/g, "").slice(0, 10)
                              )
                            }
                            placeholder="१० अंकी मोबाईल नंबर"
                            className={`${inputBase} font-mono`}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            प्रभाग क्र. / गाव <span className="text-red-600">*</span>:
                          </label>
                          <input
                            type="text"
                            required
                            value={member.prabhagNo}
                            onChange={(e) => handleMainMemberChange(index, "prabhagNo", e.target.value)}
                            placeholder="उदा. प्रभाग क्र. १२ / अमरावती"
                            className={inputBase}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION BOX 3: ADDRESS & AMOUNT IN WORDS */}
              <div className="bg-white border-2 border-amber-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 text-xs sm:text-sm">
                      संपूर्ण पत्ता <span className="text-red-600">*</span>:
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="उदा. घर क्र. १२, राजापेठ, अमरावती"
                      className="w-full bg-transparent border-b-2 border-stone-800 focus:border-amber-700 outline-none p-2 text-sm font-semibold text-stone-900 placeholder:text-stone-400 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-stone-800 text-xs sm:text-sm">
                      अक्षरी रक्कम (Amount in Words):
                    </label>
                    <input
                      type="text"
                      value="एक हजार एक रुपये फक्त"
                      readOnly
                      className={inputReadOnly}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION BOX 4: FAMILY MEMBERS TABULAR BOX */}
              <div className="bg-white border-2 border-amber-200/80 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-amber-950">
                    👨‍👩‍👧‍👦 कुटुंबातील सदस्यांची माहिती (Family Members Details Table)
                  </h3>
                  <button
                    type="button"
                    onClick={addFamilyMemberRow}
                    className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer print:hidden"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ नवीन ओळ जोडा</span>
                  </button>
                </div>

                {/* Family Members Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[650px] border border-amber-200 rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-amber-100/80 text-amber-950 text-xs font-black border-b border-amber-300">
                        <th className="p-2.5 w-12 text-center border-r border-amber-300">अ.क्र.</th>
                        <th className="p-2.5 border-r border-amber-300">सदस्याचे संपूर्ण नाव</th>
                        <th className="p-2.5 border-r border-amber-300">नाते (Relation)</th>
                        <th className="p-2.5 border-r border-amber-300">जन्म तारीख (DOB)</th>
                        <th className="p-2.5 border-r border-amber-300">व्यवसाय (Occupation)</th>
                        <th className="p-2.5 border-r border-amber-300">मोबाईल क्र.</th>
                        <th className="p-2.5 text-center print:hidden">क्रिया</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200/60 text-xs">
                      {familyMembers.map((fm, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/40">
                          <td className="p-2 text-center font-bold border-r border-amber-200">{idx + 1}</td>
                          <td className="p-2 border-r border-amber-200">
                            <input
                              type="text"
                              value={fm.name}
                              onChange={(e) => handleFamilyMemberChange(idx, "name", e.target.value)}
                              placeholder="सदस्याचे नाव"
                              className="w-full bg-transparent border-b border-stone-400 outline-none px-1 py-0.5 text-xs font-semibold"
                            />
                          </td>
                          <td className="p-2 border-r border-amber-200">
                            <input
                              type="text"
                              value={fm.relation}
                              onChange={(e) => handleFamilyMemberChange(idx, "relation", e.target.value)}
                              placeholder="उदा. पत्नी / मुलगा"
                              className="w-full bg-transparent border-b border-stone-400 outline-none px-1 py-0.5 text-xs font-semibold"
                            />
                          </td>
                          <td className="p-2 border-r border-amber-200">
                            <input
                              type="date"
                              value={fm.dob}
                              onChange={(e) => handleFamilyMemberChange(idx, "dob", e.target.value)}
                              className="w-full bg-transparent border-b border-stone-400 outline-none px-1 py-0.5 text-xs font-semibold"
                            />
                          </td>
                          <td className="p-2 border-r border-amber-200">
                            <input
                              type="text"
                              value={fm.occupation}
                              onChange={(e) => handleFamilyMemberChange(idx, "occupation", e.target.value)}
                              placeholder="उदा. नोकरी / व्यवसाय"
                              className="w-full bg-transparent border-b border-stone-400 outline-none px-1 py-0.5 text-xs font-semibold"
                            />
                          </td>
                          <td className="p-2 border-r border-amber-200">
                            <input
                              type="tel"
                              maxLength={10}
                              value={fm.mobile}
                              onChange={(e) =>
                                handleFamilyMemberChange(
                                  idx,
                                  "mobile",
                                  e.target.value.replace(/\D/g, "").slice(0, 10)
                                )
                              }
                              placeholder="मोबाईल क्र."
                              className="w-full bg-transparent border-b border-stone-400 outline-none px-1 py-0.5 text-xs font-mono font-semibold"
                            />
                          </td>
                          <td className="p-2 text-center print:hidden">
                            {familyMembers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => deleteFamilyMemberRow(idx)}
                                className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION BOX 5: PAYMENT & UPI QR CODE BOX WITH MOBILE NUMBER */}
              <div className="bg-white border-2 border-amber-200/80 rounded-2xl p-4 shadow-2xs space-y-4">
                <div className="border-b border-amber-200 pb-2 flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-extrabold text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-800" />
                    <span>देयक पद्धत व युपीआय क्यूआर कोड (Payment & UPI QR Code)</span>
                  </h3>
                  {isPaymentVerified && (
                    <span className="bg-emerald-100 text-emerald-950 border border-emerald-400 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                      ✓ रक्कम रु. 1001 प्राप्त झाली
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  
                  {/* Payment Inputs (Left 7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-stone-800">
                        देयक प्रकार निवडा (Select Payment Method):
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 outline-none focus:border-amber-700"
                      >
                        <option value="UPI">UPI / Online Payment (क्यूआर कोड / ऑनलाईन)</option>
                        <option value="रोख">रोख (Cash Payment)</option>
                      </select>
                    </div>

                    {formData.paymentMethod === "रोख" && (
                      <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-300 space-y-2">
                        <label className="block text-xs font-extrabold text-amber-950">
                          रक्कम भरली? (Cash Received Confirmation):
                        </label>
                        <div className="flex items-center gap-3">
                          <label
                            className={`flex items-center gap-1.5 cursor-pointer font-bold text-xs px-3.5 py-1.5 rounded-lg border transition-all ${
                              cashPaidStatus === "yes"
                                ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                                : "bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="cashPaidStatus"
                              value="yes"
                              checked={cashPaidStatus === "yes"}
                              onChange={() => {
                                setCashPaidStatus("yes");
                                setScreenshotError("");
                              }}
                              className="w-4 h-4 accent-emerald-700 cursor-pointer"
                            />
                            <span>होय (Yes)</span>
                          </label>
                          <label
                            className={`flex items-center gap-1.5 cursor-pointer font-bold text-xs px-3.5 py-1.5 rounded-lg border transition-all ${
                              cashPaidStatus === "no"
                                ? "bg-red-600 text-white border-red-700 shadow-xs"
                                : "bg-white text-red-900 border-red-300 hover:bg-red-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="cashPaidStatus"
                              value="no"
                              checked={cashPaidStatus === "no"}
                              onChange={() => {
                                setCashPaidStatus("no");
                                setScreenshotError("");
                              }}
                              className="w-4 h-4 accent-red-700 cursor-pointer"
                            />
                            <span>नाही (No)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {formData.paymentMethod === "UPI" && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-800">
                          ट्रान्सअॅक्शन स्क्रीनशॉट अपलोड करा <span className="text-red-600">*</span>:
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          className="w-full text-xs font-semibold text-stone-800 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-700 file:text-white hover:file:bg-amber-800 cursor-pointer"
                        />
                        {screenshotPreview && (
                          <div className="mt-2 text-xs font-bold text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>स्क्रीनशॉट यशस्वीरित्या जोडला गेला आहे</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* UPI QR Code & Contact Mobile (Right 5 cols) */}
                  <div className="lg:col-span-5 bg-amber-50/70 p-4 rounded-xl border border-amber-300/80 space-y-3 text-center">
                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-[#7A0C0C]">
                        PhonePe / Google Pay / Paytm QR Code
                      </h4>
                      <p className="text-[11px] text-stone-600 font-semibold">
                        स्कॅन करून ₹1001 भरणा करा
                      </p>
                    </div>

                    {/* QR Image Box */}
                    <div className="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto bg-white p-1.5 rounded-xl border border-amber-300 shadow-xs">
                      <img
                        src="/QR.jpeg"
                        alt="UPI Payment QR Code"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>

                    <p className="text-xs font-bold text-stone-800">
                      Rajas Balkrushna Gulwade
                    </p>

                    {/* Contact Mobile Number */}
                    <div className="bg-white p-2.5 rounded-xl border border-amber-300 text-stone-900 shadow-2xs space-y-1">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-stone-700">
                        <Phone className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" />
                        <span>देयक व अधिक माहितीसाठी संपर्क मोबाईल:</span>
                      </div>
                      <a
                        href="tel:9595707707"
                        className="block text-base sm:text-lg font-black text-[#7A0C0C] font-mono tracking-wider hover:underline"
                      >
                        9595707707
                      </a>
                      <p className="text-[10px] font-bold text-emerald-800 bg-emerald-50 py-0.5 px-2 rounded border border-emerald-200">
                        (PhonePe / Google Pay / UPI पेमेंटसाठी)
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* SANDESH DECLARATION BOX - ONLY SHOWN AFTER PAYMENT VERIFIED */}
              {isPaymentVerified && (
                <div className="p-3.5 rounded-xl bg-amber-100/90 border-2 border-amber-400 text-stone-900 space-y-1 shadow-xs">
                  <p className="text-xs sm:text-sm font-extrabold text-[#7A0C0C] flex items-start gap-1.5">
                    <span className="whitespace-nowrap">संदेश :</span>
                    <span className="text-stone-900 font-extrabold">
                      {typedMessage}
                      {typedMessage.length < FULL_SANDESH_MESSAGE.length && (
                        <span className="inline-block w-1.5 h-3.5 bg-amber-800 ml-1 animate-pulse print:hidden" />
                      )}
                    </span>
                  </p>
                </div>
              )}

              {/* ERROR / SUCCESS ALERTS */}
              {screenshotError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-900 rounded-xl text-xs font-bold">
                  {screenshotError}
                </div>
              )}
              {submitSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-xl text-xs font-bold text-center">
                  {submitSuccessMsg}
                </div>
              )}
              {submitErrorMsg && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-900 rounded-xl text-xs font-bold text-center">
                  {submitErrorMsg}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="pt-2 print:hidden">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-[#7A0C0C] via-[#9E1010] to-[#7A0C0C] hover:from-[#5E0909] hover:to-[#5E0909] text-amber-200 font-black text-sm sm:text-base rounded-xl shadow-lg border border-amber-400 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      <span>जतन होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-5 h-5" />
                      <span>कार्यकारिणी सदस्य नोंदणी जतन करा व पावती प्रिंट करा</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>

        {/* SUBMITTED EXECUTIVE RECEIPT MODAL & PRINT PREVIEW */}
        {submittedReceipt && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print">
            <div className="bg-[#FFFDF9] rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border-2 border-amber-800/40 my-auto font-sans">
              
              {/* Modal Action Header */}
              <div className="bg-gradient-to-r from-[#3A0202] via-[#7A0C0C] to-[#3A0202] text-white p-4 flex items-center justify-between border-b-2 border-amber-400 no-print">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h3 className="text-base font-black text-amber-200">
                      कार्यकारिणी सदस्य नोंदणी यशस्वीरित्या जतन झाली!
                    </h3>
                    <p className="text-xs text-amber-300 font-bold">
                      पावती क्र. : <span className="font-mono text-white font-black">{submittedReceipt.receiptNo}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>पावती प्रिंट काढा (Print)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/manage-executives")}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition cursor-pointer"
                    title="Close & Go to List"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Official Receipt Body */}
              <div id="printable-receipt-card" className="p-4 sm:p-6 space-y-4 text-stone-900 text-xs sm:text-sm">
                
                {/* Header Title Banner */}
                <div className="bg-gradient-to-r from-[#3A0202] via-[#7A0C0C] to-[#3A0202] text-white py-3 px-4 text-center rounded-xl border-b-2 border-amber-400 shadow-xs">
                  <p className="text-xs font-bold text-amber-400">❖ जय संताजी ❖</p>
                  <h2 className="text-base sm:text-2xl font-black text-amber-200 tracking-wide">
                    महाराष्ट्र प्रांतिक तैलिक महासभा
                  </h2>
                  <p className="text-xs text-sky-200 font-bold">अमरावती विभाग, अमरावती.</p>
                  <div className="inline-block mt-1">
                    <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-amber-100 font-extrabold text-xs px-4 py-0.5 rounded-full border border-amber-400 shadow-xs">
                      ★ कार्यकारिणी सदस्य नोंदणी पावती
                    </span>
                  </div>
                </div>

                {/* Top Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-300">
                  <div>
                    <span className="font-bold text-stone-700 text-xs">पावती क्र. : </span>
                    <span className="font-mono font-black text-stone-900 text-sm">{submittedReceipt.receiptNo}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-700 text-xs">दिनांक : </span>
                    <span className="font-bold text-stone-900 text-xs">{submittedReceipt.date}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-700 text-xs">नोंदणी शुल्क : </span>
                    <span className="font-black text-[#7A0C0C] text-sm">₹{submittedReceipt.registrationFee}</span>
                  </div>
                </div>

                {/* Main Member Details */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider border-b border-amber-300 pb-1 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-800" />
                    <span>मुख्य कार्यकारिणी सदस्यांची माहिती ({submittedReceipt.mainMembers.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {submittedReceipt.mainMembers.map((m: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-white border border-amber-300/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between border-b border-stone-200 pb-1 font-bold">
                          <span className="font-mono text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">{m.memberNo}</span>
                          <span className="text-stone-700">प्रभाग क्र. / गाव: {m.prabhagNo}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-semibold">
                          <div>
                            <span className="text-stone-600">संपूर्ण नाव : </span>
                            <span className="font-extrabold text-stone-900">{m.fullName}</span>
                          </div>
                          <div>
                            <span className="text-stone-600">मोबाईल क्र. : </span>
                            <span className="font-mono font-bold text-stone-900">{m.mobileNo}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Address & Amount in Words */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-300 text-xs">
                  <div>
                    <span className="font-bold text-stone-800">संपूर्ण पत्ता : </span>
                    <span className="font-semibold text-stone-900">{submittedReceipt.address}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-800">अक्षरी रक्कम : </span>
                    <span className="font-extrabold text-[#7A0C0C]">{submittedReceipt.amountInWords || convertNumberToMarathiWords(submittedReceipt.registrationFee)}</span>
                  </div>
                </div>

                {/* Family Members Details Table */}
                {submittedReceipt.familyMembers && submittedReceipt.familyMembers.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider border-b border-amber-300 pb-1 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-800" />
                      <span>कौटुंबिक सदस्यांची माहिती ({submittedReceipt.familyMembers.length})</span>
                    </h4>
                    <div className="overflow-x-auto rounded-lg border border-amber-300">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#7A0C0C] text-white font-bold text-center">
                            <th className="p-2 border-r border-amber-700/60">अ.क्र.</th>
                            <th className="p-2 border-r border-amber-700/60">नाव</th>
                            <th className="p-2 border-r border-amber-700/60">नाते</th>
                            <th className="p-2 border-r border-amber-700/60">जन्म दिनांक</th>
                            <th className="p-2 border-r border-amber-700/60">व्यवसाय</th>
                            <th className="p-2">मोबाईल क्र.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-200 text-stone-900 bg-white">
                          {submittedReceipt.familyMembers.map((fam: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 text-center font-bold border-r border-amber-200">{idx + 1}</td>
                              <td className="p-2 font-bold border-r border-amber-200">{fam.name}</td>
                              <td className="p-2 font-medium border-r border-amber-200">{fam.relation}</td>
                              <td className="p-2 border-r border-amber-200">{fam.dob || "-"}</td>
                              <td className="p-2 border-r border-amber-200">{fam.occupation || "-"}</td>
                              <td className="p-2 font-medium">{fam.mobile || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payment Status Row */}
                <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-300 text-xs">
                  <div>
                    <span className="font-bold text-stone-800">देयक पद्धत : </span>
                    <span className="font-extrabold text-stone-900">{submittedReceipt.paymentMethod}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">✓</span>
                    <span>रक्कम रु. 1001 प्राप्त झाली (Payment Verified)</span>
                  </div>
                </div>

                {/* Sandesh Declaration Box */}
                <div className="p-3.5 rounded-xl bg-amber-100/90 border-2 border-amber-400 text-stone-900">
                  <p className="text-xs sm:text-sm font-extrabold text-[#7A0C0C] flex items-start gap-1.5">
                    <span className="whitespace-nowrap">संदेश :</span>
                    <span className="text-stone-900 font-bold">
                      वरील रक्कम महाराष्ट्र प्रांतिक तैलिक महासभेच्या कार्यकारिणी सदस्य नोंदणी शुल्क म्हणून प्राप्त झाली.
                    </span>
                  </p>
                </div>

                {/* Footer Signature Block */}
                <div className="pt-6 border-t border-amber-300 flex items-end justify-between text-xs">
                  <div className="text-stone-600 font-semibold italic">
                    ही पावती सदस्य नोंदणीचा अधिकृत पुरावा म्हणून जतन करावी.
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-36 h-8 border-b-2 border-stone-800 border-dashed mx-auto"></div>
                    <p className="font-extrabold text-[#7A0C0C]">पावती देणाऱ्याची सही / शिक्का</p>
                  </div>
                </div>

                {/* Bottom Modal Actions */}
                <div className="pt-4 flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 no-print">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedReceipt(null);
                      setFormData({
                        receiptNo: formatExecutiveReceiptNo(receiptSeq + 1),
                        date: formatDateToDDMMYYYY(new Date()),
                        registrationFee: "1001",
                        amountInWords: "एक हजार एक रुपये फक्त",
                        address: "",
                        paymentMethod: "UPI",
                        otherPaymentMethod: "",
                        referredBy: "Super Admin",
                      });
                      setMainMembers([
                        {
                          srNo: 1,
                          memberNo: formatExecutiveMemberNo(baseMemberSeq + 1),
                          fullName: "",
                          mobileNo: "",
                          prabhagNo: "",
                        },
                      ]);
                      setFamilyMembers([{ srNo: 1, name: "", relation: "", dob: "", occupation: "", mobile: "" }]);
                      setPaymentScreenshot(null);
                      setScreenshotPreview(null);
                      setCashPaidStatus("");
                      setSubmitSuccessMsg("");
                      fetchNextNumbers();
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    + नवीन कार्यकारिणी नोंदणी करा
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/manage-executives")}
                    className="px-5 py-2 bg-[#7A0C0C] hover:bg-[#5E0909] text-amber-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>कार्याकारिणी यादीकडे जा</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
