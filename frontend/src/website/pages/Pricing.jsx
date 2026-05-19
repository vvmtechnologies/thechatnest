import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiCheckBold,
  PiXBold,
  PiStarFill,
  PiSparkleDuotone,
  PiShieldCheckDuotone,
  PiArrowRightBold,
  PiPlusBold,
  PiCalendarDuotone,
  PiChatTextDuotone,
  PiUsersThreeDuotone,
  PiCloudDuotone,
  PiInfinityDuotone,
} from "react-icons/pi";
import { API_BASE_URL } from "../../config/apiBaseUrl";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import Seo from "../../components/Seo.jsx";
import PricingCalculator from "../components/PricingCalculator.jsx";

const TRUST_BADGES = [
  { label: "AES-256-GCM", icon: "🔒" },
  { label: "SOC 2 Ready", icon: "✅" },
  { label: "GDPR Compliant", icon: "🇪🇺" },
  { label: "99.9% Uptime", icon: "⚡" },
  { label: "24/7 Support", icon: "💚" },
];

const COMPARE_ROWS = [
  // Core messaging — included on every paid plan + trial.
  { feature: "1:1 & group messaging", trial: true, startup: true, basic: true, business: true },
  { feature: "Threads, reactions & replies", trial: true, startup: true, basic: true, business: true },
  { feature: "HD audio & video calls", trial: true, startup: true, basic: true, business: true },
  { feature: "Screen sharing in meetings", trial: true, startup: true, basic: true, business: true },
  // Storage + history
  { feature: "File sharing & storage", trial: "1 GB", startup: "10 GB / user", basic: "50 GB / user", business: "200 GB / user" },
  { feature: "Message history", trial: "14 days", startup: "Unlimited", basic: "Unlimited", business: "Unlimited" },
  // Broadcasts — exclusive lever
  { feature: "Broadcast to multiple groups", trial: false, startup: true, basic: true, business: true },
  { feature: "Broadcast with file attachments", trial: false, startup: true, basic: true, business: true },
  // AI — actually shipped
  { feature: "AI tone adjuster + grammar", trial: false, startup: true, basic: true, business: true },
  { feature: "AI smart compose + replies", trial: false, startup: false, basic: true, business: true },
  { feature: "AI auto-translate (14 languages)", trial: false, startup: false, basic: true, business: true },
  { feature: "AI meeting summaries", trial: false, startup: false, basic: true, business: true },
  // Privacy / security — shipped
  { feature: "Chat lock with PIN", trial: true, startup: true, basic: true, business: true },
  { feature: "Disappearing messages", trial: false, startup: true, basic: true, business: true },
  { feature: "AES-256 encryption at rest", trial: true, startup: true, basic: true, business: true },
  { feature: "Trusted device management", trial: true, startup: true, basic: true, business: true },
  // Admin
  { feature: "Departments & designations", trial: false, startup: false, basic: true, business: true },
  { feature: "Activity log + OTP audit", trial: false, startup: false, basic: true, business: true },
  { feature: "Built-in invoicing (Stripe)", trial: false, startup: true, basic: true, business: true },
  // Roadmap — clearly labelled
  { feature: "SSO / SAML (Okta, Azure AD, Google)", trial: false, startup: false, basic: false, business: "Q2 2026" },
  { feature: "Customer-managed keys (BYOK)", trial: false, startup: false, basic: false, business: "Q2 2026" },
  { feature: "Self-hosted / on-premise", trial: false, startup: false, basic: false, business: "Talk to us" },
  { feature: "Dedicated success manager", trial: false, startup: false, basic: false, business: true },
];

const currencySymbol = (code) => {
  const c = String(code || "INR").toUpperCase();
  if (c === "INR") return "₹";
  if (c === "USD") return "$";
  if (c === "EUR") return "€";
  if (c === "GBP") return "£";
  return c + " ";
};

const taglineFor = (i, total, isFree) => {
  if (isFree) return "Try every paid feature for 14 days";
  if (i === 1) return "Best for solo founders & small teams";
  if (i === total - 1) return "For organizations at scale";
  return "Most teams start here";
};

const planPerks = (plan) => {
  const isFree = Number(plan?.price || 0) === 0;
  const maxUsers = Number(plan?.max_users || 0);
  const storageMb = Number(plan?.max_storage_mb || 0);
  const storageLabel = storageMb >= 1000 ? `${Math.round(storageMb / 1000)} GB` : `${storageMb} MB`;
  const userLabel = maxUsers ? `Up to ${maxUsers.toLocaleString()} users` : "Unlimited users";

  if (isFree) {
    return [
      "All paid features for 14 days",
      `${storageLabel} shared storage`,
      "Email support",
      "Cancel anytime",
    ];
  }
  return [
    userLabel,
    `${storageLabel} storage per user`,
    "Unlimited 1:1 & group chat",
    "HD audio & video calls",
    "AI assistant & file search",
  ];
};

const Pricing = () => {
  const { brandName } = useSiteBranding();
  const [billing, setBilling] = useState("yearly");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!API_BASE_URL) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/plans?limit=50&offset=0`, {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        const payload = await res.json().catch(() => ({}));
        const rows = Array.isArray(payload?.data?.rows) ? payload.data.rows : [];
        const normalized = rows
          .filter((r) => String(r?.status || "").toLowerCase() !== "inactive")
          .sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
        if (!cancelled) setPlans(normalized);
      } catch {
        if (!cancelled) setPlans([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const popularIndex = useMemo(() => {
    if (!plans.length) return -1;
    const paid = plans.filter((p) => Number(p?.price || 0) > 0);
    if (paid.length >= 2) return plans.indexOf(paid[1]);
    if (paid.length === 1) return plans.indexOf(paid[0]);
    return -1;
  }, [plans]);

  const FAQS = useMemo(
    () => [
      { q: "Can I change plans anytime?", a: "Yes. Upgrade or downgrade whenever you like — pro-rated automatically. No long-term contracts or hidden fees." },
      { q: "Is there a free trial?", a: "Every paid plan comes with a 14-day free trial. No credit card required to start. Cancel anytime, no questions asked." },
      { q: "What payment methods do you accept?", a: "All major credit cards, debit cards, and UPI through Stripe. Enterprise plans also support invoicing and bank transfer." },
      { q: "Do you offer a money-back guarantee?", a: `Yes — 30 days. If ${brandName || "TheChatNest"} doesn't fit your team, we'll refund every paisa, no questions asked.` },
      { q: `Can I self-host ${brandName || "TheChatNest"}?`, a: "Absolutely. Self-hosted deployment is included on the Business plan. You get the full deployment bundle and white-glove setup support." },
      { q: "How does per-user billing work?", a: "You're billed only for active seats. Add or remove users mid-cycle and your next invoice is automatically pro-rated." },
    ],
    [brandName]
  );

  return (
    <div className="tcn-pricing">
      <Seo
        title="Pricing"
        description="Simple per-seat pricing that scales with your team. Start free for 14 days — no credit card. Plans from ₹199/seat/month."
        keywords="thechatnest pricing, team chat pricing, slack alternative pricing, per seat pricing"
      />
      <style>{`
        .tcn-pricing { background: #fff; }
        .tcn-pricing-hero {
          background:
            radial-gradient(1200px 600px at 80% -10%, rgba(109,93,252,0.32), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.1), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          padding: 8rem 0 5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .tcn-pricing-hero::before {
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
        .tcn-pricing-hero h1 {
          font-size: clamp(2.4rem, 5vw, 4rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.025em;
          line-height: 1.08;
          margin: 0 auto 1.25rem;
          max-width: 820px;
        }
        .tcn-pricing-hero .gradient-word {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-pricing-hero p.lead {
          font-size: 1.15rem;
          color: rgba(255,255,255,0.7);
          max-width: 620px;
          margin: 0 auto 2.25rem;
          line-height: 1.6;
        }

        /* Launch banner — urgency */
        .tcn-launch-banner {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 0.55rem 1.1rem;
          margin: 0 auto 1.6rem;
          background: linear-gradient(
            90deg,
            rgba(34,197,94,0.14),
            rgba(255,213,74,0.12)
          );
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 999px;
          color: rgba(255,255,255,0.92);
          font-size: 0.82rem;
          line-height: 1.4;
          max-width: 36rem;
          text-align: left;
        }
        .tcn-launch-banner strong { color: #4ade80; font-weight: 700; }
        .tcn-launch-text { display: inline-block; }
        .tcn-launch-dot {
          width: 8px; height: 8px; border-radius: 999px;
          background: #4ade80;
          box-shadow: 0 0 0 0 rgba(74,222,128,0.7);
          animation: tcnLaunchPulse 2s infinite;
          flex-shrink: 0;
        }
        @keyframes tcnLaunchPulse {
          0% { box-shadow: 0 0 0 0 rgba(74,222,128,0.6); }
          70% { box-shadow: 0 0 0 10px rgba(74,222,128,0); }
          100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
        }

        /* Risk-reversal row */
        .tcn-risk-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.55rem;
          margin: -0.5rem auto 2.5rem;
          max-width: 44rem;
        }
        .tcn-risk-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.45rem 0.9rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          color: rgba(255,255,255,0.82);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .tcn-risk-chip svg { color: #ffd54a; flex-shrink: 0; }

        .tcn-toggle-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 3rem;
        }
        .tcn-toggle {
          display: inline-flex;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          padding: 4px;
          backdrop-filter: blur(8px);
        }
        .tcn-toggle button {
          padding: 0.6rem 1.5rem;
          border: none;
          border-radius: 999px;
          background: transparent;
          color: rgba(255,255,255,0.7);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .tcn-toggle button.active {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a;
          box-shadow: 0 4px 14px rgba(255,213,74,0.4);
        }
        .tcn-toggle .save-badge {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff;
          font-size: 0.68rem;
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .tcn-plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
          max-width: 1180px;
          margin: 0 auto;
        }
        .tcn-plan {
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 2rem 1.6rem;
          backdrop-filter: blur(12px);
          color: #fff;
          text-align: left;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }
        .tcn-plan:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.18);
        }
        .tcn-plan.popular {
          background: linear-gradient(180deg, rgba(255,213,74,0.08), rgba(109,93,252,0.06));
          border-color: rgba(255,213,74,0.4);
          transform: translateY(-10px);
          box-shadow: 0 30px 70px rgba(255,213,74,0.18), 0 10px 30px rgba(109,93,252,0.2);
        }
        .tcn-plan.popular:hover {
          transform: translateY(-14px);
        }
        .tcn-plan-badge {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 4px 14px rgba(255,213,74,0.4);
          white-space: nowrap;
        }
        .tcn-plan h3 {
          color: #fff;
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0 0 0.4rem;
        }
        .tcn-plan .tagline {
          color: rgba(255,255,255,0.55);
          font-size: 0.88rem;
          margin: 0 0 1.5rem;
        }
        .tcn-plan .price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 0.5rem;
        }
        .tcn-plan .price-row .currency {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(255,255,255,0.6);
        }
        .tcn-plan .price-row .amount {
          font-size: 2.6rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .tcn-plan .price-row .period {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.55);
        }
        .tcn-plan .billing-note {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 1.5rem;
          min-height: 1.2em;
        }
        .tcn-plan .free-pill {
          display: inline-block;
          padding: 0.3rem 0.7rem;
          background: rgba(34,197,94,0.18);
          color: #4ade80;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          margin-top: 4px;
        }
        .tcn-plan .cta {
          display: block;
          text-align: center;
          padding: 0.85rem 1rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.95rem;
          text-decoration: none;
          margin-bottom: 1.5rem;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }
        .tcn-plan .cta:hover { transform: translateY(-1px); }
        .tcn-plan.popular .cta {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a;
          box-shadow: 0 8px 24px rgba(255,213,74,0.4);
        }
        .tcn-plan:not(.popular) .cta {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.18);
        }
        .tcn-plan:not(.popular) .cta:hover {
          background: rgba(255,255,255,0.16);
        }
        .tcn-plan .perks {
          list-style: none;
          padding: 0;
          margin: 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .tcn-plan .perks li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.88rem;
          color: rgba(255,255,255,0.85);
          line-height: 1.5;
        }
        .tcn-plan .perks .tick {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: rgba(255,213,74,0.18);
          color: #ffd54a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
        }

        /* Trust strip below cards */
        .tcn-trust-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.6rem;
          margin-top: 3rem;
        }
        .tcn-trust-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.45rem 0.95rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.9);
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* Money-back banner */
        .tcn-moneyback {
          padding: 4.5rem 0 2rem;
          background: #fff;
        }
        .tcn-moneyback-card {
          max-width: 920px;
          margin: 0 auto;
          background: linear-gradient(135deg, #f3f1ff 0%, #fff 60%, #fffbeb 100%);
          border: 1px solid rgba(109,93,252,0.18);
          border-radius: 24px;
          padding: 2.25rem 2.5rem;
          display: flex;
          align-items: center;
          gap: 1.75rem;
          flex-wrap: wrap;
          box-shadow: 0 10px 40px rgba(109,93,252,0.08);
        }
        .tcn-moneyback-icon {
          width: 72px;
          height: 72px;
          border-radius: 18px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          flex-shrink: 0;
          box-shadow: 0 8px 24px rgba(34,197,94,0.35);
        }
        .tcn-moneyback-body {
          flex: 1;
          min-width: 240px;
        }
        .tcn-moneyback h3 {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--tcn-ink-900);
          margin: 0 0 0.4rem;
        }
        .tcn-moneyback p {
          color: var(--tcn-ink-500);
          margin: 0;
          font-size: 0.96rem;
          line-height: 1.55;
        }

        /* Comparison table */
        .tcn-compare-section {
          padding: 5rem 0;
          background: linear-gradient(180deg, #fff 0%, #fafbff 100%);
        }
        .tcn-compare-wrap {
          max-width: 1180px;
          margin: 0 auto;
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--tcn-shadow-md);
        }
        .tcn-compare-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.92rem;
        }
        .tcn-compare-table thead th {
          background: #fafbff;
          color: var(--tcn-ink-900);
          padding: 1.25rem 1rem;
          text-align: center;
          font-weight: 700;
          border-bottom: 1px solid var(--tcn-border);
          font-size: 0.95rem;
        }
        .tcn-compare-table thead th:first-child {
          text-align: left;
          padding-left: 1.5rem;
        }
        .tcn-compare-table thead th.highlight {
          background: linear-gradient(180deg, rgba(255,213,74,0.12), rgba(109,93,252,0.06));
          color: #1a1f3a;
          position: relative;
        }
        .tcn-compare-table thead th.highlight::after {
          content: "Popular";
          position: absolute;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.62rem;
          font-weight: 800;
          color: #ffb74d;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .tcn-compare-table tbody td {
          padding: 1rem;
          text-align: center;
          border-bottom: 1px solid #f0f2f7;
          color: var(--tcn-ink-700);
        }
        .tcn-compare-table tbody td:first-child {
          text-align: left;
          padding-left: 1.5rem;
          font-weight: 500;
          color: var(--tcn-ink-900);
        }
        .tcn-compare-table tbody td.highlight {
          background: rgba(255,213,74,0.04);
        }
        .tcn-compare-table tbody tr:last-child td {
          border-bottom: none;
        }
        .tcn-yes {
          display: inline-flex;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: rgba(34,197,94,0.15);
          color: #16a34a;
          align-items: center;
          justify-content: center;
        }
        .tcn-no {
          display: inline-flex;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: #f3f4f8;
          color: #b4bacf;
          align-items: center;
          justify-content: center;
        }

        /* FAQ */
        .tcn-faq-section {
          padding: 5rem 0;
          background: #fff;
        }
        .tcn-faq-list {
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .tcn-faq-item {
          background: #fff;
          border: 1.5px solid var(--tcn-border);
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .tcn-faq-item.open {
          border-color: var(--tcn-violet-500);
          box-shadow: 0 10px 30px rgba(109,93,252,0.12);
        }
        .tcn-faq-q {
          width: 100%;
          background: transparent;
          border: none;
          padding: 1.1rem 1.4rem;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          cursor: pointer;
          font-weight: 700;
          font-size: 1rem;
          color: var(--tcn-ink-900);
          font-family: inherit;
        }
        .tcn-faq-plus {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: #f3f4f8;
          color: var(--tcn-ink-500);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .tcn-faq-item.open .tcn-faq-plus {
          background: var(--tcn-violet-600);
          color: #fff;
          transform: rotate(45deg);
        }
        .tcn-faq-a {
          padding: 0 1.4rem 1.25rem;
          color: var(--tcn-ink-500);
          font-size: 0.94rem;
          line-height: 1.65;
        }

        /* Final CTA */
        .tcn-final-cta {
          padding: 5rem 0;
        }
        .tcn-final-cta-inner {
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
        .tcn-final-cta-inner::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(600px 300px at 20% 0%, rgba(255,213,74,0.2), transparent 60%),
            radial-gradient(600px 300px at 80% 100%, rgba(109,93,252,0.3), transparent 60%);
          pointer-events: none;
        }
        .tcn-final-cta-inner > * { position: relative; z-index: 1; }
        .tcn-final-cta h2 {
          color: #fff;
          font-size: clamp(1.8rem, 3.5vw, 2.6rem);
          font-weight: 800;
          margin: 0 0 1rem;
          letter-spacing: -0.02em;
        }
        .tcn-final-cta p {
          color: rgba(255,255,255,0.7);
          font-size: 1.05rem;
          max-width: 580px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }
        .tcn-final-cta .actions {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-final-cta .btn-primary {
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
        .tcn-final-cta .btn-primary:hover { transform: translateY(-2px); color: #1a1f3a !important; }
        .tcn-final-cta .btn-ghost {
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
        .tcn-final-cta .btn-ghost:hover { color: #fff !important; }

        @media (max-width: 900px) {
          .tcn-compare-table { font-size: 0.82rem; }
          .tcn-compare-table thead th, .tcn-compare-table tbody td { padding: 0.7rem 0.5rem; }
          .tcn-plan.popular { transform: none; }
          .tcn-final-cta-inner { padding: 3rem 1.5rem; }
        }
      `}</style>

      {/* ─── Hero + Plans (combined dark section) ─────────── */}
      <section className="tcn-pricing-hero">
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          {/* Launch pricing banner — urgency without dishonesty */}
          <div className="tcn-launch-banner" role="status">
            <span className="tcn-launch-dot" aria-hidden />
            <span className="tcn-launch-text">
              <strong>Founding-member pricing</strong> — lock in
              today's rate for 12 months. Prices rise when we hit
              500 paid seats.
            </span>
          </div>

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
            Pricing
          </span>

          <h1>
            Pricing that <span className="gradient-word">grows with you</span>
          </h1>
          <p className="lead">
            Start free for 14 days — no credit card required. Switch between monthly and yearly anytime.
            Per-user billing, no hidden fees, cancel whenever.
          </p>

          {/* Risk-reversal row — kills the 3 most common objections */}
          <div className="tcn-risk-row">
            <span className="tcn-risk-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
              No credit card to start
            </span>
            <span className="tcn-risk-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 12a9 9 0 109-9"/><path d="M3 12h6"/></svg>
              Cancel any time
            </span>
            <span className="tcn-risk-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 2v20M2 12h20"/></svg>
              30-day money back
            </span>
            <span className="tcn-risk-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              GST invoice included
            </span>
          </div>

          <div className="tcn-toggle-wrap">
            <div className="tcn-toggle">
              <button
                className={billing === "monthly" ? "active" : ""}
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </button>
              <button
                className={billing === "yearly" ? "active" : ""}
                onClick={() => setBilling("yearly")}
              >
                Yearly <span className="save-badge">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Plans grid */}
          {loading && !plans.length ? (
            <div className="tcn-plans-grid" aria-busy="true" aria-label="Loading plans">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="tcn-plan"
                  style={{
                    pointerEvents: "none",
                    background: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="tcn-skeleton" style={{ height: 20, width: "55%", marginBottom: 12 }} />
                  <div className="tcn-skeleton" style={{ height: 12, width: "70%", marginBottom: 22 }} />
                  <div className="tcn-skeleton" style={{ height: 38, width: "55%", marginBottom: 8 }} />
                  <div className="tcn-skeleton" style={{ height: 12, width: "85%", marginBottom: 22 }} />
                  <div className="tcn-skeleton" style={{ height: 38, width: "100%", borderRadius: 999, marginBottom: 18 }} />
                  {[0, 1, 2, 3].map((j) => (
                    <div key={j} className="tcn-skeleton" style={{ height: 10, width: `${85 - j * 8}%`, marginBottom: 10 }} />
                  ))}
                </div>
              ))}
            </div>
          ) : !plans.length ? (
            <div style={{ color: "rgba(255,255,255,0.6)", padding: "2rem 0" }}>Plans coming soon.</div>
          ) : (
            <div className="tcn-plans-grid">
              {plans.map((plan, i) => {
                const monthly = Number(plan?.price || 0);
                const yearlyFull = monthly * 12;
                const yearlyDiscount = Math.round(yearlyFull * 0.8);
                const displayPrice = billing === "yearly" ? Math.round(yearlyDiscount / 12) : monthly;
                const isPopular = i === popularIndex;
                const isFree = monthly === 0;
                const sym = currencySymbol(plan?.default_currency);
                const perks = planPerks(plan);

                return (
                  <div key={plan?.plan_id || i} className={`tcn-plan ${isPopular ? "popular" : ""}`}>
                    {isPopular && (
                      <div className="tcn-plan-badge">
                        <PiStarFill size={11} /> Most popular
                      </div>
                    )}

                    <h3>{plan?.plan_name || plan?.plan_key || "Plan"}</h3>
                    <p className="tagline">{taglineFor(i, plans.length, isFree)}</p>

                    {isFree ? (
                      <>
                        <div className="price-row">
                          <span className="amount">Free</span>
                        </div>
                        <div className="billing-note">
                          <span className="free-pill">No credit card</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="price-row">
                          <span className="currency">{sym}</span>
                          <span className="amount">{displayPrice.toLocaleString()}</span>
                          <span className="period">/user/mo</span>
                        </div>
                        <div className="billing-note">
                          {billing === "yearly"
                            ? `Billed ${sym}${yearlyDiscount.toLocaleString()}/yr — save ${sym}${(yearlyFull - yearlyDiscount).toLocaleString()}`
                            : `${sym}${monthly.toLocaleString()} billed every ${plan?.interval_days || 30} days`}
                        </div>
                      </>
                    )}

                    <Link
                      to={isFree ? "/auth/register" : `/auth/register?plan=${plan?.plan_key || plan?.plan_id}`}
                      className="cta"
                    >
                      {isFree ? "Get started free" : "Start 14-day trial"}
                    </Link>

                    <ul className="perks">
                      {perks.map((perk, idx) => (
                        <li key={idx}>
                          <span className="tick">
                            <PiCheckBold size={11} strokeWidth={3} />
                          </span>
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Trust strip */}
          <div className="tcn-trust-row">
            {TRUST_BADGES.map((t) => (
              <span key={t.label} className="tcn-trust-chip">
                <span>{t.icon}</span> {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Money-back ────────────────────────────────────── */}
      <section className="tcn-moneyback">
        <div className="container">
          <div className="tcn-moneyback-card">
            <div className="tcn-moneyback-icon">
              <PiShieldCheckDuotone size={36} />
            </div>
            <div className="tcn-moneyback-body">
              <h3>30-day money-back guarantee</h3>
              <p>
                Try {brandName || "TheChatNest"} risk-free. If it doesn't fit your team in the first 30 days, we'll refund every paisa — no forms, no awkward calls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Savings calculator (currency + team-size slider + ROI) ── */}
      <PricingCalculator />

      {/* ─── Comparison table ─────────────────────────────── */}
      <section className="tcn-compare-section">
        <div className="container">
          <div className="section-title" style={{ textAlign: "center" }}>
            <span className="eyebrow">Compare plans</span>
            <h2 style={{ marginTop: "1rem", textAlign: "center" }}>What's included on each plan</h2>
            <p style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>
              Every plan includes core chat, calls, and file sharing. Upgrade for more users, storage, AI, and enterprise controls.
            </p>
          </div>

          <div className="tcn-compare-wrap">
            <table className="tcn-compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Trial</th>
                  <th>Startup</th>
                  <th className="highlight">Basic</th>
                  <th>Business</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td>{row.feature}</td>
                    <td>{renderCell(row.trial)}</td>
                    <td>{renderCell(row.startup)}</td>
                    <td className="highlight">{renderCell(row.basic)}</td>
                    <td>{renderCell(row.business)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <section className="tcn-faq-section">
        <div className="container">
          <div className="section-title" style={{ textAlign: "center" }}>
            <span className="eyebrow">FAQ</span>
            <h2 style={{ marginTop: "1rem", textAlign: "center" }}>Questions, answered</h2>
            <p style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>
              Everything you need to know before you sign up.
            </p>
          </div>

          <div className="tcn-faq-list">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className={`tcn-faq-item ${isOpen ? "open" : ""}`}>
                  <button className="tcn-faq-q" onClick={() => setOpenFaq(isOpen ? -1 : i)}>
                    <span>{faq.q}</span>
                    <span className="tcn-faq-plus">
                      <PiPlusBold size={14} />
                    </span>
                  </button>
                  {isOpen && <div className="tcn-faq-a">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────── */}
      <section className="tcn-final-cta">
        <div className="container">
          <div className="tcn-final-cta-inner">
            <h2>Ready to bring your team together?</h2>
            <p>
              Start your free 14-day trial — no credit card required. Up and running in two minutes.
            </p>
            <div className="actions">
              <Link to="/auth/register" className="btn-primary">
                Start free trial <PiArrowRightBold size={16} />
              </Link>
              <Link to="/demo" className="btn-ghost">
                <PiCalendarDuotone size={18} /> Book a demo
              </Link>
              <Link to="/help" className="btn-ghost">
                <PiChatTextDuotone size={18} /> Chat with us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const renderCell = (value) => {
  if (value === true) return <span className="tcn-yes"><PiCheckBold size={13} strokeWidth={3} /></span>;
  if (value === false) return <span className="tcn-no"><PiXBold size={12} strokeWidth={3} /></span>;
  return <span style={{ fontWeight: 600, color: "var(--tcn-ink-900)" }}>{value}</span>;
};

export default Pricing;
