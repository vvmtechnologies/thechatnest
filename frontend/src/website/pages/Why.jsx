import React from "react";
import { Link } from "react-router-dom";
import {
  PiSparkleDuotone,
  PiHeartDuotone,
  PiCompassDuotone,
  PiShieldCheckDuotone,
  PiLockKeyDuotone,
  PiUsersThreeDuotone,
  PiLightningDuotone,
  PiArrowRightBold,
  PiQuotesDuotone,
  PiPlantDuotone,
  PiSignatureDuotone,
} from "react-icons/pi";
import Seo from "../../components/Seo.jsx";

const VALUES = [
  {
    Icon: PiLockKeyDuotone,
    title: "Privacy is the product",
    body: "We don't sell, lease, or share your data. Ever. The work belongs to you — encrypted, exportable, and deletable on demand.",
    tint: "#16a34a",
  },
  {
    Icon: PiLightningDuotone,
    title: "Ship before lunch",
    body: "We use TheChatNest every day to ship TheChatNest. Every release is shaped by a real team's friction — not focus-group fiction.",
    tint: "#f59e0b",
  },
  {
    Icon: PiUsersThreeDuotone,
    title: "Built for the team, not the buyer",
    body: "Procurement-friendly is fine — but the people actually using it matter more. Keyboard-first, mobile-grown-up, never bloated.",
    tint: "#6d5dfc",
  },
  {
    Icon: PiCompassDuotone,
    title: "Honest by default",
    body: "Roadmap stays public. Limits stay visible. We'll never claim a SOC 2 we don't have or a feature we haven't shipped.",
    tint: "#2065D1",
  },
];

const STORY = [
  {
    year: "2025",
    chapter: "The itch",
    body: "We were paying ₹2.4 lakh / year for Slack across 30 people — and still pasting Zoom links into Threads because the calls were ‘pro plan only'. Something had to give.",
  },
  {
    year: "Mar 2026",
    chapter: "First commit",
    body: "Built the messaging core in 6 weeks — encrypted at rest, end-to-end on Enterprise, calls baked in. Goal: replace three subscriptions with one.",
  },
  {
    year: "Apr 2026",
    chapter: "AI without the chatbot tax",
    body: "Shipped tone adjuster, smart compose, semantic search and translation — not as a paywalled add-on, as native muscle. Because charging extra for the obvious wins feels icky.",
  },
  {
    year: "May 2026",
    chapter: "Public launch",
    body: "Opening the doors. 14-day free trial, ₹199/seat, no credit card. The big names still don't ship 20 of the things we do. Let's see who's listening.",
  },
];

const DIFFERENT = [
  { num: "33", label: "features Slack / Teams / Troop don't ship" },
  { num: "₹199", label: "per seat / month — half the price of Slack" },
  { num: "0", label: "rows of data we've ever sold" },
  { num: "100%", label: "of our team uses it every day" },
];

const Why = () => {
  return (
    <div className="tcn-why">
      <Seo
        title="Why TheChatNest"
        description="Vision, values, founder note — and why we're building a workspace your team will actually want to log into. The honest version."
        keywords="thechatnest mission, founder note, why thechatnest, company values, vision"
      />

      <style>{`
        .tcn-why {
          background: linear-gradient(180deg, #fafbff 0%, #fff 50%);
          color: #0b0f1e;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          min-height: 100vh;
        }

        /* ── Hero ── */
        .tcn-why-hero {
          position: relative;
          padding: 7.5rem 0 4.5rem;
          background:
            radial-gradient(1100px 600px at 78% -10%, rgba(109,93,252,0.32), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.12), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          overflow: hidden;
        }
        .tcn-why-hero::before {
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
        .tcn-why-hero > .container { position: relative; z-index: 1; text-align: center; }
        .tcn-why-eyebrow {
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
        .tcn-why-hero h1 {
          font-family: "Fraunces", Georgia, serif;
          font-size: clamp(2.4rem, 5vw, 4rem);
          font-weight: 500;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0 0 1rem;
          color: #fff;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
        }
        .tcn-why-hero h1 em {
          font-style: italic;
          color: #ffd54a;
        }
        .tcn-why-hero p.lede {
          color: rgba(255,255,255,0.72);
          font-size: 1.15rem;
          line-height: 1.6;
          max-width: 640px;
          margin: 0 auto;
        }

        /* ── Pull quote ── */
        .tcn-why-pullquote {
          max-width: 880px;
          margin: 5rem auto;
          padding: 0 2rem;
          text-align: center;
          position: relative;
        }
        .tcn-why-pullquote .markwrap {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255,213,74,0.4);
        }
        .tcn-why-pullquote blockquote {
          font-family: "Fraunces", Georgia, serif;
          font-size: clamp(1.4rem, 2.6vw, 2rem);
          font-weight: 500;
          font-style: italic;
          line-height: 1.4;
          color: #0b0f1e;
          margin: 0 0 1rem;
          letter-spacing: -0.01em;
        }
        .tcn-why-pullquote blockquote em {
          background: linear-gradient(120deg, transparent 0%, rgba(255,213,74,0.4) 50%, transparent 100%);
          padding: 0 0.15em;
          font-style: italic;
        }
        .tcn-why-pullquote cite {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(15,23,42,0.55);
          font-style: normal;
          font-weight: 700;
        }

        /* ── Values grid ── */
        .tcn-why-section { padding: 5rem 0; border-top: 1px solid rgba(15,23,42,0.08); }
        .tcn-why-section-head { text-align: center; max-width: 660px; margin: 0 auto 3rem; }
        .tcn-why-section-head h2 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(1.85rem, 3.5vw, 2.6rem);
          letter-spacing: -0.015em;
          line-height: 1.15;
          margin: 0 0 0.85rem;
          color: #0b0f1e;
        }
        .tcn-why-section-head h2 em {
          font-style: italic;
          color: #2065D1;
        }
        .tcn-why-section-head p {
          color: rgba(15,23,42,0.6);
          font-size: 1rem;
          line-height: 1.55;
          margin: 0;
        }
        .tcn-why-values {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .tcn-why-value {
          padding: 1.85rem 1.65rem 1.65rem;
          border-radius: 18px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          transition: all 0.22s ease;
          position: relative;
          overflow: hidden;
        }
        .tcn-why-value::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 0;
          background: var(--tint);
          transition: height 0.22s ease;
        }
        .tcn-why-value:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(15,23,42,0.08);
          border-color: var(--tint);
        }
        .tcn-why-value:hover::before { height: 100%; }
        .tcn-why-value .ic {
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
        .tcn-why-value h3 {
          font-size: 1.1rem;
          font-weight: 800;
          margin: 0 0 0.45rem;
          color: #0b0f1e;
          letter-spacing: -0.01em;
        }
        .tcn-why-value p {
          color: rgba(15,23,42,0.62);
          font-size: 0.92rem;
          line-height: 1.55;
          margin: 0;
        }

        /* ── Story timeline ── */
        .tcn-why-story {
          max-width: 760px;
          margin: 0 auto;
          position: relative;
        }
        .tcn-why-story::before {
          content: "";
          position: absolute;
          left: 7px;
          top: 4px;
          bottom: 4px;
          width: 2px;
          background:
            repeating-linear-gradient(to bottom,
              #0b0f1e 0, #0b0f1e 5px,
              transparent 5px, transparent 10px);
        }
        .tcn-why-step {
          position: relative;
          padding-left: 2.5rem;
          padding-bottom: 2.5rem;
        }
        .tcn-why-step:last-child { padding-bottom: 0; }
        .tcn-why-step::before {
          content: "";
          position: absolute;
          left: 0;
          top: 4px;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #fff;
          border: 2.5px solid #0b0f1e;
        }
        .tcn-why-step::after {
          content: "";
          position: absolute;
          left: 5px;
          top: 9px;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #ffd54a;
        }
        .tcn-why-step .year {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #6d5dfc;
          text-transform: uppercase;
          margin-bottom: 0.4rem;
        }
        .tcn-why-step h3 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: 1.45rem;
          letter-spacing: -0.01em;
          margin: 0 0 0.5rem;
          color: #0b0f1e;
        }
        .tcn-why-step p {
          color: rgba(15,23,42,0.7);
          line-height: 1.65;
          margin: 0;
          font-size: 0.98rem;
        }

        /* ── Stats strip ── */
        .tcn-why-stats {
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          color: #fff;
          padding: 4rem 0;
        }
        .tcn-why-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .tcn-why-stat {
          text-align: center;
          padding: 0 1rem;
          border-right: 1px solid rgba(255,255,255,0.1);
        }
        .tcn-why-stat:last-child { border-right: 0; }
        .tcn-why-stat .num {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 1;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
          margin-bottom: 0.4rem;
        }
        .tcn-why-stat .lbl {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          line-height: 1.4;
        }
        @media (max-width: 768px) {
          .tcn-why-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 2.5rem 0; }
          .tcn-why-stat { border-right: 0 !important; }
        }

        /* ── Founder note ── */
        .tcn-why-founder {
          padding: 5rem 0;
        }
        .tcn-why-founder-card {
          max-width: 880px;
          margin: 0 auto;
          padding: 3rem 2.5rem 2.5rem;
          border-radius: 24px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          box-shadow: 0 24px 60px rgba(15,23,42,0.06);
          position: relative;
        }
        .tcn-why-founder-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #2065D1, #6d5dfc 50%, #ffd54a);
          border-radius: 24px 24px 0 0;
        }
        .tcn-why-founder-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(32,101,209,0.1);
          color: #2065D1;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .tcn-why-founder h3 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-style: italic;
          font-size: clamp(1.4rem, 2.4vw, 1.85rem);
          letter-spacing: -0.01em;
          line-height: 1.3;
          margin: 0 0 1.5rem;
          color: #0b0f1e;
        }
        .tcn-why-founder p {
          color: rgba(15,23,42,0.75);
          line-height: 1.75;
          margin: 0 0 1rem;
          font-size: 1rem;
        }
        .tcn-why-founder .sign {
          margin-top: 1.85rem;
          padding-top: 1.5rem;
          border-top: 1px dashed rgba(15,23,42,0.15);
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .tcn-why-founder .sign-ic {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2065D1, #1242a3);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .tcn-why-founder .sign-meta strong {
          display: block;
          font-weight: 800;
          color: #0b0f1e;
          font-size: 0.95rem;
        }
        .tcn-why-founder .sign-meta span {
          color: rgba(15,23,42,0.55);
          font-size: 0.82rem;
        }

        /* ── CTA ── */
        .tcn-why-cta {
          padding: 5rem 0 6rem;
          background: linear-gradient(180deg, #fafbff, #fff);
          text-align: center;
        }
        .tcn-why-cta h2 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(1.85rem, 3.5vw, 2.6rem);
          letter-spacing: -0.015em;
          line-height: 1.15;
          margin: 0 0 0.85rem;
          color: #0b0f1e;
        }
        .tcn-why-cta h2 em { font-style: italic; color: #2065D1; }
        .tcn-why-cta p {
          color: rgba(15,23,42,0.6);
          font-size: 1.05rem;
          line-height: 1.6;
          max-width: 540px;
          margin: 0 auto 1.85rem;
        }
        .tcn-why-cta-btns {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-why-cta-btns a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.85rem 1.65rem;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none !important;
          transition: transform 0.18s ease;
        }
        .tcn-why-cta-btns .gold {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          box-shadow: 0 10px 26px rgba(255,213,74,0.4);
        }
        .tcn-why-cta-btns .gold:hover { transform: translateY(-2px); color: #1a1f3a !important; }
        .tcn-why-cta-btns .ghost {
          background: #fff;
          border: 1.5px solid rgba(15,23,42,0.15);
          color: #0b0f1e !important;
        }
        .tcn-why-cta-btns .ghost:hover { border-color: #0b0f1e; }
      `}</style>

      <section className="tcn-why-hero">
        <div className="container">
          <span className="tcn-why-eyebrow">
            <PiSparkleDuotone size={12} /> The honest version
          </span>
          <h1>
            We didn't build a Slack clone. <em>We built what we wished existed.</em>
          </h1>
          <p className="lede">
            Why TheChatNest exists, what we believe, and how a 30-person team paying ₹2.4 lakh a year for messaging decided to fix it themselves.
          </p>
        </div>
      </section>

      <section className="tcn-why-pullquote">
        <div className="markwrap"><PiQuotesDuotone size={48} /></div>
        <blockquote>
          The best team chat <em>shouldn't cost more</em> than the work it carries.
        </blockquote>
        <cite>— Our north star, written on day one</cite>
      </section>

      <section className="tcn-why-section">
        <div className="container">
          <div className="tcn-why-section-head">
            <h2>What we <em>believe</em>.</h2>
            <p>
              Four principles, written on day one and tested against every product decision since.
            </p>
          </div>
          <div className="tcn-why-values">
            {VALUES.map((v) => (
              <article
                key={v.title}
                className="tcn-why-value"
                style={{ "--tint": v.tint, "--tint-soft": `${v.tint}1a` }}
              >
                <div className="ic"><v.Icon size={24} /></div>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="tcn-why-section">
        <div className="container">
          <div className="tcn-why-section-head">
            <h2>How we <em>got here</em>.</h2>
            <p>
              The short version. Real timestamps. No rewriting history.
            </p>
          </div>
          <div className="tcn-why-story">
            {STORY.map((s) => (
              <div key={s.year} className="tcn-why-step">
                <div className="year">{s.year}</div>
                <h3>{s.chapter}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tcn-why-stats">
        <div className="tcn-why-stats-grid">
          {DIFFERENT.map((d) => (
            <div key={d.label} className="tcn-why-stat">
              <div className="num">{d.num}</div>
              <div className="lbl">{d.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="tcn-why-founder">
        <div className="container">
          <div className="tcn-why-founder-card">
            <div className="tcn-why-founder-eyebrow">
              <PiSignatureDuotone size={11} /> Founder note
            </div>
            <h3>
              If you're sick of paying for chat that nickel-and-dimes you for the basics, we made this for you.
            </h3>
            <p>
              I've been on teams that pay ₹10,000 / month just to send video. Teams that pay for chat, pay for calls,
              pay for meeting transcripts, pay for AI summaries — and then someone still pastes a Google Doc link because
              the search couldn't find last week's spec.
            </p>
            <p>
              TheChatNest is the version we wanted: one workspace, encrypted by default, AI you don't have to bolt on, a
              price that doesn't make you wince. We're early — there's no SOC 2 sticker yet, our roadmap is still long —
              but the foundations are honest, and so is our list of what's shipped vs. what's planned. Every feature is
              there because we actually used it on Monday.
            </p>
            <p>
              You're not just buying software. You're betting on a team that will use what they sell, listen when it
              breaks, and ship the fix before the calendar week ends. That's the whole pitch.
            </p>
            <div className="sign">
              <div className="sign-ic"><PiPlantDuotone size={20} /></div>
              <div className="sign-meta">
                <strong>The TheChatNest team</strong>
                <span>Bengaluru · Building since 2025</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tcn-why-cta">
        <div className="container">
          <h2>
            Read enough? <em>Try the actual thing.</em>
          </h2>
          <p>14-day free trial. No credit card. If we earn it, you stay. If not, you walk.</p>
          <div className="tcn-why-cta-btns">
            <Link to="/auth/register" className="gold">
              Start free trial <PiArrowRightBold size={14} />
            </Link>
            <Link to="/compare" className="ghost">
              See how we compare
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Why;
