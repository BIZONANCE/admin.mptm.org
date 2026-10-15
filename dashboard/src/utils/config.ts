export function getApiUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!url && typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("mptmamravati.org")) url = "https://api.mptmamravati.org";
    else if (host.includes("mptm.org")) url = "https://api.mptm.org";
  }
  if (!url) url = "http://localhost:5015";
  return url.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
}

export function getMainSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_MAIN_SITE_URL) return process.env.NEXT_PUBLIC_MAIN_SITE_URL;
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    const host = window.location.hostname;
    if (host.includes("localhost") || host === "127.0.0.1") {
      return "http://localhost:3000";
    }
    if (host.includes("admin.mptmamravati.org")) return "https://mptmamravati.org";
    if (host.includes("admin.mptm.org")) return "https://mptm.org";
    if (host.startsWith("admin.")) {
      return origin.replace("admin.", "");
    }
  }
  return "https://mptmamravati.org";
}
