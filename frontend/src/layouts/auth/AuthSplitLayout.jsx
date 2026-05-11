// src/layouts/auth/AuthSplitLayout.jsx
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiShieldCheckDuotone,
  PiSparkleDuotone,
  PiLockKeyDuotone,
  PiUsersThreeDuotone,
  PiChatCircleDotsDuotone,
  PiArrowLeftBold,
} from "react-icons/pi";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";

const TESTIMONIALS = [
  {
    quote:
      "We replaced four chat tools with TheChatNest and our engineering team ships 30% faster.",
    author: "Aanya Sharma",
    role: "VP Engineering · Lumen Labs",
    avatar: "AS",
    color: "#6d5dfc",
  },
  {
    quote:
      "Self-hosted, end-to-end encrypted, and our security team finally said yes. Onboarded 600 users in a weekend.",
    author: "Rohan Kapoor",
    role: "CISO · NorthVault Capital",
    avatar: "RK",
    color: "#22c55e",
  },
  {
    quote:
      "Calls, files, AI summaries — everything in one place. Our remote team finally feels in sync.",
    author: "Meera Iyer",
    role: "Head of People · Folio Studio",
    avatar: "MI",
    color: "#ec4899",
  },
];

const HIGHLIGHTS = [
  { Icon: PiShieldCheckDuotone, label: "AES-256-GCM end-to-end" },
  { Icon: PiUsersThreeDuotone, label: "Multi-tenant ready" },
  { Icon: PiSparkleDuotone, label: "AI assistant baked in" },
  { Icon: PiLockKeyDuotone, label: "SSO / SAML on Business" },
];

const AuthSplitLayout = ({ title, subtitle, children, footer }) => {
  const { brandName } = useSiteBranding();
  const brand = brandName || "TheChatNest";
  const [isElectron, setIsElectron] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    setIsElectron(Boolean(window?.electron?.isElectron));
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

  const active = TESTIMONIALS[testimonialIdx];
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="tcn-auth">
      <style>{`
        .tcn-auth {
          min-height: 100vh;
          background: #fafbff;
          display: flex;
          flex-direction: column;
        }
        .tcn-auth-titlebar {
          height: 36px;
          background: linear-gradient(135deg, var(--tcn-navy-900), var(--tcn-navy-800));
          color: #fff;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          padding: 0 1rem;
          -webkit-app-region: drag;
        }

        .tcn-auth-shell {
          flex: 1;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          min-height: 100vh;
        }
        .tcn-auth-shell.with-titlebar { min-height: calc(100vh - 36px); }

        /* ── LEFT showcase panel ── */
        .tcn-auth-showcase {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(1000px 600px at 80% -10%, rgba(109,93,252,0.35), transparent 60%),
            radial-gradient(900px 500px at 10% 90%, rgba(255,213,74,0.12), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          padding: 3rem 3rem 2.5rem;
          display: flex;
          flex-direction: column;
        }
        .tcn-auth-showcase::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 80%);
          pointer-events: none;
        }
        .tcn-auth-showcase > * { position: relative; z-index: 1; }

        .tcn-auth-brand-row {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          text-decoration: none !important;
          color: #fff !important;
          width: max-content;
        }
        .tcn-auth-brand-row img {
          height: 52px;
          width: auto;
          filter: drop-shadow(0 4px 14px rgba(255, 213, 74, 0.25));
        }
        .tcn-auth-brand-row .brand-name {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .tcn-auth-brand-row .brand-tag {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-top: 2px;
        }

        .tcn-auth-headline {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1.5rem;
          padding: 2.5rem 0;
        }
        .tcn-auth-headline h1 {
          font-size: clamp(1.9rem, 3.2vw, 2.8rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -0.025em;
          margin: 0;
          max-width: 480px;
        }
        .tcn-auth-headline h1 .gradient-word {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-auth-headline p {
          color: rgba(255,255,255,0.7);
          font-size: 1rem;
          line-height: 1.65;
          margin: 0;
          max-width: 460px;
        }

        /* Highlights chips */
        .tcn-auth-chips {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .tcn-auth-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.4rem 0.85rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.85);
          backdrop-filter: blur(8px);
        }
        .tcn-auth-chip svg { color: #ffd54a; }

        /* Testimonial card */
        .tcn-auth-testimonial {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(12px);
        }
        .tcn-auth-testimonial blockquote {
          margin: 0 0 1rem;
          color: rgba(255,255,255,0.9);
          font-size: 0.96rem;
          line-height: 1.6;
          font-style: italic;
        }
        .tcn-auth-testimonial blockquote::before {
          content: "\\201C";
          font-size: 2.4rem;
          line-height: 0;
          vertical-align: -0.4em;
          color: #ffd54a;
          margin-right: 4px;
        }
        .tcn-auth-testimonial-foot {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tcn-auth-avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          color: #fff;
          font-weight: 700;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.18);
        }
        .tcn-auth-testimonial-name {
          font-weight: 700;
          color: #fff;
          font-size: 0.92rem;
          line-height: 1.2;
        }
        .tcn-auth-testimonial-role {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.55);
        }
        .tcn-auth-dots {
          display: flex;
          gap: 5px;
          margin-left: auto;
        }
        .tcn-auth-dot {
          width: 22px;
          height: 4px;
          border-radius: 4px;
          background: rgba(255,255,255,0.18);
          transition: background 0.25s ease;
        }
        .tcn-auth-dot.active {
          background: linear-gradient(90deg, #ffd54a, #ffb74d);
        }

        .tcn-auth-foot {
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(255,255,255,0.5);
          font-size: 0.78rem;
        }
        .tcn-auth-foot a {
          color: rgba(255,255,255,0.7) !important;
          text-decoration: none !important;
        }
        .tcn-auth-foot a:hover { color: #ffd54a !important; }

        /* ── RIGHT form panel ── */
        .tcn-auth-form-panel {
          display: flex;
          flex-direction: column;
          background: #fff;
          padding: 2.5rem 2rem;
          overflow-y: auto;
        }
        .tcn-auth-form-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--tcn-ink-500) !important;
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none !important;
          width: max-content;
          transition: color 0.18s ease, transform 0.18s ease;
        }
        .tcn-auth-form-back:hover {
          color: var(--tcn-violet-600) !important;
          transform: translateX(-3px);
        }
        .tcn-auth-form-inner {
          flex: 1;
          max-width: 460px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2.5rem 0;
        }
        .tcn-auth-mobile-brand {
          display: none;
          margin-bottom: 1.5rem;
        }
        .tcn-auth-title {
          font-size: clamp(1.6rem, 2.4vw, 2rem);
          font-weight: 800;
          color: var(--tcn-ink-900);
          letter-spacing: -0.02em;
          line-height: 1.15;
          margin: 0 0 0.5rem;
        }
        .tcn-auth-subtitle {
          color: var(--tcn-ink-500);
          font-size: 0.96rem;
          line-height: 1.55;
          margin: 0 0 2rem;
        }
        .tcn-auth-body {
          /* All MUI form fields get rounded styling */
        }
        .tcn-auth-body .MuiOutlinedInput-root {
          border-radius: 12px !important;
          background: #fafbff;
          font-family: var(--tcn-font-sans) !important;
        }
        .tcn-auth-body .MuiOutlinedInput-notchedOutline {
          border-color: var(--tcn-border) !important;
        }
        .tcn-auth-body .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: var(--tcn-violet-500) !important;
        }
        .tcn-auth-body .Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: var(--tcn-violet-600) !important;
          border-width: 2px !important;
        }
        .tcn-auth-body .MuiInputLabel-root.Mui-focused {
          color: var(--tcn-violet-600) !important;
        }
        .tcn-auth-body .MuiButton-contained {
          background: linear-gradient(135deg, var(--tcn-navy-900), #4d3eff) !important;
          color: #fff !important;
          border-radius: 999px !important;
          padding: 0.7rem 1.5rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.01em !important;
          box-shadow: 0 8px 24px rgba(109,93,252,0.35) !important;
          font-family: inherit !important;
          text-transform: none !important;
        }
        .tcn-auth-body .MuiButton-contained:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 30px rgba(109,93,252,0.5) !important;
        }
        .tcn-auth-body .MuiButton-outlined {
          border-radius: 999px !important;
          border-color: var(--tcn-border) !important;
          color: var(--tcn-ink-700) !important;
          font-family: inherit !important;
          text-transform: none !important;
          font-weight: 600 !important;
        }
        .tcn-auth-body .MuiButton-text {
          color: var(--tcn-violet-600) !important;
          font-family: inherit !important;
          text-transform: none !important;
          font-weight: 600 !important;
        }
        .tcn-auth-footer-block {
          margin-top: 2rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--tcn-border);
        }

        @media (max-width: 992px) {
          .tcn-auth-shell { grid-template-columns: 1fr; }
          .tcn-auth-showcase { display: none; }
          .tcn-auth-form-panel { padding: 1.5rem; }
          .tcn-auth-mobile-brand { display: flex; }
        }
      `}</style>

      {isElectron && (
        <div className="tcn-auth-titlebar">
          {brand.toUpperCase()} ENTERPRISE BUILD
        </div>
      )}

      <div className={`tcn-auth-shell ${isElectron ? "with-titlebar" : ""}`}>
        {/* LEFT showcase */}
        <aside className="tcn-auth-showcase">
          <Link to="/" className="tcn-auth-brand-row">
            <img src="/chat.png" alt={brand} />
            <span>
              <span className="brand-name">{brand}</span>
              <span className="brand-tag">Secure team workspace</span>
            </span>
          </Link>

          <div className="tcn-auth-headline">
            <h1>
              The workspace teams{" "}
              <span className="gradient-word">love to log into</span>
            </h1>
            <p>
              Messaging, HD calls, file sharing, and AI assistance — built for
              teams that move fast and care about privacy.
            </p>

            <div className="tcn-auth-chips">
              {HIGHLIGHTS.map(({ Icon, label }) => (
                <span key={label} className="tcn-auth-chip">
                  <Icon size={14} /> {label}
                </span>
              ))}
            </div>

            <div className="tcn-auth-testimonial">
              <blockquote>{active.quote}</blockquote>
              <div className="tcn-auth-testimonial-foot">
                <span
                  className="tcn-auth-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${active.color}, ${active.color}aa)`,
                  }}
                >
                  {active.avatar}
                </span>
                <div>
                  <div className="tcn-auth-testimonial-name">{active.author}</div>
                  <div className="tcn-auth-testimonial-role">{active.role}</div>
                </div>
                <div className="tcn-auth-dots">
                  {TESTIMONIALS.map((_, i) => (
                    <span
                      key={i}
                      className={`tcn-auth-dot ${i === testimonialIdx ? "active" : ""}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="tcn-auth-foot">
            <span>© {year} {brand}. All rights reserved.</span>
            <span style={{ display: "inline-flex", gap: 16 }}>
              <Link to="/saas-privacy">Privacy</Link>
              <Link to="/gdpr">GDPR</Link>
              <Link to="/help">Help</Link>
            </span>
          </div>
        </aside>

        {/* RIGHT form panel */}
        <main className="tcn-auth-form-panel">
          <Link to="/" className="tcn-auth-form-back">
            <PiArrowLeftBold size={14} /> Back to {brand}
          </Link>

          <div className="tcn-auth-form-inner">
            <Link to="/" className="tcn-auth-brand-row tcn-auth-mobile-brand">
              <img src="/chat.png" alt={brand} style={{ height: 44 }} />
              <span>
                <span className="brand-name" style={{ color: "var(--tcn-ink-900)" }}>
                  {brand}
                </span>
              </span>
            </Link>

            <h1 className="tcn-auth-title">{title}</h1>
            {subtitle ? <p className="tcn-auth-subtitle">{subtitle}</p> : null}

            <div className="tcn-auth-body">{children}</div>

            {footer ? <div className="tcn-auth-footer-block">{footer}</div> : null}
          </div>
        </main>
      </div>
    </div>
  );
};

AuthSplitLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  highlight: PropTypes.shape({
    label: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.elementType,
  }),
  sliderSlides: PropTypes.array,
  sliderInterval: PropTypes.number,
};

export default AuthSplitLayout;
