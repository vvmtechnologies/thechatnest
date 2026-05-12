import React from "react";
import { Link } from "react-router-dom";

const PLANS = [
  {
    idx: "P.01 / FREE",
    name: "Trial",
    price: "₹0",
    unit: "/14 days",
    desc: "All paid features. No credit card. Cancel any time.",
    href: "/auth/register",
    tag: "RECOMMENDED START",
  },
  {
    idx: "P.02",
    name: "Startup",
    price: "₹199",
    unit: "/seat/mo",
    desc: "Up to 20 seats. Everything you need to ship.",
    href: "/pricing",
  },
  {
    idx: "P.03 / POPULAR",
    name: "Basic",
    price: "₹299",
    unit: "/seat/mo",
    desc: "Up to 50 seats. Adds AI assistant + audit logs.",
    href: "/pricing",
    feature: true,
  },
  {
    idx: "P.04",
    name: "Business",
    price: "₹699",
    unit: "/seat/mo",
    desc: "100+ seats. SSO/SAML, custom roles, self-host.",
    href: "/pricing",
  },
];

const V2Cta = () => {
  return (
    <section className="v2-cta">
      <div className="v2-wrap">
        <div className="v2-cta-head">
          <h2 className="v2-fade">
            Less stack.<br />
            <em>More ship.</em>
          </h2>
          <p className="v2-fade d2">
            Per-seat pricing. Switch plans any time. Annual billing saves 20%.
            Every plan starts free for 14 days — we don&apos;t ask for a card
            until you decide we&apos;re worth it.
          </p>
        </div>

        <div className="v2-cta-plans v2-fade d3">
          {PLANS.map((p) => (
            <div
              className={`v2-cta-plan${p.feature ? " feature" : ""}`}
              key={p.name}
            >
              <span className="idx">
                <span>{p.idx}</span>
                <span>{p.tag || ""}</span>
              </span>
              <h3 className="name">{p.name}</h3>
              <div className="price">
                {p.price}
                <small>{p.unit}</small>
              </div>
              <p className="desc">{p.desc}</p>
              <Link to={p.href} className="pick">
                {p.feature ? "choose Basic →" : "details →"}
              </Link>
            </div>
          ))}
        </div>

        {/* Terminal-prompt style final CTA */}
        <div className="v2-cta-prompt v2-fade d4">
          <span className="prompt">›</span>
          <p className="copy">
            Ready when you are. <em>Spin up a workspace</em> in two minutes.
          </p>
          <Link to="/auth/register" className="go">
            start trial<span>↗</span>
          </Link>
        </div>

        <div className="v2-cta-foot">
          <span>NO_CARD&nbsp;·&nbsp;NO_LOCK_IN&nbsp;·&nbsp;30-DAY_REFUND</span>
          <span>SUPPORT&nbsp;·&nbsp;support@thechatnest.com</span>
        </div>
      </div>
    </section>
  );
};

export default V2Cta;
