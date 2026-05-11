import React, { useState, useEffect } from "react";
import {
  PiHouseDuotone,
  PiQuestionDuotone,
  PiPlayCircleDuotone,
  PiHeadsetDuotone,
  PiBookOpenDuotone,
  PiMagnifyingGlassDuotone,
} from "react-icons/pi";
import { useLocation } from "react-router-dom";
import Home from "../components/HelpCenter/Home.jsx";
import Faq from "../components/HelpCenter/Faq.jsx";
import HowTo from "../components/HelpCenter/HowTo.jsx";
import Videos from "../components/HelpCenter/Videos.jsx";
import Support from "../components/HelpCenter/Support.jsx";
import PageHero from "../components/layout/PageHero.jsx";
import FinalCta from "../components/layout/FinalCta.jsx";

const TABS = [
  { key: "home", label: "Overview", Icon: PiHouseDuotone, header: "How can we help you?" },
  { key: "howTo", label: "How-to guides", Icon: PiBookOpenDuotone, header: "How-to guides" },
  { key: "faqs", label: "FAQs", Icon: PiQuestionDuotone, header: "Frequently asked questions" },
  { key: "videos", label: "Videos", Icon: PiPlayCircleDuotone, header: "Video tutorials" },
  { key: "support", label: "Contact support", Icon: PiHeadsetDuotone, header: "Talk to a human" },
];

const TABS_BY_KEY = TABS.reduce((acc, t) => ({ ...acc, [t.key]: t }), {});

const Help = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");

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

  return (
    <div className="tcn-help">
      <style>{`
        .tcn-help { background: #fff; }

        .tcn-help-tabs-wrap {
          position: sticky;
          top: 78px;
          z-index: 15;
          background: rgba(255,255,255,0.95);
          backdrop-filter: saturate(180%) blur(14px);
          border-bottom: 1px solid var(--tcn-border);
          padding: 0.85rem 0;
        }
        .tcn-help-tabs {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .tcn-help-tab {
          padding: 0.55rem 1.1rem;
          border-radius: 999px;
          border: 1px solid var(--tcn-border);
          background: #fff;
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
        .tcn-help-tab:hover {
          background: var(--tcn-violet-50);
          color: var(--tcn-violet-600);
          border-color: var(--tcn-violet-500);
        }
        .tcn-help-tab.active {
          background: linear-gradient(135deg, var(--tcn-navy-900), var(--tcn-navy-800));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(11,15,30,0.25);
        }

        .tcn-help-content {
          padding: 3rem 0 5rem;
        }
        .tcn-help-content-card {
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 22px;
          padding: 2.5rem;
          box-shadow: var(--tcn-shadow-sm);
          max-width: 1080px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .tcn-help-tabs-wrap { top: 64px; }
          .tcn-help-content-card { padding: 1.75rem 1.25rem; }
        }
      `}</style>

      <PageHero
        eyebrow="Help center"
        eyebrowIcon={PiHeadsetDuotone}
        title={
          <>
            {TABS_BY_KEY[activeTab]?.header || "How can we"}{" "}
            <span className="gradient-word">help you?</span>
          </>
        }
        lead="Browse guides, watch videos, read FAQs, or get in touch with our support team."
        tone="tight"
      >
        <div style={{ marginTop: "1.5rem", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          <div style={{ position: "relative" }}>
            <PiMagnifyingGlassDuotone
              size={18}
              style={{
                position: "absolute",
                left: "1.1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.5)",
              }}
            />
            <input
              type="text"
              placeholder="Search articles, guides, and FAQs…"
              style={{
                width: "100%",
                padding: "0.95rem 1.2rem 0.95rem 3rem",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 999,
                color: "#fff",
                fontSize: "0.95rem",
                backdropFilter: "blur(8px)",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>
      </PageHero>

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

      <section className="tcn-help-content">
        <div className="container">
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
