import React from "react";
import { Link } from "react-router-dom";
import {
  PiWrenchDuotone,
  PiArrowRightBold,
  PiHeartbeatDuotone,
  PiTwitterLogoDuotone,
} from "react-icons/pi";
import Seo from "../../components/Seo.jsx";

// Lightweight 503 / maintenance page. Reached either by a manual route
// (/maintenance) or by switching VITE_MAINTENANCE_MODE=1 if we ever wire
// a global gate into the website layout. Never depends on backend.

const Maintenance = () => {
  return (
    <div className="tcn-maint">
      <Seo
        title="We'll be right back"
        description="TheChatNest is undergoing scheduled maintenance. We'll be back online shortly. Check the live status page for updates."
        noIndex
      />
      <style>{`
        .tcn-maint {
          min-height: 100vh;
          margin-top: -92px;
          padding-top: 92px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(1000px 600px at 80% -10%, rgba(255,213,74,0.2), transparent 60%),
            radial-gradient(700px 400px at 10% 90%, rgba(109,93,252,0.18), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .tcn-maint::before {
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
        .tcn-maint-inner {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 2rem;
          max-width: 580px;
          width: 100%;
        }
        .tcn-maint-icon {
          width: 92px;
          height: 92px;
          border-radius: 24px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
          box-shadow: 0 20px 48px rgba(255,213,74,0.4);
          animation: tcnMaintFloat 3s ease-in-out infinite;
        }
        @keyframes tcnMaintFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tcn-maint-icon { animation: none; }
        }
        .tcn-maint-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.4rem 0.95rem;
          border-radius: 999px;
          background: rgba(255,213,74,0.16);
          border: 1px solid rgba(255,213,74,0.3);
          color: #ffd54a;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 2rem;
        }
        .tcn-maint h1 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(2.2rem, 5vw, 3.4rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0 0 1.25rem;
          color: #fff;
        }
        .tcn-maint h1 em {
          font-style: italic;
          color: #ffd54a;
        }
        .tcn-maint p {
          color: rgba(255,255,255,0.72);
          font-size: 1.1rem;
          line-height: 1.65;
          margin: 0 0 2.5rem;
        }
        .tcn-maint-actions {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-maint-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.85rem 1.6rem;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none !important;
          transition: transform 0.18s ease;
        }
        .tcn-maint-btn.primary {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          box-shadow: 0 8px 22px rgba(255,213,74,0.4);
        }
        .tcn-maint-btn.primary:hover { transform: translateY(-2px); color: #1a1f3a !important; }
        .tcn-maint-btn.ghost {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff !important;
          backdrop-filter: blur(8px);
        }
        .tcn-maint-btn.ghost:hover { background: rgba(255,255,255,0.14); }
        .tcn-maint-note {
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.6;
        }
        .tcn-maint-note a { color: #ffd54a; }
      `}</style>

      <div className="tcn-maint-inner">
        <div className="tcn-maint-icon" aria-hidden>
          <PiWrenchDuotone size={42} />
        </div>

        <span className="tcn-maint-eyebrow">
          <PiWrenchDuotone size={12} /> Scheduled maintenance
        </span>

        <h1>
          We'll be <em>right back.</em>
        </h1>
        <p>
          We're doing some quick housekeeping to make TheChatNest faster and more reliable.
          Most maintenance windows wrap up in under 15 minutes. Thanks for your patience.
        </p>

        <div className="tcn-maint-actions">
          <Link to="/status" className="tcn-maint-btn primary">
            <PiHeartbeatDuotone size={16} /> Live status
          </Link>
          <a
            href="https://x.com/thechatnest"
            target="_blank"
            rel="noreferrer"
            className="tcn-maint-btn ghost"
          >
            <PiTwitterLogoDuotone size={16} /> Updates on X
            <PiArrowRightBold size={12} />
          </a>
        </div>

        <div className="tcn-maint-note">
          Stuck on this page longer than expected? Email{" "}
          <a href="mailto:support@thechatnest.com">support@thechatnest.com</a> and we'll
          dig in immediately.
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
