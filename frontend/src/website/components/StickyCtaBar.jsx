import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PiSparkleDuotone, PiArrowRightBold, PiXBold } from "react-icons/pi";

// A bottom-anchored sticky CTA that appears once the user scrolls past
// the first viewport. Dismissable per-session via sessionStorage. Hidden
// on auth/app/dashboard pages so it never overlaps with the product UI.

const DISMISS_KEY = "tcn.stickyCta.dismissed";
const HIDE_ON = ["/auth", "/app", "/owner-dashboard", "/guest", "/billing"];

const StickyCtaBar = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const onProductSurface = HIDE_ON.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (onProductSurface) return undefined;
    try {
      const isDismissed = window.sessionStorage.getItem(DISMISS_KEY) === "1";
      if (isDismissed) {
        setDismissed(true);
        return undefined;
      }
    } catch {
      /* sessionStorage blocked — proceed anyway */
    }

    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      // Show when past first viewport AND not near the very bottom (footer CTAs already there)
      setVisible(y > vh * 0.85 && y < max - 160);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onProductSurface, pathname]);

  if (onProductSurface || dismissed || !visible) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { window.sessionStorage.setItem(DISMISS_KEY, "1"); } catch {}
  };

  return (
    <>
      <style>{`
        @keyframes tcnStickyCtaIn {
          from { opacity: 0; transform: translate(-50%, 16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .tcn-sticky-cta {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 980;
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.65rem 0.65rem 0.65rem 1.25rem;
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a 60%, #2065D1);
          border: 1px solid rgba(255,213,74,0.35);
          border-radius: 999px;
          box-shadow:
            0 16px 36px rgba(15,23,42,0.32),
            0 4px 14px rgba(32,101,209,0.25),
            inset 0 1px 0 rgba(255,255,255,0.08);
          color: #fff;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          animation: tcnStickyCtaIn 0.32s cubic-bezier(0.23,1,0.32,1);
          max-width: calc(100vw - 32px);
        }
        .tcn-sticky-cta-message {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.92rem;
          font-weight: 600;
          color: rgba(255,255,255,0.92);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tcn-sticky-cta-message .ic {
          color: #ffd54a;
          flex-shrink: 0;
        }
        .tcn-sticky-cta-message strong { color: #ffd54a; }
        .tcn-sticky-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.55rem 1.1rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          font-weight: 800;
          font-size: 0.9rem;
          text-decoration: none !important;
          box-shadow: 0 6px 14px rgba(255,213,74,0.4);
          transition: transform 0.18s ease;
          white-space: nowrap;
        }
        .tcn-sticky-cta-btn:hover { transform: translateY(-1px); color: #1a1f3a !important; }
        .tcn-sticky-cta-close {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 0;
          color: rgba(255,255,255,0.7);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          flex-shrink: 0;
          padding: 0;
        }
        .tcn-sticky-cta-close:hover {
          background: rgba(255,255,255,0.18);
          color: #fff;
        }
        @media (max-width: 540px) {
          .tcn-sticky-cta {
            padding: 0.55rem 0.55rem 0.55rem 0.95rem;
            gap: 0.6rem;
          }
          .tcn-sticky-cta-message { font-size: 0.82rem; max-width: 140px; }
          .tcn-sticky-cta-btn { padding: 0.45rem 0.85rem; font-size: 0.82rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tcn-sticky-cta { animation: none; }
        }
      `}</style>

      <div className="tcn-sticky-cta" role="complementary" aria-label="Start free trial">
        <span className="tcn-sticky-cta-message">
          <PiSparkleDuotone size={16} className="ic" />
          <span><strong>14 days free</strong> · no card needed</span>
        </span>
        <Link to="/auth/register" className="tcn-sticky-cta-btn">
          Start trial <PiArrowRightBold size={13} />
        </Link>
        <button
          type="button"
          className="tcn-sticky-cta-close"
          onClick={handleDismiss}
          aria-label="Dismiss"
          title="Dismiss"
        >
          <PiXBold size={12} />
        </button>
      </div>
    </>
  );
};

export default StickyCtaBar;
