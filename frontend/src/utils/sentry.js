// Lazy Sentry bootstrap.
//
// We don't bundle @sentry/react in the main chunk — instead we load it
// on demand via CDN ONLY if a VITE_SENTRY_DSN env var is configured.
// This way:
//   - Production with DSN set → Sentry attaches and captures errors.
//   - Dev / preview / DSN unset → zero network or bundle cost.
//   - One env var flip in Vercel to enable, no code change needed.

const DSN = import.meta.env?.VITE_SENTRY_DSN || "";
const RELEASE = import.meta.env?.VITE_APP_VERSION || "thechatnest@dev";
const ENV =
  import.meta.env?.MODE === "production" ? "production" : "development";

let initialized = false;

const SENTRY_CDN = "https://browser.sentry-cdn.com/8.31.0/bundle.tracing.min.js";

const loadFromCdn = () =>
  new Promise((resolve, reject) => {
    if (window.Sentry?.init) return resolve(window.Sentry);
    const s = document.createElement("script");
    s.src = SENTRY_CDN;
    s.crossOrigin = "anonymous";
    s.integrity = ""; // intentionally empty: pin a hash if you want strict SRI
    s.async = true;
    s.onload = () => resolve(window.Sentry);
    s.onerror = () => reject(new Error("Failed to load Sentry from CDN"));
    document.head.appendChild(s);
  });

export const initSentry = async () => {
  if (initialized) return;
  if (!DSN) return; // No DSN configured — silently skip.
  // Defer past first paint so we don't block hydration.
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(() => bootstrap());
  } else {
    setTimeout(bootstrap, 1500);
  }
};

const bootstrap = async () => {
  try {
    const Sentry = await loadFromCdn();
    if (!Sentry?.init) return;
    Sentry.init({
      dsn: DSN,
      release: RELEASE,
      environment: ENV,
      // Capture 10% of transactions in prod for perf monitoring
      tracesSampleRate: ENV === "production" ? 0.1 : 0,
      // Only enable session replay on errors (lighter touch)
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: ENV === "production" ? 0.1 : 0,
      sendDefaultPii: false,
      integrations: [],
      // Filter noisy errors
      ignoreErrors: [
        "ResizeObserver loop limit exceeded",
        "Non-Error promise rejection captured",
        /ChunkLoadError/i,
      ],
      beforeSend(event) {
        // Drop events from localhost / preview deploys
        if (window.location.hostname === "localhost") return null;
        return event;
      },
    });
    initialized = true;
    // Expose for manual captureException calls if needed
    window.__tcnSentry = Sentry;
  } catch (err) {
    // Sentry failed to load — never let monitoring break the app
    console.warn("[sentry] init failed:", err?.message);
  }
};

// Helper for manual error capture from try/catch blocks
export const captureError = (error, context) => {
  try {
    if (window.__tcnSentry?.captureException) {
      window.__tcnSentry.captureException(error, { extra: context });
    }
  } catch {}
};
