"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { downloadReceiptAsPdf } from "@/utils/pdfUtils";
import {
  Search,
  RefreshCw,
  Download,
  Eye,
  Printer,
  X,
  Phone,
  MapPin,
  ImageIcon,
  UserPlus,
  ChevronRight,
  ChevronDown,
  Trash2,
  UserX,
  AlertTriangle,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Banknote,
  QrCode,
  User,
  Globe,
  Users,
  MessageSquare,
  Columns3,
  SlidersHorizontal,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Calendar,
  FileText,
  Plus,
  Pencil,
  Landmark,
  Flag,
  Wallet,
  CreditCard,
  ChevronUp,
  Building,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { MemberRegistration } from "../../types";

const WhatsappIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);
import { formatDateToDDMMYYYY, getDatePart, getTimePart, formatPaymentMethod, convertNumberToMarathiWords } from "../../utils/formatters";
import { getApiUrl, getMainSiteUrl } from "../../utils/config";
import { formatDistrictInEnglish, formatCityInEnglish, formatAddressInEnglish } from "../../utils/locationData";

function isExecutiveRegistration(reg: MemberRegistration): boolean {
  const receipt = (reg.receiptNo || "").toUpperCase();
  if (receipt.startsWith("MPTM-EM-") || receipt.includes("EM-R")) return true;
  if (reg.mainMembers && Array.isArray(reg.mainMembers)) {
    if (reg.mainMembers.some((m) => (m.memberNo || "").toUpperCase().includes("EM-S"))) {
      return true;
    }
  }
  return false;
}

function getInitials(name?: string): string {
  if (!name) return "M";
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    const f = parts[0][0] || "";
    const l = parts[parts.length - 1][0] || "";
    return (f + l).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
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
          <path id="regSealTopArc" d="M 22,80 A 58,58 0 1,1 138,80" fill="none" />
          <path id="regSealBottomArc" d="M 138,80 A 58,58 0 0,1 22,80" fill="none" />
        </defs>

        <text fontSize="7.5" fontWeight="900" fill="#7A0C0C" letterSpacing="0.4">
          <textPath href="#regSealTopArc" startOffset="50%" textAnchor="middle">
            ★ महाराष्ट्र प्रांतिक तैलिक महासभा ★
          </textPath>
        </text>

        <text fontSize="7" fontWeight="800" fill="#7A0C0C" letterSpacing="0.3">
          <textPath href="#regSealBottomArc" startOffset="50%" textAnchor="middle">
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
  address?: string | null;
  gaav?: string | null;
  taluka?: string | null;
  city?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
}): string {
  const parts: string[] = [];
  const fullAddr = (addrData.address || "").trim();

  if (fullAddr) {
    parts.push(fullAddr);
  }

  const addrLower = fullAddr.toLowerCase();

  const addIfNew = (val?: string | null) => {
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

  if (addrData.state && addrData.state.trim() && !parts.some((p) => p.toLowerCase().includes("maharashtra") || p.includes("महाराष्ट्र"))) {
    parts.push(addrData.state.trim());
  }

  if (addrData.pincode && addrData.pincode.trim() && !parts.some((p) => p.includes(addrData.pincode!.trim()))) {
    parts.push(`पिन: ${addrData.pincode.trim()}`);
  }

  return parts.length > 0 ? parts.join(", ") : "अमरावती विभाग, महाराष्ट्र";
}

type Language = "mr" | "en";

export default function RegistrationsPage() {
  const router = useRouter();

  // Language state: 'mr' (Marathi) | 'en' (English)
  const [lang, setLang] = useState<Language>("mr");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("mptm_registrations_lang") as Language;
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
      localStorage.setItem("mptm_registrations_lang", newLang);
    } catch {
      // ignore
    }
  };

  const [registrations, setRegistrations] = useState<MemberRegistration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [referrerFilter, setReferrerFilter] = useState<string>("ALL");
  const [districtFilter, setDistrictFilter] = useState<string>("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"essential" | "all">("essential");

  // Separate states: Entry details popup vs official printable pavati modal
  const [selectedDetailsReg, setSelectedDetailsReg] = useState<MemberRegistration | null>(null);
  const [selectedPavatiReg, setSelectedPavatiReg] = useState<MemberRegistration | null>(null);

  const [deleteConfirmReg, setDeleteConfirmReg] = useState<MemberRegistration | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [screenshotZoom, setScreenshotZoom] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // User & Super Admin session state
  const [loggedUserEmail, setLoggedUserEmail] = useState<string>("");
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [managedUsers, setManagedUsers] = useState<any[]>([]);

  // Modal for Link Generation
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [selectedUserForLink, setSelectedUserForLink] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedPopupLink, setCopiedPopupLink] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const API_URL = getApiUrl();
  const MAIN_SITE_URL = getMainSiteUrl();

  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  const handlePrint = (receiptNo?: string) => {
    const rNo = receiptNo || selectedPavatiReg?.receiptNo || selectedDetailsReg?.receiptNo;
    const originalTitle = document.title;
    if (rNo) {
      document.title = rNo.trim().replace(/[/\\?%*:|"<>]/g, "-");
    }
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleDownloadPdf = async (receiptNo?: string) => {
    const rNo = receiptNo || selectedPavatiReg?.receiptNo || selectedDetailsReg?.receiptNo;
    if (!rNo) return;
    try {
      setDownloadingPdf(true);
      const safeReceiptId = rNo.trim().replace(/[/\\?%*:|"<>]/g, "-");
      const originalTitle = document.title;
      document.title = safeReceiptId;
      await downloadReceiptAsPdf("printable-receipt-card", `${safeReceiptId}.pdf`);
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSendRegWhatsApp = (reg: MemberRegistration) => {
    const main = reg.mainMembers[0];
    const mobile = (main?.mobileNo || "").replace(/\D/g, "");
    const cleanPhone = mobile.length === 10 ? `91${mobile}` : mobile;
    const isExec = isExecutiveRegistration(reg);
    const title = isExec ? "★ कार्यकारिणी सदस्य नोंदणी पावती ★" : "★ प्राथमिक सदस्य नोंदणी पावती ★";

    const textMessage = `🚩 *महाराष्ट्र प्रांतिक तैलिक महासभा (अमरावती)* 🚩
${title}

----------------------------------
📄 *पावती क्र.* : ${reg.receiptNo}
📅 *दिनांक* : ${getDatePart(reg)}
👤 *सदस्याचे नाव* : ${main?.fullName || "-"}
📱 *मोबाईल क्र.* : ${main?.mobileNo || "-"}
📍 *पत्ता* : ${reg.address || "-"}
🏙️ *शहर/गाव* : ${reg.city || "-"}
🏛️ *जिल्हा* : ${reg.district || "-"}
💰 *नोंदणी शुल्क* : ₹${reg.registrationFee}/- (${reg.amountInWords || convertNumberToMarathiWords(reg.registrationFee)})
💳 *देयक पद्धत* : ${formatPaymentMethod(reg.paymentMethod)}
✅ *स्थिती* : प्राप्त व सत्यापित (Payment Verified)
----------------------------------

संदेश: ${isExec ? "वरील रक्कम महाराष्ट्र प्रांतिक तैलिक महासभेच्या कार्यकारिणी सदस्य नोंदणी शुल्क म्हणून प्राप्त झाली." : "वरील रक्कम महाराष्ट्र प्रांतिक तैलिक महासभेच्या प्राथमिक सदस्य नोंदणी शुल्क म्हणून प्राप्त झाली."}

_ही पावती सदस्य नोंदणीचा अधिकृत पुरावा आहे._
mptmamravati.org`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(textMessage)}`;
    window.open(waUrl, "_blank");
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const role = localStorage.getItem("mptm_admin_role") || "USER";
      const username = localStorage.getItem("mptm_admin_username") || "";
      const lowerUser = username.toLowerCase();
      const isSuper = role === "SUPER_ADMIN" || lowerUser === "mptmamravati.org" || lowerUser === "admin@mptmamravati.org" || lowerUser === "admin" || lowerUser === "superadmin";
      const effectiveRole = isSuper ? "SUPER_ADMIN" : role;
      const params = new URLSearchParams({
        userEmail: username,
        userRole: effectiveRole,
      });
      const res = await fetch(`${API_URL}/api/register?${params.toString()}`, {
        headers: {
          "x-user-email": username,
          "x-user-role": effectiveRole,
        },
      });
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.data)) {
        setRegistrations(data.data);
      } else {
        setError(data.error || "Failed to load registrations.");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load registrations. Ensure backend server is running.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

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
      const superAdminStatus = role === "SUPER_ADMIN" || lowerUser === "mptmamravati.org" || lowerUser === "admin@mptmamravati.org" || lowerUser === "admin" || lowerUser === "superadmin";
      setIsSuperAdmin(superAdminStatus);
      setLoggedUserEmail(username);

      const savedUsers = localStorage.getItem("mptm_managed_users");
      if (savedUsers) {
        try {
          setManagedUsers(JSON.parse(savedUsers));
        } catch (e) { }
      }
    }

    fetchRegistrations();
  }, [router]);

  const uniqueReferrersList = useMemo(() => {
    const refsSet = new Set<string>();
    registrations.forEach((r) => {
      const ref = (r.referredBy || "").trim();
      if (ref && ref !== "Direct Website" && ref !== "Direct") {
        refsSet.add(ref);
      }
    });
    managedUsers.forEach((u) => {
      if (u.email) refsSet.add(u.email);
    });
    return Array.from(refsSet);
  }, [registrations, managedUsers]);

  const uniqueDistrictsList = useMemo(() => {
    const distSet = new Set<string>();
    registrations.forEach((r) => {
      if (isExecutiveRegistration(r)) return;
      const distEng = formatDistrictInEnglish(r.district, r.city);
      if (distEng && distEng !== "-") distSet.add(distEng);
    });
    return Array.from(distSet).sort();
  }, [registrations]);

  const uniqueCitiesList = useMemo(() => {
    const citySet = new Set<string>();
    registrations.forEach((r) => {
      if (isExecutiveRegistration(r)) return;
      if (districtFilter !== "ALL") {
        const distEng = formatDistrictInEnglish(r.district, r.city);
        if (distEng !== districtFilter) return;
      }
      const cityEng = formatCityInEnglish(r.city);
      if (cityEng && cityEng !== "-") citySet.add(cityEng);
    });
    return Array.from(citySet).sort();
  }, [registrations, districtFilter]);

  const handleDeleteRegistration = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/register/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
        setToastMessage("✅ Registration record deleted successfully.");
        setDeleteConfirmReg(null);
      } else {
        alert(data.error || "Failed to delete record.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not connect to server. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Payment Filter Counts computation
  const paymentCounts = useMemo(() => {
    const userEmailClean = loggedUserEmail.trim().toLowerCase();
    let all = 0;
    let cash = 0;
    let online = 0;

    registrations.forEach((reg) => {
      // Exclude Executive Member registrations (visible ONLY on Executive Members page)
      if (isExecutiveRegistration(reg)) return;

      // 1. Role Scoping
      if (!isSuperAdmin) {
        const regRef = (reg.referredBy || "").trim().toLowerCase();
        if (!userEmailClean || regRef !== userEmailClean) return;
      }

      // 2. Referrer Filter
      if (isSuperAdmin && referrerFilter !== "ALL") {
        const regRef = (reg.referredBy || "").trim().toLowerCase();
        const targetRef = referrerFilter.trim().toLowerCase();
        if (targetRef === "direct") {
          if (regRef && regRef !== "direct website" && regRef !== "direct" && regRef !== "") return;
        } else {
          if (regRef !== targetRef) return;
        }
      }

      // 3. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const matchesGeneral =
          reg.receiptNo.toLowerCase().includes(query) ||
          reg.address.toLowerCase().includes(query) ||
          (reg.gaav || "").toLowerCase().includes(query) ||
          (reg.taluka || "").toLowerCase().includes(query) ||
          (reg.city || "").toLowerCase().includes(query) ||
          (reg.district || "").toLowerCase().includes(query) ||
          (reg.state || "").toLowerCase().includes(query) ||
          (reg.country || "").toLowerCase().includes(query) ||
          (reg.pincode || "").toLowerCase().includes(query) ||
          reg.paymentMethod.toLowerCase().includes(query) ||
          reg.registrationFee.toString().includes(query) ||
          (reg.referredBy || "").toLowerCase().includes(query) ||
          getDatePart(reg).toLowerCase().includes(query);

        const matchesMainMember = reg.mainMembers.some(
          (m) =>
            m.fullName.toLowerCase().includes(query) ||
            m.memberNo.toLowerCase().includes(query) ||
            m.mobileNo.toLowerCase().includes(query) ||
            m.prabhagNo.toLowerCase().includes(query)
        );

        const matchesFamilyMember = reg.familyMembers.some(
          (f) =>
            f.name.toLowerCase().includes(query) ||
            f.mobile.toLowerCase().includes(query) ||
            f.relation.toLowerCase().includes(query) ||
            f.occupation.toLowerCase().includes(query)
        );

        if (!matchesGeneral && !matchesMainMember && !matchesFamilyMember) return;
      }

      all++;
      const pMethod = (reg.paymentMethod || "").toLowerCase();
      if (pMethod.includes("रोख") || pMethod.includes("cash")) {
        cash++;
      } else {
        online++;
      }
    });

    return { all, cash, online };
  }, [registrations, isSuperAdmin, loggedUserEmail, referrerFilter, searchQuery]);

  // Referrer Name & Email resolver
  const getReferrerDetails = (ref: string | null | undefined) => {
    if (!ref || ref === "Direct Website" || ref === "Direct") {
      return { isDirect: true, name: "Direct Website", email: "" };
    }
    const cleanRef = ref.trim().toLowerCase();
    const matched = managedUsers.find((u) => (u.email || "").trim().toLowerCase() === cleanRef);
    if (matched && matched.name && matched.name.trim()) {
      return { isDirect: false, name: matched.name.trim(), email: matched.email.trim() };
    }
    return { isDirect: false, name: "", email: ref.trim() };
  };

  const filteredRegistrations = useMemo(() => {
    const userEmailClean = loggedUserEmail.trim().toLowerCase();

    return registrations.filter((reg) => {
      // Exclude Executive Member registrations (visible ONLY on Executive Members page)
      if (isExecutiveRegistration(reg)) return false;
      // 1. Role Scoping: Regular users ONLY see registrations referred by them
      if (!isSuperAdmin) {
        const regRef = (reg.referredBy || "").trim().toLowerCase();
        if (!userEmailClean || regRef !== userEmailClean) {
          return false;
        }
      }

      // 2. Payment Method Filter
      const pMethod = (reg.paymentMethod || "").toLowerCase();
      let matchesPayment = true;
      if (paymentFilter === "CASH") {
        matchesPayment = pMethod.includes("रोख") || pMethod.includes("cash");
      } else if (paymentFilter === "ONLINE") {
        matchesPayment =
          pMethod.includes("upi") ||
          pMethod.includes("ऑनलाइन") ||
          pMethod.includes("online") ||
          pMethod.includes("phonepe") ||
          !pMethod.includes("रोख");
      }

      if (!matchesPayment) return false;

      // 3. Referrer User Filter (for Super Admin dropdown selection)
      if (isSuperAdmin && referrerFilter !== "ALL") {
        const regRef = (reg.referredBy || "").trim().toLowerCase();
        const targetRef = referrerFilter.trim().toLowerCase();

        if (targetRef === "direct") {
          if (regRef && regRef !== "direct website" && regRef !== "direct" && regRef !== "") return false;
        } else {
          if (regRef !== targetRef) return false;
        }
      }

      // 3. District & City Filter
      if (districtFilter !== "ALL") {
        const distEng = formatDistrictInEnglish(reg.district, reg.city);
        if (distEng.toLowerCase() !== districtFilter.toLowerCase()) return false;
      }
      if (cityFilter !== "ALL") {
        const cityEng = formatCityInEnglish(reg.city);
        if (cityEng.toLowerCase() !== cityFilter.toLowerCase()) return false;
      }

      if (!searchQuery) return true;

      const query = searchQuery.toLowerCase().trim();

      if (
        reg.receiptNo.toLowerCase().includes(query) ||
        reg.address.toLowerCase().includes(query) ||
        (reg.gaav || "").toLowerCase().includes(query) ||
        (reg.taluka || "").toLowerCase().includes(query) ||
        (reg.city || "").toLowerCase().includes(query) ||
        (reg.district || "").toLowerCase().includes(query) ||
        (reg.state || "").toLowerCase().includes(query) ||
        (reg.country || "").toLowerCase().includes(query) ||
        (reg.pincode || "").toLowerCase().includes(query) ||
        reg.paymentMethod.toLowerCase().includes(query) ||
        reg.registrationFee.toString().includes(query) ||
        (reg.referredBy || "").toLowerCase().includes(query) ||
        getDatePart(reg).toLowerCase().includes(query)
      ) {
        return true;
      }

      const matchesMainMember = reg.mainMembers.some(
        (m) =>
          m.fullName.toLowerCase().includes(query) ||
          m.memberNo.toLowerCase().includes(query) ||
          m.mobileNo.toLowerCase().includes(query) ||
          m.prabhagNo.toLowerCase().includes(query)
      );
      if (matchesMainMember) return true;

      const matchesFamilyMember = reg.familyMembers.some(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.mobile.toLowerCase().includes(query) ||
          f.relation.toLowerCase().includes(query) ||
          f.occupation.toLowerCase().includes(query)
      );

      return matchesFamilyMember;
    });
  }, [registrations, searchQuery, paymentFilter, referrerFilter, isSuperAdmin, loggedUserEmail]);

  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) return;

    const headers = [
      "Receipt No",
      "Date",
      "Main Member Name",
      "Member No",
      "Prabhag No",
      "Mobile No",
      "Address",
      "Gaav",
      "Taluka",
      "City",
      "District",
      "State",
      "Country",
      "Pincode",
      "Referrer",
      "Payment Method",
      "Registration Fee",
      "Family Members Count",
      "Family Members List",
    ];

    const rows = filteredRegistrations.map((reg) => {
      const main = reg.mainMembers[0] || {};
      const familyListStr = reg.familyMembers
        .map((f) => `${f.name} (${f.relation})`)
        .join(" | ");

      return [
        `"${reg.receiptNo}"`,
        `"${getDatePart(reg)} ${getTimePart(reg)}"`,
        `"${main.fullName || ""}"`,
        `"${main.memberNo || ""}"`,
        `"${main.prabhagNo || ""}"`,
        `"${main.mobileNo || ""}"`,
        `"${(reg.address || "").replace(/"/g, '""')}"`,
        `"${(reg.gaav || "").replace(/"/g, '""')}"`,
        `"${(reg.taluka || "").replace(/"/g, '""')}"`,
        `"${(reg.city || "").replace(/"/g, '""')}"`,
        `"${(reg.district || "").replace(/"/g, '""')}"`,
        `"${(reg.state || "महाराष्ट्र").replace(/"/g, '""')}"`,
        `"${(reg.country || "भारत").replace(/"/g, '""')}"`,
        `"${(reg.pincode || "").replace(/"/g, '""')}"`,
        `"${reg.referredBy || "Direct Website"}"`,
        `"${formatPaymentMethod(reg.paymentMethod)}"`,
        `"${reg.registrationFee}"`,
        `"${reg.familyMembers.length}"`,
        `"${familyListStr.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MPTM_Registrations_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActiveFormLink = () => {
    const siteUrl = getMainSiteUrl() || MAIN_SITE_URL;
    const baseUrl = `${siteUrl}/memberregistration`;
    const targetRef = isSuperAdmin ? selectedUserForLink : loggedUserEmail;
    if (targetRef && targetRef.trim()) {
      return `${baseUrl}?ref=${encodeURIComponent(targetRef.trim())}`;
    }
    return baseUrl;
  };

  const handleCopyFormLink = () => {
    const link = getActiveFormLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const link = getActiveFormLink();
    const message = `जय संताजी! महाराष्ट्र प्रांतिक तैलिक महासभा (अमरावती विभाग) ऑनलाईन सदस्य नोंदणी फॉर्म भरण्यासाठी खालील लिंकवर क्लिक करा:\n\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <DashboardLayout>
      <div className={selectedPavatiReg ? "no-print" : ""}>
        {/* Page Title & Subtitle Toolbar */}
        <div className={`mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${selectedPavatiReg ? "no-print" : ""}`}>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-slate-800" />
              <span>{lang === "mr" ? "सदस्य नोंदणी यादी" : "Member Registrations"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {lang === "mr"
                ? (isSuperAdmin
                  ? "महाराष्ट्र प्रांतिक तैलिक महासभा - अमरावती विभाग (सर्व सदस्य नोंदणी)"
                  : `महाराष्ट्र प्रांतिक तैलिक महासभा (${loggedUserEmail} द्वारे संदर्भित नोंदणी)`)
                : (isSuperAdmin
                  ? "Maharashtra Prantik Tailik Mahasabha - Amravati Division (All Member Registrations)"
                  : `Maharashtra Prantik Tailik Mahasabha (Registrations Referred by ${loggedUserEmail})`)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
            {/* Marathi / English Language Toggle */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => handleToggleLang("mr")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${lang === "mr"
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
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${lang === "en"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>English</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => router.push("/deleted-members")}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-2 shrink-0 cursor-pointer"
              title={lang === "mr" ? "हटवलेले सदस्य पहा" : "View Deleted Members"}
            >
              <UserX className="w-4 h-4 text-red-600" />
              <span>{lang === "mr" ? "हटवलेले सदस्य" : "Deleted Members"}</span>
            </button>

            <a
              href={getActiveFormLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-2 shrink-0"
              title={lang === "mr" ? "सदस्य नोंदणी फॉर्म उघडा" : "Open Member Registration Form"}
            >
              <ExternalLink className="w-4 h-4" />
              <span>{lang === "mr" ? "सदस्य नोंदणी फॉर्म" : "Member Registration Form"}</span>
            </a>

            <button
              onClick={exportToCSV}
              disabled={filteredRegistrations.length === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{lang === "mr" ? "CSV निर्यात" : "Export CSV"}</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className={`mb-4 p-3 bg-slate-100 border border-slate-300 text-slate-900 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-2xs ${selectedPavatiReg ? "no-print" : ""}`}>
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-600 hover:text-slate-900 font-bold text-base">×</button>
          </div>
        )}

        {/* SEARCH & FILTER TOOLBAR */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 mb-6 space-y-3 ${selectedPavatiReg ? "no-print" : ""}`}>
          {/* ROW 1: SEARCH BAR + PAYMENT FILTER PILLS + VIEW MODE TOGGLE */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
              {/* Shortened Search Bar */}
              <div className="relative w-full sm:w-80 md:w-96 shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={lang === "mr" ? "पावती क्र., नाव, मोबाईल, पत्ता, किंवा प्रभाग शोधा..." : "Search receipt no, name, mobile, address, or prabhag..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

              {/* Payment Method Filter Pills (Moved next to search bar) */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0">
                <button
                  onClick={() => setPaymentFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial text-center flex items-center justify-center gap-1.5 cursor-pointer ${paymentFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <span>{lang === "mr" ? "सर्व" : "All"}</span>
                  <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full text-[11px] font-mono">
                    {paymentCounts.all}
                  </span>
                </button>

                <button
                  onClick={() => setPaymentFilter("CASH")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial text-center flex items-center justify-center gap-1.5 cursor-pointer ${paymentFilter === "CASH"
                      ? "bg-white text-emerald-800 shadow-2xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === "mr" ? "रोख" : "Cash"}</span>
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[11px] font-mono">
                    {paymentCounts.cash}
                  </span>
                </button>

                <button
                  onClick={() => setPaymentFilter("ONLINE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-initial text-center flex items-center justify-center gap-1.5 cursor-pointer ${paymentFilter === "ONLINE"
                      ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-700" />
                  <span>{lang === "mr" ? "ऑनलाइन UPI" : "UPI"}</span>
                  <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full text-[11px] font-mono">
                    {paymentCounts.online}
                  </span>
                </button>
              </div>
            </div>

            {/* View Mode Toggle (Essential vs All Columns) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("essential")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${viewMode === "essential"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
                title={lang === "mr" ? "महत्त्वाचे स्तंभ (कमी जागा, कॉम्पॅक्ट)" : "Essential Columns View"}
              >
                <Columns3 className="w-3.5 h-3.5 text-amber-600" />
                <span>{lang === "mr" ? "महत्त्वाचे" : "Essential"}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${viewMode === "all"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
                title={lang === "mr" ? "सर्व १७ स्तंभ दाखवा" : "All Columns View"}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>{lang === "mr" ? "सर्व स्तंभ" : "All Columns"}</span>
              </button>
            </div>
          </div>

          {/* ROW 2: LOCATION & REFERRER DROPDOWNS */}
          {(isSuperAdmin || uniqueDistrictsList.length > 0 || uniqueCitiesList.length > 0) && (
            <div className="flex flex-wrap items-center gap-2.5 pt-2.5 border-t border-slate-100">
              {/* Referrer Filter Dropdown */}
              {isSuperAdmin && (
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                  <span className="text-xs font-bold text-slate-700 shrink-0">{lang === "mr" ? "रेफरर:" : "Referrer:"}</span>
                  <select
                    value={referrerFilter}
                    onChange={(e) => setReferrerFilter(e.target.value)}
                    className="bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                  >
                    <option value="ALL">{lang === "mr" ? "सर्व रेफरर" : "All Referrers"}</option>
                    <option value="DIRECT">{lang === "mr" ? "थेट वेबसाईट" : "Direct Website"}</option>
                    {uniqueReferrersList.map((refEmail) => {
                      const matchedUser = managedUsers.find((u) => u.email.toLowerCase() === refEmail.toLowerCase());
                      const labelName = matchedUser && matchedUser.name && matchedUser.name.trim()
                        ? `${matchedUser.name.trim()} (${refEmail})`
                        : refEmail;
                      return (
                        <option key={refEmail} value={refEmail}>
                          {labelName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* District Filter Dropdown */}
              {uniqueDistrictsList.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                  <span className="text-xs font-bold text-slate-700 shrink-0">{lang === "mr" ? "जिल्हा:" : "District:"}</span>
                  <select
                    value={districtFilter}
                    onChange={(e) => {
                      setDistrictFilter(e.target.value);
                      setCityFilter("ALL");
                    }}
                    className="bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                  >
                    <option value="ALL">{lang === "mr" ? `सर्व जिल्हे (${uniqueDistrictsList.length})` : `All Districts (${uniqueDistrictsList.length})`}</option>
                    {uniqueDistrictsList.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* City Filter Dropdown */}
              {uniqueCitiesList.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
                  <span className="text-xs font-bold text-slate-700 shrink-0">{lang === "mr" ? "शहर:" : "City:"}</span>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="bg-white text-xs font-bold text-slate-800 py-1.5 px-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                  >
                    <option value="ALL">{lang === "mr" ? `सर्व शहरे (${uniqueCitiesList.length})` : `All Cities (${uniqueCitiesList.length})`}</option>
                    {uniqueCitiesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Helper Hint */}
        <div className={`flex items-center justify-between text-xs text-slate-500 font-medium px-1 mb-2 ${selectedPavatiReg ? "no-print" : ""}`}>
        
          <span className="text-[11px] text-slate-400 font-semibold">
            {loading ? (
              <span className="inline-block h-3.5 w-16 bg-slate-200 animate-pulse rounded align-middle" />
            ) : (
              `${filteredRegistrations.length} ${lang === "mr" ? "नोंदणी" : "Registrations"}`
            )}
          </span>
        </div>

        {/* REGISTRATION DATA TABLE CARD */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden ${selectedPavatiReg ? "no-print" : ""}`}>
          {error ? (
            <div className="p-8 text-center text-red-600 flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="font-bold">{error}</p>
              <button
                type="button"
                onClick={fetchRegistrations}
                className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
              >
                {lang === "mr" ? "पुन्हा प्रयत्न करा" : "Try Again"}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EBF1FA] text-slate-700 text-xs font-medium border-b border-slate-200 whitespace-nowrap">
                    <th className="py-2.5 px-2.5 w-8 text-center">{lang === "mr" ? "अ.क्र." : "#"}</th>
                    <th className="py-2.5 px-3 text-left">{lang === "mr" ? "दिनांक व वेळ" : "Date & Time"}</th>
                    <th className="py-2.5 px-3 text-left">{lang === "mr" ? "पावती क्र." : "Receipt No."}</th>
                    <th className="py-2.5 px-4 text-left">{lang === "mr" ? "सदस्य" : "Member"}</th>
                    <th className="py-2.5 px-3 text-left">{lang === "mr" ? "मोबाईल क्र." : "Mobile No."}</th>
                    {viewMode === "all" ? (
                      <>
                        <th className="py-2.5 px-3 text-left">{lang === "mr" ? "पत्ता" : "Address"}</th>
                        <th className="py-2.5 px-3 text-left">{lang === "mr" ? "गाव" : "Village/Town"}</th>
                        <th className="py-2.5 px-3 text-left">{lang === "mr" ? "तालुका" : "Taluka"}</th>
                        <th className="py-2.5 px-3 text-left">{lang === "mr" ? "जिल्हा" : "District"}</th>
                        <th className="py-2.5 px-3 text-left">{lang === "mr" ? "राज्य" : "State"}</th>
                        <th className="py-2.5 px-3 text-left">{lang === "mr" ? "देश" : "Country"}</th>
                        <th className="py-2.5 px-3 text-left">{lang === "mr" ? "पिनकोड" : "Pincode"}</th>
                      </>
                    ) : (
                      <th className="py-2.5 px-3 text-left">{lang === "mr" ? "स्थान (गाव/शहर)" : "(Town/City)"}</th>
                    )}
                    <th className="py-2.5 px-2 text-center">{lang === "mr" ? "प्रभाग" : "Prabhag"}</th>
                    <th className="py-2.5 px-3 text-left">{lang === "mr" ? "शुल्क व पेमेंट" : "Fee & Payment"}</th>
                    <th className="py-2.5 px-2 text-center">{lang === "mr" ? "मुख्य" : "Main"}</th>
                    <th className="py-2.5 px-2 text-center">{lang === "mr" ? "कुटुंब" : "Family"}</th>
                    <th className="py-2.5 px-3 text-left">{lang === "mr" ? "रेफरर" : "Referrer"}</th>
                    <th className="py-2.5 px-3 text-right">{lang === "mr" ? "कृती" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                  {loading ? (
                    [...Array(8)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-2.5 px-2.5 text-center">
                          <div className="h-3.5 w-4 bg-slate-200 rounded mx-auto" />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="h-3.5 w-20 bg-slate-200 rounded" />
                          <div className="h-2.5 w-14 bg-slate-200 rounded mt-1.5" />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="h-3.5 w-24 bg-slate-200 rounded" />
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="h-3.5 w-32 bg-slate-200 rounded" />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="h-3.5 w-24 bg-slate-200 rounded" />
                        </td>
                        {viewMode === "all" ? (
                          <>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-28 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-16 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-16 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-16 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-16 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-14 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3"><div className="h-3.5 w-14 bg-slate-200 rounded" /></td>
                          </>
                        ) : (
                          <td className="py-2.5 px-3">
                            <div className="h-3.5 w-24 bg-slate-200 rounded" />
                          </td>
                        )}
                        <td className="py-2.5 px-2 text-center">
                          <div className="h-3.5 w-6 bg-slate-200 rounded mx-auto" />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="h-3.5 w-20 bg-slate-200 rounded" />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="h-3.5 w-12 bg-slate-200 rounded mx-auto" />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="h-3.5 w-12 bg-slate-200 rounded mx-auto" />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="h-3.5 w-20 bg-slate-200 rounded" />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={viewMode === "all" ? 18 : 12} className="p-12 text-center text-slate-500 italic">
                        {lang === "mr" ? "कोणतीही नोंदणी सापडली नाही." : "No matching registrations found."}
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg, index) => {
                      const main = reg.mainMembers[0] || {
                        fullName: "No Details Available",
                        memberNo: "-",
                        mobileNo: "",
                        prabhagNo: "-",
                      };
                      const timeString = getTimePart(reg);

                      return (
                        <tr
                          key={reg.id}
                          onClick={() => setSelectedDetailsReg(reg)}
                          className="hover:bg-amber-50/70 transition cursor-pointer group border-b border-slate-100/80"
                          title={lang === "mr" ? "नोंदणीचे संपूर्ण तपशील पाहण्यासाठी क्लिक करा" : "Click to view full details"}
                        >
                          {/* 1. SR NO */}
                          <td className="align-top py-2.5 px-2.5 text-center text-slate-400 whitespace-nowrap text-xs font-normal">
                            {index + 1}
                          </td>

                          {/* 2. DATE & TIME (Time stacked directly below date) */}
                          <td className="align-top py-2.5 px-3 whitespace-nowrap">
                            <div className="flex flex-col leading-tight">
                              <span className="text-slate-800 text-xs font-normal">{getDatePart(reg)}</span>
                              {timeString && (
                                <span className="text-[10px] font-normal text-slate-400 mt-0.5 leading-none">{timeString}</span>
                              )}
                            </div>
                          </td>

                          {/* 3. RECEIPT NO (Aligned copy icon, no bold, simple text) */}
                          <td className="align-top py-2.5 px-3 whitespace-nowrap">
                            <div className="w-[170px] flex items-center justify-between gap-1.5 leading-tight">
                              <span className="font-mono text-xs text-slate-800 font-normal truncate" title={reg.receiptNo}>
                                {reg.receiptNo}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(reg.receiptNo, reg.id + "-rec");
                                }}
                                className="text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer shrink-0"
                                title={lang === "mr" ? "पावती क्र. कॉपी करा" : "Copy Receipt No"}
                              >
                                {copiedId === reg.id + "-rec" ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* 4. MEMBER (Clean Member Name only, no bold, increased spacing px-4) */}
                          <td className="align-top py-2.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 leading-tight">
                              <span className="text-slate-800 text-xs font-normal truncate max-w-[190px]" title={main.fullName}>
                                {main.fullName}
                              </span>
                              {reg.mainMembers && reg.mainMembers.length > 1 && (
                                <span
                                  className="text-[11px] font-normal text-amber-700 shrink-0"
                                  title={`एकूण ${reg.mainMembers.length} मुख्य सदस्य: ${reg.mainMembers.map((m) => m.fullName).join(", ")}`}
                                >
                                  (+{reg.mainMembers.length - 1} {lang === "mr" ? "मुख्य" : "Main"})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 5. MOBILE NO */}
                          <td className="align-top py-2.5 px-3 whitespace-nowrap">
                            {main.mobileNo ? (
                              <a
                                href={`tel:${main.mobileNo}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs font-normal text-slate-700 hover:text-blue-700 flex items-center gap-1 leading-tight"
                              >
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{main.mobileNo}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 font-normal text-xs leading-tight">-</span>
                            )}
                          </td>

                          {/* 6. LOCATION / ADDRESS */}
                          {viewMode === "all" ? (
                            <>
                              <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700 truncate max-w-[150px] leading-tight" title={reg.address}>
                                {reg.address || "-"}
                              </td>
                              <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700 leading-tight">
                                {reg.gaav || "-"}
                              </td>
                              <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700 leading-tight">
                                {reg.taluka || "-"}
                              </td>
                              <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-800 leading-tight">
                                {reg.district || "-"}
                              </td>
                              <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700 leading-tight">
                                {reg.state || "महाराष्ट्र"}
                              </td>
                              <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700 leading-tight">
                                {reg.country || "भारत"}
                              </td>
                              <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-mono font-normal text-slate-700 leading-tight">
                                {reg.pincode || "-"}
                              </td>
                            </>
                          ) : (
                            <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal text-slate-700 truncate max-w-[150px] leading-tight" title={`${reg.gaav || ""}, ${reg.taluka || ""}, ${reg.district || ""}`}>
                              {reg.gaav || reg.city || reg.taluka || reg.district || "-"}
                            </td>
                          )}

                          {/* 7. PRABHAG (Simple text, no capsule, no bold) */}
                          <td className="align-top py-2.5 px-2 text-center whitespace-nowrap text-xs font-normal text-slate-700 leading-tight">
                            {main.prabhagNo || "-"}
                          </td>

                          {/* 8. FEE & PAYMENT (Simple text, no capsule badge, no bold) */}
                          <td className="align-top py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 leading-tight">
                              <span className="font-normal text-slate-900 text-xs">
                                ₹{reg.registrationFee}
                              </span>
                              <span className="text-xs font-normal text-slate-600">
                                • {formatPaymentMethod(reg.paymentMethod, reg.paymentMode)}
                              </span>
                              {reg.paymentScreenshot && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setScreenshotZoom(reg.paymentScreenshot || null);
                                  }}
                                  className="text-slate-400 hover:text-slate-800 p-0.5 transition cursor-pointer"
                                  title="View Screenshot"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* 9. MUKHYA MEMBERS (Simple text, no capsule, no bold) */}
                          <td className="align-top py-2.5 px-2 text-center whitespace-nowrap text-xs font-normal text-slate-800 leading-tight">
                            {reg.mainMembers?.length || 1} {lang === "mr" ? "मुख्य" : "Main"}
                          </td>

                          {/* 10. KUTUMB MEMBERS (Simple text, no capsule, no bold) */}
                          <td className="align-top py-2.5 px-2 text-center whitespace-nowrap text-xs font-normal text-slate-800 leading-tight">
                            {reg.familyMembers && reg.familyMembers.length > 0 ? (
                              <span>{reg.familyMembers.length} {lang === "mr" ? "कुटुंब" : "Family"}</span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* 11. REFERRER (Simple text, no capsule, no bold) */}
                          <td className="align-top py-2.5 px-3 whitespace-nowrap text-xs font-normal leading-tight">
                            {(() => {
                              const refInfo = getReferrerDetails(reg.referredBy);
                              if (refInfo.isDirect) {
                                return (
                                  <span className="text-slate-500">
                                    {lang === "mr" ? "थेट वेबसाईट" : "Direct"}
                                  </span>
                                );
                              }
                              return (
                                <span className="text-slate-700 truncate max-w-[130px] inline-block" title={refInfo.email}>
                                  {refInfo.name || refInfo.email}
                                </span>
                              );
                            })()}
                          </td>

                          {/* 12. ACTIONS */}
                          <td className="align-top py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedDetailsReg(reg)}
                                className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                                title="नोंदणी तपशील पहा (View Details)"
                              >
                                <Eye className="w-4 h-4 text-amber-800" />
                              </button>

                              <button
                                onClick={() => handleSendRegWhatsApp(reg)}
                                className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition shadow-2xs active:scale-95 cursor-pointer"
                                title="Send Receipt on WhatsApp"
                              >
                                <WhatsappIcon className="w-4 h-4 text-emerald-600" />
                              </button>

                              <button
                                onClick={() => setDeleteConfirmReg(reg)}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 transition flex items-center justify-center cursor-pointer"
                                title="Delete Application"
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
          )}
        </div>

        {/* ======================================================== */}
        {/* 1. ENTRY DETAILS POPUP MODAL (MATCHING REFERENCE UI)     */}
        {/* ======================================================== */}
        {selectedDetailsReg && (() => {
          const mainMembersList = (selectedDetailsReg.mainMembers && selectedDetailsReg.mainMembers.length > 0)
            ? selectedDetailsReg.mainMembers
            : [{
              id: "fallback-main",
              registrationId: selectedDetailsReg.id,
              srNo: 1,
              fullName: "नाव उपलब्ध नाही",
              memberNo: "-",
              mobileNo: "-",
              prabhagNo: "-",
            }];
          const refInfo = getReferrerDetails(selectedDetailsReg.referredBy);
          const isExec = isExecutiveRegistration(selectedDetailsReg);
          const regDateStr = getDatePart(selectedDetailsReg);
          const regTimeStr = getTimePart(selectedDetailsReg);
          const fullDateTimeStr = regTimeStr ? `${regDateStr} • ${regTimeStr}` : regDateStr;

          return (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
              <div className="bg-[#FAF8F5] rounded-3xl shadow-2xl max-w-5xl w-full border border-amber-900/20 overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in zoom-in-95 duration-200">

                {/* 1. TOP HEADER (Deep Maroon with Gold Accents & Navlogo) */}
                <div className="bg-gradient-to-r from-[#4A0303] via-[#650808] to-[#4A0303] px-5 sm:px-7 py-4 text-white flex items-center justify-between border-b-2 border-amber-500/40 shrink-0">
                  <div className="flex items-center gap-3.5">
                    {/* Official Circular Logo with Gold Border */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-amber-50/10 flex items-center justify-center shrink-0">
                      <Image
                        src="/Navlogo.png"
                        alt="MPTM Official Logo"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-amber-300 tracking-wider block">
                        जय संताजी
                      </span>
                      <h2 className="text-base sm:text-lg font-black tracking-wide text-white drop-shadow-xs leading-tight">
                        महाराष्ट्र प्रांतिक तैलिक महासभा
                      </h2>
                      <p className="text-[11px] font-medium text-amber-200/90 leading-tight">
                        अमरावती विभाग, अमरावती
                      </p>
                    </div>
                  </div>

                  {/* Header Badges & Close Button */}
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="bg-black/35 border border-amber-400/40 text-amber-100 font-mono text-xs font-semibold px-3 py-1 rounded-full shadow-inner hidden sm:inline-block">
                      पावती क्र. : {selectedDetailsReg.receiptNo}
                    </span>
                    <span className="bg-emerald-600/90 text-white border border-emerald-400/40 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Verified</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDetailsReg(null)}
                      className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white/90 hover:text-white flex items-center justify-center transition cursor-pointer border border-white/20 active:scale-95 ml-1"
                      title="बंद करा"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. MODAL BODY (Scrollable Container) */}
                <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">

                  {/* TWO-COLUMN TOP SECTION */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                    {/* LEFT COLUMN: 8 COLS */}
                    <div className="lg:col-span-8 space-y-4">

                      {/* Box 1: नोंदणीची मूलभूत माहिती */}
                      <div className="bg-[#FDF9F2] border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-[#7A0C0C] flex items-center justify-center font-bold">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-[#7A0C0C] block">
                              नोंदणीची मूलभूत माहिती
                            </span>
                            <span className="text-[11px] text-stone-500 font-medium">
                              नोंदणीकृत तपशील व सदस्य कार्ड
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-500 block">नोंदणी दिनांक व वेळ</span>
                          <span className="text-xs font-bold text-stone-800 font-mono">
                            {fullDateTimeStr}
                          </span>
                        </div>
                      </div>

                      {/* Box 2: प्रमुख सदस्य Header */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#7A0C0C]" />
                          <h3 className="text-sm font-black text-stone-900">
                            प्रमुख सदस्य ({mainMembersList.length})
                          </h3>
                        </div>
                      </div>

                      {/* Main Members Cards */}
                      {mainMembersList.map((m, idx) => (
                        <div
                          key={m.id || idx}
                          className="bg-white border border-amber-200/90 rounded-2xl shadow-xs overflow-hidden"
                        >
                          {/* Card Sub-header */}
                          <div className="bg-gradient-to-r from-amber-50/90 to-amber-100/40 px-4 py-2.5 border-b border-amber-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-[#7A0C0C] text-white text-xs font-black flex items-center justify-center shadow-xs">
                                {m.srNo || idx + 1}
                              </span>
                              <span className="font-extrabold text-xs text-[#7A0C0C]">
                                मुख्य सदस्य - {idx + 1}
                              </span>
                              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                {isExec ? "कार्यकारिणी सदस्य (Executive Member)" : "प्राथमिक सदस्य (Primary Member)"}
                              </span>
                            </div>
                          </div>

                          {/* Card Content with 6 Tiles */}
                          <div className="p-4">
                            {/* 6 Grid Tiles */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full text-xs">
                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">पूर्ण नाव</span>
                                <span className="font-bold text-stone-900 block truncate" title={m.fullName}>
                                  {m.fullName || "-"}
                                </span>
                              </div>

                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">सदस्य क्रमांक</span>
                                <span className="font-extrabold text-[#7A0C0C] font-mono block">
                                  {m.memberNo || "-"}
                                </span>
                              </div>

                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">मोबाईल क्रमांक</span>
                                <span className="font-bold text-stone-900 font-mono block">
                                  {m.mobileNo || "-"}
                                </span>
                              </div>

                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">प्रभाग क्रमांक</span>
                                <span className="font-bold text-stone-900 block">
                                  {m.prabhagNo || "-"}
                                </span>
                              </div>

                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">गाव / शहर</span>
                                <span className="font-bold text-stone-900 block">
                                  {selectedDetailsReg.city || "-"}
                                </span>
                              </div>

                              <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                                <span className="text-[10px] text-stone-500 font-semibold block">तालुका</span>
                                <span className="font-bold text-stone-900 block">
                                  {selectedDetailsReg.taluka || selectedDetailsReg.city || "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Box 3: पत्ता व इतर माहिती (Address & Location Card) */}
                      <div className="bg-white border border-amber-200/90 rounded-2xl shadow-xs overflow-hidden">
                        <div className="bg-amber-50/60 px-4 py-2 border-b border-amber-200/80 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#7A0C0C]" />
                          <h4 className="text-xs font-black text-stone-900">
                            पत्ता व इतर माहिती
                          </h4>
                        </div>
                        <div className="p-3.5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                          <div className="sm:col-span-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                            <span className="text-[10px] text-stone-500 font-semibold block">पूर्ण पत्ता</span>
                            <span className="font-bold text-stone-900 block leading-snug">
                              {selectedDetailsReg.address || "-"}
                            </span>
                          </div>

                          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                            <span className="text-[10px] text-stone-500 font-semibold block">जिल्हा</span>
                            <span className="font-bold text-stone-900 block">
                              {selectedDetailsReg.district || "-"}
                            </span>
                          </div>

                          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                            <span className="text-[10px] text-stone-500 font-semibold block">पिनकोड</span>
                            <span className="font-bold text-stone-900 font-mono block">
                              {selectedDetailsReg.pincode || "-"}
                            </span>
                          </div>

                          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                            <span className="text-[10px] text-stone-500 font-semibold block">राज्य / देश</span>
                            <span className="font-bold text-stone-900 block">
                              {selectedDetailsReg.state || "महाराष्ट्र"}, {selectedDetailsReg.country || "भारत"}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: 4 COLS (नोंदणी व पेमेंट माहिती) */}
                    <div className="lg:col-span-4">
                      <div className="bg-white border border-amber-200/90 rounded-2xl shadow-xs overflow-hidden sticky top-2">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100/60 px-4 py-3 border-b border-amber-200 flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-[#7A0C0C]" />
                          <h4 className="text-xs font-black text-stone-900">
                            नोंदणी व पेमेंट माहिती
                          </h4>
                        </div>

                        {/* 7 Vertical Informational Tiles */}
                        <div className="p-3.5 space-y-2.5 text-xs">
                          {/* 1. पावती क्रमांक */}
                          <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-amber-100/80 flex items-center justify-between">
                            <span className="text-[11px] text-stone-600 font-semibold">पावती क्रमांक</span>
                            <span className="font-mono font-black text-[#7A0C0C] bg-amber-100/80 px-2 py-0.5 rounded-md text-[11px] border border-amber-300">
                              {selectedDetailsReg.receiptNo}
                            </span>
                          </div>

                          {/* 2. नोंदणी दिनांक व वेळ */}
                          <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-amber-100/80 flex items-center justify-between">
                            <span className="text-[11px] text-stone-600 font-semibold">नोंदणी दिनांक व वेळ</span>
                            <span className="font-mono font-bold text-stone-800 text-[11px]">
                              {fullDateTimeStr}
                            </span>
                          </div>

                          {/* 3. नोंदणी शुल्क */}
                          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50/80 to-amber-100/50 border border-amber-300/80 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-stone-500 font-bold block uppercase tracking-wider">नोंदणी शुल्क</span>
                              <span className="text-[10px] text-stone-600">प्राप्त अधिकृत देयक</span>
                            </div>
                            <span className="text-xl font-black text-[#7A0C0C] tracking-tight">
                              ₹ {selectedDetailsReg.registrationFee}
                            </span>
                          </div>

                          {/* 4. भरणा पद्धत */}
                          <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-amber-100/80 flex items-center justify-between">
                            <span className="text-[11px] text-stone-600 font-semibold">भरणा पद्धत</span>
                            <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[11px]">
                              {formatPaymentMethod(selectedDetailsReg.paymentMethod)}
                            </span>
                          </div>

                          {/* 5. व्यवहार संदर्भ क्रमांक */}
                          <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-amber-100/80">
                            <span className="text-[10px] text-stone-500 font-semibold block mb-0.5">व्यवहार संदर्भ क्रमांक (Txn ID)</span>
                            <span className="font-mono text-[11px] font-bold text-stone-800 break-all block">
                              {(selectedDetailsReg as any).paymentTransactionId || selectedDetailsReg.paymentReference || (selectedDetailsReg as any).transactionId || "UPI / Direct"}
                            </span>
                          </div>

                          {/* 6. देयक स्रोत */}
                          <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-amber-100/80">
                            <span className="text-[10px] text-stone-500 font-semibold block mb-0.5">देयक स्रोत (Referrer)</span>
                            <span className="font-bold text-stone-800 text-xs block truncate" title={refInfo.email}>
                              {refInfo.isDirect ? "थेट वेबसाईट (Direct Website)" : (refInfo.name || refInfo.email)}
                            </span>
                          </div>

                          {/* 7. नोंदणी स्थिती */}
                          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
                            <span className="text-[11px] text-emerald-900 font-semibold">नोंदणी स्थिती</span>
                            <span className="font-bold text-emerald-800 flex items-center gap-1 text-[11px]">
                              <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                              <span>Verified (यशस्वी)</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* MIDDLE SECTION: कौटुंबिक सदस्य (Family Members Table) */}
                  <div className="bg-white border border-amber-200/90 rounded-2xl shadow-xs overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 sm:px-5 py-3 border-b border-amber-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#7A0C0C]" />
                        <h4 className="text-xs sm:text-sm font-black text-stone-900">
                          कौटुंबिक सदस्य ({selectedDetailsReg.familyMembers?.length || 0})
                        </h4>
                      </div>
                    </div>

                    {selectedDetailsReg.familyMembers && selectedDetailsReg.familyMembers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="bg-[#FDF9F2] text-stone-700 font-bold border-b border-amber-200 text-[11px]">
                            <tr>
                              <th className="p-2.5 text-center w-12 border-r border-amber-100">अ. क्र.</th>
                              <th className="p-2.5 border-r border-amber-100">पूर्ण नाव</th>
                              <th className="p-2.5 border-r border-amber-100">नाते</th>
                              <th className="p-2.5 border-r border-amber-100">जन्म तारीख</th>
                              <th className="p-2.5 border-r border-amber-100">व्यवसाय</th>
                              <th className="p-2.5">मोबाईल</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100/80">
                            {selectedDetailsReg.familyMembers.map((fam, idx) => (
                              <tr key={fam.id || idx} className="hover:bg-amber-50/40 transition">
                                <td className="p-2.5 text-center font-bold text-stone-600 border-r border-amber-100">
                                  {idx + 1}
                                </td>
                                <td className="p-2.5 font-bold text-stone-900 border-r border-amber-100">
                                  {fam.name}
                                </td>
                                <td className="p-2.5 font-medium text-stone-800 border-r border-amber-100">
                                  <span className="bg-amber-100/70 border border-amber-300/80 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    {fam.relation || "-"}
                                  </span>
                                </td>
                                <td className="p-2.5 font-mono text-stone-700 border-r border-amber-100">
                                  {fam.dob ? formatDateToDDMMYYYY(fam.dob) : "-"}
                                </td>
                                <td className="p-2.5 text-stone-700 border-r border-amber-100">
                                  {fam.occupation || "-"}
                                </td>
                                <td className="p-2.5 font-mono text-stone-700">{fam.mobile || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-5 text-center text-xs text-stone-500 font-medium">
                        कोणतेही कौटुंबिक सदस्य नोंदवलेले नाहीत.
                      </div>
                    )}
                  </div>

                  {/* BOTTOM SECTION: देयक तपशील (Payment Summary Cards) */}
                  <div className="bg-white border border-amber-200/90 rounded-2xl shadow-xs overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 sm:px-5 py-2.5 border-b border-amber-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-[#7A0C0C]" />
                        <h4 className="text-xs sm:text-sm font-black text-stone-900">
                          देयक तपशील
                        </h4>
                      </div>
                      <ChevronUp className="w-4 h-4 text-stone-500" />
                    </div>

                    <div className="p-3.5 grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs">
                      <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                        <span className="text-[10px] text-stone-500 font-semibold block">नोंदणी शुल्क</span>
                        <span className="font-black text-[#7A0C0C] text-sm block">
                          ₹ {selectedDetailsReg.registrationFee}
                        </span>
                      </div>

                      <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                        <span className="text-[10px] text-stone-500 font-semibold block">पेमेंट दिनांक व वेळ</span>
                        <span className="font-mono font-bold text-stone-800 text-[11px] block">
                          {fullDateTimeStr}
                        </span>
                      </div>

                      <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                        <span className="text-[10px] text-stone-500 font-semibold block">भरणा पद्धत</span>
                        <span className="font-bold text-emerald-800 text-[11px] block">
                          {formatPaymentMethod(selectedDetailsReg.paymentMethod)}
                        </span>
                      </div>

                      <div className="sm:col-span-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                        <span className="text-[10px] text-stone-500 font-semibold block">व्यवहार संदर्भ क्रमांक</span>
                        <span className="font-mono font-bold text-stone-800 text-[11px] break-all block">
                          {(selectedDetailsReg as any).paymentTransactionId || selectedDetailsReg.paymentReference || (selectedDetailsReg as any).transactionId || "UPI / Direct"}
                        </span>
                      </div>

                      <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-amber-100/80">
                        <span className="text-[10px] text-stone-500 font-semibold block">देयक स्रोत</span>
                        <span className="font-bold text-stone-800 text-[11px] block truncate" title={refInfo.email}>
                          {refInfo.isDirect ? "थेट वेबसाईट" : (refInfo.name || refInfo.email)}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. MODAL FOOTER */}
                <div className="px-5 sm:px-7 py-3.5 bg-white border-t border-amber-200/90 rounded-b-3xl flex items-center justify-between shrink-0 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedDetailsReg(null)}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs px-4 py-2.5 rounded-xl font-bold border border-stone-300 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <X className="w-4 h-4" />
                    <span>{lang === "mr" ? "बंद करा" : "Close"}</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSendRegWhatsApp(selectedDetailsReg)}
                      className="bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs px-4.5 py-2.5 rounded-xl flex items-center gap-1.5 transition font-bold shadow-sm cursor-pointer active:scale-95"
                    >
                      <WhatsappIcon className="w-4 h-4" />
                      <span>WhatsApp करा</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const reg = selectedDetailsReg;
                        setSelectedDetailsReg(null);
                        setSelectedPavatiReg(reg);
                      }}
                      className="bg-gradient-to-r from-[#6B0606] to-[#800A0A] hover:from-[#570505] hover:to-[#6B0606] text-white text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 font-black shadow-md transition cursor-pointer active:scale-95"
                    >
                      <FileText className="w-4 h-4 text-amber-300" />
                      <span>{lang === "mr" ? "पावती पहा" : "View Receipt"}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}

        {/* ======================================================== */}
        {/* 2. OFFICIAL PRINTABLE / DOWNLOADABLE PAVATI MODAL        */}
        {/* ======================================================== */}
        {selectedPavatiReg && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs overflow-y-auto p-2 sm:p-4 md:p-6 flex justify-center items-start animate-in fade-in duration-150">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-150">
              {/* Top Action Bar (Compact, Sleek, Professional) */}
              <div className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 py-2 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs no-print">
                {/* Left: Title + Document Icon + Receipt Number */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 text-[#6B0606] flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 text-amber-800" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-xs tracking-wide whitespace-nowrap">
                      अधिकृत पावती
                    </span>
                    <span className="font-mono text-[11px] font-bold text-amber-950 bg-amber-100/90 border border-amber-300 px-1.5 py-0.5 rounded whitespace-nowrap shadow-2xs">
                      {selectedPavatiReg.receiptNo}
                    </span>
                  </div>
                </div>

                {/* Right: Action Buttons (Compact, Uniform h-7.5, Refined Spacing) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedPavatiReg.publicToken && (
                    <a
                      href={`${MAIN_SITE_URL}/receipt/${selectedPavatiReg.publicToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7.5 px-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-[11px] rounded-md border border-slate-200 shadow-2xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
                      title={lang === "mr" ? "वेबसाईटवर पावती पाहा" : "View on website"}
                    >
                      <ExternalLink className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="whitespace-nowrap">{lang === "mr" ? "वेबसाईट" : "Website"}</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSendRegWhatsApp(selectedPavatiReg)}
                    className="h-7.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] rounded-md shadow-2xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
                    title="WhatsApp वर पाठवा"
                  >
                    <WhatsappIcon className="w-3 h-3 shrink-0 text-white" />
                    <span className="whitespace-nowrap">WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePrint(selectedPavatiReg.receiptNo)}
                    className="h-7.5 px-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-[11px] rounded-md border border-slate-200 shadow-2xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95"
                    title="Print Receipt"
                  >
                    <Printer className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="whitespace-nowrap">{lang === "mr" ? "प्रिंट" : "Print"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(selectedPavatiReg.receiptNo)}
                    disabled={downloadingPdf}
                    className="h-7.5 px-2.5 bg-[#7A0C0C] hover:bg-[#600808] text-white font-semibold text-[11px] rounded-md shadow-2xs transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                    title="PDF डाऊनलोड करा"
                  >
                    <Download className={`w-3 h-3 shrink-0 ${downloadingPdf ? "animate-spin" : ""}`} />
                    <span className="whitespace-nowrap">
                      {downloadingPdf
                        ? (lang === "mr" ? "डाऊनलोड..." : "Downloading...")
                        : (lang === "mr" ? "PDF डाऊनलोड" : "PDF Download")}
                    </span>
                  </button>

                  <div className="h-4 w-px bg-slate-200 mx-0.5" />

                  <button
                    type="button"
                    onClick={() => setSelectedPavatiReg(null)}
                    className="h-7.5 w-7.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
                    title={lang === "mr" ? "बंद करा" : "Close"}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Printable Official Receipt Body */}
              {(() => {
                const reg = selectedPavatiReg;
                const isExec = isExecutiveRegistration(reg);
                const mainMembers = Array.isArray(reg.mainMembers) ? reg.mainMembers : [];
                const familyMembers = Array.isArray(reg.familyMembers) ? reg.familyMembers : [];
                const displayAddress = formatDisplayAddress(reg);
                const publicToken = reg.publicToken || "";
                const qrUrl = publicToken
                  ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    `${MAIN_SITE_URL}/receipt/${publicToken}?scan=1`
                  )}`
                  : `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    `${MAIN_SITE_URL}/receipt/${reg.receiptNo}?scan=1`
                  )}`;

                return (
                  <div
                    id="printable-receipt-card"
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
                            {isExec ? "★ कार्यकारिणी सदस्य नोंदणी पावती ★" : "★ प्राथमिक सदस्य नोंदणी पावती ★"}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-1 text-amber-400 text-lg font-bold">
                        <span className="w-6 h-[2px] bg-amber-400"></span>
                        <span>❖</span>
                      </div>
                    </div>

                    {/* 2. Top Meta Row: पावती क्र. | दिनांक | नोंदणी शुल्क */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl bg-amber-50/70 border border-amber-300 text-xs">
                      <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                        <span className="font-bold text-stone-600 text-xs sm:text-sm shrink-0">पावती क्र. :</span>
                        <span className="font-mono font-black text-stone-900 text-xs sm:text-sm tracking-tight shrink-0">{reg.receiptNo}</span>
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                        <span className="font-bold text-stone-600 text-xs sm:text-sm shrink-0">दिनांक :</span>
                        <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm shrink-0">{getDatePart(reg)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0 sm:justify-end">
                        <span className="font-bold text-stone-600 text-xs sm:text-sm shrink-0">नोंदणी शुल्क :</span>
                        <span className="font-mono font-black text-[#7A0C0C] text-xs sm:text-sm shrink-0">
                          ₹{reg.registrationFee}/-
                        </span>
                      </div>
                    </div>

                    {/* 3. MAIN MEMBERS & LOCATION CONTAINER BOX (Form Style without underlines) */}
                    {mainMembers && mainMembers.length > 0 && (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between border-b border-amber-300 pb-1.5">
                          <h3 className="text-sm sm:text-base font-extrabold text-amber-950 flex items-center gap-2">
                            <span>👤 मुख्य सदस्य माहिती</span>
                            <span className="text-[10px] sm:text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                              एकूण: {mainMembers.length}
                            </span>
                          </h3>
                        </div>

                        <div className="p-3.5 sm:p-4 rounded-xl bg-white border-2 border-amber-700/30 shadow-xs space-y-4">
                          {mainMembers.map((member: any, index: number) => (
                            <div
                              key={member.id || index}
                              className={`space-y-2.5 ${index > 0 ? "pt-3.5 border-t-2 border-dashed border-amber-300/80" : ""
                                }`}
                            >
                              <div className="flex items-center gap-2 border-b border-stone-200 pb-1.5">
                                <span className="w-5 h-5 rounded-full bg-[#7A0C0C] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {member.srNo || index + 1}
                                </span>
                                <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                                  {index === 0 ? "प्राथमिक" : `सदस्य #${index + 1}`} सदस्य माहिती
                                </h4>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:text-sm">
                                <div className="flex items-baseline gap-2">
                                  <span className="font-bold text-stone-600 whitespace-nowrap">
                                    {index === 0 ? "प्राथमिक सदस्य क्रमांक :" : "सदस्य क्रमांक :"}
                                  </span>
                                  <span className="font-mono font-black text-[#7A0C0C] text-sm">
                                    {member.memberNo || "-"}
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
                                    {member.fullName}
                                  </span>
                                </div>

                                <div className="flex items-baseline gap-2">
                                  <span className="font-bold text-stone-600 whitespace-nowrap">मोबाईल क्रमांक :</span>
                                  <span className="font-mono font-bold text-stone-900">
                                    {member.mobileNo}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Common Address & Location Details (Clean without underlines) */}
                          <div className="space-y-2.5 pt-3 border-t-2 border-amber-200 text-xs sm:text-sm">
                            <div className="flex items-baseline gap-2">
                              <span className="font-bold text-stone-600 whitespace-nowrap">पत्ता :</span>
                              <span className="font-semibold text-stone-900">
                                {reg.address || "-"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-stone-600 whitespace-nowrap">गाव :</span>
                                <span className="font-semibold text-stone-900">
                                  {reg.gaav || reg.city || "-"}
                                </span>
                              </div>

                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-stone-600 whitespace-nowrap">तालुका :</span>
                                <span className="font-semibold text-stone-900">
                                  {reg.taluka || reg.city || "-"}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-stone-600 whitespace-nowrap">जिल्हा :</span>
                                <span className="font-semibold text-stone-900">
                                  {reg.district || "अमरावती"}
                                </span>
                              </div>

                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-stone-600 whitespace-nowrap">राज्य :</span>
                                <span className="font-semibold text-stone-900">
                                  {reg.state || "महाराष्ट्र"}
                                </span>
                              </div>

                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-stone-600 whitespace-nowrap">देश :</span>
                                <span className="font-semibold text-stone-900">
                                  {reg.country || "भारत"}
                                </span>
                              </div>

                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-stone-600 whitespace-nowrap">पिनकोड :</span>
                                <span className="font-mono font-bold text-stone-900">
                                  {reg.pincode || "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
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
                        {reg.amountInWords || convertNumberToMarathiWords(reg.registrationFee)}
                      </span>
                    </div>

                    {/* 6. PAYMENT DETAILS BOX AT BOTTOM (As currently doing) */}
                    <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-50/90 via-amber-100/40 to-amber-50/90 border-2 border-amber-400/80 space-y-2.5 text-xs sm:text-sm shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-300 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-800 text-xs sm:text-sm">भरणा केलेली एकूण रक्कम :</span>
                          <span className="font-mono text-xl sm:text-2xl font-black text-[#7A0C0C]">₹{reg.registrationFee}/-</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-900 font-extrabold text-xs">
                          <span>✓</span>
                          <span>पेमेंट पुष्टी (Payment Confirmed)</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 text-xs">
                        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
                          <span className="font-bold text-stone-600 shrink-0">पेमेंट पद्धत : </span>
                          <span className="font-bold text-stone-900">{formatPaymentMethod(reg.paymentMethod)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                          <span className="font-bold text-stone-600 shrink-0">व्यवहार संदर्भ : </span>
                          <span className="font-mono font-bold text-stone-900 text-[11px] sm:text-xs truncate" title={(reg as any).paymentTransactionId || reg.paymentReference || (reg as any).transactionId || "UPI / Direct"}>
                            {(reg as any).paymentTransactionId || reg.paymentReference || (reg as any).transactionId || "UPI / Direct"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0 sm:justify-end">
                          <span className="font-bold text-stone-600 shrink-0">पावती दिनांक : </span>
                          <span className="font-mono font-bold text-stone-900">{getDatePart(reg)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 7. Declaration / Sandesh Box */}
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border-l-4 border-l-[#7A0C0C] border border-amber-200/80 text-stone-900 shadow-2xs">
                      <p className="text-xs font-extrabold text-[#7A0C0C] flex items-start gap-1.5">
                        <span className="whitespace-nowrap">संदेश :</span>
                        <span className="text-stone-800 font-medium leading-relaxed">
                          {isExec
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

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmReg && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-200 text-center space-y-4 font-sans">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Delete Registration Application?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Receipt No. <strong className="text-slate-900">{deleteConfirmReg.receiptNo}</strong> will be permanently removed from database. This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmReg(null)}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRegistration(deleteConfirmReg.id)}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GENERATE FORM LINK MODAL */}
        {isLinkModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 sm:p-6 space-y-5 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Member Registration Form Link
                    </h3>
                    <p className="text-xs text-slate-500">
                      Copy this form link or share directly with members on WhatsApp. (User links enable Cash payment option).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Super Admin User Selector for Referral Link */}
              {isSuperAdmin && (
                <div className="space-y-1 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <label className="block text-xs font-bold text-amber-900">
                    Select User to generate unique link:
                  </label>
                  <select
                    value={selectedUserForLink}
                    onChange={(e) => setSelectedUserForLink(e.target.value)}
                    className="w-full bg-white text-xs font-bold text-slate-800 py-2 px-3 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="">Default Direct Link</option>
                    {managedUsers.map((u) => (
                      <option key={u.id} value={u.email}>
                        {u.name || u.email} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Unique Referral Form URL
                  </label>
                  {(isSuperAdmin ? selectedUserForLink || loggedUserEmail : loggedUserEmail) && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                      User: {isSuperAdmin ? selectedUserForLink || loggedUserEmail : loggedUserEmail}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getActiveFormLink()}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyFormLink}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0 ${copiedLink
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                      }`}
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>
                {copiedLink && (
                  <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Unique link successfully copied to clipboard!</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <WhatsappIcon className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ZOOMED PAYMENT SCREENSHOT MODAL */}
        {screenshotZoom && (
          <div
            onClick={() => setScreenshotZoom(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
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
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center font-bold hover:bg-black transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
