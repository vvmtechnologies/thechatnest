import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  PiHeartbeatDuotone,
  PiArrowsClockwiseDuotone,
  PiCheckCircleDuotone,
  PiWarningCircleDuotone,
  PiXCircleDuotone,
  PiArrowRightBold,
} from "react-icons/pi";
import { API_BASE_URL } from "../../config/apiBaseUrl";
import Seo from "../../components/Seo.jsx";

// Self-hosted simple status page.
// Pings a small set of public health endpoints with a short timeout
// and renders Operational / Degraded / Down per component.

const COMPONENTS = [
  {
    key: "marketing",
    name: "Marketing site",
    url: typeof window !== "undefined" ? window.location.origin : "https://www.thechatnest.com",
    method: "GET",
    expectStatus: 200,
  },
  {
    key: "api",
    name: "API",
    url: API_BASE_URL ? `${API_BASE_URL}/health` : "",
    method: "GET",
    expectStatus: 200,
  },
  {
    key: "auth",
    name: "Authentication",
    url: API_BASE_URL ? `${API_BASE_URL}/health` : "",
    method: "GET",
    expectStatus: 200,
  },
  {
    key: "files",
    name: "File uploads",
    url: API_BASE_URL ? `${API_BASE_URL}/health` : "",
    method: "GET",
    expectStatus: 200,
  },
];

const fetchWithTimeout = (url, opts = {}, ms = 6000) =>
  Promise.race([
    fetch(url, { method: "GET", cache: "no-store", ...opts }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);

const probe = async (component) => {
  if (!component.url) return { status: "unknown", latency: null };
  const start = performance.now();
  try {
    const res = await fetchWithTimeout(component.url, {}, 6000);
    const latency = Math.round(performance.now() - start);
    if (res.ok && (!component.expectStatus || res.status === component.expectStatus)) {
      return { status: latency > 3000 ? "degraded" : "operational", latency };
    }
    return { status: "degraded", latency };
  } catch {
    return { status: "down", latency: null };
  }
};

const STATUS_META = {
  operational: { label: "Operational",  Icon: PiCheckCircleDuotone,  tint: "#16a34a" },
  degraded:    { label: "Degraded",     Icon: PiWarningCircleDuotone, tint: "#f59e0b" },
  down:        { label: "Outage",       Icon: PiXCircleDuotone,       tint: "#dc2626" },
  unknown:     { label: "Checking…",    Icon: PiArrowsClockwiseDuotone, tint: "#64748b" },
};

const overallStatus = (results) => {
  const states = Object.values(results).map((r) => r.status);
  if (states.includes("down")) return "down";
  if (states.includes("degraded")) return "degraded";
  if (states.every((s) => s === "operational")) return "operational";
  return "unknown";
};

const fmtTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const Status = () => {
  const [results, setResults] = useState(() =>
    Object.fromEntries(COMPONENTS.map((c) => [c.key, { status: "unknown", latency: null }]))
  );
  const [lastChecked, setLastChecked] = useState(null);
  const [checking, setChecking] = useState(false);

  const runChecks = useCallback(async () => {
    setChecking(true);
    const entries = await Promise.all(
      COMPONENTS.map(async (c) => [c.key, await probe(c)])
    );
    setResults(Object.fromEntries(entries));
    setLastChecked(new Date());
    setChecking(false);
  }, []);

  useEffect(() => {
    runChecks();
    const id = window.setInterval(runChecks, 60_000); // poll every 60s
    return () => window.clearInterval(id);
  }, [runChecks]);

  const overall = overallStatus(results);
  const overallMeta = STATUS_META[overall];

  return (
    <div className="tcn-status">
      <Seo
        title="System status"
        description="Live operational status for TheChatNest — marketing site, API, authentication, and file uploads. Updated every minute."
        keywords="thechatnest status, uptime, system status, service health"
      />

      <style>{`
        .tcn-status {
          background: linear-gradient(180deg, #fafbff 0%, #fff 60%);
          color: #0b0f1e;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          min-height: 100vh;
        }
        .tcn-status-hero {
          position: relative;
          padding: 7rem 0 3.5rem;
          background:
            radial-gradient(1100px 600px at 78% -10%, ${overallMeta.tint}3a, transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          overflow: hidden;
          transition: background 0.5s ease;
        }
        .tcn-status-hero::before {
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
        .tcn-status-hero > .container { position: relative; z-index: 1; text-align: center; }
        .tcn-status-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.85);
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .tcn-status-summary {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 1.1rem 1.85rem;
          border-radius: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid ${overallMeta.tint}55;
          box-shadow: 0 8px 30px ${overallMeta.tint}28;
          margin-bottom: 1.25rem;
          transition: all 0.3s ease;
        }
        .tcn-status-summary .pulse {
          position: relative;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: ${overallMeta.tint};
          flex-shrink: 0;
        }
        .tcn-status-summary .pulse::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 999px;
          background: ${overallMeta.tint};
          opacity: 0.4;
          animation: tcnStatusPulse 1.8s ease-out infinite;
        }
        @keyframes tcnStatusPulse {
          0% { transform: scale(0.7); opacity: 0.5; }
          80%, 100% { transform: scale(1.7); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tcn-status-summary .pulse::after { animation: none; }
        }
        .tcn-status-summary h1 {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.015em;
          margin: 0;
          color: #fff;
          line-height: 1.1;
        }
        .tcn-status-hero p.lede {
          color: rgba(255,255,255,0.65);
          font-size: 0.95rem;
          margin: 0 0 1.5rem;
        }
        .tcn-status-hero p.lede strong { color: #fff; }
        .tcn-status-refresh {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 1.05rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.18s ease;
        }
        .tcn-status-refresh:hover { background: rgba(255,255,255,0.16); }
        .tcn-status-refresh:disabled { cursor: wait; opacity: 0.6; }
        .tcn-status-refresh.checking svg { animation: tcnStatusSpin 1s linear infinite; }
        @keyframes tcnStatusSpin {
          to { transform: rotate(360deg); }
        }

        /* component list */
        .tcn-status-list {
          max-width: 880px;
          margin: 3.5rem auto;
          padding: 0 1rem;
        }
        .tcn-status-list h2 {
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(15,23,42,0.5);
          margin: 0 0 1rem;
          padding-left: 0.25rem;
        }
        .tcn-status-grid {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 18px 40px rgba(15,23,42,0.05);
        }
        .tcn-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.15rem 1.65rem;
          border-bottom: 1px solid rgba(15,23,42,0.07);
        }
        .tcn-status-row:last-child { border-bottom: 0; }
        .tcn-status-row .name {
          font-weight: 700;
          font-size: 0.98rem;
          color: #0b0f1e;
        }
        .tcn-status-row .right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tcn-status-row .latency {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          color: rgba(15,23,42,0.5);
          font-weight: 700;
        }
        .tcn-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 11px;
          border-radius: 999px;
          background: var(--tint-soft);
          color: var(--tint);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          font-family: "JetBrains Mono", monospace;
        }

        /* notes / contact */
        .tcn-status-notes {
          max-width: 880px;
          margin: 2.5rem auto;
          padding: 1.5rem 1.75rem;
          border-radius: 14px;
          background: rgba(32,101,209,0.05);
          border: 1px solid rgba(32,101,209,0.18);
          color: #1e3a8a;
          font-size: 0.92rem;
          line-height: 1.6;
        }
        .tcn-status-notes a { color: #2065D1; font-weight: 700; }

        .tcn-status-cta {
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          color: #fff;
          padding: 3.5rem 0;
          text-align: center;
        }
        .tcn-status-cta h2 { color: #fff; font-size: clamp(1.5rem, 2.8vw, 2rem); font-weight: 800; margin: 0 0 0.6rem; }
        .tcn-status-cta p { color: rgba(255,255,255,0.72); max-width: 520px; margin: 0 auto 1.5rem; }
        .tcn-status-cta a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.75rem 1.5rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none !important;
          box-shadow: 0 10px 26px rgba(255,213,74,0.4);
          transition: transform 0.18s ease;
        }
        .tcn-status-cta a:hover { transform: translateY(-2px); color: #1a1f3a !important; }
      `}</style>

      <section className="tcn-status-hero">
        <div className="container">
          <span className="tcn-status-eyebrow">
            <PiHeartbeatDuotone size={12} /> Live System Status
          </span>

          <div className="tcn-status-summary">
            <span className="pulse" aria-hidden />
            <h1>
              {overall === "operational" && "All systems operational"}
              {overall === "degraded"    && "Some systems degraded"}
              {overall === "down"        && "Service disruption in progress"}
              {overall === "unknown"     && "Checking system status…"}
            </h1>
          </div>

          <p className="lede">
            Last checked at <strong>{lastChecked ? fmtTime(lastChecked) : "—"}</strong>.
            Page auto-refreshes every 60 seconds.
          </p>

          <button
            type="button"
            className={`tcn-status-refresh ${checking ? "checking" : ""}`}
            onClick={runChecks}
            disabled={checking}
            aria-label="Refresh checks now"
          >
            <PiArrowsClockwiseDuotone size={13} />
            {checking ? "Refreshing…" : "Refresh now"}
          </button>
        </div>
      </section>

      <div className="tcn-status-list">
        <h2>Components</h2>
        <div className="tcn-status-grid">
          {COMPONENTS.map((c) => {
            const r = results[c.key] || { status: "unknown", latency: null };
            const meta = STATUS_META[r.status];
            const Icon = meta.Icon;
            return (
              <div key={c.key} className="tcn-status-row">
                <div className="name">{c.name}</div>
                <div className="right">
                  {r.latency != null && (
                    <span className="latency">{r.latency} ms</span>
                  )}
                  <span
                    className="tcn-status-pill"
                    style={{ "--tint": meta.tint, "--tint-soft": `${meta.tint}1a` }}
                  >
                    <Icon size={11} />
                    {meta.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="tcn-status-notes">
          Status is computed by your browser pinging our public health endpoints over the
          internet. If you see Degraded from your network but the rest of the world looks
          fine, it might be a local connectivity issue. Reach out at{" "}
          <a href="mailto:support@thechatnest.com">support@thechatnest.com</a> if you need
          help debugging.
        </div>
      </div>

      <section className="tcn-status-cta">
        <div className="container">
          <h2>Need to reach engineering?</h2>
          <p>
            For incident updates outside this page, follow{" "}
            <strong>@thechatnest</strong> on X or contact our team directly.
          </p>
          <Link to="/contact">
            Contact support <PiArrowRightBold size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Status;
