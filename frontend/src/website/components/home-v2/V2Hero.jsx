import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// A small marquee of feelings — the live "what people are typing right now"
// text. Rotates every 4 seconds with a soft cross-fade.
const SIGNALS = [
  {
    who: "Aanya",
    avatar: "AS",
    time: "now",
    text: "Pushed the staging build. Ready for review whenever.",
  },
  {
    who: "Rohan",
    avatar: "RK",
    time: "1m",
    text: "Pulled audit logs for last quarter — sending the CSV in a sec.",
  },
  {
    who: "Meera",
    avatar: "MI",
    time: "2m",
    text: "Demo deck v3 with the new pricing — final pass before tomorrow.",
  },
];

const V2Hero = () => {
  const [signalIdx, setSignalIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setSignalIdx((i) => (i + 1) % SIGNALS.length),
      4200
    );
    return () => clearInterval(id);
  }, []);

  const s = SIGNALS[signalIdx];

  return (
    <section className="v2-hero">
      <div className="v2-wrap">
        {/* Meta strip — datestamp + version + status */}
        <div className="v2-hero-meta">
          <span className="v2-mono v2-hero-meta-left">
            <span>
              <span className="dot" />
              LIVE&nbsp;·&nbsp;THECHATNEST/V2026.05
            </span>
            <span>VOL. 01&nbsp;/&nbsp;ISS. 06</span>
          </span>
          <span className="v2-mono">
            EST. 2026&nbsp;·&nbsp;BUILT IN BENGALURU
          </span>
        </div>

        {/* The headline — composed like a magazine cover */}
        <h1 className="v2-hero-headline v2-fade">
          <span className="line line-1">One workspace.</span>
          <span className="line line-2">
            <em>built for the teams that</em>
          </span>
          <span className="line line-3">
            ship <mark>before lunch</mark>{" "}
            <span className="ampersand">&amp;</span> sleep at night.
          </span>
        </h1>

        {/* Deck — left lede + right "live signal" card */}
        <div className="v2-hero-deck">
          <div className="v2-hero-deck-left v2-fade d3">
            <p className="lede">
              Secure messaging, HD calls, encrypted files and an AI that
              actually <em>reads your threads</em> — in one workspace your
              security team will sign off on the same day.
            </p>

            <div className="v2-hero-actions">
              <Link to="/auth/register" className="primary">
                Start 14-day trial
                <span className="arrow">→</span>
              </Link>
              <Link to="/demo" className="secondary">
                book&nbsp;a&nbsp;demo
              </Link>
            </div>

            <div className="v2-hero-tagline-stamp">
              <span>NO_CARD&nbsp;·&nbsp;CANCEL_ANY_TIME</span>
              <span>RUNS_ON&nbsp;·&nbsp;CLOUD&nbsp;|&nbsp;ON_PREM&nbsp;|&nbsp;AIR_GAPPED</span>
            </div>
          </div>

          <div className="v2-hero-signal v2-fade d5">
            <div className="v2-hero-signal-frame">
              <div className="v2-hero-signal-head">
                <span>#eng-shipping</span>
                <span>04:32 · IST</span>
              </div>

              <div className="v2-hero-signal-msg" key={signalIdx}>
                <div className="avatar">{s.avatar}</div>
                <div className="body">
                  <div className="who">
                    {s.who} <time>{s.time}</time>
                  </div>
                  <div className="text">{s.text}</div>
                </div>
              </div>

              <div className="v2-hero-signal-typing">
                <span className="dots">
                  <i /> <i /> <i />
                </span>
                <span>Devansh is typing&hellip;</span>
              </div>
            </div>
            <div className="v2-hero-signal-caption">
              REAL_PRODUCT_VIEW · <strong>app.thechatnest.com</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default V2Hero;
