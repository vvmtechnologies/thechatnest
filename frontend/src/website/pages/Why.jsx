import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PiSparkleDuotone,
  PiCompassDuotone,
  PiLockKeyDuotone,
  PiUsersThreeDuotone,
  PiLightningDuotone,
  PiArrowRightBold,
  PiQuotesDuotone,
  PiPlantDuotone,
  PiSignatureDuotone,
  PiHandshakeDuotone,
  PiShieldCheckDuotone,
  PiHeartDuotone,
  PiXBold,
  PiCheckBold,
  PiCalculatorDuotone,
  PiMapPinDuotone,
  PiPlusBold,
  PiMinusBold,
  PiCurrencyInrDuotone,
  PiCaretDownBold,
  PiPaperPlaneTiltDuotone,
  PiRobotDuotone,
  PiCloudDuotone,
} from "react-icons/pi";
import Seo from "../../components/Seo.jsx";

// ─── Core values ─────────────────────────────────────────────────────
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

// ─── Story timeline ──────────────────────────────────────────────────
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
    body: "Opening the doors. 14-day free trial, ₹199/seat, no credit card. The big names still don't ship 33 of the things we do. Let's see who's listening.",
  },
];

// ─── Concrete promises ───────────────────────────────────────────────
const PROMISES = [
  {
    Icon: PiHandshakeDuotone,
    title: "No price hikes for 24 months",
    body: "Sign up today at ₹199/seat — we won't raise your price for 2 full years. Locked in writing on your invoice. Period.",
    tint: "#16a34a",
  },
  {
    Icon: PiShieldCheckDuotone,
    title: "Your data is exportable, always",
    body: "One click to download every message, file, and audit log as a portable ZIP. No 'enterprise tier' wall. No support ticket required.",
    tint: "#2065D1",
  },
  {
    Icon: PiHeartDuotone,
    title: "30-day no-questions refund",
    body: "Doesn't fit your team? Email billing@thechatnest.com within 30 days. We refund every paisa. No exit interview, no awkward call.",
    tint: "#dc2626",
  },
];

// ─── Anti-features (what we DON'T do) ────────────────────────────────
const WONT_DO = [
  "Sell your message data to advertisers or train AI on it",
  "Lock essential features (audit logs, exports, search) behind enterprise tiers",
  "Charge per seat extra for video calls or file storage",
  "Bury a 'free' plan behind 47 nag dialogs and feature limits",
  "Auto-renew without a 14-day reminder email",
  "Make you talk to sales before you can see the actual product",
  "Track your usage to upsell you within the app",
  "Require a third-party authenticator app to log in (we have biometric + QR)",
];

// ─── Math vs Slack ───────────────────────────────────────────────────
const MATH = [
  { label: "Slack Business+",       us: false, value: "₹700/seat/mo",  sub: "Pro tier with audit logs" },
  { label: "+ Zoom Pro",            us: false, value: "₹1,200/host",   sub: "For meetings >40min" },
  { label: "+ Otter.ai",            us: false, value: "₹830/user",     sub: "For call transcripts" },
  { label: "+ Notion AI",           us: false, value: "₹830/user",     sub: "For AI writing assist" },
  { label: "Slack stack total",     us: false, value: "≈ ₹3,560/user", sub: "for a 50-person team", total: true },
  { label: "TheChatNest Standard",  us: true,  value: "₹199/user",     sub: "Everything above, native", total: true },
  { label: "What you save",         us: "save", value: "₹3,361/user/mo", sub: "₹20.2 lakh/year for a 50-person team", total: true },
];

// ─── FAQ accordion ───────────────────────────────────────────────────
const FAQS = [
  {
    q: "Why should I trust a brand-new product with my team's chat?",
    a: "Honest answer — we're early, and we say so plainly. We don't fake SOC 2 badges. We don't claim 99.99% uptime. What we do offer: our 30-day refund, full data export at any time, and a roadmap we update publicly. If we ever go away, you walk away with your data intact. That's a fair trade for a 50% lower bill than Slack.",
  },
  {
    q: "Are you really cheaper than Slack — or just for the first year?",
    a: "Permanent. Our pricing is anchored at ₹199/seat. We've signed a public commitment to not raise prices for 24 months for any customer who signs up before launch. Even if we do raise prices later, existing customers stay grandfathered for life.",
  },
  {
    q: "What happens to my data if you shut down?",
    a: "Two layers of protection. First, every customer has self-service data export — one click, all messages and files. Second, we publish daily encrypted backups to our customers on Enterprise plans (and on request for Standard). If we ever wind down, you get a 90-day notice and a final export. We've put this in our refund policy in writing.",
  },
  {
    q: "Why not just stay on Slack / Teams?",
    a: "If your bill is under ₹50k/month and the AI you're paying for actually works, stay. We're not for everyone. We're for teams who've hit the wall where the per-seat cost stops making sense — usually 25-50 people — and where adding Otter, Loom, and Zoom on top of Slack starts feeling absurd. If that's you, we're worth a 14-day trial.",
  },
  {
    q: "Self-hosted — actually possible, or marketing fluff?",
    a: "Possible, but not turn-key yet. Today we offer it as a custom contract for teams paying ₹10 lakh+/year — we run the cluster on your AWS / Azure / GCP account. A fully-automated self-host installer is on the roadmap for Q4 2026. We won't claim it's GA until it's actually one command.",
  },
  {
    q: "Who's behind this?",
    a: "A small team in Bengaluru. Engineers and designers who've spent careers in messaging — including stints at companies you've probably used. We're not VC-funded, we're not chasing a billion-dollar exit. We want to build a profitable, useful product and answer support tickets ourselves. Old-school.",
  },
];

const DIFFERENT = [
  { num: "33", label: "features Slack / Teams / Troop don't ship" },
  { num: "₹199", label: "per seat / month — half the price of Slack" },
  { num: "0", label: "rows of data we've ever sold" },
  { num: "100%", label: "of our team uses it every day" },
];

const Why = () => {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="tcn-why">
      <Seo
        title="Why TheChatNest"
        description="Vision, values, founder note, what we'll never do, and the honest math vs Slack. Why we built TheChatNest — and why teams are switching."
        keywords="thechatnest mission, founder note, why thechatnest, company values, vision, slack alternative"
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "Why TheChatNest", to: "/why-thechatnest" },
        ]}
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
          margin: 0 auto 2rem;
        }
        .tcn-why-hero-quick {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 2rem;
        }
        .tcn-why-hero-quick a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 0.95rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.85) !important;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-decoration: none !important;
          backdrop-filter: blur(8px);
          transition: all 0.18s ease;
        }
        .tcn-why-hero-quick a:hover {
          background: rgba(255,213,74,0.14);
          border-color: rgba(255,213,74,0.4);
          color: #ffd54a !important;
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

        /* ── Section common ── */
        .tcn-why-section { padding: 5rem 0; border-top: 1px solid rgba(15,23,42,0.08); }
        .tcn-why-section-head { text-align: center; max-width: 700px; margin: 0 auto 3rem; }
        .tcn-why-section-head .tag {
          display: inline-block;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #2065D1;
          margin-bottom: 1rem;
        }
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
          font-size: 1.05rem;
          line-height: 1.6;
          margin: 0;
        }

        /* ── Values grid ── */
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

        /* ── Promises (signed commitments) ── */
        .tcn-why-promises {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
        }
        .tcn-why-promise {
          padding: 2rem 1.85rem;
          border-radius: 22px;
          background: linear-gradient(180deg, #fff 0%, var(--tint-bg) 100%);
          border: 1.5px solid var(--tint-border);
          position: relative;
          overflow: hidden;
        }
        .tcn-why-promise::after {
          content: "SIGNED";
          position: absolute;
          top: 14px;
          right: 14px;
          padding: 3px 10px;
          border-radius: 4px;
          background: var(--tint);
          color: #fff;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
        }
        .tcn-why-promise .ic {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: var(--tint);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          box-shadow: 0 8px 20px var(--tint-shadow);
        }
        .tcn-why-promise h3 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: 1.4rem;
          letter-spacing: -0.01em;
          line-height: 1.2;
          margin: 0 0 0.65rem;
          color: #0b0f1e;
        }
        .tcn-why-promise p {
          color: rgba(15,23,42,0.7);
          font-size: 0.96rem;
          line-height: 1.6;
          margin: 0;
        }

        /* ── Anti-features ── */
        .tcn-why-wont-do {
          max-width: 880px;
          margin: 0 auto;
          padding: 2.5rem 2.5rem 2.25rem;
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          border-radius: 24px;
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .tcn-why-wont-do::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(600px 300px at 90% 0%, rgba(239,68,68,0.2), transparent 60%),
            radial-gradient(500px 300px at 10% 100%, rgba(255,213,74,0.08), transparent 60%);
          pointer-events: none;
        }
        .tcn-why-wont-do > * { position: relative; z-index: 1; }
        .tcn-why-wont-do h3 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(1.5rem, 2.5vw, 2rem);
          letter-spacing: -0.01em;
          color: #fff;
          margin: 0 0 0.6rem;
        }
        .tcn-why-wont-do h3 em { font-style: italic; color: #fda4af; }
        .tcn-why-wont-do .sub {
          color: rgba(255,255,255,0.62);
          font-size: 0.96rem;
          margin: 0 0 2rem;
          line-height: 1.55;
        }
        .tcn-why-wont-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 0.7rem;
        }
        .tcn-why-wont-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 0.85rem 1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(239,68,68,0.18);
          border-radius: 10px;
          color: rgba(255,255,255,0.85);
          font-size: 0.93rem;
          line-height: 1.5;
        }
        .tcn-why-wont-item .x {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(239,68,68,0.18);
          color: #fca5a5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }

        /* ── The Math ── */
        .tcn-why-math {
          max-width: 760px;
          margin: 0 auto;
        }
        .tcn-why-math-table {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(15,23,42,0.06);
        }
        .tcn-why-math-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          padding: 1.1rem 1.5rem;
          align-items: center;
          border-bottom: 1px solid rgba(15,23,42,0.06);
        }
        .tcn-why-math-row:last-child { border-bottom: 0; }
        .tcn-why-math-row.total {
          background: rgba(15,23,42,0.03);
          padding: 1.3rem 1.5rem;
        }
        .tcn-why-math-row.us {
          background: linear-gradient(135deg, rgba(32,101,209,0.06), rgba(109,93,252,0.04));
        }
        .tcn-why-math-row.save {
          background: linear-gradient(135deg, rgba(22,163,74,0.1), rgba(255,213,74,0.06));
          border-top: 2px solid rgba(22,163,74,0.3);
        }
        .tcn-why-math-row .label {
          font-weight: 600;
          color: #0b0f1e;
          font-size: 0.98rem;
        }
        .tcn-why-math-row.total .label { font-weight: 800; }
        .tcn-why-math-row .sub {
          font-size: 0.8rem;
          color: rgba(15,23,42,0.55);
          margin-top: 3px;
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.02em;
        }
        .tcn-why-math-row .value {
          font-family: "JetBrains Mono", monospace;
          font-weight: 800;
          font-size: 1.05rem;
          color: #0b0f1e;
          white-space: nowrap;
        }
        .tcn-why-math-row.us .value { color: #2065D1; }
        .tcn-why-math-row.save .value {
          color: #16a34a;
          font-size: 1.25rem;
        }
        .tcn-why-math-row .mark {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
        }
        .tcn-why-math-row .mark.no  { background: rgba(239,68,68,0.14); color: #dc2626; }
        .tcn-why-math-row .mark.yes { background: rgba(22,163,74,0.16); color: #16a34a; }

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

        /* ── Geo / Made-in-India ── */
        .tcn-why-geo {
          max-width: 880px;
          margin: 0 auto;
          padding: 2.5rem 2.5rem;
          background:
            linear-gradient(135deg, rgba(255,153,51,0.04), rgba(19,136,8,0.04)),
            #fff;
          border: 1px solid rgba(15,23,42,0.1);
          border-radius: 22px;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1.85rem;
          align-items: center;
        }
        .tcn-why-geo-flag {
          width: 84px;
          height: 84px;
          border-radius: 18px;
          background: linear-gradient(180deg, #ff9933 0%, #ff9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%, #138808 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 12px 28px rgba(15,23,42,0.12);
          position: relative;
        }
        .tcn-why-geo-flag::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background-image: radial-gradient(circle, rgba(0,0,128,0.4) 0%, transparent 22%);
        }
        .tcn-why-geo-content h3 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: 1.5rem;
          letter-spacing: -0.01em;
          line-height: 1.25;
          margin: 0 0 0.5rem;
          color: #0b0f1e;
        }
        .tcn-why-geo-content h3 em {
          font-style: italic;
          color: #138808;
        }
        .tcn-why-geo-content p {
          color: rgba(15,23,42,0.7);
          font-size: 0.96rem;
          line-height: 1.65;
          margin: 0 0 0.85rem;
        }
        .tcn-why-geo-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .tcn-why-geo-tags span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 11px;
          border-radius: 999px;
          background: rgba(19,136,8,0.08);
          color: #138808;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
        }
        @media (max-width: 640px) {
          .tcn-why-geo { grid-template-columns: 1fr; text-align: center; }
          .tcn-why-geo-flag { margin: 0 auto; }
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
        .tcn-why-founder .pullout {
          padding: 1.1rem 1.25rem;
          margin: 1.25rem 0;
          background: rgba(255,213,74,0.08);
          border-left: 3px solid #ffd54a;
          border-radius: 0 12px 12px 0;
          font-family: "Fraunces", Georgia, serif;
          font-style: italic;
          font-size: 1.08rem;
          line-height: 1.5;
          color: #0b0f1e;
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
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2065D1, #1242a3);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tcn-why-founder .sign-meta strong {
          display: block;
          font-weight: 800;
          color: #0b0f1e;
          font-size: 1rem;
        }
        .tcn-why-founder .sign-meta span {
          color: rgba(15,23,42,0.55);
          font-size: 0.82rem;
        }
        .tcn-why-founder .sign-scribble {
          margin-left: auto;
          color: rgba(15,23,42,0.4);
          font-family: "Fraunces", Georgia, serif;
          font-style: italic;
          font-size: 1.6rem;
          font-weight: 500;
        }

        /* ── FAQ accordion ── */
        .tcn-why-faqs {
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .tcn-why-faq {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.1);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.18s ease;
        }
        .tcn-why-faq.open { border-color: #2065D1; box-shadow: 0 12px 30px rgba(32,101,209,0.08); }
        .tcn-why-faq button {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          width: 100%;
          cursor: pointer;
          font-family: inherit;
          font-weight: 700;
          font-size: 1rem;
          color: #0b0f1e;
          letter-spacing: -0.005em;
          line-height: 1.4;
        }
        .tcn-why-faq button:hover { color: #2065D1; }
        .tcn-why-faq .caret {
          flex-shrink: 0;
          color: rgba(15,23,42,0.5);
          transition: transform 0.2s ease;
        }
        .tcn-why-faq.open .caret { transform: rotate(180deg); color: #2065D1; }
        .tcn-why-faq .body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.32s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .tcn-why-faq.open .body { max-height: 500px; }
        .tcn-why-faq .body-inner {
          padding: 0 1.5rem 1.4rem;
          color: rgba(15,23,42,0.72);
          font-size: 0.95rem;
          line-height: 1.7;
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

      {/* ─── Hero ── */}
      <section className="tcn-why-hero">
        <div className="container">
          <span className="tcn-why-eyebrow">
            <PiSparkleDuotone size={12} /> The honest version
          </span>
          <h1>
            We didn't build a Slack clone. <em>We built what we wished existed.</em>
          </h1>
          <p className="lede">
            Why TheChatNest exists, what we believe, the math vs Slack, what we'll
            <em style={{ fontStyle: "italic", color: "#fff" }}> never </em>
            do, and how a 30-person team paying ₹2.4 lakh a year for messaging decided to fix it themselves.
          </p>
          <div className="tcn-why-hero-quick">
            <a href="#values">↓ Values</a>
            <a href="#promises">↓ Our promises</a>
            <a href="#math">↓ The math</a>
            <a href="#wont-do">↓ What we won't do</a>
            <a href="#story">↓ Story</a>
            <a href="#faq">↓ FAQ</a>
          </div>
        </div>
      </section>

      {/* ─── Pull quote ── */}
      <section className="tcn-why-pullquote">
        <div className="markwrap"><PiQuotesDuotone size={48} /></div>
        <blockquote>
          The best team chat <em>shouldn't cost more</em> than the work it carries.
        </blockquote>
        <cite>— Our north star, written on day one</cite>
      </section>

      {/* ─── Values ── */}
      <section className="tcn-why-section" id="values">
        <div className="container">
          <div className="tcn-why-section-head">
            <span className="tag">Chapter 01</span>
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

      {/* ─── Promises (signed commitments) ── */}
      <section className="tcn-why-section" id="promises">
        <div className="container">
          <div className="tcn-why-section-head">
            <span className="tag">Chapter 02</span>
            <h2>Three promises, <em>signed</em>.</h2>
            <p>
              Not features. Commitments. Written into your invoice, our refund policy, and the way the product is built.
            </p>
          </div>
          <div className="tcn-why-promises">
            {PROMISES.map((p) => (
              <article
                key={p.title}
                className="tcn-why-promise"
                style={{
                  "--tint": p.tint,
                  "--tint-bg": `${p.tint}08`,
                  "--tint-border": `${p.tint}33`,
                  "--tint-shadow": `${p.tint}40`,
                }}
              >
                <div className="ic"><p.Icon size={26} /></div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── The math ── */}
      <section className="tcn-why-section" id="math">
        <div className="container">
          <div className="tcn-why-section-head">
            <span className="tag">Chapter 03</span>
            <h2>The <em>actual math</em> vs the Slack stack.</h2>
            <p>
              Slack on its own looks affordable. Slack + Zoom + Otter + Notion AI — the real cost of a working setup — is a different number.
            </p>
          </div>

          <div className="tcn-why-math">
            <div className="tcn-why-math-table">
              {MATH.map((m) => (
                <div
                  key={m.label}
                  className={`tcn-why-math-row ${m.total ? "total" : ""} ${m.us === true ? "us" : ""} ${m.us === "save" ? "save" : ""}`}
                >
                  <div>
                    <div className="label">
                      <span className={`mark ${m.us === false ? "no" : "yes"}`}>
                        {m.us === false ? <PiXBold size={10} /> : <PiCheckBold size={10} />}
                      </span>
                      {m.label}
                    </div>
                    {m.sub && <div className="sub">{m.sub}</div>}
                  </div>
                  <div className="value">{m.value}</div>
                </div>
              ))}
            </div>

            <p style={{
              marginTop: "1.25rem",
              color: "rgba(15,23,42,0.55)",
              fontSize: "0.85rem",
              textAlign: "center",
              fontStyle: "italic",
              fontFamily: '"Fraunces", Georgia, serif',
            }}>
              List prices in INR as of May 2026. Your mileage may vary, but it's never less than the Slack column.
            </p>
          </div>
        </div>
      </section>

      {/* ─── What we won't do ── */}
      <section className="tcn-why-section" id="wont-do">
        <div className="container">
          <div className="tcn-why-section-head">
            <span className="tag" style={{ color: "#dc2626" }}>Chapter 04</span>
            <h2>The eight things we <em style={{ color: "#dc2626" }}>won't do</em>.</h2>
            <p>
              Most companies tell you what they will do. We think the more useful list is what we'll never do — even when it would make us more money.
            </p>
          </div>

          <div className="tcn-why-wont-do">
            <h3>
              Promises framed in the <em>negative</em>.
            </h3>
            <p className="sub">
              If we ever break one of these, email us with the screenshot. We'll either fix it or refund your year.
            </p>
            <div className="tcn-why-wont-list">
              {WONT_DO.map((item, i) => (
                <div key={i} className="tcn-why-wont-item">
                  <span className="x"><PiXBold size={11} /></span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Story ── */}
      <section className="tcn-why-section" id="story">
        <div className="container">
          <div className="tcn-why-section-head">
            <span className="tag">Chapter 05</span>
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

      {/* ─── Stats ── */}
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

      {/* ─── Geo / Made in India ── */}
      <section className="tcn-why-section">
        <div className="container">
          <div className="tcn-why-section-head">
            <span className="tag">Chapter 06</span>
            <h2>Built in <em>Bengaluru</em>, for teams everywhere.</h2>
            <p>
              We're proudly Indian and globally engineered. Data centers in Mumbai keep your messages fast at home. The product is built to a global standard, in our local idiom.
            </p>
          </div>

          <div className="tcn-why-geo">
            <div className="tcn-why-geo-flag" aria-hidden />
            <div className="tcn-why-geo-content">
              <h3>
                Built in India. <em>Built right.</em>
              </h3>
              <p>
                Founded and operated from Bengaluru. Our team understands Indian SMBs — GST invoices, INR pricing, Hindi support, UPI checkout — out of the box. We also ship to teams from Berlin to São Paulo, because good software shouldn't care where you're from.
              </p>
              <div className="tcn-why-geo-tags">
                <span><PiMapPinDuotone size={9} /> BENGALURU HQ</span>
                <span><PiCloudDuotone size={9} /> MUMBAI DC</span>
                <span><PiCurrencyInrDuotone size={9} /> INR + USD + EUR + GBP</span>
                <span><PiRobotDuotone size={9} /> ENGLISH + HINDI + HINGLISH</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Founder note ── */}
      <section className="tcn-why-founder" id="founder">
        <div className="container">
          <div className="tcn-why-founder-card">
            <div className="tcn-why-founder-eyebrow">
              <PiSignatureDuotone size={11} /> Founder note
            </div>
            <h3>
              If you're sick of paying for chat that nickel-and-dimes you for the basics, we made this for you.
            </h3>
            <p>
              I've been on teams that pay ₹10,000 a month just to send video. Teams that pay for chat, pay for calls, pay for meeting transcripts, pay for AI summaries — and then someone still pastes a Google Doc link because the search couldn't find last week's spec.
            </p>
            <p>
              TheChatNest is the version we wanted: one workspace, encrypted by default, AI you don't have to bolt on, a price that doesn't make you wince.
            </p>

            <div className="pullout">
              We're early — no SOC 2 sticker yet, our roadmap is still long — but the foundations are honest, and so is our list of what's shipped vs. what's planned.
            </div>

            <p>
              Every feature is there because we actually used it on Monday. Every line in our marketing has a "would this stand up in a customer call" filter on it. We don't have a sales team yet — when you email us, an engineer answers.
            </p>
            <p>
              You're not just buying software. You're betting on a team that will use what they sell, listen when it breaks, and ship the fix before the calendar week ends. That's the whole pitch.
            </p>

            <div className="sign">
              <div className="sign-ic"><PiPlantDuotone size={22} /></div>
              <div className="sign-meta">
                <strong>The TheChatNest team</strong>
                <span>Bengaluru · Building since 2025</span>
              </div>
              <div className="sign-scribble">— team@thechatnest</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ── */}
      <section className="tcn-why-section" id="faq">
        <div className="container">
          <div className="tcn-why-section-head">
            <span className="tag">Chapter 07</span>
            <h2>Questions we get <em>every week</em>.</h2>
            <p>
              The skeptical ones. Answered honestly, not by a sales team — by the people who actually build the thing.
            </p>
          </div>

          <div className="tcn-why-faqs">
            {FAQS.map((f, i) => (
              <div key={f.q} className={`tcn-why-faq ${openFaq === i ? "open" : ""}`}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{f.q}</span>
                  <PiCaretDownBold size={16} className="caret" />
                </button>
                <div className="body">
                  <div className="body-inner">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ── */}
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
