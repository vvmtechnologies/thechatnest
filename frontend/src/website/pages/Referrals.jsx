import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PiGiftDuotone,
  PiUsersThreeDuotone,
  PiCurrencyInrDuotone,
  PiSparkleDuotone,
  PiArrowRightBold,
  PiCopyDuotone,
  PiCheckBold,
  PiPaperPlaneTiltDuotone,
  PiMegaphoneDuotone,
  PiChartLineUpDuotone,
  PiCheckCircleDuotone,
} from "react-icons/pi";
import Seo from "../../components/Seo.jsx";

const STEPS = [
  {
    Icon: PiPaperPlaneTiltDuotone,
    title: "Share your link",
    body: "Sign in, grab your unique referral link from Settings → Referrals. Share it with team leads, founders, anyone who's tired of overpaying for messaging.",
    tint: "#2065D1",
  },
  {
    Icon: PiUsersThreeDuotone,
    title: "They start a trial",
    body: "Friend clicks your link, signs up, and starts using TheChatNest with their team. We track everything — they don't need a coupon code.",
    tint: "#6d5dfc",
  },
  {
    Icon: PiGiftDuotone,
    title: "You both get rewarded",
    body: "When their team converts to a paid plan, you both get one full month free, instantly credited. No invoices, no waiting.",
    tint: "#16a34a",
  },
];

const TIERS = [
  {
    name: "Friend",
    refs: "1 – 4",
    reward: "1 month free",
    bonus: "Per successful referral",
    highlight: false,
  },
  {
    name: "Ambassador",
    refs: "5 – 14",
    reward: "1 month free + ₹500 cash",
    bonus: "Per successful referral",
    highlight: true,
  },
  {
    name: "Partner",
    refs: "15 +",
    reward: "Custom revenue share",
    bonus: "Talk to our partnerships team",
    highlight: false,
  },
];

const TERMS = [
  "Rewards are credited within 7 days of the referred team paying their first invoice.",
  "Self-referrals, duplicate accounts, and referrals to teams smaller than 3 paid seats are excluded.",
  "Cash rewards (Ambassador tier+) are paid via bank transfer or UPI after a one-time KYC check.",
  "We may end or modify the program with 30 days' notice — your earned credits stay yours.",
  "Full terms apply — see our Referral Agreement for the legalese.",
];

const Referrals = () => {
  const [copied, setCopied] = useState(false);
  const sampleLink = "https://www.thechatnest.com/?ref=YOURCODE";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sampleLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="tcn-ref">
      <Seo
        title="Referral program"
        description="Refer a team to TheChatNest, get one month free for both of you when they convert. Cash bonuses for power referrers and custom revenue share for partners."
        keywords="thechatnest referral, refer a friend, partner program, affiliate"
      />

      <style>{`
        .tcn-ref {
          background: linear-gradient(180deg, #fafbff 0%, #fff 50%);
          color: #0b0f1e;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          min-height: 100vh;
        }
        .tcn-ref-hero {
          position: relative;
          padding: 7rem 0 4rem;
          background:
            radial-gradient(1000px 600px at 80% -10%, rgba(34,197,94,0.32), transparent 60%),
            radial-gradient(700px 400px at 10% 90%, rgba(255,213,74,0.1), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          overflow: hidden;
          text-align: center;
        }
        .tcn-ref-hero::before {
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
        .tcn-ref-hero > .container { position: relative; z-index: 1; }
        .tcn-ref-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          background: rgba(34,197,94,0.18);
          border: 1px solid rgba(34,197,94,0.4);
          color: #86efac;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .tcn-ref-hero h1 {
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0 0 1rem;
          color: #fff;
          max-width: 880px;
          margin-left: auto;
          margin-right: auto;
        }
        .tcn-ref-hero h1 .accent {
          background: linear-gradient(135deg, #86efac, #4ade80);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-ref-hero p.lede {
          color: rgba(255,255,255,0.72);
          font-size: 1.15rem;
          line-height: 1.55;
          max-width: 600px;
          margin: 0 auto 2rem;
        }

        /* sample link mock */
        .tcn-ref-mock {
          max-width: 540px;
          margin: 0 auto;
          padding: 0.55rem 0.55rem 0.55rem 1.25rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(8px);
        }
        .tcn-ref-mock-url {
          flex: 1;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.85);
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .tcn-ref-mock-btn {
          padding: 0.55rem 1.1rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a;
          border: 0;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
          transition: transform 0.18s ease;
        }
        .tcn-ref-mock-btn:hover { transform: translateY(-1px); }

        /* Steps */
        .tcn-ref-section { padding: 5rem 0; border-top: 1px solid rgba(15,23,42,0.08); }
        .tcn-ref-section-head { text-align: center; max-width: 660px; margin: 0 auto 3rem; }
        .tcn-ref-section-head h2 {
          font-size: clamp(1.85rem, 3.5vw, 2.6rem);
          font-weight: 800;
          letter-spacing: -0.015em;
          line-height: 1.15;
          margin: 0 0 0.85rem;
          color: #0b0f1e;
        }
        .tcn-ref-section-head h2 .accent { color: #16a34a; }
        .tcn-ref-section-head p {
          color: rgba(15,23,42,0.6);
          font-size: 1rem;
          line-height: 1.6;
          margin: 0;
        }
        .tcn-ref-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        .tcn-ref-step {
          padding: 1.85rem 1.65rem;
          border-radius: 18px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          position: relative;
          transition: all 0.22s ease;
        }
        .tcn-ref-step:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(15,23,42,0.08);
          border-color: var(--tint);
        }
        .tcn-ref-step .num {
          position: absolute;
          top: -16px;
          left: 1.65rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--tint);
          color: #fff;
          font-family: "JetBrains Mono", monospace;
          font-weight: 800;
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 14px var(--tint-shadow);
        }
        .tcn-ref-step .ic {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--tint-soft);
          color: var(--tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          margin-top: 0.5rem;
        }
        .tcn-ref-step h3 {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin: 0 0 0.45rem;
          color: #0b0f1e;
        }
        .tcn-ref-step p {
          color: rgba(15,23,42,0.62);
          font-size: 0.92rem;
          line-height: 1.55;
          margin: 0;
        }

        /* Tier table */
        .tcn-ref-tiers {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          max-width: 1080px;
          margin: 0 auto;
        }
        .tcn-ref-tier {
          padding: 2rem 1.85rem;
          border-radius: 22px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          transition: all 0.22s ease;
          position: relative;
        }
        .tcn-ref-tier.highlight {
          background: linear-gradient(135deg, #0b0f1e, #1242a3);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 24px 60px rgba(32,101,209,0.32);
          transform: scale(1.03);
        }
        .tcn-ref-tier.highlight::before {
          content: "MOST POPULAR";
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 12px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #6e4f10;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }
        .tcn-ref-tier .name {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0b0f1e;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 0.5rem;
        }
        .tcn-ref-tier.highlight .name { color: #ffd54a; }
        .tcn-ref-tier .refs {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(1.85rem, 3vw, 2.4rem);
          line-height: 1;
          color: #0b0f1e;
          letter-spacing: -0.015em;
          margin-bottom: 0.4rem;
        }
        .tcn-ref-tier.highlight .refs { color: #fff; }
        .tcn-ref-tier .refs-sub {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(15,23,42,0.55);
        }
        .tcn-ref-tier.highlight .refs-sub { color: rgba(255,255,255,0.55); }
        .tcn-ref-tier .reward {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px dashed rgba(15,23,42,0.15);
        }
        .tcn-ref-tier.highlight .reward { border-color: rgba(255,255,255,0.18); }
        .tcn-ref-tier .reward-label {
          font-size: 0.78rem;
          color: rgba(15,23,42,0.55);
          margin-bottom: 0.35rem;
          font-family: "JetBrains Mono", monospace;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .tcn-ref-tier.highlight .reward-label { color: rgba(255,255,255,0.55); }
        .tcn-ref-tier .reward-amt {
          font-weight: 800;
          font-size: 1.15rem;
          color: #16a34a;
          line-height: 1.3;
        }
        .tcn-ref-tier.highlight .reward-amt { color: #86efac; }
        .tcn-ref-tier .reward-sub {
          font-size: 0.85rem;
          color: rgba(15,23,42,0.6);
          margin-top: 0.3rem;
        }
        .tcn-ref-tier.highlight .reward-sub { color: rgba(255,255,255,0.7); }

        /* Terms */
        .tcn-ref-terms {
          max-width: 760px;
          margin: 0 auto;
          padding: 2rem 2.25rem;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 18px;
        }
        .tcn-ref-terms h3 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0b0f1e;
          margin: 0 0 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tcn-ref-terms-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.7rem;
        }
        .tcn-ref-terms-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: rgba(15,23,42,0.7);
          font-size: 0.9rem;
          line-height: 1.55;
        }
        .tcn-ref-terms-list svg {
          color: #16a34a;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* CTA */
        .tcn-ref-cta {
          padding: 5rem 0 6rem;
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          color: #fff;
          text-align: center;
        }
        .tcn-ref-cta h2 {
          font-size: clamp(1.9rem, 3.5vw, 2.6rem);
          font-weight: 800;
          letter-spacing: -0.015em;
          line-height: 1.15;
          margin: 0 0 0.85rem;
          color: #fff;
        }
        .tcn-ref-cta p {
          color: rgba(255,255,255,0.72);
          font-size: 1.05rem;
          max-width: 560px;
          margin: 0 auto 1.85rem;
        }
        .tcn-ref-cta-btns {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-ref-cta-btns a {
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
        .tcn-ref-cta-btns .gold {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          box-shadow: 0 10px 26px rgba(255,213,74,0.45);
        }
        .tcn-ref-cta-btns .gold:hover { transform: translateY(-2px); color: #1a1f3a !important; }
        .tcn-ref-cta-btns .ghost {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff !important;
        }
        .tcn-ref-cta-btns .ghost:hover { background: rgba(255,255,255,0.14); }

        @media (max-width: 880px) {
          .tcn-ref-steps, .tcn-ref-tiers { grid-template-columns: 1fr; }
          .tcn-ref-tier.highlight { transform: none; }
        }
      `}</style>

      <section className="tcn-ref-hero">
        <div className="container">
          <span className="tcn-ref-eyebrow">
            <PiGiftDuotone size={12} /> Referral program · Launching Q2 2026
          </span>
          <h1>
            Refer a team. <span className="accent">Both get a free month.</span>
          </h1>
          <p className="lede">
            We're launching the referral program in Q2 2026. Drop your email below and we'll
            ping you the moment your referral link is ready — and credit your first three
            successful referrals retroactively.
          </p>

          <div className="tcn-ref-mock">
            <div className="tcn-ref-mock-url" style={{ opacity: 0.6 }}>{sampleLink}</div>
            <button type="button" className="tcn-ref-mock-btn" onClick={handleCopy} aria-label="Copy sample link" style={{ opacity: 0.6 }}>
              {copied ? <PiCheckBold size={13} /> : <PiCopyDuotone size={13} />}
              {copied ? "Copied" : "Sample"}
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            That's a sample link — real ones are coming with the launch.
          </div>
          <div
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(255,213,74,0.12)",
              border: "1px solid rgba(255,213,74,0.3)",
              color: "#ffd54a",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            <PiSparkleDuotone size={11} /> EARLY-BIRD CREDIT · FIRST 3 REFERRALS COUNT BACKDATED
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="tcn-ref-section">
        <div className="container">
          <div className="tcn-ref-section-head">
            <h2>
              Three steps, <span className="accent">zero friction</span>.
            </h2>
            <p>No promo codes, no manual claims. The system tracks everything automatically.</p>
          </div>
          <div className="tcn-ref-steps">
            {STEPS.map((s, i) => (
              <article
                key={s.title}
                className="tcn-ref-step"
                style={{
                  "--tint": s.tint,
                  "--tint-soft": `${s.tint}1a`,
                  "--tint-shadow": `${s.tint}55`,
                }}
              >
                <div className="num">{String(i + 1).padStart(2, "0")}</div>
                <div className="ic"><s.Icon size={22} /></div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="tcn-ref-section">
        <div className="container">
          <div className="tcn-ref-section-head">
            <h2>
              The <span className="accent">more you share</span>, the more you earn.
            </h2>
            <p>Three reward tiers. We bump you up automatically as your referrals stack up.</p>
          </div>
          <div className="tcn-ref-tiers">
            {TIERS.map((t) => (
              <div key={t.name} className={`tcn-ref-tier ${t.highlight ? "highlight" : ""}`}>
                <div className="name">{t.name}</div>
                <div className="refs">{t.refs}</div>
                <div className="refs-sub">Successful referrals</div>
                <div className="reward">
                  <div className="reward-label">Reward</div>
                  <div className="reward-amt">{t.reward}</div>
                  <div className="reward-sub">{t.bonus}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="tcn-ref-section">
        <div className="container">
          <div className="tcn-ref-terms">
            <h3>
              <PiSparkleDuotone size={16} style={{ color: "#16a34a" }} /> The fine print, written like a human
            </h3>
            <ul className="tcn-ref-terms-list">
              {TERMS.map((t, i) => (
                <li key={i}>
                  <PiCheckCircleDuotone size={16} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="tcn-ref-cta">
        <div className="container">
          <h2>Ready to start sharing?</h2>
          <p>Sign in to grab your referral link, or start a trial if you don't have an account yet.</p>
          <div className="tcn-ref-cta-btns">
            <Link to="/auth/login" className="gold">
              Sign in & get my link <PiArrowRightBold size={14} />
            </Link>
            <Link to="/auth/register" className="ghost">
              Start a free trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Referrals;
