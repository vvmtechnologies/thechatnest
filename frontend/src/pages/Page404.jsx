import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PiArrowLeftBold,
  PiArrowRightBold,
  PiCompassDuotone,
  PiMagnifyingGlassDuotone,
} from "react-icons/pi";
import Seo from "../components/Seo.jsx";

const Page404 = () => {
  const { pathname } = useLocation();

  return (
    <div className="tcn-404">
      <Seo title="Page not found" description="The page you're looking for doesn't exist on TheChatNest." noIndex />
      <style>{`
        .tcn-404 {
          min-height: 100vh;
          margin-top: -92px;
          padding-top: 92px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(1000px 600px at 80% -10%, rgba(109,93,252,0.28), transparent 60%),
            radial-gradient(700px 400px at 10% 90%, rgba(255,213,74,0.1), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .tcn-404::before {
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
        .tcn-404-inner {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 2rem;
          max-width: 640px;
          width: 100%;
        }
        .tcn-404-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.4rem 0.95rem;
          border-radius: 999px;
          background: rgba(239,68,68,0.18);
          border: 1px solid rgba(239,68,68,0.45);
          color: #fca5a5;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 2rem;
        }
        .tcn-404-eyebrow::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ef4444;
        }
        .tcn-404-code {
          font-family: "Inter", system-ui, sans-serif;
          font-size: clamp(7rem, 18vw, 14rem);
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -0.06em;
          margin: 0;
          background: linear-gradient(135deg, #ffd54a 0%, #ffb74d 50%, #6d5dfc 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-404-title {
          font-size: clamp(1.5rem, 3.5vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 1.5rem 0 0.75rem;
          color: #fff;
        }
        .tcn-404-sub {
          color: rgba(255,255,255,0.7);
          font-size: 1.05rem;
          line-height: 1.55;
          max-width: 480px;
          margin: 0 auto 1.5rem;
        }
        .tcn-404-path {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 0.95rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          font-family: "JetBrains Mono", monospace;
          font-size: 12px;
          color: #ffd54a;
          margin-bottom: 2.5rem;
          word-break: break-all;
        }
        .tcn-404-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-404-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.85rem 1.6rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none !important;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .tcn-404-btn.primary {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          box-shadow: 0 8px 24px rgba(255,213,74,0.4);
        }
        .tcn-404-btn.primary:hover {
          transform: translateY(-2px);
        }
        .tcn-404-btn.ghost {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff !important;
          backdrop-filter: blur(8px);
        }
        .tcn-404-btn.ghost:hover {
          background: rgba(255,255,255,0.14);
          transform: translateY(-2px);
        }
        .tcn-404-links {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          align-items: center;
        }
        .tcn-404-links-label {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
        }
        .tcn-404-links-row {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .tcn-404-links-row a {
          color: rgba(255,255,255,0.85) !important;
          font-size: 0.9rem;
          text-decoration: none !important;
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          transition: color 0.18s ease, background 0.18s ease;
        }
        .tcn-404-links-row a:hover {
          color: #ffd54a !important;
          background: rgba(255,213,74,0.08);
        }
      `}</style>

      <div className="tcn-404-inner">
        <span className="tcn-404-eyebrow">
          <PiCompassDuotone size={12} /> Lost in the nest
        </span>

        <h1 className="tcn-404-code">404</h1>
        <h2 className="tcn-404-title">This page wandered off.</h2>
        <p className="tcn-404-sub">
          We searched everywhere but couldn&apos;t find what you&apos;re looking for. The link might be broken, or the page may have been moved.
        </p>

        {pathname && pathname !== "/" && (
          <div className="tcn-404-path">
            <PiMagnifyingGlassDuotone size={13} />
            <span>{pathname}</span>
          </div>
        )}

        <div className="tcn-404-actions">
          <Link to="/" className="tcn-404-btn primary">
            <PiArrowLeftBold size={14} /> Back to home
          </Link>
          <Link to="/help" className="tcn-404-btn ghost">
            Help center <PiArrowRightBold size={14} />
          </Link>
        </div>

        <div className="tcn-404-links">
          <span className="tcn-404-links-label">Or try one of these</span>
          <div className="tcn-404-links-row">
            <Link to="/pricing">Pricing</Link>
            <Link to="/features">Features</Link>
            <Link to="/downloads">Downloads</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/blogs">Blog</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page404;
