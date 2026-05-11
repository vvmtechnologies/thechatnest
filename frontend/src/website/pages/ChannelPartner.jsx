import React from "react";
import {
  PiHandshakeDuotone,
  PiCoinsDuotone,
  PiChartLineUpDuotone,
  PiWrenchDuotone,
  PiTagDuotone,
  PiGraduationCapDuotone,
  PiUsersThreeDuotone,
  PiBuildingsDuotone,
  PiMegaphoneDuotone,
  PiPlugsDuotone,
  PiArrowRightBold,
  PiCheckBold,
} from "react-icons/pi";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import PageHero from "../components/layout/PageHero.jsx";
import FinalCta from "../components/layout/FinalCta.jsx";

const BENEFITS = [
  { Icon: PiCoinsDuotone, tint: "#22c55e", title: "Revenue sharing", desc: "Earn competitive commissions on every customer you refer. Recurring revenue for recurring subscriptions." },
  { Icon: PiChartLineUpDuotone, tint: "#0ea5e9", title: "Sales & marketing support", desc: "Co-branded materials, product demos, and a dedicated partner manager." },
  { Icon: PiWrenchDuotone, tint: "#f59e0b", title: "Priority technical support", desc: "Direct line to our engineering team for deployments, integrations, and escalations." },
  { Icon: PiTagDuotone, tint: "#ec4899", title: "Exclusive pricing", desc: "Offer your clients partner pricing that's not available through direct channels." },
  { Icon: PiGraduationCapDuotone, tint: "#a855f7", title: "Training & certification", desc: "Comprehensive product training and official partner certification." },
  { Icon: PiHandshakeDuotone, tint: "#14b8a6", title: "Deal registration", desc: "Register your deals for pipeline protection and enhanced support during the sales cycle." },
];

const PARTNER_TYPES = [
  {
    Icon: PiBuildingsDuotone,
    tint: "#6d5dfc",
    title: "Reseller partner",
    desc: "Purchase licenses at discounted rates and resell to your clients with full margin control.",
    best: "IT companies, system integrators, managed service providers",
  },
  {
    Icon: PiMegaphoneDuotone,
    tint: "#ec4899",
    title: "Referral partner",
    desc: "Refer qualified leads and earn a commission on every successful conversion. No technical involvement required.",
    best: "Consultants, agencies, industry influencers",
  },
  {
    Icon: PiPlugsDuotone,
    tint: "#0ea5e9",
    title: "Technology partner",
    desc: "Integrate your product with ours to offer joint solutions. Co-market to combined audiences.",
    best: "SaaS companies, productivity tool vendors, security providers",
  },
];

export default function ChannelPartner() {
  const { brandName } = useSiteBranding();
  const brand = brandName || "TheChatNest";

  return (
    <div style={{ background: "#fff" }}>
      <style>{`
        .tcn-cp-section { padding: 5rem 0; }
        .tcn-cp-section.alt { background: var(--tcn-bg-soft); }
        .tcn-cp-head {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 3rem;
        }
        .tcn-cp-head h2 {
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--tcn-ink-900);
          margin: 1rem 0 0.7rem;
        }
        .tcn-cp-head p {
          color: var(--tcn-ink-500);
          font-size: 1.02rem;
          margin: 0;
        }
        .tcn-cp-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          max-width: 1180px;
          margin: 0 auto;
        }
        .tcn-cp-card {
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 20px;
          padding: 2rem 1.6rem;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .tcn-cp-card::before {
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
        .tcn-cp-card:hover {
          transform: translateY(-4px);
          border-color: var(--card-tint, #6d5dfc);
          box-shadow: 0 14px 36px rgba(15,23,42,0.08);
        }
        .tcn-cp-card:hover::before { opacity: 1; }
        .tcn-cp-card .ico {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--card-tint-soft);
          color: var(--card-tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.1rem;
        }
        .tcn-cp-card h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--tcn-ink-900);
          margin: 0 0 0.5rem;
        }
        .tcn-cp-card p {
          color: var(--tcn-ink-500);
          font-size: 0.93rem;
          line-height: 1.55;
          margin: 0 0 1rem;
        }
        .tcn-cp-best {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--tcn-border);
          font-size: 0.82rem;
          color: var(--tcn-ink-500);
          display: flex;
          gap: 6px;
          align-items: flex-start;
        }
        .tcn-cp-best strong { color: var(--tcn-ink-900); }

        .tcn-cp-benefits {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          max-width: 1180px;
          margin: 0 auto;
        }
        .tcn-cp-benefit {
          display: flex;
          gap: 14px;
          padding: 1.5rem 1.4rem;
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 16px;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .tcn-cp-benefit:hover {
          border-color: var(--card-tint, #6d5dfc);
          transform: translateY(-2px);
        }
        .tcn-cp-benefit .ico {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--card-tint-soft);
          color: var(--card-tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tcn-cp-benefit h4 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--tcn-ink-900);
          margin: 0 0 0.3rem;
        }
        .tcn-cp-benefit p {
          font-size: 0.88rem;
          color: var(--tcn-ink-500);
          margin: 0;
          line-height: 1.55;
        }
      `}</style>

      <PageHero
        eyebrow="Channel partner program"
        eyebrowIcon={PiHandshakeDuotone}
        title={
          <>
            Grow your business with{" "}
            <span className="gradient-word">{brand}</span>
          </>
        }
        lead="Help enterprises adopt secure, self-hosted communication. Earn recurring revenue, get co-marketing support, and ship faster with our engineering team."
      >
        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "1.5rem",
          }}
        >
          {[
            "Recurring commissions",
            "Co-marketing",
            "Priority support",
            "Deal registration",
          ].map((tag) => (
            <span
              key={tag}
              className="trust-chip"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <PiCheckBold size={12} color="#ffd54a" /> {tag}
            </span>
          ))}
        </div>
      </PageHero>

      {/* Partner types */}
      <section className="tcn-cp-section">
        <div className="container">
          <div className="tcn-cp-head">
            <span className="eyebrow">Three ways to partner</span>
            <h2>Choose the model that fits your business</h2>
            <p>Whether you sell, refer, or build alongside us — there's a partnership that works.</p>
          </div>

          <div className="tcn-cp-grid-3">
            {PARTNER_TYPES.map((pt) => (
              <div
                key={pt.title}
                className="tcn-cp-card"
                style={{
                  "--card-tint": pt.tint,
                  "--card-tint-soft": `${pt.tint}1a`,
                }}
              >
                <div className="ico">
                  <pt.Icon size={28} />
                </div>
                <h3>{pt.title}</h3>
                <p>{pt.desc}</p>
                <div className="tcn-cp-best">
                  <PiUsersThreeDuotone size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>
                    <strong>Best for:</strong> {pt.best}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="tcn-cp-section alt">
        <div className="container">
          <div className="tcn-cp-head">
            <span className="eyebrow">Partner benefits</span>
            <h2>Everything you need to win deals</h2>
            <p>Real margins, real support, real partnership — not just a referral link.</p>
          </div>

          <div className="tcn-cp-benefits">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="tcn-cp-benefit"
                style={{
                  "--card-tint": b.tint,
                  "--card-tint-soft": `${b.tint}1a`,
                }}
              >
                <span className="ico">
                  <b.Icon size={24} />
                </span>
                <div>
                  <h4>{b.title}</h4>
                  <p>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCta
        eyebrow="Ready to partner?"
        eyebrowIcon={PiHandshakeDuotone}
        title="Let's grow together"
        description="Get in touch and we'll walk you through the program details, margins, and onboarding steps."
        primaryLabel="Apply to partner program"
        primaryTo="/contact"
        secondaryLabel="See pricing"
        secondaryTo="/pricing"
      />
    </div>
  );
}
