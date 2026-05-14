import React from "react";
import { Link } from "react-router-dom";
import {
  PiShieldCheckDuotone,
  PiLockKeyDuotone,
  PiKeyDuotone,
  PiUserCircleCheckDuotone,
  PiClockCountdownDuotone,
  PiFingerprintDuotone,
  PiCloudDuotone,
  PiArrowRightBold,
  PiSparkleDuotone,
  PiCheckBold,
  PiCircleDashedDuotone,
  PiNotePencilDuotone,
  PiUserSwitchDuotone,
  PiEnvelopeDuotone,
} from "react-icons/pi";
import Seo from "../../components/Seo.jsx";

// Categories: things we ship today vs. things on our roadmap.
const PRACTICES = [
  {
    cat: "Data at rest",
    Icon: PiLockKeyDuotone,
    tint: "#16a34a",
    items: [
      { live: true,  text: "AES-256-GCM encryption for chat content, files, and attachments in the database." },
      { live: true,  text: "AWS S3 server-side encryption (SSE-S3) for uploaded files in object storage." },
      { live: true,  text: "Encrypted database backups taken daily by our cloud provider." },
      { live: false, text: "Customer-managed keys (BYOK) for Enterprise customers — Q2 2026." },
    ],
  },
  {
    cat: "Data in transit",
    Icon: PiCloudDuotone,
    tint: "#2065D1",
    items: [
      { live: true,  text: "TLS 1.3 enforced everywhere — public website, app, API, and WebSocket connections." },
      { live: true,  text: "HSTS preload-list submitted; modern browsers refuse HTTP downgrade." },
      { live: true,  text: "Strict CORS allow-list — only our verified origins can hit the API." },
      { live: true,  text: "Secure cookies (HttpOnly, Secure, SameSite=Lax) for all session tokens." },
    ],
  },
  {
    cat: "Authentication",
    Icon: PiKeyDuotone,
    tint: "#6d5dfc",
    items: [
      { live: true,  text: "JWT-based access tokens (15 min) + refresh tokens (30 days) with rotating signing keys." },
      { live: true,  text: "Email + password with 6-digit OTP on every new device or suspicious login." },
      { live: true,  text: "Biometric login (Face ID / fingerprint) on iOS and Android with OTP skip for trusted devices." },
      { live: true,  text: "QR-code login on the web — scan with your phone, no password retyping." },
      { live: true,  text: "Maximum 3 simultaneous active sessions per user; revokable from Settings." },
      { live: false, text: "SAML / SSO via Okta, Azure AD, Google Workspace — Enterprise tier, Q2 2026." },
    ],
  },
  {
    cat: "Access control & audit",
    Icon: PiUserCircleCheckDuotone,
    tint: "#a855f7",
    items: [
      { live: true,  text: "Role-based access — Owner / Admin / Department Admin / User scopes." },
      { live: true,  text: "Append-only activity log for every admin action and security-relevant event." },
      { live: true,  text: "Super-admin can view OTP logs — codes, attempts, IPs, devices — for incident forensics." },
      { live: true,  text: "Trusted-device management with one-click revoke from any session." },
      { live: false, text: "IP-range + platform restrictions for workspace access — Q1 2026." },
    ],
  },
  {
    cat: "Privacy & retention",
    Icon: PiClockCountdownDuotone,
    tint: "#f59e0b",
    items: [
      { live: true,  text: "Disappearing-message timers — set per chat, auto-delete after the chosen interval." },
      { live: true,  text: "Per-chat PIN lock — lock individual conversations from a shared device." },
      { live: true,  text: "Self-service account deletion (GDPR-aligned) with complete data removal." },
      { live: true,  text: "Workspace data export (JSON / CSV) for compliance and migration audits." },
      { live: true,  text: "Zero advertising tracking — we do not sell, lease, or share customer data." },
    ],
  },
  {
    cat: "Application hardening",
    Icon: PiShieldCheckDuotone,
    tint: "#dc2626",
    items: [
      { live: true,  text: "Server-side input sanitization against XSS, SQLi, and template injection on every endpoint." },
      { live: true,  text: "Dangerous file blocking — .exe, .bat, .sh, macros, archive-bombs rejected at upload." },
      { live: true,  text: "Rate limiting and OTP-attempt throttling to defeat credential-stuffing." },
      { live: true,  text: "Password strength meter + breach-list check at registration." },
      { live: false, text: "Third-party penetration test report (annual) — first cycle planned Q3 2026." },
    ],
  },
];

const QUICK = [
  { num: "AES-256",      lbl: "at rest" },
  { num: "TLS 1.3",      lbl: "in transit" },
  { num: "JWT + OTP",    lbl: "auth" },
  { num: "GDPR",         lbl: "aligned" },
  { num: "0",            lbl: "data sold" },
];

const Security = () => {
  return (
    <div className="tcn-security">
      <Seo
        title="Security"
        description="An honest look at how TheChatNest protects your team — AES-256 encryption, TLS 1.3, JWT + OTP authentication, audit logs, and what's on our security roadmap."
        keywords="thechatnest security, encryption, GDPR, AES-256, TLS 1.3, JWT, OTP, audit log, compliance"
      />

      <style>{`
        .tcn-security {
          background: linear-gradient(180deg, #fafbff 0%, #fff 60%);
          color: #0b0f1e;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          min-height: 100vh;
        }
        .tcn-sec-hero {
          position: relative;
          padding: 7rem 0 4rem;
          background:
            radial-gradient(1100px 600px at 78% -10%, rgba(22,163,74,0.28), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.1), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          overflow: hidden;
        }
        .tcn-sec-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%);
          pointer-events: none;
        }
        .tcn-sec-hero > .container { position: relative; z-index: 1; text-align: center; }
        .tcn-sec-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          background: rgba(22,163,74,0.18);
          border: 1px solid rgba(22,163,74,0.4);
          color: #86efac;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .tcn-sec-hero h1 {
          font-size: clamp(2rem, 4.5vw, 3.4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 1rem;
          color: #fff;
        }
        .tcn-sec-hero h1 .accent {
          background: linear-gradient(135deg, #86efac, #4ade80);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-sec-hero p.lede {
          color: rgba(255,255,255,0.72);
          font-size: 1.1rem;
          line-height: 1.55;
          max-width: 600px;
          margin: 0 auto 2.25rem;
        }
        .tcn-sec-quick {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0;
          max-width: 880px;
          margin: 0 auto;
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255,255,255,0.1);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .tcn-sec-quick-cell {
          text-align: center;
          padding: 0 1rem;
          position: relative;
        }
        .tcn-sec-quick-cell:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 20%;
          bottom: 20%;
          right: 0;
          width: 1px;
          background: rgba(255,255,255,0.08);
        }
        .tcn-sec-quick-cell .num {
          font-family: "JetBrains Mono", monospace;
          font-size: clamp(1rem, 2vw, 1.4rem);
          font-weight: 700;
          color: #86efac;
          letter-spacing: -0.01em;
          margin-bottom: 0.35rem;
        }
        .tcn-sec-quick-cell .lbl {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
        }
        @media (max-width: 720px) {
          .tcn-sec-quick { grid-template-columns: repeat(2, 1fr); gap: 1.25rem 0; }
          .tcn-sec-quick-cell::after { display: none !important; }
        }

        /* honesty banner */
        .tcn-sec-honesty {
          max-width: 880px;
          margin: 4rem auto 0;
          padding: 1.5rem 1.75rem;
          background: linear-gradient(135deg, rgba(255,213,74,0.06), rgba(255,183,77,0.04));
          border: 1px solid rgba(255,213,74,0.45);
          border-radius: 16px;
          color: #2a2f44;
          font-size: 0.96rem;
          line-height: 1.6;
        }
        .tcn-sec-honesty strong { color: #b78628; }
        .tcn-sec-honesty .ic { color: #b78628; vertical-align: -3px; margin-right: 8px; }

        /* practice sections */
        .tcn-sec-list {
          max-width: 1080px;
          margin: 4rem auto;
          padding: 0 1rem;
          display: grid;
          gap: 1.25rem;
        }
        .tcn-sec-card {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 18px;
          padding: 1.85rem 1.85rem 1.5rem;
          transition: all 0.22s ease;
        }
        .tcn-sec-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(15,23,42,0.06);
          border-color: var(--tint);
        }
        .tcn-sec-card-head {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 1.2rem;
        }
        .tcn-sec-card-head .icbox {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: var(--tint-soft);
          color: var(--tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tcn-sec-card-head h3 {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin: 0;
          color: #0b0f1e;
        }
        .tcn-sec-items {
          display: grid;
          gap: 0.7rem;
        }
        .tcn-sec-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 0.75rem 0;
          border-top: 1px dashed rgba(15,23,42,0.08);
          font-size: 0.94rem;
          line-height: 1.55;
          color: rgba(15,23,42,0.78);
        }
        .tcn-sec-item:first-child { border-top: 0; padding-top: 0; }
        .tcn-sec-item .badge {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }
        .tcn-sec-item.live .badge { background: rgba(22,163,74,0.16); color: #16a34a; }
        .tcn-sec-item.planned .badge { background: rgba(15,23,42,0.06); color: rgba(15,23,42,0.45); }
        .tcn-sec-item.planned {
          color: rgba(15,23,42,0.55);
          font-style: italic;
        }
        .tcn-sec-item.planned::before {
          content: "Roadmap";
          margin-right: 6px;
          padding: 1px 6px;
          border-radius: 4px;
          background: rgba(255,213,74,0.2);
          color: #b78628;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-style: normal;
          vertical-align: middle;
          flex-shrink: 0;
        }

        /* Report / contact strip */
        .tcn-sec-report {
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          color: #fff;
          padding: 4rem 0;
          text-align: center;
        }
        .tcn-sec-report h2 {
          font-size: clamp(1.7rem, 3vw, 2.3rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 0.85rem;
          color: #fff;
        }
        .tcn-sec-report p {
          color: rgba(255,255,255,0.72);
          font-size: 1rem;
          line-height: 1.55;
          max-width: 580px;
          margin: 0 auto 1.85rem;
        }
        .tcn-sec-report-btns {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-sec-report-btns a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.85rem 1.6rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none !important;
          transition: transform 0.18s ease;
        }
        .tcn-sec-report-btns .gold {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          box-shadow: 0 10px 26px rgba(255,213,74,0.45);
        }
        .tcn-sec-report-btns .gold:hover { transform: translateY(-2px); color: #1a1f3a !important; }
        .tcn-sec-report-btns .ghost {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff !important;
          backdrop-filter: blur(8px);
        }
        .tcn-sec-report-btns .ghost:hover { background: rgba(255,255,255,0.14); }
      `}</style>

      <section className="tcn-sec-hero">
        <div className="container">
          <span className="tcn-sec-eyebrow">
            <PiShieldCheckDuotone size={12} /> Security & Privacy
          </span>
          <h1>
            Honest <span className="accent">security posture.</span>
          </h1>
          <p className="lede">
            No vague "enterprise-grade" hand-waving. Here's exactly what we ship today, what's
            on our roadmap, and how to reach our security team when something looks off.
          </p>

          <div className="tcn-sec-quick">
            {QUICK.map((q) => (
              <div key={q.lbl} className="tcn-sec-quick-cell">
                <div className="num">{q.num}</div>
                <div className="lbl">{q.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="tcn-sec-honesty">
        <PiSparkleDuotone size={18} className="ic" />
        <strong>We're early.</strong> TheChatNest is in active development. We've built the
        right foundations — encryption, audit logging, GDPR-aligned data handling — but we have
        NOT completed a third-party SOC 2 or ISO 27001 audit yet. Items marked{" "}
        <em>Roadmap</em> below are on our published plan, not features we ship today.
      </div>

      <section>
        <div className="tcn-sec-list">
          {PRACTICES.map((p) => (
            <article
              key={p.cat}
              className="tcn-sec-card"
              style={{ "--tint": p.tint, "--tint-soft": `${p.tint}1a` }}
            >
              <div className="tcn-sec-card-head">
                <span className="icbox">
                  <p.Icon size={24} />
                </span>
                <h3>{p.cat}</h3>
              </div>
              <div className="tcn-sec-items">
                {p.items.map((item, i) => (
                  <div key={i} className={`tcn-sec-item ${item.live ? "live" : "planned"}`}>
                    <span className="badge">
                      {item.live
                        ? <PiCheckBold size={11} />
                        : <PiCircleDashedDuotone size={12} />}
                    </span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tcn-sec-report">
        <div className="container">
          <h2>Found a vulnerability? Tell us.</h2>
          <p>
            Email us with steps to reproduce. We aim to acknowledge security reports within
            one business day and patch verified issues as quickly as possible. Responsible
            disclosure is rewarded with credit on our hall of fame.
          </p>
          <div className="tcn-sec-report-btns">
            <a href="mailto:security@thechatnest.com" className="gold">
              <PiEnvelopeDuotone size={16} /> security@thechatnest.com
            </a>
            <Link to="/saas-privacy" className="ghost">
              Privacy policy <PiArrowRightBold size={13} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Security;
