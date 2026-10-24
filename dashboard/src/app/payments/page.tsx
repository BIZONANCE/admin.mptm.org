"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { downloadReceiptAsPdf } from "@/utils/pdfUtils";
import {
  CreditCard,
  Search,
  RefreshCw,
  Eye,
  Printer,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  User,
  Phone,
  FileText,
  Calendar,
  Clock,
  ArrowUpRight,
  Filter,
  Users,
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  ShieldAlert,
  Code,
  Sparkles,
  Globe,
  MessageSquare,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getApiUrl, getMainSiteUrl } from "@/utils/config";
import { convertNumberToMarathiWords, formatPaymentMethod, formatDateToDDMMYYYY } from "@/utils/formatters";

interface AllPaymentItem {
  id: string;
  orderId?: string;
  receiptNo?: string | null;
  publicToken?: string | null;
  category: "REGISTRATION" | "DONATION";
  type: "PRIMARY" | "EXECUTIVE" | "DONATION";
  status: "SUCCESS" | "FAILED" | "PENDING";
  amount: number;
  amountInWords?: string;
  name: string;
  memberNo?: string | null;
  mobile: string;
  city?: string;
  prabhag?: string;
  mainCount?: number;
  familyCount?: number;
  mainMembers?: any[];
  familyMembers?: any[];
  address?: string;
  paymentMode: string;
  referredBy?: string | null;
  failureReason?: string | null;
  failureCode?: string | null;
  gatewayResponse?: any;
  createdAt: string;
  date?: string | null;
  hasValidHmac?: boolean;
}

function getPaymentDateAndTime(item: { createdAt?: string; date?: string | null }) {
  if (item.createdAt) {
    try {
      const d = new Date(item.createdAt);
      if (!isNaN(d.getTime())) {
        const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
        const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
        return { date, time };
      }
    } catch {}
  }
  return { date: item.date || "-", time: "-" };
}

interface SuccessfulPaymentItem {
  id: string;
  category: "REGISTRATION" | "DONATION";
  type: "PRIMARY" | "EXECUTIVE" | "DONATION";
  receiptNo: string;
  orderId: string;
  publicToken: string;
  amount: number;
  amountInWords?: string;
  name: string;
  memberNo?: string | null;
  mobile: string;
  memberCount: number;
  familyCount: number;
  mainMembers?: any[];
  members?: any[];
  familyMembers?: any[];
  address?: string;
  gaav?: string;
  taluka?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: string;
  paymentMode: string;
  date: string;
  createdAt: string;
  receiptHmac?: string;
  hasValidHmac: boolean;
  status: string;
}

interface FailedPaymentItem {
  id: string;
  pendingPaymentId?: string;
  orderId: string;
  type: string;
  amount: number;
  name: string;
  mobile: string;
  provider: string;
  failureCode: string;
  failureReason: string;
  gatewayResponse?: any;
  purgeAfter?: string;
  createdAt: string;
  status: string;
}

interface SummaryData {
  totalSuccessCount: number;
  totalSuccessInr: number;
  totalFailedCount: number;
  todaySuccessCount: number;
  todaySuccessInr: number;
  todayFailedCount: number;
  totalRegistrations: number;
  totalDonations: number;
}

interface VerificationResult {
  found: boolean;
  valid: boolean;
  category?: string;
  type?: string;
  receiptNo?: string;
  date?: string;
  amount?: number;
  amountInWords?: string;
  name?: string;
  mobile?: string;
  members?: any[];
  familyMembers?: any[];
  familyCount?: number;
  address?: string;
  gaav?: string;
  taluka?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: string;
  paymentMode?: string;
  paymentReference?: string;
  publicToken?: string;
  storedHmac?: string;
  computedHmac?: string;
  status?: string;
  verifiedAt?: string;
  error?: string;
}

// ── Official Organization Seal (मुद्रा / शिक्का with Navbar Logo) ──
function OfficialSeal({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none w-28 h-28 sm:w-32 sm:h-32 ${className}`}>
      {/* Outer circular SVG ring with curved Marathi text */}
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

      {/* Center Official Nav Logo (Santaji Maharaj Emblem) */}
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

// ── Clean Address Formatter without Duplicates ──
function formatDisplayAddress(addrData: {
  address?: string;
  gaav?: string;
  taluka?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
}): string {
  const parts: string[] = [];
  const fullAddr = (addrData.address || "").trim();

  if (fullAddr) {
    parts.push(fullAddr);
  }

  const addrLower = fullAddr.toLowerCase();

  const addIfNew = (val?: string) => {
    if (!val) return;
    const v = val.trim();
    if (!v) return;
    const vLower = v.toLowerCase();

    const alreadyInAddr = addrLower.includes(vLower);
    const alreadyInParts = parts.some((p) => p.toLowerCase() === vLower || p.toLowerCase().includes(vLower));

    const isAmravatiSynonym =
      (vLower === "amravati" || v === "अमरावती") &&
      (addrLower.includes("amravati") || addrLower.includes("अमरावती"));
    const isMaharashtraSynonym =
      (vLower === "maharashtra" || v === "महाराष्ट्र") &&
      (addrLower.includes("maharashtra") || addrLower.includes("महाराष्ट्र"));

    if (!alreadyInAddr && !alreadyInParts && !isAmravatiSynonym && !isMaharashtraSynonym) {
      parts.push(v);
    }
  };

  addIfNew(addrData.gaav);
  addIfNew(addrData.taluka);
  addIfNew(addrData.city);
  addIfNew(addrData.district);
  addIfNew(addrData.state);
  if (addrData.pincode && !fullAddr.includes(addrData.pincode)) {
    parts.push(`पिनकोड - ${addrData.pincode}`);
  }

  return parts.length > 0 ? parts.join(", ") : "-";
}

type Language = "mr" | "en";

const PAYMENT_TEXTS = {
  mr: {
    pageTitle: "पेमेंट्स व पावती व्यवस्थापन",
    pageSubtitle: "यशस्वी व अयशस्वी पेमेंट्सचे थेट संकलन आणि अधिकृत पावती पडताळणी",
    refresh: "रिफ्रेश करा",
    // Stats
    totalSuccessTitle: "एकूण यशस्वी संकलन",
    transactionsUnit: "व्यवहार",
    regLabel: "नोंदणी",
    donationLabel: "देणगी",
    todaySuccessTitle: "आजचे संकलन",
    todayTransactionsUnit: "आजचे व्यवहार",
    failedTitle: "अयशस्वी व्यवहार",
    todayFailedUnit: "आजचे अयशस्वी",
    retentionBadge: "९० दिवस डेटा संचयन",
    securityTitle: "सुरक्षा व सत्यता",
    securityBadge: "१००% डिजिटल स्वाक्षरी पडताळणी",
    securityDesc: "प्रत्येक पावतीवर डिजिटल स्वाक्षरी व स्वतंत्र क्यूआर कोड पडताळणी उपलब्ध",
    // Tabs
    tabAll: "सर्व व्यवहार",
    tabSuccess: "यशस्वी पेमेंट्स",
    tabFailed: "अयशस्वी पेमेंट्स",
    tabVerify: "पावती पडताळणी",
    allSubtitleHint: "प्रयत्न केलेले सर्व व्यवहार (यशस्वी, अयशस्वी व प्रलंबित) एकाच ठिकाणी सेकंडनुसार थेट",
    // Tab 0 All
    searchAllPlaceholder: "पावती क्र., ऑर्डर आयडी, नाव, मोबाईल किंवा कारण शोधा...",
    statusFilterLabel: "स्थिती:",
    statusAll: "सर्व स्थिती",
    statusSuccess: "यशस्वी",
    statusFailed: "अयशस्वी",
    statusPending: "प्रलंबित",
    loadingAll: "सर्व व्यवहार लोड होत आहेत...",
    emptyAll: "कोणतेही व्यवहार सापडले नाहीत.",
    statusSucceededBadge: "यशस्वी",
    statusFailedBadge: "अयशस्वी",
    statusPendingBadge: "प्रलंबित",
    // Common Columns (Exact 10 Columns)
    thIndex: "अनु. क्र.",
    thDateTime: "तारीख व वेळ",
    thReceiptNo: "पावती क्रमांक",
    thOrderId: "ऑर्डर आयडी / संदर्भ",
    thMember: "सदस्य",
    thType: "प्रकार",
    thAmount: "रक्कम",
    thCardUpi: "कार्ड / UPI",
    thStatus: "स्थिती",
    thActions: "क्रिया",
    // Tab 1 Success
    searchSuccessPlaceholder: "पावती क्र., ऑर्डर आयडी, सदस्याचे नाव, मोबाईल किंवा टोकन शोधा...",
    typeFilterLabel: "प्रकार:",
    typeAll: "सर्व",
    typePrimary: "प्राथमिक सदस्य",
    typeExecutive: "कार्यकारिणी सदस्य",
    typeDonation: "देणगी",
    thPayer: "सदस्य / देणगीदार",
    thSecurity: "डिजिटल सुरक्षा",
    loadingSuccess: "यशस्वी पेमेंट्स लोड होत आहेत...",
    emptySuccess: "कोणतेही यशस्वी पेमेंट्स सापडले नाहीत.",
    badgeDonationRec: "देणगी पावती",
    badgeExecRec: "कार्यकारिणी पावती",
    badgePrimaryRec: "प्राथमिक पावती",
    badgeTypeDonation: "देणगी",
    badgeTypeExec: "कार्यकारिणी",
    badgeTypePrimary: "प्राथमिक",
    badgePaid: "यशस्वी",
    badgeHmacVerified: "स्वाक्षरी सत्यापित",
    moreMembers: (n: number) => `+${n} इतर सदस्य`,
    pageInfo: (curr: number, totalPages: number, total: number) =>
      `एकूण ${total} पैकी पृष्ठ ${curr} / ${totalPages}`,
    viewReceiptTooltip: "पावती पहा",
    publicLinkTooltip: "सार्वजनिक पडताळणी लिंक उघडा",
    copyReceiptTooltip: "पावती क्रमांक कॉपी करा",
    copyOrderTooltip: "ऑर्डर आयडी कॉपी करा",
    // Tab 2 Failed
    retentionPolicyTitle: "गोपनीयता व डेटा नष्टीकरण धोरण:",
    retentionPolicyDesc:
      "अयशस्वी किंवा रद्द झालेल्या व्यवहारांचा डेटा ९० दिवसांनंतर आपोआप सुरक्षितपणे कायमस्वरूपी नष्ट केला जातो.",
    searchFailedPlaceholder: "ऑर्डर आयडी, नाव, मोबाईल, अपयशाचे कारण किंवा त्रुटी कोड शोधा...",
    thAttemptedPayer: "प्रयत्नकर्त्याचे नाव व मोबाईल",
    thAttemptedAmount: "अंदाजित रक्कम",
    thFailureReason: "अपयशाचे कारण",
    thErrorCode: "त्रुटी कोड",
    loadingFailed: "अयशस्वी पेमेंट्स लोड होत आहेत...",
    emptyFailed: "कोणतेही अयशस्वी पेमेंट्स सापडले नाहीत.",
    badgeFailed: "अयशस्वी",
    diagBtn: "तपशील",
    purgeInfo: (date: string) => `नष्टीकरण: ${date}`,
    // Tab 3 Verify
    verifyHeaderTitle: "क्रिप्टोग्राफिक पावती सत्यता पडताळणी",
    verifyHeaderDesc:
      "पावती क्रमांक, सुरक्षित डिजिटल टोकन किंवा मर्चंट ऑर्डर आयडी प्रविष्ट करून पावतीची सत्यता तपासा.",
    verifyPlaceholder: "पावती क्रमांक, सुरक्षित टोकन किंवा ऑर्डर आयडी टाका...",
    verifyBtn: "सत्यता पडताळा",
    verifyingBtn: "पडताळणी चालू आहे...",
    recentTestLabel: "अलीकडील पावतीची चाचणी:",
    validTitle: "अधिकृत व खरी पावती",
    validBadge: "डिजिटल स्वाक्षरी जुळली",
    validDesc:
      "या पावतीवरील डेटा डेटाबेस व डिजिटल स्वाक्षरीशी अचूक जुळतो. कोणतीही छेडछाड झालेली नाही.",
    viewReceiptBtn: "पावती पहा",
    publicLinkBtn: "सार्वजनिक लिंक",
    storedHmacLabel: "डेटाबेसमधील सुरक्षित स्वाक्षरी:",
    computedHmacLabel: "सिस्टमने पुनर्गणना केलेली स्वाक्षरी:",
    lblReceiptNo: "पावती क्रमांक:",
    lblDate: "दिनांक:",
    lblAmount: "रक्कम:",
    lblPaymentMode: "पेमेंट संदर्भ / पद्धत:",
    lblName: "सदस्य / देणगीदाराचे नाव:",
    lblMobile: "मोबाईल क्रमांक:",
    lblMembersCount: (count: number) => `नोंदणीकृत मुख्य सदस्य (${count})`,
    lblPrabhagNo: "प्रभाग क्र.:",
    invalidTitle: "अवैध किंवा बनावट पावती",
    invalidDescDefault: "ही पावती डेटाबेसमध्ये अस्तित्वात नाही किंवा डिजिटल स्वाक्षरीमध्ये विसंगती आहे.",
    // Modals
    receiptModalTitle: "अधिकृत पावती",
    openWebsiteBtn: "वेबसाईटवर उघडा",
    printBtn: "प्रिंट",
    downloadBtn: "PDF डाऊनलोड",
    downloadingBtn: "डाऊनलोड होत आहे...",
    diagModalTitle: "अयशस्वी पेमेंट तपशील",
    diagAttemptedName: "प्रयत्नकर्त्याचे नाव:",
    diagMobile: "मोबाईल:",
    diagAmount: "अंदाजित रक्कम:",
    diagErrorCode: "त्रुटी कोड:",
    diagFailureReason: "अपयशाचे कारण:",
    diagGatewayResponse: "गेटवे थेट प्रतिसाद:",
    diagPurgeNotice: (date: string) => `नोंद: हा लॉग ${date} रोजी डेटाबेसमधून कायमचा नष्ट होईल.`,
    closeBtn: "बंद करा",
  },
  en: {
    pageTitle: "Payments & Receipts Management",
    pageSubtitle: "Real-time tracking of successful & failed payments and official receipt verification",
    refresh: "Refresh",
    // Stats
    totalSuccessTitle: "Total Successful Collection",
    transactionsUnit: "Transactions",
    regLabel: "Registrations",
    donationLabel: "Donations",
    todaySuccessTitle: "Today's Collection",
    todayTransactionsUnit: "Today's Transactions",
    failedTitle: "Failed Transactions",
    todayFailedUnit: "Failed Today",
    retentionBadge: "90-Day Retention",
    securityTitle: "Security & Authenticity",
    securityBadge: "100% Cryptographic Audit",
    securityDesc: "Each receipt is backed by digital signature and independent QR code audit",
    // Tabs
    tabAll: "All Payments",
    tabSuccess: "Successful Payments",
    tabFailed: "Failed Payments",
    tabVerify: "Verify Receipt",
    allSubtitleHint: "Unified chronological audit trail of all attempts (Success, Failed & Pending) by every second",
    // Tab 0 All
    searchAllPlaceholder: "Search receipt no, order ID, member name, mobile, reason...",
    statusFilterLabel: "Status:",
    statusAll: "All Status",
    statusSuccess: "Successful",
    statusFailed: "Failed",
    statusPending: "Pending",
    loadingAll: "Loading all payments...",
    emptyAll: "No payments found.",
    statusSucceededBadge: "Succeeded",
    statusFailedBadge: "Failed",
    statusPendingBadge: "Pending",
    // Common Columns (Exact 10 Columns)
    thIndex: "#",
    thDateTime: "Date & Time",
    thReceiptNo: "Receipt No",
    thOrderId: "Order ID / Ref",
    thMember: "Member",
    thType: "Type",
    thAmount: "Amount",
    thCardUpi: "Card / UPI",
    thStatus: "Status",
    thActions: "Actions",
    // Tab 1 Success
    searchSuccessPlaceholder: "Search receipt no, order ID, member name, mobile, or token...",
    typeFilterLabel: "Type:",
    typeAll: "All",
    typePrimary: "Primary Member",
    typeExecutive: "Executive Member",
    typeDonation: "Donation",
    thPayer: "Member / Donor",
    thSecurity: "Digital Security",
    loadingSuccess: "Loading successful payments...",
    emptySuccess: "No successful payments found.",
    badgeDonationRec: "Donation Receipt",
    badgeExecRec: "Executive Receipt",
    badgePrimaryRec: "Primary Receipt",
    badgeTypeDonation: "Donation",
    badgeTypeExec: "Executive",
    badgeTypePrimary: "Primary",
    badgePaid: "Paid",
    badgeHmacVerified: "HMAC Verified",
    moreMembers: (n: number) => `+${n} more members`,
    pageInfo: (curr: number, totalPages: number, total: number) =>
      `Page ${curr} of ${totalPages} (Total: ${total})`,
    viewReceiptTooltip: "View Receipt",
    publicLinkTooltip: "Open Public Verification Link",
    copyReceiptTooltip: "Copy Receipt No",
    copyOrderTooltip: "Copy Order ID",
    // Tab 2 Failed
    retentionPolicyTitle: "Privacy & Retention Policy:",
    retentionPolicyDesc:
      "Failed or cancelled transaction records are automatically and permanently purged after 90 days.",
    searchFailedPlaceholder: "Search order ID, name, mobile, failure reason, or error code...",
    thAttemptedPayer: "Attempted Name & Mobile",
    thAttemptedAmount: "Attempted Amount",
    thFailureReason: "Failure Reason",
    thErrorCode: "Error Code",
    loadingFailed: "Loading failed payments...",
    emptyFailed: "No failed payments found.",
    badgeFailed: "Failed",
    diagBtn: "Diagnostics",
    purgeInfo: (date: string) => `Purge: ${date}`,
    // Tab 3 Verify
    verifyHeaderTitle: "Cryptographic Receipt Verification Tool",
    verifyHeaderDesc:
      "Enter receipt number, secure digital token, or merchant order ID to audit authenticity.",
    verifyPlaceholder: "Enter receipt number, secure token, or order ID...",
    verifyBtn: "Verify Receipt",
    verifyingBtn: "Verifying...",
    recentTestLabel: "Test recent receipt:",
    validTitle: "Authentic & Valid Receipt",
    validBadge: "HMAC SHA-256 MATCH",
    validDesc:
      "The receipt data precisely matches the official database and cryptographic signature. No tampering detected.",
    viewReceiptBtn: "View Receipt",
    publicLinkBtn: "Public Link",
    storedHmacLabel: "Database Cryptographic Signature:",
    computedHmacLabel: "Recomputed Verification HMAC:",
    lblReceiptNo: "Receipt No:",
    lblDate: "Date:",
    lblAmount: "Amount:",
    lblPaymentMode: "Payment Ref / Method:",
    lblName: "Member / Donor Name:",
    lblMobile: "Mobile Number:",
    lblMembersCount: (count: number) => `Registered Members (${count})`,
    lblPrabhagNo: "Prabhag No:",
    invalidTitle: "Invalid or Unverified Receipt",
    invalidDescDefault: "This receipt does not exist in the database or there is a signature mismatch.",
    // Modals
    receiptModalTitle: "Official Receipt",
    openWebsiteBtn: "Open on Website",
    printBtn: "Print",
    downloadBtn: "Download PDF",
    downloadingBtn: "Downloading...",
    diagModalTitle: "Failed Payment Diagnostics",
    diagAttemptedName: "Attempted Name:",
    diagMobile: "Mobile:",
    diagAmount: "Attempted Amount:",
    diagErrorCode: "Error Code:",
    diagFailureReason: "Failure Reason:",
    diagGatewayResponse: "Gateway Raw Response:",
    diagPurgeNotice: (date: string) => `Note: This diagnostic log will be purged on ${date}.`,
    closeBtn: "Close",
  },
};

export default function PaymentsPage() {
  const router = useRouter();
  const API_URL = getApiUrl();
  const MAIN_SITE_URL = getMainSiteUrl();

  // Language state: 'mr' (Marathi) | 'en' (English)
  const [lang, setLang] = useState<Language>("mr");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("mptm_payments_lang") as Language;
      if (savedLang === "mr" || savedLang === "en") {
        setLang(savedLang);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleLang = (newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem("mptm_payments_lang", newLang);
    } catch {
      // ignore
    }
  };

  const text = PAYMENT_TEXTS[lang];

  // Active Tab: ALL | SUCCESSFUL | FAILED | VERIFY
  const [activeTab, setActiveTab] = useState<"ALL" | "SUCCESSFUL" | "FAILED" | "VERIFY">("ALL");

  // Summary Metrics
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);

  // Tab 0: All Payments (Unified chronological view of all attempts down to every second)
  const [allList, setAllList] = useState<AllPaymentItem[]>([]);
  const [searchAll, setSearchAll] = useState<string>("");
  const [statusFilterAll, setStatusFilterAll] = useState<string>("ALL");
  const [typeFilterAll, setTypeFilterAll] = useState<string>("ALL");
  const [pageAll, setPageAll] = useState<number>(1);
  const [totalPagesAll, setTotalPagesAll] = useState<number>(1);
  const [totalAllItems, setTotalAllItems] = useState<number>(0);
  const [loadingAll, setLoadingAll] = useState<boolean>(true);
  const [selectedPendingItem, setSelectedPendingItem] = useState<AllPaymentItem | null>(null);

  // Tab 1: Successful Payments
  const [successfulList, setSuccessfulList] = useState<SuccessfulPaymentItem[]>([]);
  const [searchSuccess, setSearchSuccess] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [pageSuccess, setPageSuccess] = useState<number>(1);
  const [totalPagesSuccess, setTotalPagesSuccess] = useState<number>(1);
  const [totalSuccessItems, setTotalSuccessItems] = useState<number>(0);
  const [loadingSuccess, setLoadingSuccess] = useState<boolean>(true);

  // Tab 2: Failed Payments
  const [failedList, setFailedList] = useState<FailedPaymentItem[]>([]);
  const [searchFailed, setSearchFailed] = useState<string>("");
  const [pageFailed, setPageFailed] = useState<number>(1);
  const [totalPagesFailed, setTotalPagesFailed] = useState<number>(1);
  const [totalFailedItems, setTotalFailedItems] = useState<number>(0);
  const [loadingFailed, setLoadingFailed] = useState<boolean>(true);

  // Tab 3: Verify Receipt
  const [verifyQuery, setVerifyQuery] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);

  // User & Super Admin session state
  const [loggedUserEmail, setLoggedUserEmail] = useState<string>("");
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("mptm_admin_logged_in");
      if (!loggedIn) {
        router.replace("/login");
        return;
      }
      const role = localStorage.getItem("mptm_admin_role");
      const username = localStorage.getItem("mptm_admin_username") || "";
      const lowerUser = username.toLowerCase();
      const superAdminStatus =
        role === "SUPER_ADMIN" ||
        lowerUser === "mptmamravati.org" ||
        lowerUser === "admin@mptmamravati.org" ||
        lowerUser === "admin" ||
        lowerUser === "superadmin";
      setIsSuperAdmin(superAdminStatus);
      setLoggedUserEmail(username);
    }
  }, [router]);

  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState<SuccessfulPaymentItem | VerificationResult | null>(null);
  const [selectedFailedDiag, setSelectedFailedDiag] = useState<FailedPaymentItem | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper copy function
  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format Date & Time in IST
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  // Format Date Only
  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // 0. Fetch All Payments (Unified chronological view down to every second)
  const fetchAllPayments = useCallback(async () => {
    try {
      setLoadingAll(true);
      const role = localStorage.getItem("mptm_admin_role") || "USER";
      const username = localStorage.getItem("mptm_admin_username") || "";
      const lowerUser = username.toLowerCase();
      const isSuper =
        role === "SUPER_ADMIN" ||
        lowerUser === "mptmamravati.org" ||
        lowerUser === "admin@mptmamravati.org" ||
        lowerUser === "admin" ||
        lowerUser === "superadmin";
      const effectiveRole = isSuper ? "SUPER_ADMIN" : role;

      const params = new URLSearchParams({
        page: String(pageAll),
        limit: "25",
        search: searchAll.trim(),
        status: statusFilterAll,
        type: typeFilterAll,
        userEmail: username,
        userRole: effectiveRole,
      });

      const res = await fetch(`${API_URL}/api/admin/payments/all?${params.toString()}`, {
        headers: {
          "x-user-email": username,
          "x-user-role": effectiveRole,
        },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.items)) {
        let items: AllPaymentItem[] = data.items;
        if (!isSuper) {
          items = items.filter((item) => item.category !== "DONATION");
        }
        setAllList(items);
        setTotalPagesAll(data.totalPages || 1);
        setTotalAllItems(data.total || 0);
      }
    } catch (err) {
      console.error("All payments fetch error:", err);
    } finally {
      setLoadingAll(false);
    }
  }, [API_URL, pageAll, searchAll, statusFilterAll, typeFilterAll]);

  // 1. Fetch Summary
  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const role = localStorage.getItem("mptm_admin_role") || "USER";
      const username = localStorage.getItem("mptm_admin_username") || "";
      const lowerUser = username.toLowerCase();
      const isSuper =
        role === "SUPER_ADMIN" ||
        lowerUser === "mptmamravati.org" ||
        lowerUser === "admin@mptmamravati.org" ||
        lowerUser === "admin" ||
        lowerUser === "superadmin";
      const effectiveRole = isSuper ? "SUPER_ADMIN" : role;

      const params = new URLSearchParams({
        userEmail: username,
        userRole: effectiveRole,
      });
      const res = await fetch(`${API_URL}/api/admin/payments/summary?${params.toString()}`, {
        headers: {
          "x-user-email": username,
          "x-user-role": effectiveRole,
        },
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setSummary(data.data);
      }
    } catch (err) {
      console.error("Summary fetch error:", err);
    } finally {
      setSummaryLoading(false);
    }
  }, [API_URL]);

  // 2. Fetch Successful Payments
  const fetchSuccessful = useCallback(async () => {
    try {
      setLoadingSuccess(true);
      const role = localStorage.getItem("mptm_admin_role") || "USER";
      const username = localStorage.getItem("mptm_admin_username") || "";
      const lowerUser = username.toLowerCase();
      const isSuper =
        role === "SUPER_ADMIN" ||
        lowerUser === "mptmamravati.org" ||
        lowerUser === "admin@mptmamravati.org" ||
        lowerUser === "admin" ||
        lowerUser === "superadmin";
      const effectiveRole = isSuper ? "SUPER_ADMIN" : role;

      const params = new URLSearchParams({
        page: String(pageSuccess),
        limit: "25",
        search: searchSuccess.trim(),
        type: typeFilter,
        userEmail: username,
        userRole: effectiveRole,
      });
      const res = await fetch(`${API_URL}/api/admin/payments/successful?${params.toString()}`, {
        headers: {
          "x-user-email": username,
          "x-user-role": effectiveRole,
        },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.items)) {
        // Defense-in-depth: If not super admin, exclude donations and non-matching referrers
        let items = data.items;
        if (!isSuper) {
          items = items.filter((item: SuccessfulPaymentItem) => {
            if (item.category === "DONATION") return false;
            return true;
          });
        }
        setSuccessfulList(items);
        setTotalPagesSuccess(data.totalPages || 1);
        setTotalSuccessItems(data.total || 0);
      }
    } catch (err) {
      console.error("Successful payments fetch error:", err);
    } finally {
      setLoadingSuccess(false);
    }
  }, [API_URL, pageSuccess, searchSuccess, typeFilter]);

  // 3. Fetch Failed Payments
  const fetchFailed = useCallback(async () => {
    try {
      setLoadingFailed(true);
      const role = localStorage.getItem("mptm_admin_role") || "USER";
      const username = localStorage.getItem("mptm_admin_username") || "";
      const lowerUser = username.toLowerCase();
      const isSuper =
        role === "SUPER_ADMIN" ||
        lowerUser === "mptmamravati.org" ||
        lowerUser === "admin@mptmamravati.org" ||
        lowerUser === "admin" ||
        lowerUser === "superadmin";
      const effectiveRole = isSuper ? "SUPER_ADMIN" : role;

      const params = new URLSearchParams({
        page: String(pageFailed),
        limit: "25",
        search: searchFailed.trim(),
        userEmail: username,
        userRole: effectiveRole,
      });
      const res = await fetch(`${API_URL}/api/admin/payments/failed?${params.toString()}`, {
        headers: {
          "x-user-email": username,
          "x-user-role": effectiveRole,
        },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.items)) {
        setFailedList(data.items);
        setTotalPagesFailed(data.totalPages || 1);
        setTotalFailedItems(data.total || 0);
      }
    } catch (err) {
      console.error("Failed payments fetch error:", err);
    } finally {
      setLoadingFailed(false);
    }
  }, [API_URL, pageFailed, searchFailed]);

  // Initial load
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (activeTab === "ALL") {
      fetchAllPayments();
    } else if (activeTab === "SUCCESSFUL") {
      fetchSuccessful();
    } else if (activeTab === "FAILED") {
      fetchFailed();
    }
  }, [activeTab, fetchAllPayments, fetchSuccessful, fetchFailed]);

  // Execute verification
  const handleVerifyReceipt = async (queryToVerify?: string) => {
    const q = (queryToVerify || verifyQuery).trim();
    if (!q) return;

    try {
      setVerifying(true);
      setVerifyResult(null);
      const role = localStorage.getItem("mptm_admin_role") || "USER";
      const username = localStorage.getItem("mptm_admin_username") || "";
      const lowerUser = username.toLowerCase();
      const isSuper =
        role === "SUPER_ADMIN" ||
        lowerUser === "mptmamravati.org" ||
        lowerUser === "admin@mptmamravati.org" ||
        lowerUser === "admin" ||
        lowerUser === "superadmin";
      const effectiveRole = isSuper ? "SUPER_ADMIN" : role;

      const res = await fetch(`${API_URL}/api/admin/payments/verify-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": username,
          "x-user-role": effectiveRole,
        },
        body: JSON.stringify({ query: q, userEmail: username, userRole: effectiveRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyResult(data);
      } else {
        setVerifyResult({
          found: false,
          valid: false,
          error: data.error || "पावती सापडली नाही किंवा क्रमांक अवैध आहे.",
        });
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setVerifyResult({
        found: false,
        valid: false,
        error: "पडताळणी दरम्यान नेटवर्क त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
      });
    } finally {
      setVerifying(false);
    }
  };

  // Print Receipt (sets document.title to receipt ID so browser print/Save as PDF uses the receipt ID)
  const handlePrintReceipt = (receiptNo: string) => {
    const originalTitle = document.title;
    const safeReceiptId = (receiptNo || "Receipt").trim().replace(/[/\\?%*:|"<>]/g, "-");
    document.title = safeReceiptId;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  // Download PDF
  const handleDownloadPdf = async (receiptNo: string) => {
    const safeReceiptId = (receiptNo || "Receipt").trim().replace(/[/\\?%*:|"<>]/g, "-");
    const originalTitle = document.title;
    document.title = safeReceiptId;
    try {
      setDownloadingPdf(true);
      await downloadReceiptAsPdf("printable-payment-receipt", `${safeReceiptId}.pdf`);
    } finally {
      setDownloadingPdf(false);
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    }
  };

  // WhatsApp Share Handler
  const handleSendPaymentWhatsApp = (receipt: any) => {
    if (!receipt) return;
    const mainMembers = Array.isArray(receipt.mainMembers)
      ? receipt.mainMembers
      : Array.isArray(receipt.members)
      ? receipt.members
      : [];
    const main = mainMembers[0];
    const rawMobile = receipt.mobile || main?.mobileNo || "";
    const mobile = rawMobile.replace(/\D/g, "");
    const cleanPhone = mobile.length === 10 ? `91${mobile}` : mobile;
    const isDonation = receipt.category === "DONATION";
    const isExec =
      receipt.type === "EXECUTIVE" ||
      Boolean(
        receipt.receiptNo &&
          (receipt.receiptNo.startsWith("MPTM-EM-") || receipt.receiptNo.includes("EM-R"))
      );
    const title = isDonation
      ? "★ अधिकृत देणगी पावती ★"
      : isExec
      ? "★ कार्यकारिणी सदस्य नोंदणी पावती ★"
      : "★ प्राथमिक सदस्य नोंदणी पावती ★";

    const memberName = main?.fullName || receipt.name || "-";
    const memberMobile = main?.mobileNo || receipt.mobile || "-";
    const displayAddr = formatDisplayAddress(receipt);
    const dateStr = formatDateToDDMMYYYY(receipt.date || receipt.createdAt);
    const amountInWords =
      receipt.amountInWords || convertNumberToMarathiWords(receipt.amount || 0);

    const textMessage = `🚩 *महाराष्ट्र प्रांतिक तैलिक महासभा (अमरावती)* 🚩
${title}

----------------------------------
📄 *पावती क्र.* : ${receipt.receiptNo}
📅 *दिनांक* : ${dateStr}
👤 *नाव* : ${memberName}
📱 *मोबाईल क्र.* : ${memberMobile}
${displayAddr && displayAddr !== "-" ? `📍 *पत्ता* : ${displayAddr}\n` : ""}💰 *रक्कम* : ₹${receipt.amount}/- (${amountInWords})
💳 *देयक पद्धत* : ${formatPaymentMethod(receipt.paymentMode)}
✅ *स्थिती* : प्राप्त व सत्यापित (Payment Verified)
----------------------------------

संदेश: ${
      isDonation
        ? "महाराष्ट्र प्रांतिक तैलिक महासभेस देणगी दिल्याबद्दल आपले मनःपूर्वक आभार."
        : isExec
        ? "वरील रक्कम महाराष्ट्र प्रांतिक तैलिक महासभेच्या कार्यकारिणी सदस्य नोंदणी शुल्क म्हणून प्राप्त झाली."
        : "वरील रक्कम महाराष्ट्र प्रांतिक तैलिक महासभेच्या प्राथमिक सदस्य नोंदणी शुल्क म्हणून प्राप्त झाली."
    }

_ही पावती अधिकृत संगणकीय डिजिटल पावती आहे._
mptmamravati.org`;

    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 w-full">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-slate-800 shrink-0" />
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {text.pageTitle}
                </h1>
                {isSuperAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-700" />
                    <span>Super Admin</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-700" />
                    <span>{loggedUserEmail || "Staff Portal"}</span>
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isSuperAdmin
                ? text.pageSubtitle
                : lang === "mr"
                ? "तुमच्या नोंदणीकृत सदस्यांचे थेट पेमेंट्स, अयशस्वी व्यवहार व अधिकृत पावती पडताळणी"
                : "Payments, failed attempts, and official receipt verification for your registered members"}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            {/* Marathi / English Language Toggle */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => handleToggleLang("mr")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  lang === "mr"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>मराठी</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleLang("en")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  lang === "en"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>English</span>
              </button>
            </div>

            <button
              onClick={() => {
                fetchSummary();
                if (activeTab === "ALL") fetchAllPayments();
                if (activeTab === "SUCCESSFUL") fetchSuccessful();
                if (activeTab === "FAILED") fetchFailed();
              }}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-2 shadow-2xs cursor-pointer"
              title={text.refresh}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${summaryLoading ? "animate-spin text-amber-600" : ""}`} />
              <span>{text.refresh}</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Success */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {text.totalSuccessTitle}
              </span>
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                ₹
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                ₹{(summary?.totalSuccessInr || 0).toLocaleString("en-IN")}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  {summary?.totalSuccessCount || 0} {text.transactionsUnit}
                </span>
                {isSuperAdmin ? (
                  <span>({text.regLabel}: {summary?.totalRegistrations || 0}, {text.donationLabel}: {summary?.totalDonations || 0})</span>
                ) : (
                  <span>({text.regLabel}: {summary?.totalRegistrations || 0})</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Today's Collection */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50/30 border border-blue-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                {text.todaySuccessTitle}
              </span>
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                ₹{(summary?.todaySuccessInr || 0).toLocaleString("en-IN")}
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  {summary?.todaySuccessCount || 0} {text.todayTransactionsUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Failed Payments */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 via-white to-rose-50/30 border border-rose-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                {text.failedTitle}
              </span>
              <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {summary?.totalFailedCount || 0}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-700 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{text.todayFailedUnit}: {summary?.todayFailedCount || 0}</span>
                <span className="text-[10px] text-slate-400 font-normal ml-auto">({text.retentionBadge})</span>
              </div>
            </div>
          </div>

          {/* Card 4: HMAC Cryptographic Status */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                {text.securityTitle}
              </span>
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-base font-extrabold text-amber-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{text.securityBadge}</span>
              </div>
              <div className="mt-1.5 text-xs text-slate-600 leading-snug">
                {text.securityDesc}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls Bar (Matching Members Tab Capsule Bar) */}
        <div className="flex items-center gap-1.5 w-full bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto">
          {/* Tab 0: All Payments */}
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "ALL"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <CreditCard className={`w-4 h-4 ${activeTab === "ALL" ? "text-amber-600" : "text-slate-500"}`} />
            <span>{text.tabAll}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeTab === "ALL"
                  ? "bg-slate-200/80 text-slate-900"
                  : "bg-slate-200/80 text-slate-700"
              }`}
            >
              {totalAllItems || allList.length}
            </span>
          </button>

          {/* Tab 1: Successful Payments */}
          <button
            onClick={() => setActiveTab("SUCCESSFUL")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "SUCCESSFUL"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${activeTab === "SUCCESSFUL" ? "text-emerald-600" : "text-slate-500"}`} />
            <span>{text.tabSuccess}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeTab === "SUCCESSFUL"
                  ? "bg-slate-200/80 text-slate-900"
                  : "bg-slate-200/80 text-slate-700"
              }`}
            >
              {summary?.totalSuccessCount || successfulList.length}
            </span>
          </button>

          {/* Tab 2: Failed Payments */}
          <button
            onClick={() => setActiveTab("FAILED")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "FAILED"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <XCircle className={`w-4 h-4 ${activeTab === "FAILED" ? "text-rose-600" : "text-slate-500"}`} />
            <span>{text.tabFailed}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeTab === "FAILED"
                  ? "bg-slate-200/80 text-slate-900"
                  : "bg-slate-200/80 text-slate-700"
              }`}
            >
              {summary?.totalFailedCount || failedList.length}
            </span>
          </button>

          {/* Tab 3: Verify Receipt */}
          <button
            onClick={() => setActiveTab("VERIFY")}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "VERIFY"
                ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-extrabold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === "VERIFY" ? "text-blue-600" : "text-slate-500"}`} />
            <span>{text.tabVerify}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 0: ALL PAYMENTS (Unified Chronological View)        */}
        {/* ======================================================== */}
        {activeTab === "ALL" && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3">
              {/* Row 1: Search Bar */}
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchAll}
                  onChange={(e) => {
                    setSearchAll(e.target.value);
                    setPageAll(1);
                  }}
                  placeholder={text.searchAllPlaceholder}
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                />
                {searchAll && (
                  <button
                    onClick={() => setSearchAll("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Row 2: Filter Dropdowns */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                    <span className="text-xs font-bold text-slate-700 shrink-0">{text.statusFilterLabel}</span>
                    <select
                      value={statusFilterAll}
                      onChange={(e) => {
                        setStatusFilterAll(e.target.value);
                        setPageAll(1);
                      }}
                      className="bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                    >
                      <option value="ALL">{text.statusAll}</option>
                      <option value="SUCCESS">{text.statusSuccess}</option>
                      <option value="FAILED">{text.statusFailed}</option>
                      <option value="PENDING">{text.statusPending}</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                    <span className="text-xs font-bold text-slate-700 shrink-0">{text.typeFilterLabel}</span>
                    <select
                      value={typeFilterAll}
                      onChange={(e) => {
                        setTypeFilterAll(e.target.value);
                        setPageAll(1);
                      }}
                      className="bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                    >
                      <option value="ALL">{text.typeAll}</option>
                      <option value="PRIMARY">{text.typePrimary}</option>
                      <option value="EXECUTIVE">{text.typeExecutive}</option>
                      {isSuperAdmin && <option value="DONATION">{text.typeDonation}</option>}
                    </select>
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-medium hidden sm:block">
                  <span className="text-slate-400">{text.allSubtitleHint}</span>
                </div>
              </div>
            </div>

            {/* Helper Hint Bar (Matching Members Tab) */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1 mb-2">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Eye className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  {lang === "mr"
                    ? "व्यवहाराचे संपूर्ण तपशील पाहण्यासाठी ओळीवर किंवा 👁️ आयकॉनवर क्लिक करा"
                    : "Click on any row to view full transaction details • Click 👁️ icon for receipt"}
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-semibold font-mono">
                {totalAllItems} {lang === "mr" ? "व्यवहार" : "transactions"}
              </span>
            </div>

            {/* All Payments Table (Exact 10 Columns) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EBF1FA] text-slate-800 text-[11px] font-bold border-b border-slate-200 uppercase tracking-wider whitespace-nowrap">
                      <th className="py-2.5 px-2.5 w-8 text-center">{text.thIndex}</th>
                      <th className="py-2.5 px-3">{text.thDateTime}</th>
                      <th className="py-2.5 px-3">{text.thReceiptNo}</th>
                      <th className="py-2.5 px-3">{text.thOrderId}</th>
                      <th className="py-2.5 px-3">{text.thMember}</th>
                      <th className="py-2.5 px-3">{text.thType}</th>
                      <th className="py-2.5 px-3">{text.thAmount}</th>
                      <th className="py-2.5 px-3">{text.thCardUpi}</th>
                      <th className="py-2.5 px-3">{text.thStatus}</th>
                      <th className="py-2.5 px-3 text-right">{text.thActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                    {loadingAll ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500 font-medium">
                          <RefreshCw className="w-6 h-6 animate-spin text-amber-600 mx-auto mb-2" />
                          {text.loadingAll}
                        </td>
                      </tr>
                    ) : allList.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500 italic">
                          {text.emptyAll}
                        </td>
                      </tr>
                    ) : (
                      allList.map((item, index) => {
                        const rowNumber = (pageAll - 1) * 25 + index + 1;
                        const dt = getPaymentDateAndTime(item);
                        const isExec =
                          item.type === "EXECUTIVE" ||
                          Boolean(
                            item.receiptNo &&
                              (item.receiptNo.startsWith("MPTM-EM-") || item.receiptNo.includes("EM-R"))
                          );
                        const isDonation = item.category === "DONATION" || item.type === "DONATION";

                        return (
                          <tr
                            key={item.id}
                            onClick={() => {
                              if (item.receiptNo) setSelectedReceipt(item as any);
                              else setSelectedPendingItem(item);
                            }}
                            className="hover:bg-amber-50/70 transition cursor-pointer group border-b border-slate-100/80"
                            title={lang === "mr" ? "तपशील पाहण्यासाठी क्लिक करा" : "Click to view full details"}
                          >
                            {/* 1. # Index */}
                            <td className="py-2 px-2.5 text-center font-bold text-slate-400 whitespace-nowrap text-xs">
                              {rowNumber}
                            </td>

                            {/* 2. Date & Time (Down to the second, clean stack) */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              <div className="flex flex-col leading-tight">
                                <span className="font-bold text-slate-900 text-xs">{dt.date}</span>
                                <span className="text-[11px] font-normal text-slate-500 mt-0.5">{dt.time}</span>
                              </div>
                            </td>

                            {/* 3. Receipt No (Clean bold mono text) */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              {item.receiptNo ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-xs text-slate-900">
                                    {item.receiptNo}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(item.receiptNo!, item.id + "-all-rec");
                                    }}
                                    className="text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer"
                                    title={text.copyReceiptTooltip}
                                  >
                                    {copiedId === item.id + "-all-rec" ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-mono text-xs">-</span>
                              )}
                            </td>

                            {/* 4. Order ID / Ref */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              {item.orderId ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs text-slate-600 max-w-[150px] truncate" title={item.orderId}>
                                    {item.orderId}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(item.orderId!, item.id + "-all-ord");
                                    }}
                                    className="text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer"
                                    title={text.copyOrderTooltip}
                                  >
                                    {copiedId === item.id + "-all-ord" ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 font-mono text-xs">-</span>
                              )}
                            </td>

                            {/* 5. Member (Matching Members Table Name & Mobile Layout) */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              <div className="flex flex-col leading-tight">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 text-xs truncate max-w-[170px]" title={item.name || "-"}>
                                    {item.name || "-"}
                                  </span>
                                  {item.memberNo && item.memberNo !== "-" && (
                                    <span className="font-mono text-[11px] text-slate-500 font-medium shrink-0">
                                      ({item.memberNo})
                                    </span>
                                  )}
                                </div>
                                {item.mobile && item.mobile !== "N/A" ? (
                                  <a
                                    href={`tel:${item.mobile}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[11px] font-mono text-slate-500 hover:text-blue-700 flex items-center gap-1 mt-0.5"
                                  >
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{item.mobile}</span>
                                  </a>
                                ) : null}
                              </div>
                            </td>

                            {/* 6. Type (Clean Capsules matching registrations) */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              {isDonation ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-800 bg-pink-100/80 border border-pink-200 px-2 py-0.5 rounded-full">
                                  <Heart className="w-3 h-3 text-pink-600" />
                                  <span>{text.badgeTypeDonation}</span>
                                </span>
                              ) : isExec ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-full">
                                  <Users className="w-3 h-3 text-amber-700" />
                                  <span>{text.badgeTypeExec}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100/80 border border-blue-200 px-2 py-0.5 rounded-full">
                                  <User className="w-3 h-3 text-blue-700" />
                                  <span>{text.badgeTypePrimary}</span>
                                </span>
                              )}
                            </td>

                            {/* 7. Amount */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="font-bold text-slate-900 text-xs">
                                ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                              </span>
                            </td>

                            {/* 8. card/upi */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                                <CreditCard className="w-3 h-3 text-slate-500" />
                                <span>{formatPaymentMethod(item.paymentMode || "Online UPI")}</span>
                              </span>
                            </td>

                            {/* 9. Status (Pill Badges) */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              {item.status === "SUCCESS" ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  <span>{text.statusSucceededBadge}</span>
                                </span>
                              ) : item.status === "FAILED" ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100/90 border border-rose-300 px-2.5 py-0.5 rounded-full">
                                  <XCircle className="w-3 h-3 text-rose-700" />
                                  <span>{text.statusFailedBadge}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-full">
                                  <Clock className="w-3 h-3 text-amber-700" />
                                  <span>{text.statusPendingBadge}</span>
                                </span>
                              )}
                            </td>

                            {/* 10. Actions (Button Styles Matching Registrations) */}
                            <td className="py-2 px-3 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {item.receiptNo ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedReceipt(item as any);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                                    title={text.viewReceiptTooltip}
                                  >
                                    <Eye className="w-4 h-4 text-amber-800" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPendingItem(item);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                                    title="तपशील पहा (View Details)"
                                  >
                                    <Eye className="w-4 h-4 text-amber-800" />
                                  </button>
                                )}

                                {item.status === "SUCCESS" && item.receiptNo && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendPaymentWhatsApp(item);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                                    title="व्हॉट्सॲपवर पाठवा (WhatsApp Receipt)"
                                  >
                                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                                  </button>
                                )}

                                {item.status === "FAILED" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFailedDiag({
                                        id: item.id,
                                        orderId: item.orderId || "N/A",
                                        type: item.type,
                                        amount: item.amount,
                                        name: item.name,
                                        mobile: item.mobile,
                                        provider: item.paymentMode,
                                        failureCode: item.failureCode || "N/A",
                                        failureReason: item.failureReason || "Payment failed or was cancelled",
                                        gatewayResponse: item.gatewayResponse,
                                        createdAt: item.createdAt,
                                        status: "FAILED",
                                      });
                                    }}
                                    className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                                    title="त्रुटी तपशील (View Failure Diagnostics)"
                                  >
                                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                                  </button>
                                )}

                                {item.publicToken && (
                                  <a
                                    href={`${MAIN_SITE_URL}/receipt/${item.publicToken}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 flex items-center justify-center transition shadow-2xs"
                                    title={text.publicLinkTooltip}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPagesAll > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {text.pageInfo(pageAll, totalPagesAll, totalAllItems)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPageAll((p) => Math.max(1, p - 1))}
                      disabled={pageAll <= 1}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPageAll((p) => Math.min(totalPagesAll, p + 1))}
                      disabled={pageAll >= totalPagesAll}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: SUCCESSFUL PAYMENTS (Exact 10 Columns)             */}
        {/* ======================================================== */}
        {activeTab === "SUCCESSFUL" && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 space-y-3">
              {/* Row 1: Search Bar */}
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchSuccess}
                  onChange={(e) => {
                    setSearchSuccess(e.target.value);
                    setPageSuccess(1);
                  }}
                  placeholder={text.searchSuccessPlaceholder}
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                />
                {searchSuccess && (
                  <button
                    onClick={() => setSearchSuccess("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Row 2: Filter Dropdown */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                  <span className="text-xs font-bold text-slate-700 shrink-0">{text.typeFilterLabel}</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setPageSuccess(1);
                    }}
                    className="bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                  >
                    <option value="ALL">{text.typeAll}</option>
                    <option value="PRIMARY">{text.typePrimary}</option>
                    <option value="EXECUTIVE">{text.typeExecutive}</option>
                    {isSuperAdmin && <option value="DONATION">{text.typeDonation}</option>}
                  </select>
                </div>
              </div>
            </div>

            {/* Helper Hint Bar (Matching Members Tab) */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1 mb-2">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Eye className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  {lang === "mr"
                    ? "पावती व संपूर्ण तपशील पाहण्यासाठी ओळीवर किंवा 👁️ आयकॉनवर क्लिक करा"
                    : "Click on any row to view full receipt • Click 👁️ icon for receipt"}
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-semibold font-mono">
                {totalSuccessItems} {lang === "mr" ? "यशस्वी व्यवहार" : "successful payments"}
              </span>
            </div>

            {/* Successful Table (Exact 10 Columns Matching ALL tab) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EBF1FA] text-slate-800 text-[11px] font-bold border-b border-slate-200 uppercase tracking-wider whitespace-nowrap">
                      <th className="py-2.5 px-2.5 w-8 text-center">{text.thIndex}</th>
                      <th className="py-2.5 px-3">{text.thDateTime}</th>
                      <th className="py-2.5 px-3">{text.thReceiptNo}</th>
                      <th className="py-2.5 px-3">{text.thOrderId}</th>
                      <th className="py-2.5 px-3">{text.thMember}</th>
                      <th className="py-2.5 px-3">{text.thType}</th>
                      <th className="py-2.5 px-3">{text.thAmount}</th>
                      <th className="py-2.5 px-3">{text.thCardUpi}</th>
                      <th className="py-2.5 px-3">{text.thStatus}</th>
                      <th className="py-2.5 px-3 text-right">{text.thActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                    {loadingSuccess ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500 font-medium">
                          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                          {text.loadingSuccess}
                        </td>
                      </tr>
                    ) : successfulList.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-slate-500 italic">
                          {text.emptySuccess}
                        </td>
                      </tr>
                    ) : (
                      successfulList.map((item, index) => {
                        const rowNumber = (pageSuccess - 1) * 25 + index + 1;
                        const dt = getPaymentDateAndTime(item);
                        const isExec =
                          item.type === "EXECUTIVE" ||
                          Boolean(
                            item.receiptNo &&
                              (item.receiptNo.startsWith("MPTM-EM-") || item.receiptNo.includes("EM-R"))
                          );
                        const isDonation = item.category === "DONATION";

                        return (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedReceipt(item)}
                            className="hover:bg-amber-50/70 transition cursor-pointer group border-b border-slate-100/80"
                            title={lang === "mr" ? "पावती पाहण्यासाठी क्लिक करा" : "Click to view receipt"}
                          >
                            {/* 1. # Index */}
                            <td className="py-2 px-2.5 text-center font-bold text-slate-400 whitespace-nowrap text-xs">
                              {rowNumber}
                            </td>

                            {/* 2. Date & Time */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              <div className="flex flex-col leading-tight">
                                <span className="font-bold text-slate-900 text-xs">{dt.date}</span>
                                <span className="text-[11px] font-normal text-slate-500 mt-0.5">{dt.time}</span>
                              </div>
                            </td>

                            {/* 3. Receipt No */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs text-slate-900">
                                  {item.receiptNo}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(item.receiptNo, item.id + "-rec");
                                  }}
                                  className="text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer"
                                  title={text.copyReceiptTooltip}
                                >
                                  {copiedId === item.id + "-rec" ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* 4. Order ID / Ref */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs text-slate-600 max-w-[150px] truncate" title={item.orderId}>
                                  {item.orderId}
                                </span>
                                {item.orderId && item.orderId !== "N/A" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(item.orderId, item.id + "-ord");
                                    }}
                                    className="text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer"
                                    title={text.copyOrderTooltip}
                                  >
                                    {copiedId === item.id + "-ord" ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* 5. Member (Matching Members Table Name & Mobile Layout) */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              <div className="flex flex-col leading-tight">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 text-xs truncate max-w-[170px]" title={item.name}>
                                    {item.name}
                                  </span>
                                  {(() => {
                                    const mNo = item.memberNo || (item.mainMembers && item.mainMembers[0]?.memberNo);
                                    if (mNo && mNo !== "-") {
                                      return (
                                        <span className="font-mono text-[11px] text-slate-500 font-medium shrink-0">
                                          ({mNo})
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                                {item.mobile && item.mobile !== "N/A" ? (
                                  <a
                                    href={`tel:${item.mobile}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[11px] font-mono text-slate-500 hover:text-blue-700 flex items-center gap-1 mt-0.5"
                                  >
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{item.mobile}</span>
                                  </a>
                                ) : null}
                              </div>
                            </td>

                            {/* 6. Type (Clean Capsules matching registrations) */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              {isDonation ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-800 bg-pink-100/80 border border-pink-200 px-2 py-0.5 rounded-full">
                                  <Heart className="w-3 h-3 text-pink-600" />
                                  <span>{text.badgeTypeDonation}</span>
                                </span>
                              ) : isExec ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-full">
                                  <Users className="w-3 h-3 text-amber-700" />
                                  <span>{text.badgeTypeExec}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100/80 border border-blue-200 px-2 py-0.5 rounded-full">
                                  <User className="w-3 h-3 text-blue-700" />
                                  <span>{text.badgeTypePrimary}</span>
                                </span>
                              )}
                            </td>

                            {/* 7. Amount */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="font-bold text-slate-900 text-xs">
                                ₹{item.amount.toLocaleString("en-IN")}
                              </span>
                            </td>

                            {/* 8. card/upi */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                                <CreditCard className="w-3 h-3 text-slate-500" />
                                <span>{formatPaymentMethod(item.paymentMode || "Online UPI")}</span>
                              </span>
                            </td>

                            {/* 9. Status (Pill Badge) */}
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                <span>{text.statusSucceededBadge}</span>
                              </span>
                            </td>

                            {/* 10. Actions (Button Styles Matching Registrations) */}
                            <td className="py-2 px-3 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReceipt(item);
                                  }}
                                  className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                                  title={text.viewReceiptTooltip}
                                >
                                  <Eye className="w-4 h-4 text-amber-800" />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSendPaymentWhatsApp(item);
                                  }}
                                  className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                                  title="व्हॉट्सॲपवर पाठवा (WhatsApp Receipt)"
                                >
                                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                                </button>

                                {item.publicToken && (
                                  <a
                                    href={`${MAIN_SITE_URL}/receipt/${item.publicToken}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 flex items-center justify-center transition shadow-2xs"
                                    title={text.publicLinkTooltip}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPagesSuccess > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {text.pageInfo(pageSuccess, totalPagesSuccess, totalSuccessItems)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPageSuccess((p) => Math.max(1, p - 1))}
                      disabled={pageSuccess <= 1}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPageSuccess((p) => Math.min(totalPagesSuccess, p + 1))}
                      disabled={pageSuccess >= totalPagesSuccess}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: FAILED PAYMENTS                                   */}
        {/* ======================================================== */}
        {activeTab === "FAILED" && (
          <div className="space-y-4">
            {/* Retention Notification Banner */}
            <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-900">
              <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <div>
                <p className="font-bold">{text.retentionPolicyTitle}</p>
                <p className="text-rose-700/90 font-medium">
                  {text.retentionPolicyDesc}
                </p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFailed}
                  onChange={(e) => {
                    setSearchFailed(e.target.value);
                    setPageFailed(1);
                  }}
                  placeholder={text.searchFailedPlaceholder}
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                />
                {searchFailed && (
                  <button
                    onClick={() => setSearchFailed("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Helper Hint Bar (Matching Members Tab) */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1 mb-2">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Eye className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>
                  {lang === "mr"
                    ? "त्रुटीचे तांत्रिक विश्लेषण पाहण्यासाठी ओळीवर किंवा डायग्नोस्टिक्सवर क्लिक करा"
                    : "Click on any row or diagnostics button to view gateway failure analysis"}
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-semibold font-mono">
                {totalFailedItems} {lang === "mr" ? "अयशस्वी व्यवहार" : "failed transactions"}
              </span>
            </div>

            {/* Failed Payments Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EBF1FA] text-slate-800 text-[11px] font-bold border-b border-slate-200 uppercase tracking-wider whitespace-nowrap">
                      <th className="py-2.5 px-3">{text.thDateTime}</th>
                      <th className="py-2.5 px-3">{text.thOrderId}</th>
                      <th className="py-2.5 px-3">{text.thAttemptedPayer}</th>
                      <th className="py-2.5 px-3">{text.thType}</th>
                      <th className="py-2.5 px-3">{text.thAttemptedAmount}</th>
                      <th className="py-2.5 px-3">{text.thFailureReason}</th>
                      <th className="py-2.5 px-3">{text.thErrorCode}</th>
                      <th className="py-2.5 px-3 text-right">{text.thActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                    {loadingFailed ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                          <RefreshCw className="w-6 h-6 animate-spin text-rose-600 mx-auto mb-2" />
                          {text.loadingFailed}
                        </td>
                      </tr>
                    ) : failedList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500 italic">
                          {text.emptyFailed}
                        </td>
                      </tr>
                    ) : (
                      failedList.map((f) => (
                        <tr
                          key={f.id}
                          onClick={() => setSelectedFailedDiag(f)}
                          className="hover:bg-amber-50/70 transition cursor-pointer group border-b border-slate-100/80"
                          title={lang === "mr" ? "त्रुटी तपशील पाहण्यासाठी क्लिक करा" : "Click to view failure diagnostics"}
                        >
                          {/* Date & Time */}
                          <td className="py-2 px-3 whitespace-nowrap align-middle">
                            <div className="flex flex-col leading-tight">
                              <span className="font-bold text-slate-900 text-xs">{formatDateTime(f.createdAt)}</span>
                              <span className="text-[11px] font-normal text-slate-500 mt-0.5">{formatDateOnly(f.createdAt)}</span>
                            </div>
                          </td>

                          {/* Order ID */}
                          <td className="py-2 px-3 whitespace-nowrap align-middle">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {f.orderId}
                              </span>
                              {f.orderId && f.orderId !== "N/A" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(f.orderId, f.id + "-failord");
                                  }}
                                  className="text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer"
                                  title={text.copyOrderTooltip}
                                >
                                  {copiedId === f.id + "-failord" ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {f.provider}
                            </span>
                          </td>

                          {/* Payer Info */}
                          <td className="py-2 px-3 align-middle">
                            <div className="flex flex-col leading-tight">
                              <span className="font-bold text-slate-900 text-xs truncate max-w-[160px]">{f.name}</span>
                              {f.mobile && (
                                <span className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{f.mobile}</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-2 px-3 whitespace-nowrap align-middle">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                              {f.type}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="py-2 px-3 whitespace-nowrap align-middle">
                            <div className="font-bold text-slate-900 text-xs">
                              ₹{f.amount.toLocaleString("en-IN")}
                            </div>
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                              {text.badgeFailed}
                            </span>
                          </td>

                          {/* Failure Reason */}
                          <td className="py-2 px-3 align-middle max-w-[200px]">
                            <div className="text-xs font-semibold text-rose-900 leading-snug line-clamp-2" title={f.failureReason}>
                              {f.failureReason}
                            </div>
                            {f.purgeAfter && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {text.purgeInfo(formatDateOnly(f.purgeAfter))}
                              </div>
                            )}
                          </td>

                          {/* Failure Code */}
                          <td className="py-2 px-3 whitespace-nowrap align-middle">
                            <span className="inline-block text-[11px] font-mono font-bold text-rose-800 bg-rose-100/80 border border-rose-300 px-2 py-0.5 rounded-md">
                              {f.failureCode}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-2 px-3 whitespace-nowrap align-middle text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFailedDiag(f);
                              }}
                              className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center transition shadow-2xs active:scale-95 ml-auto cursor-pointer"
                              title="View Diagnostic Details"
                            >
                              <Code className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPagesFailed > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {text.pageInfo(pageFailed, totalPagesFailed, totalFailedItems)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPageFailed((p) => Math.max(1, p - 1))}
                      disabled={pageFailed <= 1}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPageFailed((p) => Math.min(totalPagesFailed, p + 1))}
                      disabled={pageFailed >= totalPagesFailed}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: VERIFY RECEIPT                                    */}
        {/* ======================================================== */}
        {activeTab === "VERIFY" && (
          <div className="space-y-6">
            {/* Verification Input Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>{text.verifyHeaderTitle}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {text.verifyHeaderDesc}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={verifyQuery}
                    onChange={(e) => setVerifyQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleVerifyReceipt();
                    }}
                    placeholder={text.verifyPlaceholder}
                    className="w-full pl-10 pr-9 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900 font-mono placeholder:font-sans placeholder-slate-400"
                  />
                  {verifyQuery && (
                    <button
                      onClick={() => setVerifyQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleVerifyReceipt()}
                  disabled={verifying || !verifyQuery.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-extrabold text-sm rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{text.verifyingBtn}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{text.verifyBtn}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick helper suggestion buttons */}
              {successfulList.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                  <span className="font-bold text-slate-600">{text.recentTestLabel}</span>
                  {successfulList.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setVerifyQuery(item.receiptNo);
                        handleVerifyReceipt(item.receiptNo);
                      }}
                      className="font-mono text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md transition cursor-pointer"
                    >
                      {item.receiptNo}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Verification Result Display */}
            {verifyResult && (
              <div className="animate-in fade-in duration-200">
                {verifyResult.valid ? (
                  <div className="bg-white rounded-2xl border-2 border-emerald-400 shadow-md p-6 space-y-6">
                    {/* Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                          ✓
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base sm:text-lg font-black text-emerald-950">
                              {text.validTitle}
                            </h4>
                            <span className="text-[11px] font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                              {text.validBadge}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                            {text.validDesc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <button
                          onClick={() => setSelectedReceipt(verifyResult)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{text.viewReceiptBtn}</span>
                        </button>

                        {verifyResult.publicToken && (
                          <a
                            href={`${MAIN_SITE_URL}/receipt/${verifyResult.publicToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{text.publicLinkBtn}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Cryptographic Proof Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {text.storedHmacLabel}
                        </span>
                        <div className="font-mono text-xs font-bold text-slate-800 break-all bg-white p-2 rounded border border-slate-200">
                          {verifyResult.storedHmac || "N/A"}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {text.computedHmacLabel}
                        </span>
                        <div className="font-mono text-xs font-bold text-emerald-800 break-all bg-emerald-50/50 p-2 rounded border border-emerald-200">
                          {verifyResult.computedHmac || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-slate-800">
                      <div>
                        <span className="text-slate-500 font-bold block">{text.lblReceiptNo}</span>
                        <span className="font-mono font-black text-slate-900 text-sm">
                          {verifyResult.receiptNo}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-bold block">{text.lblDate}</span>
                        <span className="font-bold text-slate-900">
                          {formatDateOnly(verifyResult.date)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-bold block">{text.lblAmount}</span>
                        <span className="text-base font-black text-emerald-700">
                          ₹{verifyResult.amount?.toLocaleString("en-IN")}
                        </span>
                        <span className="block text-[11px] text-slate-500 font-medium">
                          ({verifyResult.amountInWords || convertNumberToMarathiWords(verifyResult.amount || 0)})
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-bold block">{text.lblPaymentMode}</span>
                        <span className="font-bold text-slate-900">
                          {verifyResult.paymentMode || "PhonePe / UPI"}
                        </span>
                        <span className="block font-mono text-[10px] text-slate-400 truncate">
                          {verifyResult.paymentReference}
                        </span>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-slate-500 font-bold block">{text.lblName}</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {verifyResult.name}
                        </span>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-slate-500 font-bold block">{text.lblMobile}</span>
                        <span className="font-mono font-bold text-slate-900">
                          {verifyResult.mobile}
                        </span>
                      </div>
                    </div>

                    {/* Registered Members List (if registration) */}
                    {Array.isArray(verifyResult.members) && verifyResult.members.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span>{text.lblMembersCount(verifyResult.members.length)}</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {verifyResult.members.map((m: any, idx: number) => (
                            <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                                  {m.memberNo}
                                </span>
                                <span className="text-slate-500">{text.lblPrabhagNo} {m.prabhagNo || "-"}</span>
                              </div>
                              <div className="font-bold text-slate-900 pt-1">{m.fullName}</div>
                              <div className="font-mono text-slate-500">{m.mobileNo}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border-2 border-rose-300 shadow-md p-6 space-y-4">
                    <div className="flex items-center gap-3 bg-rose-50 p-4 rounded-xl border border-rose-200">
                      <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
                        ✕
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-rose-950">
                          {text.invalidTitle}
                        </h4>
                        <p className="text-xs text-rose-800 font-semibold mt-0.5">
                          {verifyResult.error || text.invalidDescDefault}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 1: VIEW OFFICIAL RECEIPT                            */}
        {/* ======================================================== */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs overflow-y-auto p-2 sm:p-4 md:p-6 flex justify-center items-start animate-in fade-in duration-150">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-150">
              {/* Header Action Bar (Sticky, Single Line, Crisp Typography & Balanced Spacing) */}
              <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
                {/* Left: Title + Document Icon + Receipt Number */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[#6B0606] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-amber-800" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800 text-sm sm:text-base tracking-wide whitespace-nowrap">
                      अधिकृत पावती
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-950 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-md whitespace-nowrap shadow-2xs">
                      {selectedReceipt.receiptNo}
                    </span>
                  </div>
                </div>

                {/* Right: Action Buttons (Uniform height, whitespace-nowrap, sleek colors) */}
                <div className="flex items-center gap-2 shrink-0">
                  {selectedReceipt.publicToken && (
                    <a
                      href={`${MAIN_SITE_URL}/receipt/${selectedReceipt.publicToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/90 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 hover:border-slate-300"
                      title="वेबसाईटवर पावती पाहा"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="whitespace-nowrap">वेबसाईट</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSendPaymentWhatsApp(selectedReceipt)}
                    className="h-9 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
                    title="WhatsApp वर पाठवा"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-white" />
                    <span className="whitespace-nowrap">WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(selectedReceipt.receiptNo || "Receipt")}
                    className="h-9 px-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/90 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 hover:border-slate-300"
                    title="प्रिंट पावती"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="whitespace-nowrap">प्रिंट</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(selectedReceipt.receiptNo || "Receipt")}
                    disabled={downloadingPdf}
                    className="h-9 px-3.5 bg-gradient-to-r from-[#6B0606] to-[#800A0A] hover:from-[#550505] hover:to-[#6B0606] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                    title="PDF डाऊनलोड करा"
                  >
                    <Download className={`w-3.5 h-3.5 shrink-0 ${downloadingPdf ? "animate-spin" : ""}`} />
                    <span className="whitespace-nowrap">{downloadingPdf ? "डाऊनलोड होत आहे..." : "PDF डाऊनलोड"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(null)}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ml-0.5"
                    title="बंद करा (Close)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Body */}
              {(() => {
                const r = selectedReceipt as any;
                const mainMembers = Array.isArray(r.mainMembers)
                  ? r.mainMembers
                  : Array.isArray(r.members)
                  ? r.members
                  : [];

                const familyMembers = Array.isArray(r.familyMembers)
                  ? r.familyMembers
                  : [];

                const publicToken = r.publicToken || "";
                const orderId = r.orderId || r.paymentReference || "N/A";
                const isDonation = r.category === "DONATION";
                const isExec =
                  r.type === "EXECUTIVE" ||
                  Boolean(
                    r.receiptNo &&
                      (r.receiptNo.startsWith("MPTM-EM-") || r.receiptNo.includes("EM-R"))
                  );
                const qrUrl = publicToken
                  ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      `${MAIN_SITE_URL}/receipt/${publicToken}`
                    )}`
                  : `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      `${MAIN_SITE_URL}/receipt/${r.receiptNo}`
                    )}`;

                const displayAddress = formatDisplayAddress(selectedReceipt);
                const receiptDate = formatDateToDDMMYYYY(selectedReceipt.date || (selectedReceipt as any).createdAt);

                return (
                                    <div
                    id="printable-payment-receipt"
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
                            {isDonation
                              ? "★ अधिकृत देणगी पावती ★"
                              : isExec
                              ? "★ कार्यकारिणी सदस्य नोंदणी पावती ★"
                              : "★ प्राथमिक सदस्य नोंदणी पावती ★"}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-1 text-amber-400 text-lg font-bold">
                        <span className="w-6 h-[2px] bg-amber-400"></span>
                        <span>❖</span>
                      </div>
                    </div>

                    {/* 2. Top Meta Row: पावती क्र. | दिनांक | नोंदणी शुल्क/देणगी रक्कम */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-3 rounded-xl bg-amber-50/70 border border-amber-300">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-stone-600 text-xs sm:text-sm whitespace-nowrap">पावती क्र. :</span>
                        <span className="font-mono font-black text-stone-900 text-sm sm:text-base">{selectedReceipt.receiptNo}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-stone-600 text-xs sm:text-sm whitespace-nowrap">दिनांक :</span>
                        <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm">{receiptDate}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-stone-600 text-xs sm:text-sm whitespace-nowrap">
                          {isDonation ? "देणगी रक्कम :" : "नोंदणी शुल्क :"}
                        </span>
                        <span className="font-mono font-black text-[#7A0C0C] text-sm sm:text-base">
                          ₹{selectedReceipt.amount}/-
                        </span>
                      </div>
                    </div>

                    {/* 3. MAIN MEMBERS & LOCATION CONTAINER BOX (Form Style without underlines) */}
                    {!isDonation && mainMembers && mainMembers.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between border-b border-amber-300 pb-1.5">
                          <h3 className="text-sm sm:text-base font-extrabold text-amber-950 flex items-center gap-2">
                            <span>👤 {isExec ? "कार्यकारिणी सदस्य माहिती" : "मुख्य सदस्य माहिती"}</span>
                            <span className="text-[10px] sm:text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                              एकूण: {mainMembers.length}
                            </span>
                          </h3>
                        </div>

                        <div className="p-3.5 sm:p-4 rounded-xl bg-white border-2 border-amber-700/30 shadow-xs space-y-4">
                          {mainMembers.map((member: any, index: number) => (
                            <div
                              key={member.id || index}
                              className={`space-y-2.5 ${
                                index > 0 ? "pt-3.5 border-t-2 border-dashed border-amber-300/80" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2 border-b border-stone-200 pb-1.5">
                                <span className="w-5 h-5 rounded-full bg-[#7A0C0C] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {member.srNo || index + 1}
                                </span>
                                <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                                  {index === 0 ? (isExec ? "कार्यकारिणी" : "प्राथमिक") : `सदस्य #${index + 1}`} सदस्य माहिती
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:text-sm">
                                <div className="flex items-baseline gap-2">
                                  <span className="font-bold text-stone-600 whitespace-nowrap">
                                    {index === 0 ? "सदस्य क्रमांक :" : "सदस्य क्रमांक :"}
                                  </span>
                                  <span className="font-mono font-black text-[#7A0C0C] text-sm">
                                    {member.memberNo || (r.seriesNo ? `MPTM-EM-${r.seriesNo}` : "-")}
                                  </span>
                                </div>

                                <div className="flex items-baseline gap-2">
                                  <span className="font-bold text-stone-600 whitespace-nowrap">
                                    प्रभाग क्रमांक :
                                  </span>
                                  <span className="font-bold text-stone-900">
                                    {member.prabhagNo || "-"}
                                  </span>
                                </div>

                                <div className="flex items-baseline gap-2">
                                  <span className="font-bold text-stone-600 whitespace-nowrap">सदस्याचे पूर्णनाव :</span>
                                  <span className="font-extrabold text-stone-950 text-sm sm:text-base">
                                    {member.fullName || member.name}
                                  </span>
                                </div>

                                <div className="flex items-baseline gap-2">
                                  <span className="font-bold text-stone-600 whitespace-nowrap">मोबाईल क्रमांक :</span>
                                  <span className="font-mono font-bold text-stone-900">
                                    {member.mobileNo || member.mobile}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Common Address Details (Clean without underlines) */}
                          {displayAddress && displayAddress !== "-" && (
                            <div className="space-y-2.5 pt-3 border-t-2 border-amber-200 text-xs sm:text-sm">
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-stone-600 whitespace-nowrap">पत्ता :</span>
                                <span className="font-semibold text-stone-900 leading-relaxed">
                                  {displayAddress}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Single Member or Donor Details */
                      <div className="p-3.5 sm:p-4 rounded-xl bg-white border-2 border-amber-700/30 shadow-xs space-y-3">
                        <div className="flex items-center gap-2 border-b border-stone-200 pb-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#7A0C0C] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            1
                          </span>
                          <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                            {isDonation ? "देणगीदार माहिती" : "सदस्य माहिती"}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:text-sm">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-stone-600 whitespace-nowrap">पूर्ण नाव :</span>
                            <span className="font-extrabold text-stone-950 text-sm sm:text-base">{selectedReceipt.name}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-stone-600 whitespace-nowrap">मोबाईल क्रमांक :</span>
                            <span className="font-mono font-bold text-stone-900">{selectedReceipt.mobile}</span>
                          </div>
                        </div>

                        {displayAddress && displayAddress !== "-" && (
                          <div className="pt-2.5 border-t border-amber-200 flex items-baseline gap-2 text-xs sm:text-sm">
                            <span className="font-bold text-stone-600 whitespace-nowrap">पत्ता :</span>
                            <span className="font-semibold text-stone-900">{displayAddress}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. FAMILY MEMBERS SECTION (Exact table matching Form.tsx) */}
                    {familyMembers && familyMembers.length > 0 && (
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
                              {familyMembers.map((fm: any, i: number) => (
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
                        {selectedReceipt.amountInWords || convertNumberToMarathiWords(selectedReceipt.amount || 0)}
                      </span>
                    </div>

                    {/* 6. PAYMENT DETAILS BOX AT BOTTOM (As currently doing) */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-50/90 via-amber-100/40 to-amber-50/90 border-2 border-amber-400/80 space-y-2.5 text-xs sm:text-sm shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-800 text-xs sm:text-sm">भरणा केलेली एकूण रक्कम :</span>
                          <span className="font-mono text-xl sm:text-2xl font-black text-[#7A0C0C]">₹{selectedReceipt.amount}/-</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-900 font-extrabold text-xs">
                          <span>✓</span>
                          <span>पेमेंट पुष्टी (Payment Confirmed)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="font-bold text-stone-600">पेमेंट पद्धत : </span>
                          <span className="font-bold text-stone-900">{formatPaymentMethod(selectedReceipt.paymentMode)}</span>
                        </div>
                        <div>
                          <span className="font-bold text-stone-600">व्यवहार संदर्भ : </span>
                          <span className="font-mono font-bold text-stone-900">{orderId}</span>
                        </div>
                        <div>
                          <span className="font-bold text-stone-600">पावती दिनांक : </span>
                          <span className="font-mono font-bold text-stone-900">{receiptDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* 7. Declaration / Sandesh Box */}
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border-l-4 border-l-[#7A0C0C] border border-amber-200/80 text-stone-900 shadow-2xs">
                      <p className="text-xs font-extrabold text-[#7A0C0C] flex items-start gap-1.5">
                        <span className="whitespace-nowrap">संदेश :</span>
                        <span className="text-stone-800 font-medium leading-relaxed">
                          {isDonation
                            ? "महाराष्ट्र प्रांतिक तैलिक महासभेस देणगी दिल्याबद्दल आपले मनःपूर्वक आभार."
                            : isExec
                            ? "वरील रक्कम महाराष्ट्र प्रांतिक तैलिक महासभेच्या कार्यकारिणी सदस्य नोंदणी शुल्क म्हणून प्राप्त झाली."
                            : "वरील रक्कम महाराष्ट्र प्रांतिक तैलिक महासभेच्या प्राथमिक सदस्य नोंदणी शुल्क म्हणून प्राप्त झाली."}
                        </span>
                      </p>
                    </div>

                    {/* 8. AUTHORIZATION: QR CODE + OFFICIAL SEAL + SIGNATURE BLOCK */}
                    <div className="pt-3 border-t-2 border-amber-300/80 grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
                      {/* Left: QR Code Verification */}
                      <div className="flex items-center gap-2.5">
                        {qrUrl ? (
                          <div className="p-1 bg-white border border-amber-400 rounded-xl shadow-2xs shrink-0 text-center">
                            <img src={qrUrl} alt="Receipt QR" className="w-18 h-18 sm:w-20 sm:h-20 object-contain mx-auto" />
                            <span className="text-[8px] font-bold text-stone-600 block leading-tight mt-0.5">
                              स्कॅन व पडताळा
                            </span>
                          </div>
                        ) : null}
                        <div className="space-y-0.5 text-stone-700 text-left">
                          <p className="font-bold text-[11px] text-[#7A0C0C] flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>डिजिटल सत्यता हमी</span>
                          </p>
                          <p className="text-[9.5px] text-stone-500 leading-tight">
                            मोबाईलने स्कॅन करून पावतीची थेट पोर्टलवर सत्यता तपासा.
                          </p>
                        </div>
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
                        <p className="font-black text-[#7A0C0C] text-xs pt-0.5">
                          अध्यक्ष / सचिव / कोषाध्यक्ष
                        </p>
                        <p className="text-[10px] text-stone-600 font-medium">
                          महाराष्ट्र प्रांतिक तैलिक महासभा, अमरावती
                        </p>
                      </div>
                    </div>

                    {/* 9. Clean Footer Note */}
                    <div className="pt-2 border-t border-amber-200 text-center">
                      <p className="text-[10px] text-stone-600 font-semibold">
                        ही पावती संगणकीय प्रणालीद्वारे तयार करण्यात आलेली अधिकृत डिजिटल पावती आहे. (Computer-Generated Official Receipt)
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: FAILED PAYMENT DIAGNOSTIC DETAILS               */}
        {/* ======================================================== */}
        {selectedFailedDiag && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs overflow-y-auto p-4 flex justify-center items-start animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-rose-300 p-6 space-y-4 my-4 sm:my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {text.diagModalTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Order: {selectedFailedDiag.orderId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFailedDiag(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-bold block">{text.diagAttemptedName}</span>
                    <span className="font-bold text-slate-900">{selectedFailedDiag.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">{text.diagMobile}</span>
                    <span className="font-mono font-bold text-slate-900">{selectedFailedDiag.mobile}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">{text.diagAmount}</span>
                    <span className="font-bold text-slate-900">₹{selectedFailedDiag.amount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">{text.diagErrorCode}</span>
                    <span className="font-mono font-extrabold text-rose-700">{selectedFailedDiag.failureCode}</span>
                  </div>
                </div>

                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                  <span className="text-rose-900 font-bold block">{text.diagFailureReason}</span>
                  <p className="text-rose-800 leading-relaxed font-medium">
                    {selectedFailedDiag.failureReason}
                  </p>
                </div>

                {selectedFailedDiag.gatewayResponse && (
                  <div className="space-y-1">
                    <span className="text-slate-700 font-bold block">{text.diagGatewayResponse}</span>
                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                      {JSON.stringify(selectedFailedDiag.gatewayResponse, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 font-medium">
                  {text.diagPurgeNotice(formatDateOnly(selectedFailedDiag.purgeAfter))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedFailedDiag(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {text.closeBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3: PENDING / ATTEMPT DETAILS MODAL                 */}
        {/* ======================================================== */}
        {selectedPendingItem && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs overflow-y-auto p-4 flex justify-center items-start animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-amber-300 p-6 space-y-4 my-4 sm:my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      व्यवहार तपशील (Transaction Attempt)
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Order: {selectedPendingItem.orderId || "N/A"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPendingItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-bold block">नाव (Name):</span>
                    <span className="font-bold text-slate-900">{selectedPendingItem.name || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">मोबाईल (Mobile):</span>
                    <span className="font-mono font-bold text-slate-900">{selectedPendingItem.mobile || "-"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">रक्कम (Amount):</span>
                    <span className="font-bold text-slate-900">₹{selectedPendingItem.amount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">स्थिती (Status):</span>
                    <span className="font-bold uppercase text-amber-700">{selectedPendingItem.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">पद्धत (Mode):</span>
                    <span className="font-medium text-slate-800">{formatPaymentMethod(selectedPendingItem.paymentMode)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">प्रकार (Type):</span>
                    <span className="font-bold text-slate-800">{selectedPendingItem.type}</span>
                  </div>
                </div>

                {selectedPendingItem.failureReason && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                    <span className="text-rose-900 font-bold block">त्रुटी / कारण (Reason):</span>
                    <p className="text-rose-800 leading-relaxed font-medium">
                      {selectedPendingItem.failureReason}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedPendingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {text.closeBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
