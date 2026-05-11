import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiAppleLogoDuotone,
  PiAndroidLogoDuotone,
  PiWindowsLogoDuotone,
  PiLinuxLogoDuotone,
  PiDownloadSimpleDuotone,
  PiCheckCircleDuotone,
  PiBrowserDuotone,
  PiShieldCheckDuotone,
  PiCalendarDuotone,
  PiArrowRightBold,
  PiClockDuotone,
} from "react-icons/pi";
import { API_BASE_URL } from "../../config/apiBaseUrl";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";

const desktopPlatforms = [
  {
    key: "windows",
    name: "Windows",
    Icon: PiWindowsLogoDuotone,
    tint: "#0ea5e9",
    desc: "Windows 10 / 11 (64-bit)",
    size: "~85 MB",
    format: ".exe installer",
    perks: ["Native notifications", "Auto-update", "System tray support"],
  },
  {
    key: "macos",
    name: "macOS",
    Icon: PiAppleLogoDuotone,
    tint: "#a855f7",
    desc: "macOS 12+ (Apple Silicon & Intel)",
    size: "~92 MB",
    format: ".dmg installer",
    perks: ["Apple Silicon native", "Menu-bar integration", "Continuity-ready"],
  },
  {
    key: "linux",
    name: "Linux",
    Icon: PiLinuxLogoDuotone,
    tint: "#f59e0b",
    desc: "Ubuntu 20.04+ / Debian / Fedora",
    size: "~78 MB",
    format: ".AppImage / .deb",
    perks: ["AppImage portable", ".deb package", "Wayland & X11 support"],
  },
];

const mobileApps = [
  {
    key: "android",
    name: "Android",
    Icon: PiAndroidLogoDuotone,
    tint: "#22c55e",
    desc: "Android 8.0+ (API 26)",
    stores: ["Google Play", "Direct APK"],
  },
  {
    key: "ios",
    name: "iOS",
    Icon: PiAppleLogoDuotone,
    tint: "#ec4899",
    desc: "iOS 15.0+",
    stores: ["App Store"],
  },
];

const desktopReqs = [
  "Windows 10 or later (64-bit)",
  "macOS 12 Monterey or later",
  "Ubuntu 20.04+ / Debian 11+ / Fedora 36+",
  "4 GB RAM minimum, 8 GB recommended",
  "200 MB free disk space",
  "Webcam & microphone for video calls",
];

const mobileReqs = [
  "Android 8.0 (Oreo) or later",
  "iOS 15.0 or later",
  "100 MB free storage",
  "Active internet connection",
  "Camera & microphone permissions for calls",
  "Biometric hardware for fingerprint / Face ID login",
];

const RELEASES_API = "https://api.github.com/repos/thakurbhavesh/Dream/releases/latest";
const RELEASES_PAGE = "https://github.com/thakurbhavesh/Dream/releases/latest";

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

export default function Downloads() {
  const { brandName } = useSiteBranding();
  const [release, setRelease] = useState(null);
  const [appUrl, setAppUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.assets) {
          if (!cancelled) setAppUrl(RELEASES_PAGE);
          return;
        }
        const winInstaller = data.assets.find((a) => /\.exe$/i.test(a.name));
        setRelease({
          version: data.tag_name || data.name || "",
          publishedAt: data.published_at,
          size: winInstaller ? Math.round((winInstaller.size || 0) / 1048576) : null,
        });
        setAppUrl(winInstaller?.browser_download_url || RELEASES_PAGE);
      })
      .catch(() => {
        if (!cancelled) setAppUrl(RELEASES_PAGE);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="tcn-downloads">
      <style>{`
        .tcn-downloads { background: #fff; }

        /* HERO */
        .tcn-dl-hero {
          background:
            radial-gradient(1200px 600px at 80% -10%, rgba(109,93,252,0.32), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.1), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          padding: 8rem 0 5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .tcn-dl-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%);
          pointer-events: none;
        }
        .tcn-dl-hero > .container { position: relative; z-index: 1; }
        .tcn-dl-hero h1 {
          font-size: clamp(2.4rem, 5vw, 4rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.025em;
          line-height: 1.08;
          margin: 0 auto 1.25rem;
          max-width: 820px;
        }
        .tcn-dl-hero .gradient-word {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-dl-hero p.lead {
          font-size: 1.15rem;
          color: rgba(255,255,255,0.7);
          max-width: 640px;
          margin: 0 auto 2.25rem;
          line-height: 1.6;
        }
        .tcn-dl-release {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.5rem 1.1rem;
          border-radius: 999px;
          background: rgba(34,197,94,0.12);
          border: 1px solid rgba(34,197,94,0.3);
          color: #4ade80;
          font-size: 0.85rem;
          font-weight: 600;
          backdrop-filter: blur(8px);
        }
        .tcn-dl-release .pulse {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #22c55e;
          box-shadow: 0 0 0 0 rgba(34,197,94,0.6);
          animation: tcnPulseDot 2s infinite;
        }
        @keyframes tcnPulseDot {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
          70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }

        /* SECTION TITLES */
        .tcn-dl-section {
          padding: 5rem 0 1rem;
        }
        .tcn-dl-section + .tcn-dl-section { padding-top: 1rem; }
        .tcn-dl-section.alt { background: #fafbff; }
        .tcn-dl-section-head {
          text-align: center;
          margin-bottom: 3rem;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
        }
        .tcn-dl-section-head h2 {
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--tcn-ink-900);
          margin: 1rem 0 0.7rem;
        }
        .tcn-dl-section-head p {
          color: var(--tcn-ink-500);
          font-size: 1.02rem;
          margin: 0;
        }

        /* DESKTOP CARDS */
        .tcn-dl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          max-width: 1180px;
          margin: 0 auto;
        }
        .tcn-dl-card {
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 20px;
          padding: 2rem 1.6rem 1.6rem;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .tcn-dl-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--card-tint, #6d5dfc);
          opacity: 0;
          transition: opacity 0.22s ease;
        }
        .tcn-dl-card:hover {
          transform: translateY(-6px);
          border-color: var(--card-tint, #6d5dfc);
          box-shadow: 0 20px 50px rgba(15,23,42,0.1);
        }
        .tcn-dl-card:hover::before { opacity: 1; }
        .tcn-dl-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: var(--card-tint-soft, rgba(109,93,252,0.1));
          color: var(--card-tint, #6d5dfc);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .tcn-dl-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--tcn-ink-900);
          margin: 0 0 0.4rem;
        }
        .tcn-dl-card .meta {
          font-size: 0.88rem;
          color: var(--tcn-ink-500);
          margin: 0 0 0.4rem;
        }
        .tcn-dl-card .filemeta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: var(--tcn-ink-500);
          margin-bottom: 1.5rem;
        }
        .tcn-dl-card .filemeta .dot {
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: var(--tcn-ink-400);
        }
        .tcn-dl-perks {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .tcn-dl-perks li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--tcn-ink-700);
        }
        .tcn-dl-perks li svg {
          color: var(--card-tint, #6d5dfc);
          flex-shrink: 0;
        }
        .tcn-dl-cta {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 0.85rem 1rem;
          border-radius: 999px;
          background: var(--card-tint, #6d5dfc);
          color: #fff !important;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none !important;
          border: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          cursor: pointer;
          font-family: inherit;
        }
        .tcn-dl-cta:hover {
          transform: translateY(-2px);
          color: #fff !important;
          box-shadow: 0 10px 24px var(--card-tint-shadow, rgba(109,93,252,0.4));
        }
        .tcn-dl-cta.soon {
          background: #f3f4f8;
          color: var(--tcn-ink-500) !important;
          cursor: not-allowed;
          pointer-events: none;
        }
        .tcn-dl-cta.soon:hover { transform: none; box-shadow: none; }

        /* MOBILE STORE PILLS */
        .tcn-store-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: auto;
        }
        .tcn-store-pill {
          flex: 1;
          min-width: 120px;
          background: var(--card-tint-soft, rgba(109,93,252,0.08));
          border: 1px solid var(--card-tint, #6d5dfc);
          border-color: var(--card-tint-border, rgba(109,93,252,0.2));
          color: var(--card-tint, #6d5dfc);
          padding: 0.7rem 0.9rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.82rem;
          text-align: center;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        .tcn-store-pill .tag {
          font-size: 0.65rem;
          background: rgba(245,158,11,0.18);
          color: #d97706;
          padding: 2px 6px;
          border-radius: 999px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        /* REQUIREMENTS */
        .tcn-req-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
          max-width: 1080px;
          margin: 0 auto;
        }
        .tcn-req-card {
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 20px;
          padding: 1.75rem 1.6rem;
          transition: border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .tcn-req-card:hover {
          border-color: var(--tcn-violet-500);
          box-shadow: var(--tcn-shadow-md);
        }
        .tcn-req-card h4 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--tcn-ink-900);
          margin: 0 0 1rem;
        }
        .tcn-req-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .tcn-req-card ul li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--tcn-ink-700);
          line-height: 1.5;
        }
        .tcn-req-card ul li svg {
          color: #22c55e;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* WEB CTA */
        .tcn-web-cta {
          padding: 5rem 0 6rem;
        }
        .tcn-web-cta-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 4rem 3rem;
          border-radius: 24px;
          background: linear-gradient(135deg, #0b0f1e 0%, #1a1f3a 50%, #2d2563 100%);
          text-align: center;
          color: #fff;
          position: relative;
          overflow: hidden;
          box-shadow: var(--tcn-shadow-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .tcn-web-cta-inner::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(600px 300px at 20% 0%, rgba(255,213,74,0.2), transparent 60%),
            radial-gradient(600px 300px at 80% 100%, rgba(109,93,252,0.3), transparent 60%);
          pointer-events: none;
        }
        .tcn-web-cta-inner > * { position: relative; z-index: 1; }
        .tcn-web-cta-inner .browser-icon {
          width: 72px;
          height: 72px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(255,213,74,0.18), rgba(109,93,252,0.18));
          color: #ffd54a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        .tcn-web-cta-inner h2 {
          color: #fff;
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          font-weight: 800;
          margin: 0 0 0.7rem;
          letter-spacing: -0.02em;
        }
        .tcn-web-cta-inner p {
          color: rgba(255,255,255,0.72);
          font-size: 1.05rem;
          max-width: 540px;
          margin: 0 0 1.5rem;
          line-height: 1.6;
        }
        .tcn-web-cta-inner .btn-gold {
          padding: 0.9rem 1.85rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          font-weight: 800;
          font-size: 1rem;
          text-decoration: none !important;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 8px 24px rgba(255,213,74,0.35);
          transition: transform 0.18s ease;
        }
        .tcn-web-cta-inner .btn-gold:hover { transform: translateY(-2px); color: #1a1f3a !important; }

        @media (max-width: 768px) {
          .tcn-dl-hero { padding: 6.5rem 0 3.5rem; }
          .tcn-dl-section { padding: 3.5rem 0 0.5rem; }
          .tcn-web-cta-inner { padding: 3rem 1.5rem; }
        }
      `}</style>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="tcn-dl-hero">
        <div className="container">
          <span
            className="eyebrow"
            style={{
              background: "rgba(255,213,74,0.12)",
              color: "#ffd54a",
              borderColor: "rgba(255,213,74,0.25)",
              marginBottom: "1.25rem",
              display: "inline-flex",
            }}
          >
            <PiDownloadSimpleDuotone size={12} />
            Apps for every device
          </span>

          <h1>
            Get {brandName || "TheChatNest"} on{" "}
            <span className="gradient-word">every platform</span>
          </h1>
          <p className="lead">
            Install the native desktop app, grab the mobile companion, or open the browser web
            app — your conversations stay in sync wherever you are.
          </p>

          {release?.version && (
            <div className="tcn-dl-release">
              <span className="pulse" />
              Latest release {release.version}
              {release.publishedAt ? ` · ${formatDate(release.publishedAt)}` : ""}
            </div>
          )}
        </div>
      </section>

      {/* ─── DESKTOP APPS ──────────────────────────────────── */}
      <section className="tcn-dl-section">
        <div className="container">
          <div className="tcn-dl-section-head">
            <span className="eyebrow">Desktop</span>
            <h2>Native desktop, built for focused work</h2>
            <p>
              Native notifications, screen sharing, system tray, global shortcuts, and deep OS
              integration. Auto-updates included.
            </p>
          </div>

          <div className="tcn-dl-grid">
            {desktopPlatforms.map((p) => {
              const isAvailable = p.key === "windows" && appUrl;
              const shadowColor = `${p.tint}66`;
              return (
                <div
                  key={p.key}
                  className="tcn-dl-card"
                  style={{
                    "--card-tint": p.tint,
                    "--card-tint-soft": `${p.tint}1a`,
                    "--card-tint-shadow": shadowColor,
                  }}
                >
                  <div className="tcn-dl-icon">
                    <p.Icon size={36} />
                  </div>
                  <h3>{p.name}</h3>
                  <p className="meta">{p.desc}</p>
                  <div className="filemeta">
                    <span>{p.size}</span>
                    <span className="dot" />
                    <span>{p.format}</span>
                  </div>
                  <ul className="tcn-dl-perks">
                    {p.perks.map((perk) => (
                      <li key={perk}>
                        <PiCheckCircleDuotone size={16} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  {isAvailable ? (
                    <a className="tcn-dl-cta" href={appUrl}>
                      <PiDownloadSimpleDuotone size={16} />
                      Download for {p.name}
                    </a>
                  ) : (
                    <span className="tcn-dl-cta soon">
                      <PiClockDuotone size={16} />
                      Coming soon
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── MOBILE APPS ───────────────────────────────────── */}
      <section className="tcn-dl-section alt">
        <div className="container">
          <div className="tcn-dl-section-head">
            <span className="eyebrow">Mobile</span>
            <h2>Stay in flow on the go</h2>
            <p>
              Full feature parity with desktop — messaging, calls, admin panel, biometric login.
              Mobile launch coming soon.
            </p>
          </div>

          <div
            className="tcn-dl-grid"
            style={{ maxWidth: 760, marginLeft: "auto", marginRight: "auto" }}
          >
            {mobileApps.map((m) => {
              const shadowColor = `${m.tint}66`;
              return (
                <div
                  key={m.key}
                  className="tcn-dl-card"
                  style={{
                    "--card-tint": m.tint,
                    "--card-tint-soft": `${m.tint}1a`,
                    "--card-tint-shadow": shadowColor,
                    "--card-tint-border": `${m.tint}40`,
                  }}
                >
                  <div className="tcn-dl-icon">
                    <m.Icon size={36} />
                  </div>
                  <h3>{m.name}</h3>
                  <p className="meta" style={{ marginBottom: "1.5rem" }}>
                    {m.desc}
                  </p>
                  <div className="tcn-store-row">
                    {m.stores.map((s) => (
                      <span key={s} className="tcn-store-pill">
                        {s} <span className="tag">SOON</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SYSTEM REQUIREMENTS ───────────────────────────── */}
      <section className="tcn-dl-section">
        <div className="container">
          <div className="tcn-dl-section-head">
            <span className="eyebrow">Requirements</span>
            <h2>What you'll need to run it</h2>
            <p>
              {brandName || "TheChatNest"} runs on lean hardware. Most modern machines and phones
              are good to go.
            </p>
          </div>

          <div className="tcn-req-grid">
            <div className="tcn-req-card">
              <h4>
                <PiWindowsLogoDuotone size={22} color="#0ea5e9" />
                Desktop
              </h4>
              <ul>
                {desktopReqs.map((req) => (
                  <li key={req}>
                    <PiCheckCircleDuotone size={16} />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div className="tcn-req-card">
              <h4>
                <PiAndroidLogoDuotone size={22} color="#22c55e" />
                Mobile
              </h4>
              <ul>
                {mobileReqs.map((req) => (
                  <li key={req}>
                    <PiCheckCircleDuotone size={16} />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WEB APP CTA ───────────────────────────────────── */}
      <section className="tcn-web-cta">
        <div className="container">
          <div className="tcn-web-cta-inner">
            <span
              className="eyebrow"
              style={{
                background: "rgba(255,213,74,0.12)",
                color: "#ffd54a",
                borderColor: "rgba(255,213,74,0.25)",
                display: "inline-flex",
              }}
            >
              <PiShieldCheckDuotone size={12} />
              No install required
            </span>
            <div className="browser-icon">
              <PiBrowserDuotone size={36} />
            </div>
            <h2>Prefer the browser?</h2>
            <p>
              Open {brandName || "TheChatNest"} in any modern browser — same features, zero
              install. Perfect for shared machines or quick check-ins.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link to="/auth/login" className="btn-gold">
                Open web app <PiArrowRightBold size={16} />
              </Link>
              <Link
                to="/auth/register"
                style={{
                  padding: "0.9rem 1.75rem",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backdropFilter: "blur(8px)",
                }}
              >
                <PiCalendarDuotone size={18} /> Start free trial
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
