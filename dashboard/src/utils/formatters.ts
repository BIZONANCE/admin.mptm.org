import { MemberRegistration } from "../types";

export function formatDateToDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-";

  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return "-";
    const day = String(dateInput.getDate()).padStart(2, "0");
    const month = String(dateInput.getMonth() + 1).padStart(2, "0");
    const year = dateInput.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const str = String(dateInput).trim();
  if (!str) return "-";

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    return `${dd.padStart(2, "0")}/${mm.padStart(2, "0")}/${yyyy}`;
  }

  const dashMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dashMatch) {
    const [, dd, mm, yyyy] = dashMatch;
    return `${dd.padStart(2, "0")}/${mm.padStart(2, "0")}/${yyyy}`;
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return str;
}

export const getDatePart = (reg: MemberRegistration | null): string => {
  if (!reg) return "-";
  if (reg.date) {
    const parts = reg.date.trim().split(/\s+/);
    if (parts[0]) return formatDateToDDMMYYYY(parts[0]);
  }
  if (reg.createdAt) {
    try {
      const d = new Date(reg.createdAt);
      if (!isNaN(d.getTime())) {
        return formatDateToDDMMYYYY(d);
      }
    } catch (e) {}
  }
  return formatDateToDDMMYYYY(reg.date) || "-";
};

export const getTimePart = (reg: MemberRegistration | null): string => {
  if (!reg) return "";
  if (reg.date) {
    const parts = reg.date.trim().split(/\s+/);
    if (parts.length > 1) {
      return parts.slice(1).join(" ");
    }
  }
  if (reg.createdAt) {
    try {
      const d = new Date(reg.createdAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).toLowerCase();
      }
    } catch (e) {}
  }
  return "";
};

export const formatPaymentMethod = (method: string | null | undefined): string => {
  if (!method) return "Cash";
  const lower = method.toLowerCase().trim();
  if (lower.includes("रोख") || lower.includes("cash")) {
    return "Cash";
  }
  if (
    lower.includes("ऑनलाइन") ||
    lower.includes("online") ||
    lower.includes("upi") ||
    lower.includes("phonepe")
  ) {
    return "Online UPI";
  }
  return method;
};
