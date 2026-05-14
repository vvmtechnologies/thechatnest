import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PiMagnifyingGlassDuotone,
  PiHouseDuotone,
  PiCurrencyInrDuotone,
  PiSparkleDuotone,
  PiScalesDuotone,
  PiBookOpenDuotone,
  PiHeadsetDuotone,
  PiDownloadDuotone,
  PiBracketsCurlyDuotone,
  PiVideoConferenceDuotone,
  PiPaintBrushDuotone,
  PiShieldCheckDuotone,
  PiHeartbeatDuotone,
  PiUsersThreeDuotone,
  PiCommandDuotone,
  PiCornersOutDuotone,
  PiArrowUpDuotone,
  PiArrowDownDuotone,
  PiKeyReturnDuotone,
} from "react-icons/pi";

// Global Cmd+K / Ctrl+K command palette. Mounted at the website layout
// level. Searches public pages, blog posts, FAQs, and tools.

const ITEMS = [
  // Pages
  { kind: "page", label: "Home",                 to: "/",                  Icon: PiHouseDuotone,             desc: "Landing page" },
  { kind: "page", label: "Pricing",              to: "/pricing",           Icon: PiCurrencyInrDuotone,       desc: "Plans + savings calculator" },
  { kind: "page", label: "Features",             to: "/features",          Icon: PiSparkleDuotone,           desc: "What we ship" },
  { kind: "page", label: "Compare",              to: "/compare",           Icon: PiScalesDuotone,            desc: "33 features Slack/Teams/Troop don't ship" },
  { kind: "page", label: "Why TheChatNest",      to: "/why-thechatnest",   Icon: PiSparkleDuotone,           desc: "Founder note + values" },
  { kind: "page", label: "Downloads",            to: "/downloads",         Icon: PiDownloadDuotone,          desc: "Mac, Windows, Linux, mobile" },
  { kind: "page", label: "How it works",         to: "/how-it-works",      Icon: PiBookOpenDuotone,          desc: "Product tour" },
  { kind: "page", label: "Demo",                 to: "/demo",              Icon: PiVideoConferenceDuotone,   desc: "Book a 30-min walkthrough" },
  { kind: "page", label: "Contact",              to: "/contact",           Icon: PiHeadsetDuotone,           desc: "Talk to sales / support" },
  { kind: "page", label: "Help center",          to: "/help",              Icon: PiHeadsetDuotone,           desc: "Guides + FAQs + support" },
  { kind: "page", label: "Blog",                 to: "/blog",              Icon: PiBookOpenDuotone,          desc: "Field notes from the team" },
  { kind: "page", label: "Brand kit",            to: "/brand",             Icon: PiPaintBrushDuotone,        desc: "Logos, colors, fonts" },
  { kind: "page", label: "Security",             to: "/security",          Icon: PiShieldCheckDuotone,       desc: "Our honest security posture" },
  { kind: "page", label: "System status",        to: "/status",            Icon: PiHeartbeatDuotone,         desc: "Live system health" },
  { kind: "page", label: "Referrals",            to: "/referrals",         Icon: PiUsersThreeDuotone,        desc: "Refer a team, both get a free month" },
  { kind: "page", label: "Versions",             to: "/versions",          Icon: PiSparkleDuotone,           desc: "What's new" },
  // Use cases
  { kind: "page", label: "For engineering",      to: "/for-engineering",   Icon: PiBracketsCurlyDuotone,     desc: "Use case: engineering teams" },
  { kind: "page", label: "For sales",            to: "/for-sales",         Icon: PiSparkleDuotone,           desc: "Use case: sales teams" },
  { kind: "page", label: "For remote",           to: "/for-remote",        Icon: PiHouseDuotone,             desc: "Use case: remote teams" },
  { kind: "page", label: "For agencies",         to: "/for-agencies",      Icon: PiSparkleDuotone,           desc: "Use case: agencies" },
  // Blog posts
  { kind: "blog", label: "10 Slack alternatives in 2026",     to: "/blog/slack-alternatives-2026",        Icon: PiBookOpenDuotone, desc: "Comparison · 9 min read" },
  { kind: "blog", label: "Self-hosted team messaging guide",   to: "/blog/self-hosted-team-messaging-guide", Icon: PiBookOpenDuotone, desc: "Self-host · 14 min read" },
  { kind: "blog", label: "Team chat security checklist 2026",  to: "/blog/team-chat-security-2026",         Icon: PiBookOpenDuotone, desc: "Security · 11 min read" },
  // Actions
  { kind: "action", label: "Start free trial",   to: "/auth/register",     Icon: PiSparkleDuotone,           desc: "14 days, no card" },
  { kind: "action", label: "Sign in",            to: "/auth/login",        Icon: PiKeyReturnDuotone,         desc: "Already a member?" },
  { kind: "action", label: "Book a demo",        to: "/demo",              Icon: PiVideoConferenceDuotone,   desc: "30-min live walkthrough" },
];

const KIND_META = {
  page:   { label: "Page",    tint: "#2065D1" },
  blog:   { label: "Article", tint: "#6d5dfc" },
  action: { label: "Action",  tint: "#16a34a" },
};

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Cmd+K / Ctrl+K to open, Esc to close, / to open
  useEffect(() => {
    const onKey = (e) => {
      const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const slash =
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target?.tagName || "").toUpperCase()) &&
        !e.target?.isContentEditable;
      if (cmdK || slash) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.desc.toLowerCase().includes(q) ||
        it.kind.toLowerCase().includes(q) ||
        it.to.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => { setActive(0); }, [query]);

  // Keep active item visible
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const el = list?.querySelector(`[data-idx="${active}"]`);
    if (el && list) {
      const er = el.getBoundingClientRect();
      const lr = list.getBoundingClientRect();
      if (er.top < lr.top) el.scrollIntoView({ block: "nearest" });
      else if (er.bottom > lr.bottom) el.scrollIntoView({ block: "nearest" });
    }
  }, [active, open]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) {
        navigate(item.to);
        setOpen(false);
      }
    }
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes tcnCpFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tcnCpIn {
          from { opacity: 0; transform: translate(-50%, -45%) scale(0.97); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .tcn-cp-overlay {
          position: fixed;
          inset: 0;
          background: rgba(11,15,30,0.55);
          backdrop-filter: blur(6px);
          z-index: 9500;
          animation: tcnCpFade 0.2s ease;
        }
        .tcn-cp {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(640px, calc(100vw - 32px));
          max-height: 70vh;
          z-index: 9600;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 36px 80px rgba(0,0,0,0.5);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: tcnCpIn 0.22s cubic-bezier(0.23,1,0.32,1);
        }
        .tcn-cp-input-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 1rem 1.2rem;
          border-bottom: 1px solid rgba(15,23,42,0.08);
        }
        .tcn-cp-input-row input {
          flex: 1;
          background: transparent;
          border: 0;
          outline: 0;
          font-family: inherit;
          font-size: 1rem;
          color: #0b0f1e;
          font-weight: 500;
        }
        .tcn-cp-input-row input::placeholder { color: rgba(15,23,42,0.4); }
        .tcn-cp-input-row .ic { color: rgba(15,23,42,0.45); }
        .tcn-cp-input-row kbd {
          padding: 2px 7px;
          border-radius: 5px;
          background: rgba(15,23,42,0.06);
          border: 1px solid rgba(15,23,42,0.1);
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 700;
          color: rgba(15,23,42,0.6);
        }
        .tcn-cp-list {
          overflow-y: auto;
          padding: 0.4rem;
          max-height: 50vh;
        }
        .tcn-cp-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          cursor: pointer;
          color: #0b0f1e;
          transition: background 0.12s ease;
        }
        .tcn-cp-row:hover, .tcn-cp-row.active {
          background: rgba(32,101,209,0.08);
        }
        .tcn-cp-row.active .tcn-cp-row-arrow { opacity: 1; transform: translateX(0); }
        .tcn-cp-row-ic {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--tint-soft);
          color: var(--tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tcn-cp-row-text { flex: 1; min-width: 0; }
        .tcn-cp-row-label {
          font-weight: 700;
          font-size: 0.92rem;
          color: #0b0f1e;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tcn-cp-row-desc {
          font-size: 0.78rem;
          color: rgba(15,23,42,0.55);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tcn-cp-row-kind {
          padding: 2px 8px;
          border-radius: 4px;
          background: var(--tint-soft);
          color: var(--tint);
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .tcn-cp-row-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.15s ease;
          color: rgba(15,23,42,0.4);
          flex-shrink: 0;
        }
        .tcn-cp-empty {
          padding: 2rem 1rem;
          text-align: center;
          color: rgba(15,23,42,0.5);
          font-size: 0.9rem;
        }
        .tcn-cp-foot {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 0.65rem 1.2rem;
          border-top: 1px solid rgba(15,23,42,0.08);
          font-size: 0.78rem;
          color: rgba(15,23,42,0.5);
          flex-wrap: wrap;
        }
        .tcn-cp-foot span { display: inline-flex; align-items: center; gap: 5px; }
        .tcn-cp-foot kbd {
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(15,23,42,0.06);
          border: 1px solid rgba(15,23,42,0.1);
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 700;
          color: rgba(15,23,42,0.65);
        }
        @media (prefers-reduced-motion: reduce) {
          .tcn-cp-overlay, .tcn-cp { animation: none; }
        }
      `}</style>

      <div className="tcn-cp-overlay" onClick={() => setOpen(false)} />

      <div
        className="tcn-cp"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKey}
      >
        <div className="tcn-cp-input-row">
          <PiMagnifyingGlassDuotone size={18} className="ic" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="Search pages, articles, FAQs…"
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search query"
          />
          <kbd>esc</kbd>
        </div>

        <div className="tcn-cp-list" ref={listRef}>
          {results.length === 0 ? (
            <div className="tcn-cp-empty">
              Nothing matched "{query}". Try a different keyword.
            </div>
          ) : (
            results.map((it, i) => {
              const meta = KIND_META[it.kind];
              const Icon = it.Icon;
              return (
                <div
                  key={`${it.kind}-${it.to}`}
                  data-idx={i}
                  className={`tcn-cp-row ${i === active ? "active" : ""}`}
                  style={{ "--tint": meta.tint, "--tint-soft": `${meta.tint}1a` }}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    navigate(it.to);
                    setOpen(false);
                  }}
                  role="button"
                  tabIndex={-1}
                >
                  <span className="tcn-cp-row-ic"><Icon size={16} /></span>
                  <div className="tcn-cp-row-text">
                    <div className="tcn-cp-row-label">{it.label}</div>
                    <div className="tcn-cp-row-desc">{it.desc}</div>
                  </div>
                  <span className="tcn-cp-row-kind">{meta.label}</span>
                  <PiKeyReturnDuotone size={14} className="tcn-cp-row-arrow" />
                </div>
              );
            })
          )}
        </div>

        <div className="tcn-cp-foot">
          <span><kbd><PiArrowUpDuotone size={9} /></kbd><kbd><PiArrowDownDuotone size={9} /></kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <kbd><PiCommandDuotone size={10} /> K</kbd> toggle
          </span>
        </div>
      </div>
    </>
  );
};

export default CommandPalette;
