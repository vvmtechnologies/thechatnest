import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PiBrowserDuotone,
  PiAndroidLogoDuotone,
  PiAppleLogoDuotone,
  PiDesktopDuotone,
  PiSparkleDuotone,
  PiBugDuotone,
  PiShieldCheckDuotone,
  PiTrendUpDuotone,
  PiWarningDuotone,
  PiGaugeDuotone,
  PiArrowRightBold,
  PiCheckBold,
  PiCalendarDuotone,
} from "react-icons/pi";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";

const PLATFORMS = {
  web: { label: "Web", Icon: PiBrowserDuotone, tint: "#0ea5e9" },
  android: { label: "Android", Icon: PiAndroidLogoDuotone, tint: "#22c55e" },
  ios: { label: "iOS", Icon: PiAppleLogoDuotone, tint: "#ec4899" },
  desktop: { label: "Desktop", Icon: PiDesktopDuotone, tint: "#a855f7" },
};

const CHANGE_TYPES = {
  feature: { label: "Feature", Icon: PiSparkleDuotone, tint: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  improvement: { label: "Improvement", Icon: PiTrendUpDuotone, tint: "#0ea5e9", bg: "rgba(14,165,233,0.12)" },
  fix: { label: "Fix", Icon: PiBugDuotone, tint: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  security: { label: "Security", Icon: PiShieldCheckDuotone, tint: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  performance: { label: "Performance", Icon: PiGaugeDuotone, tint: "#6d5dfc", bg: "rgba(109,93,252,0.12)" },
  breaking: { label: "Breaking", Icon: PiWarningDuotone, tint: "#ec4899", bg: "rgba(236,72,153,0.12)" },
};

// ─── Release data (unchanged) ────────────────────────────
const releases = [
  {
    version: "1.5.3",
    date: "May 10, 2026",
    tag: "Latest",
    platforms: ["web", "android", "desktop"],
    changes: [
      { type: "feature", text: "Image format conversion in chat — convert any image to PNG, JPG, or WebP before sending" },
      { type: "feature", text: "AI background removal for image attachments — one tap to make a transparent PNG" },
      { type: "feature", text: "Desktop auto-update — installed app now updates itself silently via GitHub Releases" },
      { type: "feature", text: "Admin OTP Verifications tab — view the last 25 OTP attempts with status, channel, and IP" },
      { type: "improvement", text: "Meeting details dialog is now mobile-friendly — full-screen on phones with a 2-up stat layout" },
      { type: "fix", text: "Meeting details now show Duration and Started for instant meetings that ended without going live" },
      { type: "fix", text: "Linked Devices QR scanner now requests camera permission upfront on Android and iOS" },
      { type: "fix", text: "Meeting room controls on mobile no longer overlap the home-indicator safe area" },
      { type: "improvement", text: "Cleaner login page — silenced 401/404 console noise on unauthenticated visits" },
      { type: "security", text: "Rate-limited auth REST endpoints — 5 logins / 15 min, 3 password resets / hour" },
    ],
  },
  {
    version: "1.5.2",
    date: "April 12, 2026",
    platforms: ["web", "android", "ios", "desktop"],
    changes: [
      { type: "feature", text: "Incoming call ringtone — plays a ring sound with vibration when someone calls you" },
      { type: "feature", text: "Outgoing call tone — hear a ringback while waiting for the other person to pick up" },
      { type: "feature", text: "15 custom notification tones — choose from Chime, Ping, Bell, Crystal, and more" },
      { type: "improvement", text: "Improved call connectivity and reliability across all platforms" },
      { type: "improvement", text: "Faster app launch — optimized startup and session handling" },
      { type: "improvement", text: "Better offline experience — stay logged in even without internet connection" },
    ],
  },
  {
    version: "1.5.1",
    date: "April 10, 2026",
    platforms: ["web"],
    changes: [
      { type: "feature", text: "11 new website pages — Downloads, Blogs, Versions, Channel Partner, Privacy, GDPR, Refund Policy" },
      { type: "feature", text: "Self-Hosted vs Cloud deployment comparison on the Compare page" },
      { type: "feature", text: "30 new features added to the product comparison across Mobile & Web categories" },
      { type: "feature", text: "Features page now shows a visual comparison chart against competitors" },
      { type: "improvement", text: "Updated website branding, footer, and contact information" },
      { type: "improvement", text: "Refreshed Compare page with cost savings calculator and exclusive feature highlights" },
    ],
  },
  {
    version: "1.5.0",
    date: "April 5, 2026",
    platforms: ["web", "android", "ios"],
    changes: [
      { type: "feature", text: "Mobile app launch — 55+ screens with full feature parity with web" },
      { type: "feature", text: "1-on-1 audio and video calling with high-quality real-time connection" },
      { type: "feature", text: "Screen share receive on mobile — view shared screens during calls" },
      { type: "feature", text: "AI Live Assistant on mobile — get instant answers in English, Hindi, and Hinglish" },
      { type: "feature", text: "QR Code login — scan from your browser to instantly log in on mobile" },
      { type: "feature", text: "Biometric login — use fingerprint or Face ID for fast, secure access" },
      { type: "feature", text: "Offline message queue — messages are saved and sent automatically when you're back online" },
      { type: "feature", text: "Mobile admin panel — manage users, groups, departments, and billing from your phone" },
      { type: "feature", text: "Swipe to reply — swipe right on any message to instantly reply" },
      { type: "feature", text: "Dark mode — complete dark theme across all screens" },
      { type: "feature", text: "Chat wallpaper — set a custom background for each conversation" },
      { type: "feature", text: "Voice message speed control — play at 1x, 1.5x, or 2x" },
      { type: "feature", text: "Draft auto-save — unsent messages are automatically restored" },
      { type: "feature", text: "Pin and archive chats — keep important chats on top, hide old ones" },
      { type: "feature", text: "Profile photo upload — take or choose from your gallery" },
      { type: "security", text: "Device limit — maximum 3 devices logged in at once for security" },
    ],
  },
  {
    version: "1.4.0",
    date: "March 15, 2026",
    platforms: ["web"],
    changes: [
      { type: "feature", text: "Compare page — side-by-side comparison against Slack, Teams, and Troop Messenger" },
      { type: "feature", text: "Cost calculator — estimate savings with adjustable team size and contract length" },
      { type: "feature", text: "190+ features cataloged with descriptions across 11 categories" },
      { type: "feature", text: "Screen annotation — draw and highlight directly on shared screens during meetings" },
      { type: "feature", text: "Remote desktop control — take control of a shared screen for hands-on support" },
      { type: "feature", text: "Broadcast with attachments — send files to multiple contacts at once" },
      { type: "feature", text: "Chat export — save entire chat history as a text file" },
      { type: "security", text: "Password strength meter — visual indicator showing Weak, Fair, Good, or Strong" },
      { type: "security", text: "Terms and Privacy acceptance — required on registration with linked legal pages" },
    ],
  },
  {
    version: "1.3.0",
    date: "February 20, 2026",
    platforms: ["web"],
    changes: [
      { type: "feature", text: "AI Smart Compose — get auto-complete suggestions as you type" },
      { type: "feature", text: "AI Tone Adjuster — rewrite any message in Formal, Friendly, or Diplomatic tone" },
      { type: "feature", text: "Smart Reply — choose from 3 AI-suggested replies in the sender's language" },
      { type: "feature", text: "Auto Translate — instantly translate messages across 14 languages" },
      { type: "feature", text: "Grammar Check — automatic correction before you hit send" },
      { type: "feature", text: "AI Search — find messages by meaning, not just exact words" },
      { type: "feature", text: "AI Help Guide — built-in assistant for feature questions and troubleshooting" },
      { type: "feature", text: "AI Call Notes — auto-generated meeting summaries with key points and action items" },
    ],
  },
  {
    version: "1.2.0",
    date: "January 10, 2026",
    platforms: ["web"],
    changes: [
      { type: "feature", text: "Group video meetings with gallery and speaker view layouts" },
      { type: "feature", text: "Meeting scheduling with RSVP — accept, decline, or mark as tentative" },
      { type: "feature", text: "Reactions and hand raise during meetings" },
      { type: "feature", text: "Pin or spotlight any participant's video" },
      { type: "feature", text: "In-meeting text chat for side discussions" },
      { type: "feature", text: "Meeting duration tracker — see how long each meeting runs" },
      { type: "feature", text: "Professional email invitations with one-click join buttons" },
      { type: "feature", text: "Instant meetings — start with one click, share by meeting ID" },
    ],
  },
  {
    version: "1.1.0",
    date: "December 5, 2025",
    platforms: ["web"],
    changes: [
      { type: "security", text: "End-to-end encryption — all messages encrypted with military-grade AES-256" },
      { type: "feature", text: "Disappearing messages — set messages to auto-delete after 24 hours or 7 days" },
      { type: "feature", text: "Chat lock — protect sensitive conversations with a PIN code" },
      { type: "security", text: "IP and platform restrictions — control who can access your workspace" },
      { type: "security", text: "Input protection — all messages are sanitized to prevent malicious content" },
      { type: "security", text: "File safety — dangerous file types are automatically blocked" },
      { type: "security", text: "Device limit — maximum 3 simultaneous logins with device management" },
      { type: "security", text: "Account deletion — permanently delete your account and all data (GDPR compliant)" },
    ],
  },
  {
    version: "1.0.0",
    date: "November 1, 2025",
    tag: "Initial Release",
    platforms: ["web", "desktop"],
    changes: [
      { type: "feature", text: "Direct messaging and group chat with instant delivery" },
      { type: "feature", text: "File and image sharing — up to 2 GB per upload" },
      { type: "feature", text: "Voice messages with recording and playback" },
      { type: "feature", text: "GIF picker — search and send animated GIFs" },
      { type: "feature", text: "Emoji reactions on any message" },
      { type: "feature", text: "Reply, forward, pin, edit, and delete messages" },
      { type: "feature", text: "Read receipts and typing indicators" },
      { type: "feature", text: "Broadcast messages to multiple contacts at once" },
      { type: "feature", text: "Admin dashboard with role-based permissions" },
      { type: "feature", text: "Department and designation management" },
      { type: "feature", text: "Built-in billing — subscriptions, invoices, and payments" },
      { type: "feature", text: "Self-hosted and cloud deployment options" },
      { type: "feature", text: "Windows desktop app" },
      { type: "feature", text: "Online, offline, and idle status indicators" },
    ],
  },
];

const PLATFORM_FILTERS = [
  { key: "all", label: "All platforms", Icon: null },
  { key: "web", label: "Web", Icon: PiBrowserDuotone },
  { key: "android", label: "Android", Icon: PiAndroidLogoDuotone },
  { key: "ios", label: "iOS", Icon: PiAppleLogoDuotone },
  { key: "desktop", label: "Desktop", Icon: PiDesktopDuotone },
];

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "feature", label: "Features" },
  { key: "improvement", label: "Improvements" },
  { key: "fix", label: "Fixes" },
  { key: "security", label: "Security" },
];

export default function Versions() {
  const { brandName } = useSiteBranding();
  const [platformFilter, setPlatformFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return releases
      .filter((r) => platformFilter === "all" || r.platforms.includes(platformFilter))
      .map((r) => {
        if (typeFilter === "all") return r;
        const changes = r.changes.filter((c) => c.type === typeFilter);
        return changes.length > 0 ? { ...r, changes } : null;
      })
      .filter(Boolean);
  }, [platformFilter, typeFilter]);

  const stats = useMemo(() => {
    const features = releases.reduce((s, r) => s + r.changes.filter((c) => c.type === "feature").length, 0);
    const fixes = releases.reduce((s, r) => s + r.changes.filter((c) => c.type === "fix").length, 0);
    const sec = releases.reduce((s, r) => s + r.changes.filter((c) => c.type === "security").length, 0);
    return { releases: releases.length, features, fixes, sec };
  }, []);

  return (
    <div className="tcn-versions">
      <style>{`
        .tcn-versions { background: #fff; }

        /* HERO */
        .tcn-ver-hero {
          background:
            radial-gradient(1200px 600px at 80% -10%, rgba(109,93,252,0.32), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.1), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          padding: 8rem 0 4.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .tcn-ver-hero::before {
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
        .tcn-ver-hero > .container { position: relative; z-index: 1; }
        .tcn-ver-hero h1 {
          font-size: clamp(2.4rem, 5vw, 4rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.025em;
          line-height: 1.08;
          margin: 0 auto 1.25rem;
          max-width: 800px;
        }
        .tcn-ver-hero .gradient-word {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-ver-hero p.lead {
          font-size: 1.15rem;
          color: rgba(255,255,255,0.7);
          max-width: 620px;
          margin: 0 auto 2.5rem;
          line-height: 1.6;
        }
        .tcn-ver-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .tcn-ver-stat {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 1rem 1.5rem;
          min-width: 140px;
          backdrop-filter: blur(10px);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .tcn-ver-stat:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.1);
        }
        .tcn-ver-stat .num {
          font-size: 2rem;
          font-weight: 800;
          display: block;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, var(--g1, #ffd54a), var(--g2, #ffb74d));
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .tcn-ver-stat .lbl {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.6);
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* FILTERS — sticky */
        .tcn-ver-filters {
          position: sticky;
          top: 64px;
          z-index: 20;
          background: rgba(255,255,255,0.95);
          backdrop-filter: saturate(180%) blur(14px);
          border-bottom: 1px solid var(--tcn-border);
          padding: 1rem 0;
        }
        .tcn-ver-filters-inner {
          display: flex;
          gap: 1rem;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-ver-filter-group {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .tcn-ver-pill {
          padding: 0.5rem 1rem;
          border-radius: 999px;
          border: 1px solid var(--tcn-border);
          background: #fff;
          color: var(--tcn-ink-700);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .tcn-ver-pill:hover {
          background: var(--tcn-violet-50);
          border-color: var(--tcn-violet-500);
          color: var(--tcn-violet-600);
        }
        .tcn-ver-pill.active {
          background: linear-gradient(135deg, var(--tcn-navy-900), var(--tcn-navy-800));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(11,15,30,0.25);
        }
        .tcn-ver-divider {
          width: 1px;
          height: 26px;
          background: var(--tcn-border);
        }

        /* TIMELINE */
        .tcn-ver-timeline {
          max-width: 920px;
          margin: 0 auto;
          padding: 4rem 1rem;
          position: relative;
        }
        .tcn-ver-timeline::before {
          content: "";
          position: absolute;
          left: 22px;
          top: 4.5rem;
          bottom: 4rem;
          width: 2px;
          background: linear-gradient(180deg, var(--tcn-violet-600) 0%, var(--tcn-border) 12%, var(--tcn-border) 100%);
        }
        .tcn-ver-release {
          position: relative;
          padding-left: 56px;
          padding-bottom: 2.5rem;
        }
        .tcn-ver-release:last-child { padding-bottom: 0; }
        .tcn-ver-dot {
          position: absolute;
          left: 11px;
          top: 8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid var(--tcn-border);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        .tcn-ver-release.latest .tcn-ver-dot {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          border-color: transparent;
          box-shadow: 0 0 0 4px rgba(255,213,74,0.18), 0 0 16px rgba(255,213,74,0.5);
        }
        .tcn-ver-card {
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 18px;
          padding: 1.75rem 1.6rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .tcn-ver-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--tcn-shadow-md);
        }
        .tcn-ver-release.latest .tcn-ver-card {
          border-color: rgba(255,213,74,0.5);
          box-shadow: 0 12px 32px rgba(255,213,74,0.12);
        }

        .tcn-ver-card-head {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .tcn-ver-version {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--tcn-ink-900);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .tcn-ver-date {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--tcn-ink-500);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .tcn-ver-tag {
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .tcn-ver-tag.latest {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a;
          box-shadow: 0 3px 10px rgba(255,213,74,0.35);
        }
        .tcn-ver-tag.initial {
          background: var(--tcn-violet-50);
          color: var(--tcn-violet-600);
        }
        .tcn-ver-platforms {
          display: flex;
          gap: 5px;
          margin-left: auto;
        }
        .tcn-ver-plat-chip {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .tcn-ver-summary {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .tcn-ver-summary-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .tcn-ver-changes {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .tcn-ver-change {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 0.55rem 0.75rem;
          border-radius: 10px;
          transition: background 0.18s ease;
        }
        .tcn-ver-change:hover {
          background: var(--tcn-bg-soft);
        }
        .tcn-ver-change-icon {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .tcn-ver-change-text {
          color: var(--tcn-ink-700);
          font-size: 0.92rem;
          line-height: 1.5;
        }

        .tcn-ver-empty {
          text-align: center;
          padding: 4rem 1.5rem;
          color: var(--tcn-ink-500);
        }
        .tcn-ver-empty button {
          margin-top: 0.85rem;
          padding: 0.6rem 1.25rem;
          border-radius: 999px;
          background: var(--tcn-violet-600);
          color: #fff;
          border: none;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }

        /* FINAL CTA */
        .tcn-ver-cta {
          padding: 4rem 0 6rem;
        }
        .tcn-ver-cta-inner {
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
        .tcn-ver-cta-inner::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(600px 300px at 20% 0%, rgba(255,213,74,0.2), transparent 60%),
            radial-gradient(600px 300px at 80% 100%, rgba(109,93,252,0.3), transparent 60%);
          pointer-events: none;
        }
        .tcn-ver-cta-inner > * { position: relative; z-index: 1; }
        .tcn-ver-cta h2 {
          color: #fff;
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          font-weight: 800;
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
        }
        .tcn-ver-cta p {
          color: rgba(255,255,255,0.72);
          font-size: 1.05rem;
          max-width: 540px;
          margin: 0 auto 1.75rem;
          line-height: 1.6;
        }
        .tcn-ver-cta .btns {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-ver-cta .btn-gold {
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
        .tcn-ver-cta .btn-gold:hover { transform: translateY(-2px); color: #1a1f3a !important; }
        .tcn-ver-cta .btn-ghost {
          padding: 0.9rem 1.75rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff !important;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none !important;
          backdrop-filter: blur(8px);
        }

        @media (max-width: 768px) {
          .tcn-ver-hero { padding: 6.5rem 0 3rem; }
          .tcn-ver-timeline { padding: 3rem 0.25rem; }
          .tcn-ver-card { padding: 1.4rem 1.2rem; }
          .tcn-ver-cta-inner { padding: 3rem 1.5rem; }
          .tcn-ver-divider { display: none; }
        }
      `}</style>

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="tcn-ver-hero">
        <div className="container">
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
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#22c55e", boxShadow: "0 0 0 4px rgba(34,197,94,0.25)" }} />
            Changelog
          </span>

          <h1>
            We ship updates <span className="gradient-word">every week</span>
          </h1>
          <p className="lead">
            Every release makes {brandName || "TheChatNest"} faster, more secure, and more
            powerful. Here's everything we've shipped.
          </p>

          <div className="tcn-ver-stats">
            <div className="tcn-ver-stat">
              <span className="num">{stats.releases}</span>
              <span className="lbl">Releases</span>
            </div>
            <div className="tcn-ver-stat" style={{ "--g1": "#22c55e", "--g2": "#16a34a" }}>
              <span className="num">{stats.features}</span>
              <span className="lbl">Features added</span>
            </div>
            <div className="tcn-ver-stat" style={{ "--g1": "#f59e0b", "--g2": "#d97706" }}>
              <span className="num">{stats.fixes}</span>
              <span className="lbl">Bugs fixed</span>
            </div>
            <div className="tcn-ver-stat" style={{ "--g1": "#ef4444", "--g2": "#dc2626" }}>
              <span className="num">{stats.sec}</span>
              <span className="lbl">Security updates</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FILTERS ───────────────────────────────────────── */}
      <div className="tcn-ver-filters">
        <div className="container">
          <div className="tcn-ver-filters-inner">
            <div className="tcn-ver-filter-group">
              {PLATFORM_FILTERS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  className={`tcn-ver-pill ${platformFilter === key ? "active" : ""}`}
                  onClick={() => setPlatformFilter(key)}
                >
                  {Icon && <Icon size={14} />} {label}
                </button>
              ))}
            </div>

            <div className="tcn-ver-divider" />

            <div className="tcn-ver-filter-group">
              {TYPE_FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`tcn-ver-pill ${typeFilter === key ? "active" : ""}`}
                  onClick={() => setTypeFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── TIMELINE ──────────────────────────────────────── */}
      <div className="container">
        <div className="tcn-ver-timeline">
          {filtered.length === 0 ? (
            <div className="tcn-ver-empty">
              <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>📋</div>
              <h4 style={{ fontWeight: 700, color: "var(--tcn-ink-900)" }}>
                No releases match your filters
              </h4>
              <button
                onClick={() => {
                  setPlatformFilter("all");
                  setTypeFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((r, i) => {
              const isLatest = r.tag === "Latest" || i === 0;
              const isInitial = r.tag === "Initial Release";
              const counts = {};
              r.changes.forEach((c) => {
                counts[c.type] = (counts[c.type] || 0) + 1;
              });

              return (
                <div key={r.version} className={`tcn-ver-release ${isLatest ? "latest" : ""}`}>
                  <span className="tcn-ver-dot">
                    {isLatest && <PiSparkleDuotone size={12} color="#1a1f3a" />}
                  </span>
                  <div className="tcn-ver-card">
                    <div className="tcn-ver-card-head">
                      <h3 className="tcn-ver-version">v{r.version}</h3>
                      <span className="tcn-ver-date">
                        <PiCalendarDuotone size={14} />
                        {r.date}
                      </span>
                      {r.tag && (
                        <span className={`tcn-ver-tag ${isLatest ? "latest" : isInitial ? "initial" : ""}`}>
                          {r.tag}
                        </span>
                      )}
                      <div className="tcn-ver-platforms">
                        {r.platforms.map((p) => {
                          const plat = PLATFORMS[p];
                          if (!plat) return null;
                          const Icon = plat.Icon;
                          return (
                            <span
                              key={p}
                              className="tcn-ver-plat-chip"
                              title={plat.label}
                              style={{
                                background: `${plat.tint}1a`,
                                color: plat.tint,
                              }}
                            >
                              <Icon size={16} />
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Summary chips */}
                    <div className="tcn-ver-summary">
                      {Object.entries(counts).map(([type, count]) => {
                        const t = CHANGE_TYPES[type];
                        if (!t) return null;
                        return (
                          <span
                            key={type}
                            className="tcn-ver-summary-chip"
                            style={{ background: t.bg, color: t.tint }}
                          >
                            <t.Icon size={11} /> {count} {t.label}
                            {count > 1 && type === "fix" ? "es" : count > 1 ? "s" : ""}
                          </span>
                        );
                      })}
                    </div>

                    {/* Changes list */}
                    <ul className="tcn-ver-changes">
                      {r.changes.map((c, j) => {
                        const t = CHANGE_TYPES[c.type] || CHANGE_TYPES.feature;
                        return (
                          <li key={j} className="tcn-ver-change">
                            <span
                              className="tcn-ver-change-icon"
                              style={{ background: t.bg, color: t.tint }}
                            >
                              <t.Icon size={13} />
                            </span>
                            <span className="tcn-ver-change-text">{c.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── FINAL CTA ─────────────────────────────────────── */}
      <section className="tcn-ver-cta">
        <div className="container">
          <div className="tcn-ver-cta-inner">
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
              <PiSparkleDuotone size={12} /> What's next
            </span>
            <h2>Get every update the moment it ships</h2>
            <p>
              Start free for 14 days and grow with us. Auto-updates, new features, and security
              patches — all included.
            </p>
            <div className="btns">
              <Link to="/auth/register" className="btn-gold">
                Start free trial <PiArrowRightBold size={16} />
              </Link>
              <Link to="/features" className="btn-ghost">
                View all features
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
