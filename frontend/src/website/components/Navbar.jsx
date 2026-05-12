import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  PiArrowCircleUp,
  PiCaretDownBold,
  PiList,
  PiX,
  PiWindowsLogoDuotone,
  PiDownloadSimpleDuotone,
  PiHeadsetDuotone,
  PiArrowRightBold,
} from "react-icons/pi";
import { API_BASE_URL } from "../../config/apiBaseUrl";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/pricing", label: "Pricing" },
  { to: "/features", label: "Features" },
  { to: "/compare", label: "Compare" },
];

const Navbar = () => {
  const { brandName } = useSiteBranding();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [appUrl, setAppUrl] = useState("/");

  // Fetch desktop app URL once
  useEffect(() => {
    let cancelled = false;
    const fetchUrl = async () => {
      if (!API_BASE_URL) return;
      try {
        const url = `${API_BASE_URL.replace(/\/$/, "")}/api/desktop-apps/active`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) return;
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) return;
        const data = await res.json();
        if (!cancelled && data?.success && data.data?.length > 0) {
          setAppUrl(data.data[0].app_url);
        }
      } catch {
        /* keep default */
      }
    };
    fetchUrl();
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll-based UI state
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setShowScrollTop(y > 320);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setAppsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <style>{`
        .tcn-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1040;
          padding: 0.85rem 0;
          background: rgba(11, 15, 30, 0.7);
          backdrop-filter: saturate(180%) blur(16px);
          -webkit-backdrop-filter: saturate(180%) blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          transition: padding 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
        }
        .tcn-nav.scrolled {
          padding: 0.5rem 0;
          background: rgba(11, 15, 30, 0.92);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
        }
        .tcn-nav-inner {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .tcn-nav-brand {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
          flex-shrink: 0;
          transition: transform 0.22s ease;
        }
        .tcn-nav-brand:hover { transform: translateY(-1px); }
        .tcn-nav-brand img {
          height: 60px;
          width: auto;
          object-fit: contain;
          display: block;
          transition: height 0.22s ease;
          filter: drop-shadow(0 4px 14px rgba(255, 213, 74, 0.18));
        }
        .tcn-nav.scrolled .tcn-nav-brand img { height: 46px; }

        .tcn-nav-links {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          flex: 1;
          justify-content: center;
        }
        .tcn-nav-link {
          position: relative;
          padding: 0.55rem 0.95rem;
          border-radius: 999px;
          color: rgba(231, 233, 243, 0.78);
          font-weight: 500;
          font-size: 0.92rem;
          text-decoration: none !important;
          transition: color 0.18s ease, background 0.18s ease;
        }
        .tcn-nav-link:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }
        .tcn-nav-link.active {
          color: #ffd54a;
        }
        .tcn-nav-link.active::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: -3px;
          transform: translateX(-50%);
          width: 22px;
          height: 2px;
          background: linear-gradient(90deg, #ffd54a, #ffb74d);
          border-radius: 999px;
          box-shadow: 0 0 12px rgba(255, 213, 74, 0.6);
        }

        /* Dropdown */
        .tcn-nav-dropdown {
          position: relative;
        }
        .tcn-nav-dropdown-trigger {
          background: transparent;
          border: none;
          padding: 0.55rem 0.85rem;
          border-radius: 999px;
          color: rgba(231, 233, 243, 0.78);
          font-weight: 500;
          font-size: 0.92rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: inherit;
          transition: color 0.18s ease, background 0.18s ease;
        }
        .tcn-nav-dropdown-trigger:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }
        .tcn-nav-dropdown-trigger .caret {
          transition: transform 0.2s ease;
        }
        .tcn-nav-dropdown.open .tcn-nav-dropdown-trigger .caret {
          transform: rotate(180deg);
        }
        .tcn-nav-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(-6px);
          min-width: 230px;
          background: rgba(26, 31, 58, 0.96);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 0.4rem;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.22s ease;
        }
        .tcn-nav-dropdown.open .tcn-nav-dropdown-menu {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
          pointer-events: auto;
        }
        .tcn-nav-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.6rem 0.85rem;
          border-radius: 9px;
          color: rgba(231, 233, 243, 0.88) !important;
          text-decoration: none !important;
          font-size: 0.88rem;
          font-weight: 500;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .tcn-nav-dropdown-item:hover {
          background: rgba(255, 213, 74, 0.08);
          color: #ffd54a !important;
        }
        .tcn-nav-dropdown-item .ico {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(109, 93, 252, 0.15);
          color: #a99dff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tcn-nav-dropdown-item:hover .ico {
          background: rgba(255, 213, 74, 0.18);
          color: #ffd54a;
        }

        /* Right cluster */
        .tcn-nav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .tcn-nav-login {
          padding: 0.5rem 1rem;
          border-radius: 999px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.85) !important;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none !important;
          transition: all 0.18s ease;
        }
        .tcn-nav-login:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff !important;
          border-color: rgba(255, 255, 255, 0.25);
        }
        .tcn-nav-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.55rem 1.15rem 0.55rem 1.25rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          font-weight: 800;
          font-size: 0.88rem;
          letter-spacing: 0.02em;
          text-decoration: none !important;
          box-shadow: 0 6px 18px rgba(255, 213, 74, 0.32);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .tcn-nav-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(255, 213, 74, 0.5);
          color: #1a1f3a !important;
        }

        /* Mobile burger */
        .tcn-nav-burger {
          display: none;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin-left: auto;
        }
        .tcn-nav-burger:hover { background: rgba(255, 255, 255, 0.1); }

        /* Mobile drawer */
        .tcn-mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(6px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
          z-index: 1050;
        }
        .tcn-mobile-backdrop.open {
          opacity: 1;
          pointer-events: auto;
        }
        .tcn-mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(340px, 90vw);
          background: linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
          z-index: 1060;
          overflow-y: auto;
        }
        .tcn-mobile-drawer.open { transform: translateX(0); }
        .tcn-mobile-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .tcn-mobile-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .tcn-mobile-link {
          padding: 0.85rem 1rem;
          border-radius: 12px;
          color: rgba(231, 233, 243, 0.85) !important;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none !important;
          transition: all 0.18s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tcn-mobile-link:hover { background: rgba(255, 255, 255, 0.06); color: #fff !important; }
        .tcn-mobile-link.active {
          background: linear-gradient(90deg, rgba(255, 213, 74, 0.18), rgba(255, 213, 74, 0.04));
          color: #ffd54a !important;
          box-shadow: inset 3px 0 0 #ffd54a;
        }
        .tcn-mobile-sub {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.45);
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.5rem 1rem;
          margin-top: 0.4rem;
        }
        .tcn-mobile-actions {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .tcn-mobile-actions .login-btn {
          padding: 0.85rem 1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #fff !important;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none !important;
          text-align: center;
        }
        .tcn-mobile-actions .trial-btn {
          padding: 0.85rem 1rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 6px 18px rgba(255, 213, 74, 0.35);
        }

        @media (max-width: 991px) {
          .tcn-nav-links, .tcn-nav-right { display: none; }
          .tcn-nav-burger { display: inline-flex; }
        }

        /* Body padding for fixed navbar */
        body { padding-top: 0 !important; }
      `}</style>

      <nav className={`tcn-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="tcn-nav-inner">
          {/* Brand */}
          <Link to="/" className="tcn-nav-brand" aria-label={brandName || "TheChatNest"}>
            <img src="/chat.png" alt={brandName || "TheChatNest"} width="48" height="48" decoding="async" fetchpriority="high" />
          </Link>

          {/* Center links */}
          <div className="tcn-nav-links">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `tcn-nav-link ${isActive ? "active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div
              className={`tcn-nav-dropdown ${appsOpen ? "open" : ""}`}
              onMouseEnter={() => setAppsOpen(true)}
              onMouseLeave={() => setAppsOpen(false)}
            >
              <button
                type="button"
                className="tcn-nav-dropdown-trigger"
                onClick={() => setAppsOpen((v) => !v)}
                aria-expanded={appsOpen}
              >
                Get our app
                <PiCaretDownBold size={11} className="caret" />
              </button>
              <div className="tcn-nav-dropdown-menu" role="menu">
                <Link to={appUrl || "/downloads"} className="tcn-nav-dropdown-item">
                  <span className="ico">
                    <PiWindowsLogoDuotone size={16} />
                  </span>
                  Windows app
                </Link>
                <Link to="/downloads" className="tcn-nav-dropdown-item">
                  <span className="ico">
                    <PiDownloadSimpleDuotone size={16} />
                  </span>
                  All downloads
                </Link>
                <Link to="/help" className="tcn-nav-dropdown-item">
                  <span className="ico">
                    <PiHeadsetDuotone size={16} />
                  </span>
                  Help center
                </Link>
              </div>
            </div>

            <NavLink to="/app" className={({ isActive }) => `tcn-nav-link ${isActive ? "active" : ""}`}>
              Messenger
            </NavLink>
          </div>

          {/* Right actions (desktop) */}
          <div className="tcn-nav-right">
            <Link to="/auth/login" className="tcn-nav-login">
              Login
            </Link>
            <Link to="/auth/register" className="tcn-nav-cta">
              Free trial <PiArrowRightBold size={12} />
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            className="tcn-nav-burger"
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <PiList size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`tcn-mobile-backdrop ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside className={`tcn-mobile-drawer ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="tcn-mobile-head">
          <Link to="/" className="tcn-nav-brand" onClick={() => setMenuOpen(false)}>
            <img src="/chat.png" alt={brandName || "TheChatNest"} width="44" height="44" decoding="async" style={{ height: 44 }} />
          </Link>
          <button
            type="button"
            className="tcn-mobile-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <PiX size={20} />
          </button>
        </div>

        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `tcn-mobile-link ${isActive ? "active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}

        <NavLink to="/app" className={({ isActive }) => `tcn-mobile-link ${isActive ? "active" : ""}`}>
          Messenger
        </NavLink>

        <div className="tcn-mobile-sub">Get our app</div>
        <Link to={appUrl || "/downloads"} className="tcn-mobile-link">
          Windows app <PiArrowRightBold size={14} />
        </Link>
        <Link to="/downloads" className="tcn-mobile-link">
          All downloads <PiArrowRightBold size={14} />
        </Link>
        <Link to="/help" className="tcn-mobile-link">
          Help center <PiArrowRightBold size={14} />
        </Link>

        <div className="tcn-mobile-actions">
          <Link to="/auth/login" className="login-btn">
            Login
          </Link>
          <Link to="/auth/register" className="trial-btn">
            Free trial <PiArrowRightBold size={14} />
          </Link>
        </div>
      </aside>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          style={{
            position: "fixed",
            bottom: "30px",
            right: "20px",
            background: "linear-gradient(135deg, #6d5dfc, #4d3eff)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "52px",
            height: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 24px rgba(109, 93, 252, 0.45)",
            cursor: "pointer",
            zIndex: 1000,
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <PiArrowCircleUp size={28} />
        </button>
      )}
    </>
  );
};

export default Navbar;
