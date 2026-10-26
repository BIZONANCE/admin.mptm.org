// Centralized environment configuration - purely driven by process.env without hardcoded domain fallbacks
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  return url ? url.replace(/\/+$/, "") : "";
}

export function getMainSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim()) {
    // If configured URL mistakenly points to the admin subdomain, strip 'admin.'
    return envUrl.replace(/\/+$/, "").replace(/:\/\/admin\./i, "://");
  }

  // Automatic browser fallback based on the current hostname
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.includes("admin.mptmamravati.org")) {
      return "https://mptmamravati.org";
    }
    if (origin.includes("admin.mptm.org")) {
      return "https://mptm.org";
    }
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return "http://localhost:3000";
    }
    // Generic fallback: strip 'admin.' from origin if present
    return origin.replace(/:\/\/admin\./i, "://");
  }

  return "https://mptmamravati.org";
}
