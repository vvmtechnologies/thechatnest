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
  PiCheckBold,
  PiCaretDownBold,
} from "react-icons/pi";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import Seo from "../../components/Seo.jsx";

// ─── Features that set TheChatNest apart ──────────────────────────────
// Curated to the 16 most differentiated features. Generic capabilities
// (1:1 chat, file sharing, basic groups) are NOT here — they're table
// stakes that every product ships. Each entry includes:
//   - title:     short headline
//   - desc:      single-line value prop
//   - details:   4-6 specific bullets explaining the feature
//   - vs:        head-to-head against Slack / Teams / Troop
//   - category:  filter group
const EXCLUSIVE = [
  // ─── AI & Smart Features (5 — strongest moat) ──────────────────────
  {
    title: "AI Tone Adjuster",
    desc: "Rewrite any draft in Formal, Friendly, or Diplomatic tone with one tap — before you regret hitting send.",
    details: [
      "Three pre-built tones: Formal (for clients), Friendly (for teammates), Diplomatic (for disagreement).",
      "Works on any message draft — even half-written ones. The AI preserves your intent, only changes the register.",
      "Built into the composer toolbar — no separate window, no copy-paste between apps.",
      "Costs nothing extra. Slack, Teams and Troop have NO equivalent (yet).",
      "Privacy: tone-adjustment runs through our own AI proxy. Your drafts never leave our infrastructure.",
    ],
    vs: { slack: "No equivalent", teams: "No equivalent", troop: "No equivalent" },
    category: "AI & Smart Features",
    Icon: PiSparkleDuotone,
    tint: "#a855f7",
  },
  {
    title: "Smart Compose (Auto-Complete)",
    desc: "Type the first few words, accept an AI suggestion. Tab → done. Cuts your message-writing time by ~40%.",
    details: [
      "AI suggests the next 3-10 words as you type, in light grey inline text.",
      "Press Tab to accept, keep typing to ignore. Like Gmail's Smart Compose — but for chat.",
      "Trained per workspace: learns your team's vocabulary, project names, common phrases.",
      "Available on all paid plans, no add-on cost.",
      "Teams ships a watered-down version; Slack and Troop don't ship it at all.",
    ],
    vs: { slack: "No equivalent", teams: "Partial (Copilot enterprise add-on)", troop: "No equivalent" },
    category: "AI & Smart Features",
    Icon: PiFastForwardDuotone,
    tint: "#a855f7",
  },
  {
    title: "Auto-Translate (14 Languages)",
    desc: "Translate any incoming message into your language with one tap. Your team writes in their native tongue.",
    details: [
      "Supported: English, Hindi, Spanish, French, German, Portuguese, Japanese, Korean, Mandarin, Arabic, Russian, Turkish, Italian, Dutch.",
      "Inline translation — original message stays visible, translated version shown below.",
      "Auto-detect mode: messages in languages you don't speak get translated automatically.",
      "Built into the message context menu — no third-party browser extension needed.",
      "Slack only offers translation via paid Workflow Builder add-ons. Teams has it on Enterprise only.",
    ],
    vs: { slack: "Paid add-on", teams: "Enterprise-only", troop: "No equivalent" },
    category: "AI & Smart Features",
    Icon: PiUserSoundDuotone,
    tint: "#a855f7",
  },
  {
    title: "AI Semantic Search",
    desc: "Search by meaning, not exact keywords. \"That doc about Q4 budget\" finds it — even if no message literally said that.",
    details: [
      "Vector-based search across messages, files, threads, and meeting transcripts.",
      "Understands intent: \"who's on call this weekend\" returns the rotation thread even without the exact phrase.",
      "Filters by sender, channel, file type, date range — combined with semantic intent.",
      "Slack & Teams use keyword search only. Troop has no real search past 30 days.",
      "Available on all paid plans — no \"Enterprise tier\" lock-in.",
    ],
    vs: { slack: "Keyword only", teams: "Keyword only", troop: "30-day keyword only" },
    category: "AI & Smart Features",
    Icon: PiMagnifyingGlassDuotone,
    tint: "#a855f7",
  },
  {
    title: "AI Call Notes",
    desc: "Auto-generated meeting summary, key points, and action items at the end of every call. No Otter subscription needed.",
    details: [
      "Triggered automatically when a meeting ends — no \"start recording\" step.",
      "Output: 5-bullet summary, decisions list, action items with assigned owners, full transcript.",
      "Posts to the meeting's chat channel within 60 seconds of end-of-call.",
      "Editable: meeting host can refine the AI draft before it's shared.",
      "Replaces ~₹830/user/month of Otter.ai or Fireflies.",
    ],
    vs: { slack: "Partial (Huddles summary)", teams: "Yes (Premium add-on)", troop: "No equivalent" },
    category: "AI & Smart Features",
    Icon: PiBookOpenDuotone,
    tint: "#a855f7",
  },

  // ─── Privacy & Security (3 — enterprise hooks) ─────────────────────
  {
    title: "Chat Lock with PIN",
    desc: "Lock individual chats behind a 4-digit PIN. Loan your laptop to a freelancer without leaking sensitive threads.",
    details: [
      "Per-chat 4-digit PIN — set independently from your account password.",
      "PIN screen wraps the chat. Even if your laptop is unlocked, the locked chat stays hidden.",
      "Works across web, desktop, iOS, Android — PIN syncs encrypted.",
      "Optional auto-lock timer: re-locks after 5 / 15 / 60 minutes of inactivity.",
      "Slack, Teams and Troop have no equivalent — admins must rely on org-wide MFA.",
    ],
    vs: { slack: "No equivalent", teams: "No equivalent", troop: "No equivalent" },
    category: "Privacy & Security",
    Icon: PiLockKeyDuotone,
    tint: "#16a34a",
  },
  {
    title: "Disappearing Messages",
    desc: "Auto-delete messages after a chosen timer. Built-in privacy without third-party add-ons.",
    details: [
      "Set per-chat timer: 1 hour, 24 hours, 7 days, 30 days, or custom.",
      "Messages auto-delete on every participant's device — server-side too.",
      "Useful for: HR conversations, exit interviews, NDA'd customer chats, sensitive payroll discussions.",
      "Audit log captures that the chat existed — but not the content. Compliance-friendly.",
      "Slack, Teams and Troop ALL lack this. Signal/Telegram have it but aren't business-grade.",
    ],
    vs: { slack: "No equivalent", teams: "No equivalent", troop: "No equivalent" },
    category: "Privacy & Security",
    Icon: PiClockCountdownDuotone,
    tint: "#16a34a",
  },
  {
    title: "Self-Hosted & Air-Gapped",
    desc: "Deploy on your own infra — private cloud or fully air-gapped. Slack and Teams require their cloud, period.",
    details: [
      "Docker-Compose installer for VPC / on-prem deployment (Q4 2026 GA).",
      "Air-gapped mode: zero internet calls — every dependency bundled.",
      "Customer manages encryption keys (BYOK) — even our engineers can't read your messages.",
      "Available today as a managed contract (we run it on YOUR cloud); GA self-installer next.",
      "Defense, government, healthcare, financial services — verticals Slack literally cannot serve.",
    ],
    vs: { slack: "No equivalent", teams: "No (cloud-only)", troop: "Self-hosted available" },
    category: "Privacy & Security",
    Icon: PiCloudDuotone,
    tint: "#16a34a",
  },

  // ─── Messaging (3 — workflow exclusive) ────────────────────────────
  {
    title: "Broadcast to Groups",
    desc: "Send one announcement to many groups simultaneously — one click, hundreds of teams informed.",
    details: [
      "Pick recipients: individual contacts, groups, or both at once.",
      "Each recipient sees it as a private 1-on-1 — replies don't spam the others.",
      "Attach files, images, or any document to a broadcast (Slack & Teams cap at text-only).",
      "Use cases: company-wide updates, sales enablement to 50 reps, customer-segmented announcements.",
      "Audit log captures every recipient and delivery status — compliance built-in.",
    ],
    vs: { slack: "Text-only, manual", teams: "Channels only", troop: "Yes, but no attachments" },
    category: "Messaging",
    Icon: PiMegaphoneDuotone,
    tint: "#2065D1",
  },
  {
    title: "Scheduled Messages with Recurring Rules",
    desc: "Schedule any message to send later — including weekly recurring reminders, standup nudges, deadline alerts.",
    details: [
      "One-time schedule: \"send this on Friday at 9 AM\".",
      "Recurring: \"every Monday morning, post our standup template\".",
      "Conditional: \"only send if no message in #prod-alerts for 4 hours\" — heartbeat-style.",
      "Editable before send — late changes don't require deleting and retyping.",
      "Slack has basic scheduled messages but no recurring or conditional logic.",
    ],
    vs: { slack: "Basic one-time only", teams: "One-time only", troop: "No equivalent" },
    category: "Messaging",
    Icon: PiClockCountdownDuotone,
    tint: "#2065D1",
  },
  {
    title: "Offline Message Queue",
    desc: "Compose anywhere — flight mode, weak signal. Messages queue locally and auto-send when you're back online.",
    details: [
      "Type in airplane mode, the train tunnel, the metro — messages queue locally.",
      "Smart retry: exponential backoff on network failure, automatic re-send on reconnect.",
      "Visual indicator: queued messages show a clock icon, sent ones show the green tick.",
      "Edit or delete queued messages before they send — full control.",
      "Slack and Teams have partial offline support; Troop has none at all.",
    ],
    vs: { slack: "Partial (recent only)", teams: "Partial (mobile only)", troop: "No equivalent" },
    category: "Messaging",
    Icon: PiBackspaceDuotone,
    tint: "#2065D1",
  },

  // ─── Admin & Management (2 — enterprise differentiator) ────────────
  {
    title: "OTP Verification Logs",
    desc: "Super-admins can audit every OTP — codes, attempts, IPs, devices. Forensics built-in for compliance investigations.",
    details: [
      "Every OTP issued is logged: timestamp, recipient, channel (email/SMS), code (admin-only), attempts.",
      "Failed attempts logged separately — see brute-force patterns at a glance.",
      "IP geolocation + device fingerprint per attempt — incident response in minutes.",
      "Export as CSV / JSON for SIEM ingestion. Slack and Teams require Enterprise Grid for this.",
      "Required for HIPAA, SOC 2, ISO 27001 audits — and we ship it on the base Admin plan.",
    ],
    vs: { slack: "Enterprise Grid only", teams: "Enterprise add-on", troop: "No equivalent" },
    category: "Admin & Management",
    Icon: PiShieldCheckDuotone,
    tint: "#0891b2",
  },
  {
    title: "Built-in Stripe Billing & Invoices",
    desc: "Subscriptions, invoices with GST, payment history — all native. No bouncing to an external billing portal.",
    details: [
      "Invoices with GST, company name, billing address, registered office — Indian compliance out-of-box.",
      "INV-TCN auto-numbered invoices — clean accounting trail for your finance team.",
      "UPI, NetBanking, cards, NEFT — Stripe + PayPal + manual options all native.",
      "Customer can self-serve: upgrade, downgrade, cancel, refund-request from inside the app.",
      "Slack and Teams force you to log into a separate billing dashboard — context switch hell.",
    ],
    vs: { slack: "External portal", teams: "External portal", troop: "Manual quote-only" },
    category: "Admin & Management",
    Icon: PiCreditCardDuotone,
    tint: "#0891b2",
  },

  // ─── Mobile (2 — quality-of-life that defines the product) ─────────
  {
    title: "Full Mobile Admin Panel",
    desc: "Run your entire workspace from your phone — users, groups, departments, billing, OTP audit. No laptop required.",
    details: [
      "Add / remove users, manage roles, set up departments — all from iOS / Android.",
      "Read audit logs and OTP attempt history from anywhere.",
      "Approve / deny pending invitations, manage billing — including downloading PDF invoices.",
      "Push notifications for admin events: failed logins, payment issues, license over-limits.",
      "Slack and Teams require a desktop browser for admin tasks. We don't.",
    ],
    vs: { slack: "Desktop-only", teams: "Desktop-only", troop: "Limited mobile admin" },
    category: "Mobile",
    Icon: PiDeviceMobileSpeakerDuotone,
    tint: "#f59e0b",
  },
  {
    title: "Biometric + QR Login",
    desc: "Fingerprint or Face ID on mobile, QR-scan from your phone on web. Zero passwords, zero retyping.",
    details: [
      "After first login, biometric unlocks the app on iOS and Android — Touch / Face ID supported.",
      "Web login: scan a QR with your phone, you're in. No password retyping. Like WhatsApp Web.",
      "Trusted devices skip OTP. Untrusted ones still require it. Per-device revocation in settings.",
      "Maximum 3 simultaneous active sessions per user — leaked credentials have a limited blast radius.",
      "Slack and Teams support biometric, but no QR sign-in for web. Troop has no biometric.",
    ],
    vs: { slack: "Biometric only", teams: "Biometric only", troop: "No equivalent" },
    category: "Mobile",
    Icon: PiFingerprintDuotone,
    tint: "#f59e0b",
  },

  // ─── Web & Desktop (1 — infrastructure exclusive) ──────────────────
  {
    title: "Bring Your Own Storage (S3 / R2)",
    desc: "Plug in your own AWS S3 or Cloudflare R2 bucket. Files never touch our infrastructure. Privacy + cost control.",
    details: [
      "Configure your bucket credentials in Admin → Storage. Files upload directly to YOUR bucket.",
      "Cost: ₹0.85/GB/month on R2 vs Slack's ₹X-per-seat-storage tax.",
      "Data residency: choose your region — Mumbai, Singapore, Frankfurt, Virginia.",
      "Sovereign cloud: pair with self-host mode for fully air-gapped, BYO-everything compliance.",
      "Slack and Teams force their managed storage — no opt-out, no per-customer keys.",
    ],
    vs: { slack: "No equivalent", teams: "No equivalent", troop: "No equivalent" },
    category: "Web & Desktop",
    Icon: PiCloudDuotone,
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
  const [expandedCard, setExpandedCard] = useState(null);

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

        /* Expandable details */
        .tcn-cmp-card.expanded {
          grid-column: span 2;
        }
        @media (max-width: 720px) {
          .tcn-cmp-card.expanded { grid-column: span 1; }
        }
        .tcn-cmp-card-details {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .tcn-cmp-card-details.open {
          max-height: 1000px;
          margin-bottom: 0.85rem;
        }
        .tcn-cmp-card-details-inner {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-top: 1px dashed rgba(15,23,42,0.1);
        }
        .tcn-cmp-card-detail-label {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--tint);
          margin-top: 0.85rem;
          margin-bottom: 0.6rem;
        }
        .tcn-cmp-card-detail-list {
          margin: 0;
          padding-left: 1.1rem;
          font-size: 0.88rem;
          color: rgba(15,23,42,0.72);
          line-height: 1.55;
        }
        .tcn-cmp-card-detail-list li {
          margin-bottom: 0.5rem;
        }
        .tcn-cmp-card-detail-list li::marker {
          color: var(--tint);
        }
        .tcn-cmp-card-vs {
          display: grid;
          gap: 0.45rem;
          margin-top: 0.5rem;
        }
        .tcn-cmp-card-vs .vs-row {
          display: grid;
          grid-template-columns: 110px auto 1fr;
          align-items: center;
          gap: 10px;
          padding: 0.55rem 0.7rem;
          border-radius: 8px;
          background: rgba(15,23,42,0.04);
          font-size: 0.85rem;
        }
        .tcn-cmp-card-vs .vs-row.us {
          background: var(--tint-soft);
          border: 1px solid var(--tint);
        }
        .tcn-cmp-card-vs .vs-name {
          font-weight: 700;
          color: #0b0f1e;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.04em;
        }
        .tcn-cmp-card-vs .vs-value {
          color: rgba(15,23,42,0.7);
          font-size: 0.82rem;
        }
        .tcn-cmp-card-vs .vs-mark {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
        }
        .tcn-cmp-card-vs .vs-mark.yes { background: rgba(22,163,74,0.15); color: #16a34a; }
        .tcn-cmp-card-vs .vs-mark.no { background: rgba(239,68,68,0.12); color: #dc2626; }
        .tcn-cmp-card-vs .vs-mark.partial { background: rgba(245,158,11,0.16); color: #b45309; }

        /* Show details toggle */
        .tcn-cmp-card-toggle {
          margin-left: auto;
          background: transparent;
          border: 0;
          color: var(--tint);
          font-weight: 700;
          font-size: 11px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: inherit;
          transition: background 0.15s ease;
        }
        .tcn-cmp-card-toggle:hover {
          background: var(--tint-soft);
        }
        .tcn-cmp-card-toggle .toggle-caret {
          display: inline-flex;
          transition: transform 0.2s ease;
        }
        .tcn-cmp-card-toggle .toggle-caret.open {
          transform: rotate(180deg);
        }

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
                const isExpanded = expandedCard === f.title;
                return (
                  <article
                    key={f.title}
                    className={`tcn-cmp-card ${isExpanded ? "expanded" : ""}`}
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

                    {/* Expandable details + competitor comparison */}
                    {f.details && (
                      <div className={`tcn-cmp-card-details ${isExpanded ? "open" : ""}`}>
                        <div className="tcn-cmp-card-details-inner">
                          <div className="tcn-cmp-card-detail-label">How it works</div>
                          <ul className="tcn-cmp-card-detail-list">
                            {f.details.map((d, di) => (
                              <li key={di}>{d}</li>
                            ))}
                          </ul>

                          {f.vs && (
                            <>
                              <div className="tcn-cmp-card-detail-label" style={{ marginTop: "1rem" }}>
                                Head-to-head
                              </div>
                              <div className="tcn-cmp-card-vs">
                                <div className="vs-row us">
                                  <span className="vs-name">TheChatNest</span>
                                  <span className="vs-mark yes"><PiCheckBold size={9} /></span>
                                  <span className="vs-value">Native, free on all paid plans</span>
                                </div>
                                <div className="vs-row">
                                  <span className="vs-name">Slack</span>
                                  <span className={`vs-mark ${/no/i.test(f.vs.slack) ? "no" : "partial"}`}>
                                    {/no/i.test(f.vs.slack) ? <PiXBold size={9} /> : "~"}
                                  </span>
                                  <span className="vs-value">{f.vs.slack}</span>
                                </div>
                                <div className="vs-row">
                                  <span className="vs-name">MS Teams</span>
                                  <span className={`vs-mark ${/no/i.test(f.vs.teams) ? "no" : "partial"}`}>
                                    {/no/i.test(f.vs.teams) ? <PiXBold size={9} /> : "~"}
                                  </span>
                                  <span className="vs-value">{f.vs.teams}</span>
                                </div>
                                <div className="vs-row">
                                  <span className="vs-name">Troop</span>
                                  <span className={`vs-mark ${/no/i.test(f.vs.troop) ? "no" : "partial"}`}>
                                    {/no/i.test(f.vs.troop) ? <PiXBold size={9} /> : "~"}
                                  </span>
                                  <span className="vs-value">{f.vs.troop}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="tcn-cmp-card-foot">
                      <span className="tcn-tag">
                        <PiCheckCircleDuotone size={11} /> {f.category}
                      </span>
                      {f.details && (
                        <button
                          type="button"
                          className="tcn-cmp-card-toggle"
                          onClick={() => setExpandedCard(isExpanded ? null : f.title)}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? "Show less" : "Show details"}
                          <span className={`toggle-caret ${isExpanded ? "open" : ""}`}>
                            <PiCaretDownBold size={10} />
                          </span>
                        </button>
                      )}
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
