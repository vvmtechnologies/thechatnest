import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiCookieDuotone,
  PiCheckBold,
  PiGearDuotone,
  PiXBold,
  PiArrowRightBold,
} from "react-icons/pi";

// GDPR-style cookie consent banner.
// Three states:
//   not-decided      → banner visible
//   accept-all       → analytics + marketing loaded
//   reject-all       → only necessary cookies
//   custom { ... }   → user picked specific categories
//
// Persisted in localStorage. Re-prompted only if version is bumped.

const STORAGE_KEY = "tcn.cookieConsent.v1";

const loadGoogleAnalytics = () => {
  if (window.__tcnGaLoaded) return;
  const id = window.__TCN_GA_ID__;
  if (!id) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  // gtag stub already exists from index.html bootstrap
  window.gtag("config", id);
  window.__tcnGaLoaded = true;
};

const loadTawk = () => {
  if (window.__tcnTawkLoaded) return;
  const src = window.__TCN_TAWK_SRC__;
  if (!src) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  s.charset = "UTF-8";
  s.setAttribute("crossorigin", "*");
  document.head.appendChild(s);
  window.__tcnTawkLoaded = true;
};

const applyConsent = (consent) => {
  if (!consent) return;
  if (consent.analytics) loadGoogleAnalytics();
  if (consent.marketing) loadTawk();
};

const readConsent = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeConsent = (consent) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...consent,
      decided_at: new Date().toISOString(),
    }));
  } catch {
    /* localStorage blocked — UI still works for the session */
  }
};

const CookieConsent = () => {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const existing = readConsent();
    if (existing) {
      applyConsent(existing);
      setAnalytics(Boolean(existing.analytics));
      setMarketing(Boolean(existing.marketing));
      return;
    }
    // Defer the banner mount slightly so it doesn't compete with hero LCP
    const id = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(id);
  }, []);

  const handleAcceptAll = () => {
    const consent = { necessary: true, analytics: true, marketing: true };
    writeConsent(consent);
    applyConsent(consent);
    setOpen(false);
  };

  const handleRejectAll = () => {
    const consent = { necessary: true, analytics: false, marketing: false };
    writeConsent(consent);
    setOpen(false);
  };

  const handleSavePrefs = () => {
    const consent = { necessary: true, analytics, marketing };
    writeConsent(consent);
    applyConsent(consent);
    setOpen(false);
    setShowSettings(false);
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes tcnCcIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tcnCcOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .tcn-cc-overlay {
          position: fixed;
          inset: 0;
          z-index: 9000;
          background: rgba(11,15,30,0.45);
          backdrop-filter: blur(4px);
          animation: tcnCcOverlayIn 0.3s ease;
          display: none;
        }
        .tcn-cc-overlay.show { display: block; }
        .tcn-cc-banner {
          position: fixed;
          left: 16px;
          right: 16px;
          bottom: 16px;
          z-index: 9100;
          max-width: 760px;
          margin: 0 auto;
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          border: 1px solid rgba(255,213,74,0.25);
          border-radius: 18px;
          padding: 1.4rem 1.6rem;
          box-shadow:
            0 24px 60px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.04);
          color: #fff;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          animation: tcnCcIn 0.4s cubic-bezier(0.23,1,0.32,1);
        }
        .tcn-cc-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 0.85rem;
        }
        .tcn-cc-head .ic {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: rgba(255,213,74,0.16);
          color: #ffd54a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tcn-cc-head h3 {
          font-size: 1.05rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.01em;
          color: #fff;
        }
        .tcn-cc-body p {
          font-size: 0.92rem;
          line-height: 1.55;
          color: rgba(255,255,255,0.72);
          margin: 0 0 1rem;
        }
        .tcn-cc-body a {
          color: #ffd54a;
          text-decoration: underline;
        }
        .tcn-cc-actions {
          display: flex;
          gap: 0.55rem;
          flex-wrap: wrap;
          align-items: center;
        }
        .tcn-cc-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.6rem 1.15rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.88rem;
          font-family: inherit;
          cursor: pointer;
          border: 0;
          transition: all 0.18s ease;
        }
        .tcn-cc-btn.primary {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a;
          box-shadow: 0 8px 20px rgba(255,213,74,0.32);
        }
        .tcn-cc-btn.primary:hover { transform: translateY(-1px); }
        .tcn-cc-btn.ghost {
          background: rgba(255,255,255,0.06);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.16);
        }
        .tcn-cc-btn.ghost:hover { background: rgba(255,255,255,0.12); }
        .tcn-cc-btn.text {
          background: transparent;
          color: rgba(255,255,255,0.78);
          padding: 0.6rem 0.85rem;
        }
        .tcn-cc-btn.text:hover { color: #fff; }
        .tcn-cc-btn.text .ic { margin-right: 4px; }

        /* Settings panel */
        .tcn-cc-settings {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .tcn-cc-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.85rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .tcn-cc-row:last-child { border-bottom: 0; }
        .tcn-cc-row-text h4 {
          margin: 0 0 0.2rem;
          font-size: 0.92rem;
          font-weight: 700;
          color: #fff;
        }
        .tcn-cc-row-text p {
          margin: 0;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
        }
        .tcn-cc-row-text .req {
          display: inline-block;
          margin-left: 6px;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #ffd54a;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(255,213,74,0.16);
          vertical-align: middle;
          text-transform: uppercase;
        }

        /* Tiny toggle */
        .tcn-cc-toggle {
          position: relative;
          width: 38px;
          height: 22px;
          background: rgba(255,255,255,0.18);
          border-radius: 999px;
          border: 0;
          padding: 0;
          cursor: pointer;
          transition: background 0.18s ease;
          flex-shrink: 0;
        }
        .tcn-cc-toggle.on { background: #16a34a; }
        .tcn-cc-toggle.locked { background: rgba(255,213,74,0.4); cursor: not-allowed; }
        .tcn-cc-toggle::after {
          content: "";
          position: absolute;
          left: 3px;
          top: 3px;
          width: 16px;
          height: 16px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.18s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .tcn-cc-toggle.on::after,
        .tcn-cc-toggle.locked::after { transform: translateX(16px); }

        @media (max-width: 640px) {
          .tcn-cc-banner { padding: 1.1rem 1.2rem; }
          .tcn-cc-actions { flex-direction: column; align-items: stretch; }
          .tcn-cc-btn { justify-content: center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tcn-cc-banner, .tcn-cc-overlay { animation: none; }
        }
      `}</style>

      <div className={`tcn-cc-overlay ${showSettings ? "show" : ""}`} onClick={() => setShowSettings(false)} />

      <div
        className="tcn-cc-banner"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tcn-cc-title"
        aria-describedby="tcn-cc-desc"
      >
        <div className="tcn-cc-head">
          <span className="ic" aria-hidden>
            <PiCookieDuotone size={20} />
          </span>
          <h3 id="tcn-cc-title">We use cookies</h3>
        </div>

        <div className="tcn-cc-body">
          <p id="tcn-cc-desc">
            We use cookies to keep your session secure, understand how the site is used, and
            improve the experience over time. Necessary cookies are always on. You can accept
            everything, reject everything, or pick what you're comfortable with. See our{" "}
            <Link to="/saas-privacy">privacy policy</Link> for details.
          </p>

          <div className="tcn-cc-actions">
            <button
              className="tcn-cc-btn primary"
              onClick={handleAcceptAll}
              aria-label="Accept all cookies"
            >
              <PiCheckBold size={13} /> Accept all
            </button>
            <button
              className="tcn-cc-btn ghost"
              onClick={handleRejectAll}
              aria-label="Reject non-essential cookies"
            >
              Reject all
            </button>
            <button
              className="tcn-cc-btn text"
              onClick={() => setShowSettings((s) => !s)}
              aria-expanded={showSettings}
              aria-controls="tcn-cc-settings-panel"
            >
              <PiGearDuotone size={14} className="ic" />
              {showSettings ? "Hide settings" : "Customize"}
            </button>
          </div>

          {showSettings && (
            <div className="tcn-cc-settings" id="tcn-cc-settings-panel">
              <div className="tcn-cc-row">
                <div className="tcn-cc-row-text">
                  <h4>
                    Necessary
                    <span className="req">Always on</span>
                  </h4>
                  <p>
                    Required for login, security, and payment flows.
                    Without these the site simply doesn't work.
                  </p>
                </div>
                <button className="tcn-cc-toggle locked" disabled aria-label="Necessary cookies always on" />
              </div>

              <div className="tcn-cc-row">
                <div className="tcn-cc-row-text">
                  <h4>Analytics</h4>
                  <p>
                    Anonymous usage stats via Google Analytics so we can spot
                    broken pages, slow loads, and what people actually use.
                  </p>
                </div>
                <button
                  className={`tcn-cc-toggle ${analytics ? "on" : ""}`}
                  onClick={() => setAnalytics((v) => !v)}
                  aria-pressed={analytics}
                  aria-label="Toggle analytics cookies"
                />
              </div>

              <div className="tcn-cc-row">
                <div className="tcn-cc-row-text">
                  <h4>Marketing &amp; live chat</h4>
                  <p>
                    Enables our live-chat widget (Tawk.to) so you can talk to
                    a human, plus session replays we use to improve onboarding.
                  </p>
                </div>
                <button
                  className={`tcn-cc-toggle ${marketing ? "on" : ""}`}
                  onClick={() => setMarketing((v) => !v)}
                  aria-pressed={marketing}
                  aria-label="Toggle marketing cookies"
                />
              </div>

              <div className="tcn-cc-actions" style={{ marginTop: "1rem" }}>
                <button className="tcn-cc-btn primary" onClick={handleSavePrefs}>
                  Save my choices <PiArrowRightBold size={12} />
                </button>
                <button className="tcn-cc-btn text" onClick={() => setShowSettings(false)}>
                  <PiXBold size={12} className="ic" /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
