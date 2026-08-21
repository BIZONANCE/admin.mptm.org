export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("mptmamravati.org")) return "https://api.mptmamravati.org";
    if (host.includes("mptm.org")) return "https://api.mptm.org";
  }
  return "http://localhost:5000";
}

export function getMainSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_MAIN_SITE_URL) return process.env.NEXT_PUBLIC_MAIN_SITE_URL;
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    const host = window.location.hostname;
    if (host.includes("localhost") || host === "127.0.0.1") {
      return "http://localhost:3001";
    }
    if (host.includes("admin.mptmamravati.org")) return "https://mptmamravati.org";
    if (host.includes("admin.mptm.org")) return "https://mptm.org";
    if (host.startsWith("admin.")) {
      return origin.replace("admin.", "");
    }
  }
  return "https://mptmamravati.org";
}
