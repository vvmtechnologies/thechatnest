import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiMagnifyingGlassDuotone,
  PiCheckBold,
  PiArrowRightBold,
  PiSparkleDuotone,
  PiClockDuotone,
  PiCalendarDuotone,
  PiChatTextDuotone,
} from "react-icons/pi";
import { API_BASE_URL } from "../../config/apiBaseUrl";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";

const toSectionId = (value, fallbackId) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || `feature-section-${fallbackId}`;
};

const isComingSoonCategory = (category) => {
  const key = String(category?.category_key || "").toLowerCase();
  const label = String(category?.category_label || "").toLowerCase();
  return key.endsWith("_cs") || label.includes("coming soon");
};

const stripComingSoonLabel = (label) =>
  String(label || "")
    .replace(/\s*\(coming soon\)\s*/i, "")
    .trim();

const CATEGORY_ICONS = {
  messaging: "💬",
  group: "👥",
  audio_video: "🎥",
  collaboration: "🤝",
  productivity: "⚡",
  filters: "🔍",
  security: "🔒",
  admin: "🛠️",
  ai_features: "✨",
  integrations_cs: "🔌",
  automation_cs: "🤖",
  mobile: "📱",
  web_desktop: "💻",
};
const CATEGORY_TINT = {
  messaging: "#6d5dfc",
  group: "#22c55e",
  audio_video: "#0ea5e9",
  collaboration: "#ec4899",
  productivity: "#f59e0b",
  filters: "#14b8a6",
  security: "#ef4444",
  admin: "#a855f7",
  ai_features: "#ffd54a",
  integrations_cs: "#8b5cf6",
  automation_cs: "#f97316",
  mobile: "#06b6d4",
  web_desktop: "#3b82f6",
};

const getIcon = (key) => CATEGORY_ICONS[String(key || "").toLowerCase()] || "⭐";
const getTint = (key) => CATEGORY_TINT[String(key || "").toLowerCase()] || "#6d5dfc";

const normalizeFeatureSections = (catalogRows = []) =>
  catalogRows
    .filter((category) => String(category?.status || "active").toLowerCase() !== "inactive")
    .map((category) => ({
      feature_category_id: category.feature_category_id,
      category_key: category.category_key,
      icon: getIcon(category.category_key),
      tint: getTint(category.category_key),
      id: toSectionId(category.category_key || category.category_label, category.feature_category_id),
      title: stripComingSoonLabel(category.category_label || category.category_key || "Category"),
      comingSoon: isComingSoonCategory(category),
      display_order: Number(category.display_order || 0),
      features: (Array.isArray(category.items) ? category.items : [])
        .filter((item) => String(item?.status || "active").toLowerCase() !== "inactive")
        .sort((a, b) => Number(a?.display_order || 0) - Number(b?.display_order || 0))
        .map((item, index) => ({
          feature_item_id: item.feature_item_id || index + 1,
          title: String(item.title || "Feature").trim(),
          description: String(item.description || "").trim(),
        })),
    }))
    .sort((a, b) => a.display_order - b.display_order);

const Features = () => {
  const { brandName } = useSiteBranding();
  const [sections, setSections] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!API_BASE_URL) return;
      setLoading(true);
      setErrorMessage("");
      try {
        const res = await fetch(`${API_BASE_URL}/product-features/catalog?status=active`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload?.message || "Unable to load features");
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const normalized = normalizeFeatureSections(rows);
        if (!ignore) {
          setSections(normalized);
          setActiveTab(normalized[0]?.id || "");
        }
      } catch (err) {
        if (!ignore) {
          setErrorMessage(err?.message || "Unable to load features right now.");
          setSections([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        features: s.features.filter(
          (f) => f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.features.length > 0);
  }, [query, sections]);

  const totalFeatures = useMemo(
    () => sections.reduce((sum, s) => sum + s.features.length, 0),
    [sections]
  );
  const liveCategories = useMemo(
    () => sections.filter((s) => !s.comingSoon).length,
    [sections]
  );
  const comingSoonCount = useMemo(
    () => sections.filter((s) => s.comingSoon).length,
    [sections]
  );

  const sectionIds = useMemo(() => filtered.map((s) => s.id), [filtered]);

  const handleScroll = useCallback(() => {
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 220 && rect.bottom >= 220) {
          setActiveTab(id);
          break;
        }
      }
    }
  }, [sectionIds]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 140, behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="tcn-features">
      <style>{`
        .tcn-features { background: #fff; }

        /* HERO */
        .tcn-feat-hero {
          background:
            radial-gradient(1200px 600px at 80% -10%, rgba(109,93,252,0.32), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.1), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          padding: 8rem 0 4.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .tcn-feat-hero::before {
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
        .tcn-feat-hero > .container { position: relative; z-index: 1; }
        .tcn-feat-hero h1 {
          font-size: clamp(2.4rem, 5vw, 4rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.025em;
          line-height: 1.08;
          margin: 0 auto 1.25rem;
          max-width: 880px;
        }
        .tcn-feat-hero .gradient-word {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-feat-hero p.lead {
          font-size: 1.15rem;
          color: rgba(255,255,255,0.7);
          max-width: 660px;
          margin: 0 auto 2.5rem;
          line-height: 1.6;
        }

        /* Stats */
        .tcn-feat-stats {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }
        .tcn-stat {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 1rem 1.5rem;
          min-width: 140px;
          backdrop-filter: blur(10px);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .tcn-stat:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.1);
        }
        .tcn-stat .num {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          display: block;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .tcn-stat .lbl {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* Search */
        .tcn-feat-search {
          max-width: 640px;
          margin: 0 auto;
          position: relative;
        }
        .tcn-feat-search input {
          width: 100%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.16);
          color: #fff;
          padding: 1rem 1.4rem 1rem 3.2rem;
          font-size: 1rem;
          border-radius: 999px;
          font-family: inherit;
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
        }
        .tcn-feat-search input::placeholder { color: rgba(255,255,255,0.5); }
        .tcn-feat-search input:focus {
          outline: none;
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,213,74,0.5);
          box-shadow: 0 0 0 4px rgba(255,213,74,0.12);
        }
        .tcn-feat-search .icon {
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.5);
        }

        /* Sticky tab bar */
        .tcn-feat-tabs {
          position: sticky;
          top: 64px;
          z-index: 10;
          background: rgba(255,255,255,0.95);
          backdrop-filter: saturate(180%) blur(14px);
          border-bottom: 1px solid var(--tcn-border);
          padding: 0.85rem 0;
        }
        .tcn-feat-tabs-inner {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          scrollbar-width: none;
          padding: 0 0.5rem;
        }
        .tcn-feat-tabs-inner::-webkit-scrollbar { display: none; }
        .tcn-tab {
          flex-shrink: 0;
          padding: 0.55rem 1.1rem;
          border-radius: 999px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--tcn-ink-700);
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .tcn-tab:hover {
          background: var(--tcn-violet-50);
          color: var(--tcn-violet-600);
        }
        .tcn-tab.active {
          background: linear-gradient(135deg, var(--tcn-navy-900), var(--tcn-navy-800));
          color: #fff;
          box-shadow: 0 4px 14px rgba(11,15,30,0.25);
        }
        .tcn-tab .cs {
          font-size: 0.62rem;
          padding: 2px 6px;
          border-radius: 999px;
          background: rgba(245,158,11,0.18);
          color: #f59e0b;
          font-weight: 800;
          letter-spacing: 0.04em;
        }
        .tcn-tab.active .cs {
          background: rgba(255,213,74,0.25);
          color: #ffd54a;
        }

        /* Section */
        .tcn-feat-section {
          padding: 4.5rem 0 1rem;
        }
        .tcn-section-head {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .tcn-section-emoji {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          flex-shrink: 0;
        }
        .tcn-section-head h2 {
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
          color: var(--tcn-ink-900);
        }
        .tcn-section-meta {
          color: var(--tcn-ink-500);
          font-size: 0.92rem;
          margin: 0;
        }
        .tcn-cs-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          background: rgba(245,158,11,0.12);
          color: #d97706;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* Feature card grid */
        .tcn-feat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .tcn-feat-card {
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 16px;
          padding: 1.5rem;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          position: relative;
          overflow: hidden;
        }
        .tcn-feat-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--card-tint, #6d5dfc);
          opacity: 0;
          transition: opacity 0.22s ease;
        }
        .tcn-feat-card:hover {
          transform: translateY(-4px);
          border-color: var(--card-tint, #6d5dfc);
          box-shadow: 0 14px 36px rgba(15,23,42,0.08);
        }
        .tcn-feat-card:hover::before { opacity: 1; }
        .tcn-feat-card-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: var(--card-tint-soft, rgba(109,93,252,0.1));
          color: var(--card-tint, #6d5dfc);
          font-weight: 800;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .tcn-feat-card h4 {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--tcn-ink-900);
          margin: 0 0 0.4rem;
        }
        .tcn-feat-card p {
          font-size: 0.92rem;
          color: var(--tcn-ink-500);
          line-height: 1.55;
          margin: 0;
        }

        /* Coming soon variant */
        .tcn-feat-section.coming-soon .tcn-feat-card {
          background: repeating-linear-gradient(
            45deg,
            #fafbff,
            #fafbff 10px,
            #f3f4f8 10px,
            #f3f4f8 12px
          );
          opacity: 0.85;
        }
        .tcn-feat-section.coming-soon .tcn-feat-card h4::after {
          content: " · soon";
          color: #d97706;
          font-weight: 600;
          font-size: 0.85em;
        }

        /* Empty / loading state */
        .tcn-feat-empty {
          padding: 4rem 0;
          text-align: center;
          color: var(--tcn-ink-500);
        }

        /* Final CTA banner */
        .tcn-feat-cta {
          padding: 5rem 0 6rem;
        }
        .tcn-feat-cta-inner {
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
        }
        .tcn-feat-cta-inner::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(600px 300px at 20% 0%, rgba(255,213,74,0.2), transparent 60%),
            radial-gradient(600px 300px at 80% 100%, rgba(109,93,252,0.3), transparent 60%);
          pointer-events: none;
        }
        .tcn-feat-cta-inner > * { position: relative; z-index: 1; }
        .tcn-feat-cta h2 {
          color: #fff;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          font-weight: 800;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }
        .tcn-feat-cta p {
          color: rgba(255,255,255,0.72);
          font-size: 1.05rem;
          max-width: 560px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }
        .tcn-feat-cta .btns {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-btn-gold {
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
        .tcn-btn-gold:hover { transform: translateY(-2px); color: #1a1f3a !important; }
        .tcn-btn-ghost {
          padding: 0.9rem 1.75rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff !important;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none !important;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(8px);
        }

        @media (max-width: 768px) {
          .tcn-feat-hero { padding: 6.5rem 0 3rem; }
          .tcn-feat-section { padding: 3rem 0 0.5rem; }
          .tcn-feat-cta-inner { padding: 3rem 1.5rem; }
          .tcn-feat-tabs { top: 56px; }
        }
      `}</style>

      {/* ─── Hero + Stats + Search ──────────────────────── */}
      <section className="tcn-feat-hero">
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
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#ffd54a" }} />
            Everything in one place
          </span>

          <h1>
            All the features your team{" "}
            <span className="gradient-word">actually uses</span>
          </h1>
          <p className="lead">
            Messaging, calls, file sharing, AI shortcuts, admin controls — built into one focused
            workspace so your team can stop tool-hopping and start shipping.
          </p>

          {!!sections.length && (
            <div className="tcn-feat-stats">
              <div className="tcn-stat">
                <span className="num">{totalFeatures}+</span>
                <span className="lbl">Features</span>
              </div>
              <div className="tcn-stat">
                <span className="num">{liveCategories}</span>
                <span className="lbl">Live categories</span>
              </div>
              {comingSoonCount > 0 && (
                <div className="tcn-stat">
                  <span className="num">{comingSoonCount}</span>
                  <span className="lbl">Coming soon</span>
                </div>
              )}
            </div>
          )}

          <div className="tcn-feat-search">
            <PiMagnifyingGlassDuotone size={20} className="icon" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search features (e.g. encryption, polls, AI)…"
            />
          </div>
        </div>
      </section>

      {/* ─── Sticky tabs ────────────────────────────────── */}
      {!!filtered.length && !isSearching && (
        <div className="tcn-feat-tabs">
          <div className="container">
            <div className="tcn-feat-tabs-inner">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  className={`tcn-tab ${activeTab === s.id ? "active" : ""}`}
                  onClick={() => scrollToSection(s.id)}
                >
                  <span>{s.icon}</span>
                  {s.title}
                  {s.comingSoon && <span className="cs">soon</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Feature sections ───────────────────────────── */}
      <div className="container">
        {loading && !sections.length ? (
          <div className="tcn-feat-empty">Loading features…</div>
        ) : errorMessage ? (
          <div className="tcn-feat-empty" style={{ color: "#dc2626" }}>{errorMessage}</div>
        ) : !filtered.length ? (
          <div className="tcn-feat-empty">
            {isSearching ? (
              <>
                No features matched <strong>"{query}"</strong>.{" "}
                <button
                  onClick={() => setQuery("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--tcn-violet-600)",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Clear search
                </button>
              </>
            ) : (
              "No features available right now."
            )}
          </div>
        ) : (
          filtered.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className={`tcn-feat-section ${section.comingSoon ? "coming-soon" : ""}`}
            >
              <div className="tcn-section-head">
                <div
                  className="tcn-section-emoji"
                  style={{
                    background: `${section.tint}1a`,
                    border: `1px solid ${section.tint}33`,
                  }}
                >
                  {section.icon}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h2>{section.title}</h2>
                  <p className="tcn-section-meta">
                    {section.features.length} feature{section.features.length === 1 ? "" : "s"}
                  </p>
                </div>
                {section.comingSoon && (
                  <span className="tcn-cs-badge">
                    <PiClockDuotone size={11} /> Coming soon
                  </span>
                )}
              </div>

              <div className="tcn-feat-grid">
                {section.features.map((feature, idx) => (
                  <div
                    key={feature.feature_item_id}
                    className="tcn-feat-card"
                    style={{
                      "--card-tint": section.tint,
                      "--card-tint-soft": `${section.tint}1a`,
                    }}
                  >
                    <div className="tcn-feat-card-num">{idx + 1}</div>
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* ─── Final CTA ──────────────────────────────────── */}
      {!loading && !!sections.length && (
        <section className="tcn-feat-cta">
          <div className="container">
            <div className="tcn-feat-cta-inner">
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
                <PiSparkleDuotone size={12} />
                Try it free
              </span>
              <h2>See it in action with your team</h2>
              <p>
                Start your free 14-day trial — no credit card required. Or book a quick walkthrough
                with us to see {brandName || "TheChatNest"} fit your workflow.
              </p>
              <div className="btns">
                <Link to="/auth/register" className="tcn-btn-gold">
                  Start free trial <PiArrowRightBold size={16} />
                </Link>
                <Link to="/demo" className="tcn-btn-ghost">
                  <PiCalendarDuotone size={18} /> Book a demo
                </Link>
                <Link to="/help" className="tcn-btn-ghost">
                  <PiChatTextDuotone size={18} /> Chat with us
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Features;
