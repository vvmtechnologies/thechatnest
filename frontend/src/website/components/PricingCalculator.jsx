import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiCalculatorDuotone,
  PiUsersThreeDuotone,
  PiSparkleDuotone,
  PiArrowRightBold,
  PiCurrencyInrDuotone,
} from "react-icons/pi";

// Currency switcher + team-size slider + savings calculator. Single
// section that drops onto the Pricing page. Uses live FX rates from
// exchangerate.host with a 24-hour localStorage cache so visitors abroad
// see prices in their currency without hammering an API.

const FX_CACHE_KEY = "tcn.fx.v1";
const FX_TTL_MS = 24 * 60 * 60 * 1000;
const FX_URL = "https://open.er-api.com/v6/latest/INR";

const CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
];

// Static fallback rates (1 INR = X currency) used if FX API fails.
// Updated periodically — close enough for display ROI.
const FALLBACK_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0094,
};

// Public pricing of competitor SaaS chat tools (per seat / month) in INR.
// Conservative figures that match published list prices.
const COMPETITOR_INR = {
  slack: 700,      // Slack Business+ approx 700 INR/seat
  teams: 580,      // MS Teams Business Standard
  troop: 450,      // Troop Messenger Premium
};

const TCN_INR = 199; // TheChatNest Standard

const readFxCache = () => {
  try {
    const raw = window.localStorage.getItem(FX_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.rates || !parsed?.cachedAt) return null;
    if (Date.now() - parsed.cachedAt > FX_TTL_MS) return null;
    return parsed.rates;
  } catch {
    return null;
  }
};

const writeFxCache = (rates) => {
  try {
    window.localStorage.setItem(FX_CACHE_KEY, JSON.stringify({ rates, cachedAt: Date.now() }));
  } catch {}
};

const PricingCalculator = () => {
  const [currency, setCurrency] = useState("INR");
  const [seats, setSeats] = useState(10);
  const [rates, setRates] = useState(() => readFxCache() || FALLBACK_RATES);

  useEffect(() => {
    if (readFxCache()) return; // fresh cache — skip
    let cancelled = false;
    fetch(FX_URL)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const r = data?.rates || {};
        const merged = {
          INR: 1,
          USD: r.USD ?? FALLBACK_RATES.USD,
          EUR: r.EUR ?? FALLBACK_RATES.EUR,
          GBP: r.GBP ?? FALLBACK_RATES.GBP,
        };
        setRates(merged);
        writeFxCache(merged);
      })
      .catch(() => {
        /* keep fallback rates */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "₹";
  const rate = rates[currency] || 1;

  const convert = (inr) => {
    if (currency === "INR") return Math.round(inr);
    // Keep 2 dp for foreign currencies
    return (inr * rate).toFixed(2);
  };

  const monthly = useMemo(() => ({
    tcn:   convert(TCN_INR * seats),
    slack: convert(COMPETITOR_INR.slack * seats),
    teams: convert(COMPETITOR_INR.teams * seats),
    troop: convert(COMPETITOR_INR.troop * seats),
  }), [seats, currency, rate]); // eslint-disable-line react-hooks/exhaustive-deps

  const yearly = useMemo(() => ({
    tcn:    convert(TCN_INR * seats * 12 * 0.8), // 20% off on annual
    slack:  convert(COMPETITOR_INR.slack * seats * 12),
    teams:  convert(COMPETITOR_INR.teams * seats * 12),
    troop:  convert(COMPETITOR_INR.troop * seats * 12),
  }), [seats, currency, rate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Savings vs Slack (the largest, most-common comparison)
  const savingVsSlackYearly = useMemo(() => {
    const tcnYear = TCN_INR * seats * 12 * 0.8;
    const slackYear = COMPETITOR_INR.slack * seats * 12;
    return convert(Math.max(0, slackYear - tcnYear));
  }, [seats, currency, rate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (val) =>
    typeof val === "number"
      ? val.toLocaleString("en-IN")
      : Number(val).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  return (
    <section className="tcn-calc">
      <style>{`
        .tcn-calc {
          padding: 5rem 0;
          background:
            linear-gradient(180deg, #fff 0%, #fafbff 50%, #fff 100%);
        }
        .tcn-calc-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .tcn-calc-head {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 2.75rem;
        }
        .tcn-calc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          background: rgba(32,101,209,0.1);
          color: #2065D1;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .tcn-calc h2 {
          font-size: clamp(1.85rem, 3.5vw, 2.6rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 0.85rem;
          color: #0b0f1e;
        }
        .tcn-calc h2 .accent { color: #2065D1; }
        .tcn-calc p.lede {
          color: rgba(15,23,42,0.6);
          font-size: 1.05rem;
          margin: 0;
        }

        /* Currency switcher */
        .tcn-calc-currency {
          display: inline-flex;
          align-items: center;
          gap: 0;
          padding: 4px;
          margin: 0 auto 2rem;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 999px;
          box-shadow: 0 4px 12px rgba(15,23,42,0.04);
        }
        .tcn-calc-currency button {
          padding: 0.55rem 1rem;
          border: 0;
          background: transparent;
          font-family: inherit;
          font-weight: 700;
          font-size: 0.86rem;
          color: rgba(15,23,42,0.55);
          cursor: pointer;
          border-radius: 999px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .tcn-calc-currency button:hover { color: #0b0f1e; }
        .tcn-calc-currency button.active {
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          color: #fff;
          box-shadow: 0 6px 14px rgba(11,15,30,0.25);
        }
        .tcn-calc-currency .sym {
          font-family: "JetBrains Mono", monospace;
          font-weight: 800;
        }

        /* Slider card */
        .tcn-calc-board {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 22px;
          padding: 2.25rem 2.25rem 2rem;
          box-shadow: 0 24px 60px rgba(15,23,42,0.06);
        }
        .tcn-calc-slider-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 2.25rem;
        }
        .tcn-calc-slider-label {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .tcn-calc-slider-label .lbl {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(15,23,42,0.55);
        }
        .tcn-calc-slider-label .val {
          font-size: 2.2rem;
          font-weight: 800;
          color: #0b0f1e;
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .tcn-calc-slider-label .val .sub {
          font-size: 0.85rem;
          color: rgba(15,23,42,0.5);
          font-weight: 600;
          margin-left: 6px;
        }
        .tcn-calc-slider {
          flex: 1;
          min-width: 280px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .tcn-calc-slider input[type="range"] {
          width: 100%;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(to right, #2065D1 0%, #2065D1 var(--pct), rgba(15,23,42,0.08) var(--pct), rgba(15,23,42,0.08) 100%);
          -webkit-appearance: none;
          appearance: none;
          outline: none;
        }
        .tcn-calc-slider input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #2065D1;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(32,101,209,0.4);
          transition: transform 0.15s ease;
        }
        .tcn-calc-slider input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .tcn-calc-slider input[type="range"]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #2065D1;
          cursor: pointer;
        }
        .tcn-calc-slider-tick {
          display: flex;
          justify-content: space-between;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 700;
          color: rgba(15,23,42,0.4);
          letter-spacing: 0.04em;
        }

        /* Cost grid */
        .tcn-calc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .tcn-calc-cell {
          padding: 1.4rem 1.3rem;
          border-radius: 16px;
          background: #fafbff;
          border: 1px solid rgba(15,23,42,0.08);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .tcn-calc-cell.us {
          background: linear-gradient(135deg, #0b0f1e, #1242a3 70%, #2065D1);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 18px 40px rgba(32,101,209,0.32);
        }
        .tcn-calc-cell.us::before {
          content: "BEST";
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 3px 9px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #6e4f10;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }
        .tcn-calc-cell .name {
          font-size: 0.85rem;
          font-weight: 700;
          color: rgba(15,23,42,0.55);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: "JetBrains Mono", monospace;
        }
        .tcn-calc-cell.us .name { color: rgba(255,213,74,0.85); }
        .tcn-calc-cell .price {
          font-size: 1.5rem;
          font-weight: 800;
          color: #0b0f1e;
          line-height: 1.05;
          letter-spacing: -0.015em;
          margin-bottom: 0.25rem;
        }
        .tcn-calc-cell.us .price { color: #fff; }
        .tcn-calc-cell .price .sym {
          font-family: "JetBrains Mono", monospace;
          font-weight: 700;
          margin-right: 2px;
          opacity: 0.85;
        }
        .tcn-calc-cell .sub {
          font-size: 0.8rem;
          color: rgba(15,23,42,0.5);
        }
        .tcn-calc-cell.us .sub { color: rgba(255,255,255,0.65); }
        .tcn-calc-cell .yr {
          margin-top: 0.6rem;
          padding-top: 0.6rem;
          border-top: 1px dashed rgba(15,23,42,0.12);
          font-size: 0.78rem;
          color: rgba(15,23,42,0.55);
          font-family: "JetBrains Mono", monospace;
          font-weight: 600;
        }
        .tcn-calc-cell.us .yr {
          border-color: rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.7);
        }

        /* Savings strip + CTA */
        .tcn-calc-savings {
          margin-top: 2.25rem;
          padding: 1.85rem 1.85rem;
          background: linear-gradient(135deg, rgba(255,213,74,0.15), rgba(255,183,77,0.08));
          border: 1px solid rgba(255,213,74,0.45);
          border-radius: 18px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .tcn-calc-savings .text {
          flex: 1;
          min-width: 240px;
        }
        .tcn-calc-savings .savings-num {
          font-size: 1.85rem;
          font-weight: 800;
          color: #b78628;
          letter-spacing: -0.015em;
          line-height: 1.1;
        }
        .tcn-calc-savings .savings-num .sym {
          font-family: "JetBrains Mono", monospace;
          font-weight: 700;
        }
        .tcn-calc-savings .savings-sub {
          color: rgba(15,23,42,0.65);
          font-size: 0.92rem;
          margin-top: 0.2rem;
          line-height: 1.55;
        }
        .tcn-calc-savings .savings-sub strong { color: #b78628; font-weight: 800; }
        .tcn-calc-savings a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.75rem 1.4rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #0b0f1e, #1242a3);
          color: #fff !important;
          font-weight: 800;
          font-size: 0.92rem;
          text-decoration: none !important;
          box-shadow: 0 12px 28px rgba(32,101,209,0.32);
          transition: transform 0.18s ease;
          white-space: nowrap;
        }
        .tcn-calc-savings a:hover { transform: translateY(-2px); color: #fff !important; }

        @media (max-width: 768px) {
          .tcn-calc-board { padding: 1.5rem 1.25rem; }
          .tcn-calc-slider-row { gap: 1rem; }
          .tcn-calc-savings { padding: 1.5rem 1.25rem; }
          .tcn-calc-savings .savings-num { font-size: 1.5rem; }
        }
      `}</style>

      <div className="tcn-calc-inner">
        <div className="tcn-calc-head">
          <span className="tcn-calc-eyebrow">
            <PiCalculatorDuotone size={12} /> Calculate your savings
          </span>
          <h2>
            What you'd pay vs <span className="accent">what you'd save.</span>
          </h2>
          <p className="lede">
            Slide your team size, pick your currency. We do the math against Slack, MS Teams, and Troop Messenger.
          </p>
        </div>

        <div style={{ textAlign: "center" }}>
          <div className="tcn-calc-currency" role="group" aria-label="Currency">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                type="button"
                className={currency === c.code ? "active" : ""}
                onClick={() => setCurrency(c.code)}
                aria-pressed={currency === c.code}
              >
                <span className="sym">{c.symbol}</span> {c.code}
              </button>
            ))}
          </div>
        </div>

        <div className="tcn-calc-board">
          <div className="tcn-calc-slider-row">
            <div className="tcn-calc-slider-label">
              <span className="lbl">Team size</span>
              <span className="val">
                {seats}
                <span className="sub">{seats === 1 ? "user" : "users"}</span>
              </span>
            </div>
            <div className="tcn-calc-slider">
              <input
                type="range"
                min={1}
                max={500}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                aria-label="Team size slider"
                style={{ "--pct": `${(seats / 500) * 100}%` }}
              />
              <div className="tcn-calc-slider-tick">
                <span>1</span>
                <span>50</span>
                <span>100</span>
                <span>250</span>
                <span>500</span>
              </div>
            </div>
          </div>

          <div className="tcn-calc-grid">
            <div className="tcn-calc-cell us">
              <div className="name">TheChatNest</div>
              <div className="price">
                <span className="sym">{symbol}</span>
                {fmt(monthly.tcn)}
                <span className="sub" style={{ marginLeft: 6 }}>/ mo</span>
              </div>
              <div className="sub">Annual billing applied</div>
              <div className="yr">{symbol}{fmt(yearly.tcn)} / year</div>
            </div>
            <div className="tcn-calc-cell">
              <div className="name">Slack Business+</div>
              <div className="price">
                <span className="sym">{symbol}</span>
                {fmt(monthly.slack)}
                <span className="sub" style={{ marginLeft: 6, fontWeight: 500 }}>/ mo</span>
              </div>
              <div className="sub">Per seat list price</div>
              <div className="yr">{symbol}{fmt(yearly.slack)} / year</div>
            </div>
            <div className="tcn-calc-cell">
              <div className="name">MS Teams Std.</div>
              <div className="price">
                <span className="sym">{symbol}</span>
                {fmt(monthly.teams)}
                <span className="sub" style={{ marginLeft: 6, fontWeight: 500 }}>/ mo</span>
              </div>
              <div className="sub">Microsoft 365 BizStd.</div>
              <div className="yr">{symbol}{fmt(yearly.teams)} / year</div>
            </div>
            <div className="tcn-calc-cell">
              <div className="name">Troop Premium</div>
              <div className="price">
                <span className="sym">{symbol}</span>
                {fmt(monthly.troop)}
                <span className="sub" style={{ marginLeft: 6, fontWeight: 500 }}>/ mo</span>
              </div>
              <div className="sub">Per seat list price</div>
              <div className="yr">{symbol}{fmt(yearly.troop)} / year</div>
            </div>
          </div>

          <div className="tcn-calc-savings">
            <PiSparkleDuotone size={28} style={{ color: "#b78628", flexShrink: 0 }} />
            <div className="text">
              <div className="savings-num">
                Save <span className="sym">{symbol}</span>{fmt(savingVsSlackYearly)} a year
              </div>
              <div className="savings-sub">
                vs <strong>Slack Business+</strong> for a team of {seats}. That's roughly{" "}
                {seats > 1 ? `${symbol}${fmt(Number(savingVsSlackYearly) / seats || 0)} per seat per year` : "money back in your pocket"}.
              </div>
            </div>
            <Link to="/auth/register">
              Start free trial <PiArrowRightBold size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingCalculator;
