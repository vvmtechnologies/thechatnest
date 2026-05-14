import React, { useState, useEffect, useMemo } from "react";
import {
  PiHouseDuotone,
  PiQuestionDuotone,
  PiPlayCircleDuotone,
  PiHeadsetDuotone,
  PiBookOpenDuotone,
  PiMagnifyingGlassDuotone,
  PiXBold,
  PiArrowRightBold,
  PiSparkleDuotone,
  PiChatTeardropDotsDuotone,
  PiClockCountdownDuotone,
  PiUserCheckDuotone,
} from "react-icons/pi";
import { Link, useLocation } from "react-router-dom";
import Home from "../components/HelpCenter/Home.jsx";
import Faq from "../components/HelpCenter/Faq.jsx";
import HowTo from "../components/HelpCenter/HowTo.jsx";
import Videos from "../components/HelpCenter/Videos.jsx";
import Support from "../components/HelpCenter/Support.jsx";
import FinalCta from "../components/layout/FinalCta.jsx";
import Seo from "../../components/Seo.jsx";

const TABS = [
  { key: "home", label: "Overview", Icon: PiHouseDuotone, header: "How can we help you?" },
  { key: "howTo", label: "How-to guides", Icon: PiBookOpenDuotone, header: "How-to guides" },
  { key: "faqs", label: "FAQs", Icon: PiQuestionDuotone, header: "Frequently asked questions" },
  { key: "videos", label: "Videos", Icon: PiPlayCircleDuotone, header: "Video tutorials" },
  { key: "support", label: "Contact support", Icon: PiHeadsetDuotone, header: "Talk to a human" },
];

// Lightweight search index — surfaces matching articles from across tabs.
// Each entry maps to which tab to open when clicked.
const SEARCH_INDEX = [
  { title: "Invite team members to your workspace", category: "Getting started", tabKey: "howTo" },
  { title: "Set up two-factor authentication", category: "Security", tabKey: "howTo" },
  { title: "Create your first channel or group", category: "Messaging", tabKey: "howTo" },
  { title: "Schedule a recurring meeting", category: "Meetings", tabKey: "howTo" },
  { title: "Record and share a meeting", category: "Meetings", tabKey: "howTo" },
  { title: "Difference between Standard and Premium plans", category: "Billing", tabKey: "faqs" },
  { title: "How to upgrade or downgrade your plan", category: "Billing", tabKey: "faqs" },
  { title: "Export chat history for compliance", category: "Admin", tabKey: "faqs" },
  { title: "Move a chat into a group conversation", category: "Messaging", tabKey: "faqs" },
  { title: "Send scheduled messages", category: "Messaging", tabKey: "howTo" },
  { title: "Broadcast announcements to multiple groups", category: "Messaging", tabKey: "howTo" },
  { title: "Configure department-based permissions", category: "Admin", tabKey: "howTo" },
  { title: "OTP and login attempt logs (Super Admin)", category: "Security", tabKey: "faqs" },
  { title: "Enable disappearing messages on a chat", category: "Privacy", tabKey: "howTo" },
  { title: "Set up biometric login on mobile", category: "Mobile", tabKey: "howTo" },
  { title: "Swipe-to-reply on iOS and Android", category: "Mobile", tabKey: "howTo" },
  { title: "Use QR code to log in from a new device", category: "Mobile", tabKey: "howTo" },
  { title: "Adjust voice message playback speed", category: "Messaging", tabKey: "faqs" },
  { title: "Use the AI tone adjuster before sending", category: "AI", tabKey: "howTo" },
  { title: "AI grammar correction in chat", category: "AI", tabKey: "faqs" },
  { title: "Custom workspace branding and theme", category: "Admin", tabKey: "faqs" },
  { title: "Self-host vs cloud — picking your deployment", category: "Getting started", tabKey: "faqs" },
];

const Help = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_INDEX.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const tabContent = {
    home: <Home setActiveTab={setActiveTab} />,
    howTo: <HowTo />,
    faqs: <Faq />,
    videos: <Videos />,
    support: <Support />,
  };

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    } else if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const activeTabMeta = TABS.find((t) => t.key === activeTab);

  return (
    <div className="tcn-help">
      <Seo
        title="Help center"
        description="Guides, FAQs, video tutorials and contact support for TheChatNest. Find an answer fast or talk to a real person."
        keywords="thechatnest help, support, documentation, faq, knowledge base"
      />
      <style>{`
        .tcn-help { background: #fff; min-height: 100vh; }

        /* ─── Hero ─── */
        .tcn-help-hero {
          position: relative;
          background:
            radial-gradient(1100px 600px at 78% -10%, rgba(109,93,252,0.32), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.12), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          padding: 7rem 0 3.5rem;
          overflow: hidden;
        }
        .tcn-help-hero::before {
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
        .tcn-help-hero > .container { position: relative; z-index: 2; text-align: center; }

        .tcn-help-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          background: rgba(255,213,74,0.14);
          border: 1px solid rgba(255,213,74,0.3);
          color: #ffd54a;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .tcn-help-hero h1 {
          font-size: clamp(2rem, 4.5vw, 3.4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 1rem;
          max-width: 760px;
          margin-left: auto;
          margin-right: auto;
        }
        .tcn-help-hero h1 .accent {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .tcn-help-hero p.lede {
          color: rgba(255,255,255,0.72);
          font-size: 1.1rem;
          line-height: 1.55;
          max-width: 560px;
          margin: 0 auto 2rem;
        }

        /* Search */
        .tcn-help-search-wrap {
          position: relative;
          max-width: 620px;
          margin: 0 auto;
        }
        .tcn-help-search-icon {
          position: absolute;
          left: 1.3rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.55);
          pointer-events: none;
          z-index: 1;
        }
        .tcn-help-search {
          width: 100%;
          padding: 1.1rem 1.3rem 1.1rem 3.2rem;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          color: #fff;
          font-size: 1rem;
          font-family: inherit;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }
        .tcn-help-search::placeholder { color: rgba(255,255,255,0.45); }
        .tcn-help-search:focus {
          outline: none;
          background: rgba(255,255,255,0.16);
          border-color: rgba(255,213,74,0.6);
          box-shadow: 0 0 0 4px rgba(255,213,74,0.12);
        }
        .tcn-help-search-clear {
          position: absolute;
          right: 1.3rem;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.1);
          border: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #fff;
          z-index: 1;
        }
        .tcn-help-search-clear:hover { background: rgba(255,255,255,0.2); }

        /* Search results dropdown */
        .tcn-help-search-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #fff;
          border-radius: 18px;
          padding: 0.6rem;
          box-shadow: 0 24px 60px rgba(0,0,0,0.35);
          z-index: 30;
          max-height: 420px;
          overflow-y: auto;
          text-align: left;
        }
        .tcn-help-search-results .result {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.75rem 0.9rem;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s ease;
          border: 0;
          background: transparent;
          width: 100%;
          font-family: inherit;
          text-align: left;
        }
        .tcn-help-search-results .result:hover {
          background: rgba(109,93,252,0.06);
        }
        .tcn-help-search-results .result .title {
          font-weight: 600;
          font-size: 0.93rem;
          color: var(--tcn-ink-900, #0b0f1e);
          line-height: 1.35;
        }
        .tcn-help-search-results .result .cat {
          display: inline-block;
          margin-top: 3px;
          padding: 1px 7px;
          border-radius: 999px;
          background: rgba(109,93,252,0.08);
          color: var(--tcn-violet-600, #6d5dfc);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .tcn-help-search-results .result .arrow {
          color: rgba(15,23,42,0.4);
          flex-shrink: 0;
        }
        .tcn-help-search-results .empty {
          padding: 1.5rem 1rem;
          text-align: center;
          color: var(--tcn-ink-500, rgba(15,23,42,0.6));
          font-size: 0.9rem;
        }

        /* Stat strip */
        .tcn-help-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          max-width: 760px;
          margin: 2.75rem auto 0;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .tcn-help-stat {
          text-align: center;
          padding: 0 0.85rem;
          position: relative;
        }
        .tcn-help-stat:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 18%;
          bottom: 18%;
          right: 0;
          width: 1px;
          background: rgba(255,255,255,0.08);
        }
        .tcn-help-stat .ic {
          color: #ffd54a;
          margin-bottom: 0.45rem;
        }
        .tcn-help-stat .num {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 0.3rem;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .tcn-help-stat .lbl {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
        }
        @media (max-width: 640px) {
          .tcn-help-stats { grid-template-columns: repeat(2, 1fr); gap: 1.25rem 0; }
          .tcn-help-stat:nth-child(2)::after { display: none; }
        }

        /* ─── Sticky tabs ─── */
        .tcn-help-tabs-wrap {
          position: sticky;
          top: 78px;
          z-index: 15;
          background: rgba(255,255,255,0.95);
          backdrop-filter: saturate(180%) blur(14px);
          border-bottom: 1px solid var(--tcn-border, rgba(15,23,42,0.08));
          padding: 1rem 0;
        }
        .tcn-help-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .tcn-help-tab {
          padding: 0.6rem 1.2rem;
          border-radius: 999px;
          border: 1.5px solid var(--tcn-border, rgba(15,23,42,0.1));
          background: #fff;
          color: var(--tcn-ink-700, rgba(15,23,42,0.7));
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .tcn-help-tab:hover {
          background: rgba(109,93,252,0.05);
          color: var(--tcn-violet-600, #6d5dfc);
          border-color: rgba(109,93,252,0.35);
          transform: translateY(-1px);
        }
        .tcn-help-tab.active {
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 8px 20px rgba(11,15,30,0.3);
        }

        /* ─── Content ─── */
        .tcn-help-content {
          padding: 3.5rem 0 5rem;
          background: linear-gradient(180deg, #fafbff 0%, #fff 80%);
        }
        .tcn-help-content-inner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .tcn-help-section-head {
          margin-bottom: 1.75rem;
        }
        .tcn-help-section-head h2 {
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--tcn-ink-900, #0b0f1e);
          margin: 0 0 0.4rem;
        }
        .tcn-help-section-head p {
          color: var(--tcn-ink-500, rgba(15,23,42,0.6));
          font-size: 1rem;
          margin: 0;
        }
        .tcn-help-content-card {
          background: #fff;
          border: 1px solid var(--tcn-border, rgba(15,23,42,0.08));
          border-radius: 22px;
          padding: 2.5rem;
          box-shadow: 0 14px 36px rgba(15,23,42,0.05);
        }

        @media (max-width: 768px) {
          .tcn-help-hero { padding: 6rem 0 3rem; }
          .tcn-help-tabs-wrap { top: 64px; padding: 0.75rem 0; }
          .tcn-help-tab { padding: 0.5rem 0.95rem; font-size: 0.85rem; }
          .tcn-help-content { padding: 2.5rem 0 4rem; }
          .tcn-help-content-card { padding: 1.5rem 1.1rem; border-radius: 16px; }
        }
      `}</style>

      {/* ─── Hero with search ─── */}
      <section className="tcn-help-hero">
        <div className="container">
          <span className="tcn-help-eyebrow">
            <PiSparkleDuotone size={12} /> Help Center
          </span>
          <h1>
            How can we <span className="accent">help you?</span>
          </h1>
          <p className="lede">
            85+ articles, video walkthroughs, and a real support team that replies in under 2 hours.
          </p>

          <div className="tcn-help-search-wrap">
            <PiMagnifyingGlassDuotone size={18} className="tcn-help-search-icon" />
            <input
              type="text"
              className="tcn-help-search"
              placeholder="Search guides, FAQs, and videos…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search help center"
            />
            {query && (
              <button
                type="button"
                className="tcn-help-search-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <PiXBold size={12} />
              </button>
            )}

            {query.trim() && (
              <div className="tcn-help-search-results" role="listbox">
                {searchResults.length === 0 ? (
                  <div className="empty">
                    No results for &quot;{query}&quot;. Try a different keyword, or{" "}
                    <Link to="/contact" style={{ color: "var(--tcn-violet-600, #6d5dfc)", fontWeight: 700 }}>
                      contact support
                    </Link>
                    .
                  </div>
                ) : (
                  searchResults.map((r) => (
                    <button
                      key={r.title}
                      className="result"
                      onClick={() => {
                        setActiveTab(r.tabKey);
                        setQuery("");
                      }}
                    >
                      <span>
                        <span className="title">{r.title}</span>
                        <br />
                        <span className="cat">{r.category}</span>
                      </span>
                      <PiArrowRightBold size={14} className="arrow" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="tcn-help-stats">
            <div className="tcn-help-stat">
              <div className="ic"><PiBookOpenDuotone size={20} /></div>
              <div className="num">85+</div>
              <div className="lbl">Articles</div>
            </div>
            <div className="tcn-help-stat">
              <div className="ic"><PiPlayCircleDuotone size={20} /></div>
              <div className="num">40+</div>
              <div className="lbl">Videos</div>
            </div>
            <div className="tcn-help-stat">
              <div className="ic"><PiClockCountdownDuotone size={20} /></div>
              <div className="num">&lt; 2h</div>
              <div className="lbl">Reply Time</div>
            </div>
            <div className="tcn-help-stat">
              <div className="ic"><PiUserCheckDuotone size={20} /></div>
              <div className="num">24/7</div>
              <div className="lbl">Real Humans</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Sticky tabs ─── */}
      <div className="tcn-help-tabs-wrap">
        <div className="container">
          <div className="tcn-help-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`tcn-help-tab ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                <t.Icon size={15} /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <section className="tcn-help-content">
        <div className="tcn-help-content-inner">
          {activeTab !== "home" && activeTabMeta && (
            <div className="tcn-help-section-head">
              <h2>{activeTabMeta.header}</h2>
              <p>
                {activeTab === "howTo" && "Hands-on, step-by-step walkthroughs for the features you actually use."}
                {activeTab === "faqs" && "Answers to the most common questions — sorted by topic."}
                {activeTab === "videos" && "Watch and learn — short clips covering every workflow."}
                {activeTab === "support" && "Real engineers and product folks. No chatbots."}
              </p>
            </div>
          )}
          <div className="tcn-help-content-card">{tabContent[activeTab]}</div>
        </div>
      </section>

      <FinalCta
        eyebrow="Still stuck?"
        eyebrowIcon={PiHeadsetDuotone}
        title="Our team is one message away"
        description="Average first reply in under 2 hours. Real engineers and product folks — not chatbots."
        primaryLabel="Talk to support"
        primaryTo="/contact"
        secondaryLabel="Book a demo"
        secondaryTo="/demo"
      />
    </div>
  );
};

export default Help;
