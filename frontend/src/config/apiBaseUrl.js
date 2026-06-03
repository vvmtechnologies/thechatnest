const cleanUrl = (value) =>
  typeof value === "string" && value.trim()
    ? value.trim().replace(/\/$/, "")
    : "";

const DEFAULT_DEV_API_URL = "http://localhost:5000";
const DEFAULT_PROD_API_URL = "https://api.thechatnest.com";

// Resolution order:
//   1. Any of the *_API_URL env vars (works in dev + prod, set per environment)
//   2. In dev, when accessed over LAN IP (e.g. phone on the same network),
//      fall back to <protocol>//<host>:5000 so the phone hits your laptop's
//      backend without needing extra env-var plumbing.
//   3. Sensible defaults: localhost:5000 in dev, the live backend in prod.
export const getApiBaseUrl = () => {
  const candidates = [
    import.meta.env.REACT_APP_API_URL,
    import.meta.env.VITE_API_URL,
    import.meta.env.VITE_SERVER_URL,
    import.meta.env.VITE_BACKEND_URL,
    import.meta.env.VITE_APP_API_URL,
  ];

  for (const candidate of candidates) {
    const cleaned = cleanUrl(candidate);
    if (cleaned) return cleaned;
  }

  // Dev-only LAN fallback — never hit in production builds.
  if (typeof window !== "undefined" && !import.meta.env.PROD) {
    const host = window.location.hostname;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `${window.location.protocol}//${host}:5000`;
    }
  }

  return import.meta.env.PROD ? DEFAULT_PROD_API_URL : DEFAULT_DEV_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();
