import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL } from "../config/apiBaseUrl";

// Single source of truth for the brand name, logo, contact info, and socials.
// Anything in the UI that used to hard-code "TheChatNest" should call
// useSiteBranding() so admins can rename the product from the Site Details
// admin tab and have it ripple through the whole app.
//
// Behaviour:
//  - One fetch per app boot (cached in memory + sessionStorage so the next
//    page load is instant and silent on a flaky network).
//  - Falls back to "TheChatNest" defaults when the API is unreachable.
//  - Re-fetched when the user calls refresh() — used by the admin Site
//    Details editor right after a successful save.

const STORAGE_KEY = "thechatnest.site_branding";

const DEFAULT_BRANDING = {
  brandName: "TheChatNest",
  brandShort: "TC",
  logoUrl: "",
  mascotUrl: "",
  primaryEmail: "",
  primaryPhone: "",
  address: "",
  social: {
    facebook: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    instagram: "",
    pinterest: "",
  },
  emails: [],
  phones: [],
  addresses: [],
  raw: null,
  loading: true,
  error: null,
};

const pickPrimary = (rows = []) => {
  if (!Array.isArray(rows) || !rows.length) return null;
  return rows.find((r) => Boolean(r?.is_primary)) || rows[0] || null;
};

const initials = (text = "") => {
  const parts = String(text).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "TC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatAddress = (addr) =>
  addr
    ? [
        addr.address_line_1,
        addr.address_line_2,
        addr.city,
        addr.state,
        addr.country,
        addr.postal_code,
      ]
        .map((v) => String(v || "").trim())
        .filter(Boolean)
        .join(", ")
    : "";

const cleanLegacyEmail = (value) =>
  String(value || "")
    .trim()
    .replace(/@teamchatx\.com$/i, "@thechatnest.com")
    .replace(/@aabhyasa\.com$/i, "@thechatnest.com");

const cleanLegacyText = (value) =>
  String(value || "")
    .replace(/TeamChatX|TeamChatx|Teamchatx/g, "TheChatNest")
    .replace(/teamChatx|teamchatX|teamchatx/g, "thechatnest")
    .replace(/Aabhyasa/g, "Thechatnest")
    .replace(/aabhyasa/g, "thechatnest");

const normalize = (row) => {
  if (!row) return null;
  const primaryEmail = pickPrimary(row.emails);
  const primaryPhone = pickPrimary(row.phones);
  const primaryAddress = pickPrimary(row.addresses);
  const brandName = cleanLegacyText(String(row.brand_name || "").trim() || DEFAULT_BRANDING.brandName);
  return {
    brandName,
    brandShort: initials(brandName),
    logoUrl: String(row.logo_url || "").trim(),
    mascotUrl: String(row.mascot_url || "").trim(),
    primaryEmail: cleanLegacyEmail(primaryEmail?.email_address),
    primaryPhone: String(primaryPhone?.phone_number || "").trim(),
    address: cleanLegacyText(formatAddress(primaryAddress)),
    social: {
      facebook: String(row.google_plus_url || "").trim(),
      twitter: String(row.twitter_url || "").trim(),
      linkedin: String(row.linkedin_url || "").trim(),
      youtube: String(row.youtube_url || "").trim(),
      instagram: "",
      pinterest: "",
    },
    emails: Array.isArray(row.emails)
      ? row.emails.map((e) => ({
          ...e,
          email_address: cleanLegacyEmail(e?.email_address),
          label: cleanLegacyText(e?.label),
        }))
      : [],
    phones: Array.isArray(row.phones) ? row.phones : [],
    addresses: Array.isArray(row.addresses) ? row.addresses : [],
    raw: row,
  };
};

const readCached = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeCached = (data) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota / privacy mode — ignore */
  }
};

const SiteBrandingContext = createContext(DEFAULT_BRANDING);

export const SiteBrandingProvider = ({ children }) => {
  const cached = readCached();
  const [state, setState] = useState({
    ...DEFAULT_BRANDING,
    ...(cached || {}),
    // Even if we hydrate from cache, kick off a background refresh.
    loading: !cached,
  });

  const fetchOnce = async () => {
    if (!API_BASE_URL) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/site-details`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const rows = Array.isArray(payload?.data) ? payload.data : [];
      const active =
        rows.find((r) => String(r?.status || "").toLowerCase() === "active") ||
        rows[0] ||
        null;
      const next = normalize(active) || {};
      const merged = { ...DEFAULT_BRANDING, ...next, loading: false, error: null };
      setState(merged);
      writeCached(merged);
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err?.message || "" }));
    }
  };

  useEffect(() => {
    fetchOnce();
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      refresh: fetchOnce,
    }),
    [state]
  );

  return (
    <SiteBrandingContext.Provider value={value}>
      {children}
    </SiteBrandingContext.Provider>
  );
};

export const useSiteBranding = () => useContext(SiteBrandingContext);

// Lightweight component that keeps document.title in sync with brandName.
// Drop into the App tree once.
export const SiteTitleSync = () => {
  const { brandName } = useSiteBranding();
  useEffect(() => {
    if (!brandName) return;
    const current = document.title || "";
    const dash = current.indexOf(" — ");
    if (dash > -1) {
      document.title = `${brandName}${current.slice(dash)}`;
    } else if (
      !current ||
      current === "TheChatNest" ||
      current === "TheChatNest" ||
      current === "TheChatNest"
    ) {
      document.title = brandName;
    }
  }, [brandName]);
  return null;
};

export default SiteBrandingContext;
