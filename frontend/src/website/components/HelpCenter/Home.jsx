import React from "react";
import {
  PiBookOpenDuotone,
  PiQuestionDuotone,
  PiHeadsetDuotone,
  PiChatTeardropDotsDuotone,
  PiVideoConferenceDuotone,
  PiUsersThreeDuotone,
  PiCreditCardDuotone,
  PiDeviceMobileSpeakerDuotone,
  PiArrowRightBold,
  PiLightningDuotone,
  PiCaretRightBold,
} from "react-icons/pi";

// Six core topics — each is a small editorial tile that drops the user
// straight into the right tab with the right context.
const TOPICS = [
  {
    title: "Getting started",
    desc: "Set up your workspace, invite teammates, and send the first message — under 5 minutes.",
    tabKey: "howTo",
    Icon: PiLightningDuotone,
    tint: "#2065D1",
    articles: 8,
  },
  {
    title: "Messaging & chat",
    desc: "Threads, broadcasts, scheduled messages, formatting, reactions, attachments.",
    tabKey: "faqs",
    Icon: PiChatTeardropDotsDuotone,
    tint: "#6d5dfc",
    articles: 22,
  },
  {
    title: "Meetings & calls",
    desc: "Instant rooms, scheduled sessions, screen share, recording, host controls.",
    tabKey: "howTo",
    Icon: PiVideoConferenceDuotone,
    tint: "#a855f7",
    articles: 14,
  },
  {
    title: "Admin & team management",
    desc: "Invite members, roles & permissions, department setup, audit logs, OTP logs.",
    tabKey: "faqs",
    Icon: PiUsersThreeDuotone,
    tint: "#0891b2",
    articles: 18,
  },
  {
    title: "Billing & plans",
    desc: "Subscriptions, invoices, upgrades, coupons, refunds, and tax compliance.",
    tabKey: "faqs",
    Icon: PiCreditCardDuotone,
    tint: "#16a34a",
    articles: 11,
  },
  {
    title: "Mobile apps",
    desc: "iOS & Android setup, biometric login, swipe-to-reply, push notification tuning.",
    tabKey: "howTo",
    Icon: PiDeviceMobileSpeakerDuotone,
    tint: "#f59e0b",
    articles: 12,
  },
];

const POPULAR_ARTICLES = [
  { title: "How do I invite team members to my workspace?", tabKey: "howTo" },
  { title: "Setting up two-factor authentication", tabKey: "howTo" },
  { title: "Difference between Standard and Premium plans", tabKey: "faqs" },
  { title: "How to schedule a recurring meeting", tabKey: "howTo" },
  { title: "Move a chat into a group conversation", tabKey: "faqs" },
  { title: "Export chat history for compliance", tabKey: "faqs" },
];

const Home = ({ setActiveTab }) => {
  return (
    <div className="tcn-help-home">
      <style>{`
        .tcn-help-home {
          font-family: inherit;
        }
        .tcn-help-home-section + .tcn-help-home-section {
          margin-top: 3rem;
          padding-top: 2.5rem;
          border-top: 1px solid var(--tcn-border, rgba(15,23,42,0.08));
        }
        .tcn-help-home h2 {
          font-size: clamp(1.4rem, 2.4vw, 1.85rem);
          font-weight: 800;
          letter-spacing: -0.015em;
          color: var(--tcn-ink-900, #0b0f1e);
          margin: 0 0 0.4rem;
        }
        .tcn-help-home .section-lead {
          color: var(--tcn-ink-500, rgba(15,23,42,0.6));
          font-size: 0.98rem;
          line-height: 1.55;
          margin: 0 0 1.85rem;
          max-width: 620px;
        }

        .tcn-help-topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 1rem;
        }
        .tcn-help-topic {
          position: relative;
          padding: 1.5rem 1.4rem 1.25rem;
          border-radius: 16px;
          background: #fff;
          border: 1px solid var(--tcn-border, rgba(15,23,42,0.08));
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: all 0.22s ease;
          overflow: hidden;
        }
        .tcn-help-topic::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--tint);
          opacity: 0;
          transition: opacity 0.22s ease;
        }
        .tcn-help-topic:hover {
          transform: translateY(-3px);
          border-color: var(--tint);
          box-shadow: 0 16px 36px rgba(15,23,42,0.08);
        }
        .tcn-help-topic:hover::before { opacity: 1; }
        .tcn-help-topic-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: var(--tint-soft);
          color: var(--tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .tcn-help-topic h3 {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin: 0 0 0.45rem;
          color: var(--tcn-ink-900, #0b0f1e);
        }
        .tcn-help-topic p {
          color: var(--tcn-ink-500, rgba(15,23,42,0.6));
          font-size: 0.9rem;
          line-height: 1.55;
          margin: 0 0 0.95rem;
          min-height: 4em;
        }
        .tcn-help-topic-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.85rem;
          border-top: 1px dashed rgba(15,23,42,0.1);
        }
        .tcn-help-topic-foot .articles {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 700;
          color: rgba(15,23,42,0.55);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .tcn-help-topic-foot .arrow {
          color: var(--tint);
          font-weight: 700;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: transform 0.18s ease;
        }
        .tcn-help-topic:hover .tcn-help-topic-foot .arrow { transform: translateX(2px); }

        /* Popular articles */
        .tcn-help-popular {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }
        .tcn-help-popular button {
          all: unset;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.95rem 1.1rem;
          border-radius: 10px;
          border: 1px solid transparent;
          background: var(--tcn-bg-soft, #fafbff);
          color: var(--tcn-ink-700, rgba(15,23,42,0.85));
          font-weight: 600;
          font-size: 0.92rem;
          transition: all 0.18s ease;
        }
        .tcn-help-popular button:hover {
          border-color: var(--tcn-violet-500, #6d5dfc);
          background: rgba(109,93,252,0.05);
          color: var(--tcn-violet-600, #4d3eff);
          transform: translateX(2px);
        }
        .tcn-help-popular button svg {
          color: var(--tcn-ink-500, rgba(15,23,42,0.4));
          flex-shrink: 0;
        }
        .tcn-help-popular button:hover svg { color: var(--tcn-violet-600, #6d5dfc); }

        /* Quick actions row */
        .tcn-help-quick {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .tcn-help-quick-tile {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1.1rem 1.25rem;
          border-radius: 14px;
          background: var(--card-bg, #fff);
          border: 1px solid var(--tcn-border, rgba(15,23,42,0.08));
          cursor: pointer;
          font-family: inherit;
          text-align: left;
          transition: all 0.18s ease;
        }
        .tcn-help-quick-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(15,23,42,0.08);
          border-color: rgba(15,23,42,0.18);
        }
        .tcn-help-quick-tile .ic {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--tint-soft);
          color: var(--tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tcn-help-quick-tile .label {
          font-weight: 700;
          font-size: 0.92rem;
          color: var(--tcn-ink-900, #0b0f1e);
          line-height: 1.2;
        }
        .tcn-help-quick-tile .sub {
          font-size: 0.78rem;
          color: var(--tcn-ink-500, rgba(15,23,42,0.55));
          margin-top: 2px;
        }

        @media (max-width: 768px) {
          .tcn-help-popular { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ─── Browse topics ─── */}
      <div className="tcn-help-home-section">
        <h2>Browse by topic</h2>
        <p className="section-lead">
          Six areas, 85+ articles, written by the engineers who actually built the product.
        </p>

        <div className="tcn-help-topics-grid">
          {TOPICS.map((t) => (
            <button
              key={t.title}
              className="tcn-help-topic"
              style={{ "--tint": t.tint, "--tint-soft": `${t.tint}1a` }}
              onClick={() => setActiveTab(t.tabKey)}
            >
              <div className="tcn-help-topic-icon">
                <t.Icon size={22} />
              </div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
              <div className="tcn-help-topic-foot">
                <span className="articles">{t.articles} articles</span>
                <span className="arrow">
                  Read <PiCaretRightBold size={11} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Popular articles ─── */}
      <div className="tcn-help-home-section">
        <h2>Popular this week</h2>
        <p className="section-lead">
          What other teams are reading right now.
        </p>
        <div className="tcn-help-popular">
          {POPULAR_ARTICLES.map((a) => (
            <button key={a.title} onClick={() => setActiveTab(a.tabKey)}>
              <span>{a.title}</span>
              <PiArrowRightBold size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* ─── Quick links — go straight to a tab ─── */}
      <div className="tcn-help-home-section">
        <h2>Other ways we can help</h2>
        <p className="section-lead">
          Prefer videos? Need a human? Pick the channel that works for you.
        </p>

        <div className="tcn-help-quick">
          <button
            className="tcn-help-quick-tile"
            style={{ "--tint": "#6d5dfc", "--tint-soft": "rgba(109,93,252,0.1)" }}
            onClick={() => setActiveTab("howTo")}
          >
            <span className="ic"><PiBookOpenDuotone size={20} /></span>
            <span>
              <span className="label">How-to guides</span>
              <span className="sub">Step-by-step walkthroughs</span>
            </span>
          </button>

          <button
            className="tcn-help-quick-tile"
            style={{ "--tint": "#16a34a", "--tint-soft": "rgba(22,163,74,0.1)" }}
            onClick={() => setActiveTab("faqs")}
          >
            <span className="ic"><PiQuestionDuotone size={20} /></span>
            <span>
              <span className="label">FAQs</span>
              <span className="sub">Answers to common questions</span>
            </span>
          </button>

          <button
            className="tcn-help-quick-tile"
            style={{ "--tint": "#f59e0b", "--tint-soft": "rgba(245,158,11,0.1)" }}
            onClick={() => setActiveTab("support")}
          >
            <span className="ic"><PiHeadsetDuotone size={20} /></span>
            <span>
              <span className="label">Contact support</span>
              <span className="sub">Real humans, &lt; 2 hr reply</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
