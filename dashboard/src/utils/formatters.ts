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

export function convertNumberToMarathiWords(amountStr: string | number): string {
  const num = typeof amountStr === "number" ? amountStr : parseInt(String(amountStr), 10);
  if (isNaN(num) || num <= 0) return "शून्य रुपये फक्त";
  if (num === 1001) return "एक हजार एक रुपये फक्त";
  if (num === 101) return "एकशे एक रुपये फक्त";

  const unitsAndTens: { [key: number]: string } = {
    1: "एक", 2: "दोन", 3: "तीन", 4: "चार", 5: "पाच", 6: "सहा", 7: "सात", 8: "आठ", 9: "नऊ", 10: "दहा",
    11: "अकरा", 12: "बारा", 13: "तेरा", 14: "चौदा", 15: "पंधरा", 16: "सोळा", 17: "सतरा", 18: "अठरा", 19: "एकोणीस",
    20: "वीस", 21: "एकवीस", 22: "बावीस", 23: "तेवीस", 24: "चोवीस", 25: "पंचवीस", 26: "सव्वीस", 27: "सत्तावीस", 28: "अठ्ठावीस", 29: "एकोणतीस",
    30: "तीस", 31: "एकतीस", 32: "बत्तीस", 33: "तेहेतीस", 34: "चौतीस", 35: "पस्तीस", 36: "छत्तीस", 37: "सदतीस", 38: "अडतीस", 39: "एकोणचाळीस",
    40: "चाळीस", 41: "एक्केचाळीस", 42: "बेचाळीस", 43: "त्रेश्चाळीस", 44: "चौचाळीस", 45: "पंचेचाळीस", 46: "शेचाळीस", 47: "सत्ताचाळीस", 48: "अठ्ठाचाळीस", 49: "एकोणपन्नास",
    50: "पन्नास", 51: "एकपन्न", 52: "बावन्न", 53: "तिरपन्न", 54: "चौपन्न", 55: "पंचावन्न", 56: "छप्पन्न", 57: "सत्तावन्न", 58: "अठ्ठावन्न", 59: "एकोणसाठ",
    60: "साठ", 61: "एकसष्ठ", 62: "बासष्ठ", 63: "त्रिसष्ठ", 64: "चौसष्ठ", 65: "पासष्ठ", 66: "सायसष्ठ", 67: "सदसष्ठ", 68: "अडसष्ठ", 69: "एकोणसत्तर",
    70: "सत्तर", 71: "एकहत्तर", 72: "बाहत्तर", 73: "त्रियेहत्तर", 74: "चौहत्तर", 75: "पंचहत्तर", 76: "शहात्तर", 77: "सत्त्याहत्तर", 78: "अठ्ठाहत्तर", 79: "एकोणऐंशी",
    80: "ऐंशी", 81: "एकऐंशी", 82: "ब्याऐंशी", 83: "त्र्याऐंशी", 84: "चौऱ्याऐंशी", 85: "पंच्याऐंशी", 86: "स्याऐंशी", 87: "सत्त्याऐंशी", 88: "अठ्ठ्याऐंशी", 89: "एकोणनव्वद",
    90: "नव्वद", 91: "एक्यानव्वद", 92: "ब्यानव्वद", 93: "त्र्यानव्वद", 94: "चौऱ्यानव्वद", 95: "पंच्यानव्वद", 96: "शहाणव्वद", 97: "सत्त्यानव्वद", 98: "अठ्ठ्यानव्वद", 99: "नव्व्यान्नव"
  };

  const hundreds: { [key: number]: string } = {
    1: "एकशे", 2: "दोनशे", 3: "तीनशे", 4: "चारशे", 5: "पाचशे", 6: "सहाशे", 7: "सातशे", 8: "आठशे", 9: "नऊशे"
  };

  let words = "";
  let n = num;

  if (n >= 100000) {
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    words += (unitsAndTens[lakh] || lakh) + " लाख ";
  }

  if (n >= 100) {
    const h = Math.floor(n / 100);
    n %= 100;
    words += (hundreds[h] || (unitsAndTens[h] + " शे")) + " ";
  }

  if (n > 0) {
    words += (unitsAndTens[n] || n) + " ";
  }

  return words.trim() + " रुपये फक्त";
}
