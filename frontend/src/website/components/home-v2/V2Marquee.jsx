import React from "react";

const METRICS = [
  { num: "12,400+", label: "teams shipped from" },
  { num: "AES-256", label: "encryption at rest" },
  { num: "99.94%", label: "uptime last 90 days" },
  { num: "<200ms", label: "median message delivery" },
  { num: "SOC 2", label: "Type II audited" },
  { num: "30s", label: "self-host install" },
  { num: "₹199", label: "per seat / month" },
  { num: "0", label: "data sold. ever." },
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
