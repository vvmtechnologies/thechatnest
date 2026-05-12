import React from "react";

const METRICS = [
  { num: "AES-256", label: "encryption at rest" },
  { num: "TLS 1.3", label: "transport security" },
  { num: "GDPR", label: "aligned by design" },
  { num: "₹199", label: "per seat / month" },
  { num: "14 days", label: "free trial. no card." },
  { num: "Self-host", label: "or cloud — your call" },
  { num: "0", label: "data sold. ever." },
  { num: "100%", label: "yours to own" },
];

const V2Marquee = () => {
  // Render the list twice so the CSS marquee can loop seamlessly.
  const items = [...METRICS, ...METRICS];

  return (
    <section className="v2-marquee" aria-label="By the numbers">
      <div className="v2-marquee-track">
        {items.map((m, i) => (
          <span className="v2-marquee-item" key={i}>
            <b>{m.num}</b>
            <span>{m.label}</span>
          </span>
        ))}
      </div>
    </section>
  );
};

export default V2Marquee;
