import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiCheckCircleDuotone,
  PiXCircleDuotone,
  PiSparkleDuotone,
  PiArrowRightBold,
  PiLightningDuotone,
  PiCrownDuotone,
  PiTrophyDuotone,
  PiShieldCheckDuotone,
  PiMegaphoneDuotone,
  PiChatTeardropDotsDuotone,
  PiUserSoundDuotone,
  PiRobotDuotone,
  PiLockKeyDuotone,
  PiDeviceMobileSpeakerDuotone,
  PiBrowsersDuotone,
  PiClockCountdownDuotone,
  PiHandTapDuotone,
  PiFingerprintDuotone,
  PiQrCodeDuotone,
  PiPaletteDuotone,
  PiCreditCardDuotone,
  PiCloudDuotone,
  PiUsersThreeDuotone,
  PiPaperPlaneTiltDuotone,
  PiFastForwardDuotone,
  PiPhoneSlashDuotone,
  PiBookOpenDuotone,
  PiBackspaceDuotone,
  PiUserCirclePlusDuotone,
  PiMagnifyingGlassDuotone,
  PiXBold,
} from "react-icons/pi";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import Seo from "../../components/Seo.jsx";

// ─── Features that set TheChatNest apart ──────────────────────────────
// Each entry is either fully exclusive (none of Slack/Teams/Troop ship it)
// or strongly differentiated (at most one competitor has a partial / paid
// implementation). Sourced from the full 102-feature comparison matrix.
const EXCLUSIVE = [
  // Messaging (6)
  {
    title: "Broadcast to Groups",
    desc: "Send one message to many groups simultaneously — one click, hundreds of teams informed.",
    category: "Messaging",
    Icon: PiMegaphoneDuotone,
    tint: "#2065D1",
  },
  {
    title: "Broadcast with File Attachments",
    desc: "Broadcast announcements with PDFs, images, or any file attached. Slack & Teams cap you at text-only.",
    category: "Messaging",
    Icon: PiPaperPlaneTiltDuotone,
    tint: "#2065D1",
  },
  {
    title: "Disappearing Messages",
    desc: "Auto-delete messages after a chosen timer. Built-in privacy without third-party add-ons.",
    category: "Messaging",
    Icon: PiClockCountdownDuotone,
    tint: "#2065D1",
  },
  {
    title: "Voice-to-Text Transcription",
    desc: "Every voice message and recording transcribed automatically — searchable, scannable, accessible.",
    category: "Messaging",
    Icon: PiUserSoundDuotone,
    tint: "#2065D1",
  },
  {
    title: "Forward to Multiple Contacts",
    desc: "Forward any message to multiple contacts in one action. Slack & Teams force you one-by-one.",
    category: "Messaging",
    Icon: PiPaperPlaneTiltDuotone,
    tint: "#2065D1",
  },
  {
    title: "Offline Message Queue",
    desc: "Compose anywhere — flight mode, weak signal. Messages queue locally and auto-send the second you're back online, with retry.",
    category: "Messaging",
    Icon: PiBackspaceDuotone,
    tint: "#2065D1",
  },

  // Audio & Video (2)
  {
    title: "Privacy-First Camera & Mic",
    desc: "Camera and microphone only activate when you choose. No always-listening, no surprise hot-mic.",
    category: "Audio & Video",
    Icon: PiPhoneSlashDuotone,
    tint: "#ef4444",
  },
  {
    title: "Voice Playback Speed (1x / 1.5x / 2x)",
    desc: "Play voice messages and recordings at adjustable speed. Read your inbox faster.",
    category: "Audio & Video",
    Icon: PiFastForwardDuotone,
    tint: "#ef4444",
  },

  // AI (8 — TheChatNest's strongest moat)
  {
    title: "AI App Guide",
    desc: "Built-in AI assistant answers how-to questions in English, Hindi or Hinglish — no separate chatbot tool needed.",
    category: "AI & Smart Features",
    Icon: PiRobotDuotone,
    tint: "#a855f7",
  },
  {
    title: "AI Grammar Check",
    desc: "Automatic grammar correction before you hit send. Your team's writing, polished in real time.",
    category: "AI & Smart Features",
    Icon: PiBookOpenDuotone,
    tint: "#a855f7",
  },
  {
    title: "AI Tone Adjuster",
    desc: "Rewrite any message in Formal, Friendly, or Diplomatic tone with a single tap.",
    category: "AI & Smart Features",
    Icon: PiSparkleDuotone,
    tint: "#a855f7",
  },
  {
    title: "AI Live Assistant",
    desc: "Built-in AI chatbot for instant in-app answers and troubleshooting — pinned to your sidebar.",
    category: "AI & Smart Features",
    Icon: PiChatTeardropDotsDuotone,
    tint: "#a855f7",
  },
  {
    title: "Smart Compose (Auto-Complete)",
    desc: "Type the first few words, accept an AI suggestion. Tab → done. Teams ships a watered-down version; Slack and Troop don't ship it at all.",
    category: "AI & Smart Features",
    Icon: PiFastForwardDuotone,
    tint: "#a855f7",
  },
  {
    title: "Smart Reply Suggestions",
    desc: "Three contextual replies generated for every incoming message — matched to the sender's language.",
    category: "AI & Smart Features",
    Icon: PiSparkleDuotone,
    tint: "#a855f7",
  },
  {
    title: "Auto-Translate (14 Languages)",
    desc: "Translate any incoming message into your language with one tap. Slack only has it via paid add-ons.",
    category: "AI & Smart Features",
    Icon: PiUserSoundDuotone,
    tint: "#a855f7",
  },
  {
    title: "AI Semantic Search",
    desc: "Search by meaning, not exact keywords. \"That doc about Q4 budget\" finds it even if no message literally said that.",
    category: "AI & Smart Features",
    Icon: PiMagnifyingGlassDuotone,
    tint: "#a855f7",
  },
  {
    title: "AI Call Notes",
    desc: "Auto-generated meeting summary, key points, and action items at the end of every call.",
    category: "AI & Smart Features",
    Icon: PiBookOpenDuotone,
    tint: "#a855f7",
  },

  // Privacy (3)
  {
    title: "Chat Lock (PIN)",
    desc: "Lock individual chats behind a 4-digit PIN. Loan your laptop without leaking sensitive threads.",
    category: "Privacy & Security",
    Icon: PiLockKeyDuotone,
    tint: "#16a34a",
  },
  {
    title: "IP & Platform Restrictions",
    desc: "Restrict workspace access by IP range and platform type. Lock the office down without paying for Slack Enterprise Grid.",
    category: "Privacy & Security",
    Icon: PiShieldCheckDuotone,
    tint: "#16a34a",
  },
  {
    title: "Self-Hosted & Air-Gapped",
    desc: "Deploy on your own infra — private cloud or fully air-gapped. Slack and Teams require their cloud, period.",
    category: "Privacy & Security",
    Icon: PiCloudDuotone,
    tint: "#16a34a",
  },

  // Admin (3)
  {
    title: "OTP Verification Logs",
    desc: "Super-admins can audit every OTP — codes, attempts, IPs, devices. Forensics built-in.",
    category: "Admin & Management",
    Icon: PiShieldCheckDuotone,
    tint: "#0891b2",
  },
  {
    title: "Departments & Designations",
    desc: "Organize users by department, designation, and location. Built-in HR-ready structure, not a paid add-on.",
    category: "Admin & Management",
    Icon: PiUsersThreeDuotone,
    tint: "#0891b2",
  },
  {
    title: "Built-in Payment History & Invoices",
    desc: "Complete payment trail, downloadable invoices, billing addresses — all native. No external portal bouncing.",
    category: "Admin & Management",
    Icon: PiCreditCardDuotone,
    tint: "#0891b2",
  },

  // Mobile (7)
  {
    title: "Mobile Admin Panel",
    desc: "Full admin powers from your phone — users, groups, departments, billing, OTP logs. Slack & Teams admins need a laptop.",
    category: "Mobile",
    Icon: PiDeviceMobileSpeakerDuotone,
    tint: "#f59e0b",
  },
  {
    title: "Swipe to Reply",
    desc: "Swipe right on any message to instantly reply with haptic feedback — like WhatsApp.",
    category: "Mobile",
    Icon: PiHandTapDuotone,
    tint: "#f59e0b",
  },
  {
    title: "Per-Chat Wallpaper",
    desc: "Set a custom background image per conversation. Personal touch, distinct context.",
    category: "Mobile",
    Icon: PiPaletteDuotone,
    tint: "#f59e0b",
  },
  {
    title: "Biometric Login",
    desc: "Fingerprint / Face ID login with OTP skip for trusted devices. Zero friction, zero compromises.",
    category: "Mobile",
    Icon: PiFingerprintDuotone,
    tint: "#f59e0b",
  },
  {
    title: "QR Code Login",
    desc: "Scan the QR on web from your phone — WhatsApp-style linked devices, no password retyping.",
    category: "Mobile",
    Icon: PiQrCodeDuotone,
    tint: "#f59e0b",
  },
  {
    title: "Haptic Feedback",
    desc: "Tactile vibrations on every meaningful action — reactions, sends, navigation. Feels alive.",
    category: "Mobile",
    Icon: PiHandTapDuotone,
    tint: "#f59e0b",
  },
  {
    title: "Contact Photo Viewer",
    desc: "Tap any avatar to view full-size profile photo. Tiny detail, big delight.",
    category: "Mobile",
    Icon: PiUserCirclePlusDuotone,
    tint: "#f59e0b",
  },

  // Web (3)
  {
    title: "Built-in QR Code Generator",
    desc: "Generate scannable login QR right on the web. No third-party authenticator needed.",
    category: "Web & Desktop",
    Icon: PiQrCodeDuotone,
    tint: "#6d5dfc",
  },
  {
    title: "S3 Cloud Storage Integration",
    desc: "AWS S3 wired in for scalable, low-cost file storage. Bring your own bucket if you prefer.",
    category: "Web & Desktop",
    Icon: PiCloudDuotone,
    tint: "#6d5dfc",
  },
  {
    title: "Stripe Billing, Built In",
    desc: "Subscriptions, invoices, payment management — all native. No external billing portal to bounce through.",
    category: "Web & Desktop",
    Icon: PiCreditCardDuotone,
    tint: "#6d5dfc",
  },
];

// Counts per category — drives the filter pill row
const CATEGORY_META = [
  { key: "All",                   label: "All",                     count: EXCLUSIVE.length,   tint: "#0b0f1e" },
  { key: "Messaging",             label: "Messaging",               tint: "#2065D1" },
  { key: "Audio & Video",         label: "Audio & Video",           tint: "#ef4444" },
  { key: "AI & Smart Features",   label: "AI & Smart",              tint: "#a855f7" },
  { key: "Privacy & Security",    label: "Privacy",                 tint: "#16a34a" },
  { key: "Admin & Management",    label: "Admin",                   tint: "#0891b2" },
  { key: "Mobile",                label: "Mobile",                  tint: "#f59e0b" },
  { key: "Web & Desktop",         label: "Web & Desktop",           tint: "#6d5dfc" },
];

const COMPETITORS = [
  { name: "Slack",        color: "#4A154B" },
  { name: "MS Teams",     color: "#4b53bc" },
  { name: "Troop",        color: "#64748b" },
];

const Compare = () => {
  const { brandName } = useSiteBranding();
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXCLUSIVE.filter((f) => {
      if (activeCategory !== "All" && f.category !== activeCategory) return false;
      if (!q) return true;
      return (
        f.title.toLowerCase().includes(q) ||
        f.desc.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    });
  }, [activeCategory, query]);

  const categoryCounts = useMemo(() => {
    const counts = { All: EXCLUSIVE.length };
    EXCLUSIVE.forEach((f) => { counts[f.category] = (counts[f.category] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="tcn-compare">
      <Seo
        title="Compare"
        description={`${brandName || "TheChatNest"} ships ${EXCLUSIVE.length} unique features that Slack, Microsoft Teams, and Troop Messenger don't. See what makes us different.`}
        keywords="slack alternative, teams alternative, troop messenger alternative, team chat comparison, unique features"
      />

      <style>{`
        .tcn-compare {
          background: linear-gradient(180deg, #fafbff 0%, #ffffff 60%);
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          color: #0b0f1e;
          min-height: 100vh;
        }
        .tcn-cmp-hero {
          position: relative;
          background:
            radial-gradient(1100px 600px at 78% -10%, rgba(109,93,252,0.32), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.12), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          padding: 8rem 0 5rem;
          overflow: hidden;
        }
        .tcn-cmp-hero::before {
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
        .tcn-cmp-hero > .container { position: relative; z-index: 1; text-align: center; }
        .tcn-cmp-eyebrow {
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
          margin-bottom: 1.5rem;
        }
        .tcn-cmp-hero h1 {
          font-size: clamp(2.2rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          max-width: 920px;
          margin: 0 auto 1rem;
          color: #ffffff;
        }
        .tcn-cmp-hero h1 .accent {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-cmp-hero p.lede {
          color: rgba(255,255,255,0.72);
          font-size: 1.15rem;
          line-height: 1.55;
          max-width: 600px;
          margin: 0 auto 2.5rem;
        }

        /* stat strip in hero */
        .tcn-cmp-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          max-width: 720px;
          margin: 0 auto;
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255,255,255,0.1);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .tcn-cmp-stat {
          text-align: center;
          padding: 0 1rem;
          position: relative;
        }
        .tcn-cmp-stat:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 20%;
          bottom: 20%;
          right: 0;
          width: 1px;
          background: rgba(255,255,255,0.08);
        }
        .tcn-cmp-stat .num {
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 800;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          line-height: 1;
          margin-bottom: 0.35rem;
        }
        .tcn-cmp-stat .lbl {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
        }
        @media (max-width: 640px) {
          .tcn-cmp-stats { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .tcn-cmp-stat:nth-child(2)::after { display: none; }
        }

        /* head-to-head row */
        .tcn-cmp-vs {
          padding: 4rem 0 1.5rem;
        }
        .tcn-cmp-vs-row {
          display: grid;
          grid-template-columns: 1.4fr auto repeat(3, 1fr);
          gap: 0;
          align-items: stretch;
          max-width: 1100px;
          margin: 0 auto;
          border-radius: 18px;
          overflow: hidden;
          border: 1.5px solid rgba(15,23,42,0.12);
          background: #fff;
          box-shadow: 0 24px 60px rgba(15,23,42,0.06);
        }
        .tcn-cmp-vs-cell {
          padding: 1.5rem 1.25rem;
          text-align: center;
          border-right: 1px solid rgba(15,23,42,0.08);
        }
        .tcn-cmp-vs-cell:last-child { border-right: 0; }
        .tcn-cmp-vs-cell.us {
          background: linear-gradient(135deg, #2065D1 0%, #1242a3 100%);
          color: #fff;
          text-align: left;
          padding: 1.75rem 1.5rem;
          border-right: 1px solid rgba(255,255,255,0.18);
        }
        .tcn-cmp-vs-cell.us .name {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #ffd54a;
          margin-bottom: 0.5rem;
        }
        .tcn-cmp-vs-cell.us .num {
          font-size: 2.4rem;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .tcn-cmp-vs-cell.us .sub {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.7);
          margin-top: 0.35rem;
        }
        .tcn-cmp-vs-cell.vs {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-style: italic;
          font-size: 1.3rem;
          color: rgba(15,23,42,0.5);
          padding: 1rem 0.75rem;
          border-right: 1px solid rgba(15,23,42,0.08);
        }
        .tcn-cmp-vs-cell.them .label {
          font-weight: 700;
          font-size: 0.95rem;
          color: rgba(15,23,42,0.85);
          margin-bottom: 0.6rem;
        }
        .tcn-cmp-vs-cell.them .num {
          font-size: 1.7rem;
          font-weight: 800;
          color: #dc2626;
          line-height: 1;
        }
        .tcn-cmp-vs-cell.them .delta {
          display: inline-block;
          margin-top: 0.45rem;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(220,38,38,0.08);
          color: #b91c1c;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
        }
        @media (max-width: 900px) {
          .tcn-cmp-vs-row { grid-template-columns: 1fr; }
          .tcn-cmp-vs-cell { border-right: 0; border-bottom: 1px solid rgba(15,23,42,0.08); text-align: center !important; }
          .tcn-cmp-vs-cell.us { text-align: center !important; }
          .tcn-cmp-vs-cell.us .name { justify-content: center; }
          .tcn-cmp-vs-cell:last-child { border-bottom: 0; }
          .tcn-cmp-vs-cell.vs { display: none; }
        }

        /* main grid section */
        .tcn-cmp-features {
          padding: 5rem 0 6rem;
        }
        .tcn-cmp-features-head {
          max-width: 760px;
          margin: 0 auto 2.5rem;
          text-align: center;
        }
        .tcn-cmp-features-head h2 {
          font-size: clamp(1.9rem, 3.5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 0.85rem;
        }
        .tcn-cmp-features-head h2 .accent {
          color: #2065D1;
        }
        .tcn-cmp-features-head p {
          color: rgba(15,23,42,0.6);
          font-size: 1.05rem;
          line-height: 1.6;
          margin: 0;
        }

        .tcn-cmp-controls {
          display: flex;
          justify-content: center;
          gap: 0.6rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding: 0 1rem;
        }
        .tcn-cmp-search-wrap {
          max-width: 460px;
          margin: 0 auto 2rem;
          padding: 0 1rem;
        }
        .tcn-cmp-search {
          width: 100%;
          padding: 0.85rem 1.1rem 0.85rem 2.85rem;
          border-radius: 999px;
          border: 1.5px solid rgba(15,23,42,0.12);
          background: #fff;
          font-size: 0.95rem;
          font-family: inherit;
          color: #0b0f1e;
          transition: all 0.18s ease;
          position: relative;
        }
        .tcn-cmp-search:focus {
          outline: none;
          border-color: #2065D1;
          box-shadow: 0 0 0 4px rgba(32,101,209,0.12);
        }
        .tcn-cmp-search-icon {
          position: absolute;
          left: 1.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(15,23,42,0.4);
          pointer-events: none;
        }
        .tcn-cmp-search-clear {
          position: absolute;
          right: 1.85rem;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(15,23,42,0.06);
          border: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: rgba(15,23,42,0.5);
        }
        .tcn-cmp-search-clear:hover { background: rgba(15,23,42,0.12); color: #0b0f1e; }

        .tcn-cmp-chip {
          padding: 0.5rem 1rem;
          border-radius: 999px;
          background: #fff;
          border: 1.5px solid rgba(15,23,42,0.12);
          color: rgba(15,23,42,0.75);
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.18s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
        }
        .tcn-cmp-chip:hover {
          border-color: rgba(15,23,42,0.3);
          transform: translateY(-1px);
        }
        .tcn-cmp-chip.active {
          color: #fff;
          border-color: transparent;
          box-shadow: 0 6px 16px rgba(15,23,42,0.18);
        }
        .tcn-cmp-chip .count {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 999px;
          background: rgba(15,23,42,0.08);
          color: rgba(15,23,42,0.6);
        }
        .tcn-cmp-chip.active .count {
          background: rgba(255,255,255,0.22);
          color: #fff;
        }

        .tcn-cmp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.1rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .tcn-cmp-card {
          position: relative;
          background: #fff;
          border-radius: 16px;
          padding: 1.6rem 1.4rem 1.4rem;
          border: 1px solid rgba(15,23,42,0.08);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          overflow: hidden;
        }
        .tcn-cmp-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 0;
          background: var(--tint, #2065D1);
          transition: height 0.22s ease;
        }
        .tcn-cmp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 22px 50px rgba(15,23,42,0.10);
          border-color: var(--tint, #2065D1);
        }
        .tcn-cmp-card:hover::before {
          height: 100%;
        }
        .tcn-cmp-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--tint-soft, rgba(32,101,209,0.1));
          color: var(--tint, #2065D1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .tcn-cmp-card h3 {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin: 0 0 0.5rem;
          color: #0b0f1e;
          line-height: 1.25;
        }
        .tcn-cmp-card p {
          color: rgba(15,23,42,0.65);
          font-size: 0.93rem;
          line-height: 1.55;
          margin: 0 0 1rem;
        }
        .tcn-cmp-card-foot {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-top: 0.85rem;
          border-top: 1px dashed rgba(15,23,42,0.1);
          flex-wrap: wrap;
        }
        .tcn-cmp-card-foot .tcn-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(34,197,94,0.1);
          color: #16a34a;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
        .tcn-cmp-card-foot .lose {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px 8px;
          border-radius: 999px;
          background: rgba(239,68,68,0.08);
          color: #b91c1c;
          font-size: 11px;
          font-weight: 600;
        }
        .tcn-cmp-card-foot .lose svg { color: #dc2626; }

        /* Exclusive ribbon */
        .tcn-cmp-card-ribbon {
          position: absolute;
          top: 14px;
          right: 14px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 9px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #6e4f10;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: "JetBrains Mono", monospace;
          box-shadow: 0 4px 10px rgba(255,213,74,0.45);
        }

        .tcn-cmp-empty {
          text-align: center;
          padding: 4rem 1rem;
          color: rgba(15,23,42,0.5);
          font-size: 1rem;
        }
        .tcn-cmp-empty button {
          margin-top: 0.85rem;
          background: transparent;
          border: 0;
          color: #2065D1;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          font-size: 1rem;
        }

        /* CTA */
        .tcn-cmp-cta {
          padding: 5rem 0 6rem;
          background: #fafbff;
        }
        .tcn-cmp-cta-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 4rem 3rem;
          border-radius: 28px;
          background: linear-gradient(135deg, #0b0f1e 0%, #11162a 50%, #1a3a8a 100%);
          color: #fff;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(15,23,42,0.2);
        }
        .tcn-cmp-cta-inner::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(700px 360px at 20% 0%, rgba(255,213,74,0.22), transparent 60%),
            radial-gradient(700px 360px at 80% 100%, rgba(32,101,209,0.36), transparent 60%);
          pointer-events: none;
        }
        .tcn-cmp-cta-inner > * { position: relative; z-index: 1; }
        .tcn-cmp-cta h2 {
          font-size: clamp(1.85rem, 3.5vw, 2.6rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 0.85rem;
          color: #fff;
        }
        .tcn-cmp-cta p {
          color: rgba(255,255,255,0.72);
          font-size: 1.1rem;
          max-width: 560px;
          margin: 0 auto 2rem;
          line-height: 1.55;
        }
        .tcn-cmp-cta-btns {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-cmp-cta-btns .btn-gold {
          padding: 0.95rem 1.85rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          font-weight: 800;
          font-size: 1rem;
          text-decoration: none !important;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 26px rgba(255,213,74,0.45);
          transition: transform 0.18s ease;
        }
        .tcn-cmp-cta-btns .btn-gold:hover { transform: translateY(-3px); color: #1a1f3a !important; }
        .tcn-cmp-cta-btns .btn-ghost {
          padding: 0.95rem 1.75rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff !important;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none !important;
          backdrop-filter: blur(8px);
          transition: all 0.18s ease;
        }
        .tcn-cmp-cta-btns .btn-ghost:hover { background: rgba(255,255,255,0.14); }

        @media (max-width: 768px) {
          .tcn-cmp-hero { padding: 6.5rem 0 3.5rem; }
          .tcn-cmp-features { padding: 3.5rem 0 4.5rem; }
          .tcn-cmp-cta-inner { padding: 3rem 1.5rem; }
        }
      `}</style>

      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="tcn-cmp-hero">
        <div className="container">
          <span className="tcn-cmp-eyebrow">
            <PiCrownDuotone size={12} />
            What only TheChatNest does
          </span>
          <h1>
            <span className="accent">{EXCLUSIVE.length} features</span> Slack, Teams &amp; Troop don&apos;t ship.
          </h1>
          <p className="lede">
            We didn&apos;t build a Slack clone. We built what every team actually needs — and the big names still don&apos;t.
          </p>

          <div className="tcn-cmp-stats">
            <div className="tcn-cmp-stat">
              <div className="num">{EXCLUSIVE.length}</div>
              <div className="lbl">Exclusive Features</div>
            </div>
            <div className="tcn-cmp-stat">
              <div className="num">{CATEGORY_META.length - 1}</div>
              <div className="lbl">Categories</div>
            </div>
            <div className="tcn-cmp-stat">
              <div className="num">0</div>
              <div className="lbl">Add-ons Needed</div>
            </div>
            <div className="tcn-cmp-stat">
              <div className="num">₹199</div>
              <div className="lbl">Per Seat / Month</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Head-to-head row ──────────────────────────────────────── */}
      <section className="tcn-cmp-vs">
        <div className="container">
          <div className="tcn-cmp-vs-row">
            <div className="tcn-cmp-vs-cell us">
              <div className="name">
                <PiTrophyDuotone size={16} />
                {brandName || "TheChatNest"}
              </div>
              <div className="num">{EXCLUSIVE.length} unique</div>
              <div className="sub">Built into one workspace, no add-ons.</div>
            </div>
            <div className="tcn-cmp-vs-cell vs">vs</div>
            {COMPETITORS.map((c) => (
              <div key={c.name} className="tcn-cmp-vs-cell them">
                <div className="label">{c.name}</div>
                <div className="num">0</div>
                <div className="delta">−{EXCLUSIVE.length} BEHIND</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features grid ─────────────────────────────────────────── */}
      <section className="tcn-cmp-features">
        <div className="container">
          <div className="tcn-cmp-features-head">
            <h2>
              Every <span className="accent">exclusive feature</span>, in one place.
            </h2>
            <p>
              Filter by area or search by keyword. None of these ship in Slack, Microsoft Teams, or Troop — without paid add-ons or third-party integrations.
            </p>
          </div>

          <div className="tcn-cmp-search-wrap" style={{ position: "relative" }}>
            <PiMagnifyingGlassDuotone size={18} className="tcn-cmp-search-icon" style={{ position: "absolute", left: "2.85rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              className="tcn-cmp-search"
              placeholder="Search exclusive features…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="tcn-cmp-search-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                style={{ right: "2.85rem" }}
              >
                <PiXBold size={11} />
              </button>
            )}
          </div>

          <div className="tcn-cmp-controls">
            {CATEGORY_META.map((c) => {
              const count = categoryCounts[c.key] || 0;
              const isActive = activeCategory === c.key;
              const style = isActive
                ? { background: c.tint, "--count-bg": "rgba(255,255,255,0.22)" }
                : { color: c.tint };
              return (
                <button
                  key={c.key}
                  className={`tcn-cmp-chip ${isActive ? "active" : ""}`}
                  onClick={() => setActiveCategory(c.key)}
                  style={style}
                >
                  {c.label}
                  <span className="count">{count}</span>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="tcn-cmp-empty">
              No features matched <strong>&quot;{query}&quot;</strong>.
              <br />
              <button onClick={() => { setQuery(""); setActiveCategory("All"); }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="tcn-cmp-grid">
              {filtered.map((f, i) => {
                const Icon = f.Icon;
                return (
                  <article
                    key={f.title}
                    className="tcn-cmp-card"
                    style={{
                      "--tint": f.tint,
                      "--tint-soft": `${f.tint}1a`,
                      animation: `tcnCmpFade 0.4s ease ${i * 0.03}s both`,
                    }}
                  >
                    <span className="tcn-cmp-card-ribbon">
                      <PiSparkleDuotone size={10} /> Exclusive
                    </span>
                    <div className="tcn-cmp-card-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                    <div className="tcn-cmp-card-foot">
                      <span className="tcn-tag">
                        <PiCheckCircleDuotone size={11} /> {f.category}
                      </span>
                      <span className="lose">
                        <PiXCircleDuotone size={11} /> Not in Slack / Teams / Troop
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes tcnCmpFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ─── CTA ───────────────────────────────────────────────────── */}
      <section className="tcn-cmp-cta">
        <div className="container">
          <div className="tcn-cmp-cta-inner">
            <span className="tcn-cmp-eyebrow" style={{ marginBottom: "1.25rem" }}>
              <PiLightningDuotone size={12} />
              Stop paying for what they don&apos;t ship
            </span>
            <h2>The fastest way to find out is to try.</h2>
            <p>
              14 days free, no credit card. Move your team and see every one of these {EXCLUSIVE.length} features in your hands within minutes.
            </p>
            <div className="tcn-cmp-cta-btns">
              <Link to="/auth/register" className="btn-gold">
                Start free trial <PiArrowRightBold size={14} />
              </Link>
              <Link to="/pricing" className="btn-ghost">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Compare;
