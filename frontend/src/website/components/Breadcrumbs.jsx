import React from "react";
import { Link } from "react-router-dom";
import { PiCaretRightBold, PiHouseDuotone } from "react-icons/pi";

// Visual breadcrumb trail. Pair with `<Seo breadcrumbs={...} />` to also
// emit BreadcrumbList JSON-LD for Google search results.
//
// Usage:
//   <Breadcrumbs items={[
//     { label: "Home", to: "/" },
//     { label: "Compare", to: "/compare" },
//   ]} />

const Breadcrumbs = ({ items = [], dark = false }) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <nav className={`tcn-breadcrumbs ${dark ? "is-dark" : ""}`} aria-label="Breadcrumb">
      <style>{`
        .tcn-breadcrumbs {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          font-size: 0.85rem;
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.04em;
          margin-bottom: 1.5rem;
        }
        .tcn-breadcrumbs a, .tcn-breadcrumbs span {
          color: rgba(15,23,42,0.55);
          text-decoration: none !important;
          transition: color 0.18s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .tcn-breadcrumbs a:hover {
          color: #2065D1;
        }
        .tcn-breadcrumbs span.current {
          color: #0b0f1e;
          font-weight: 700;
        }
        .tcn-breadcrumbs .sep {
          color: rgba(15,23,42,0.25);
          margin: 0 2px;
        }

        .tcn-breadcrumbs.is-dark a,
        .tcn-breadcrumbs.is-dark span {
          color: rgba(255,255,255,0.55);
        }
        .tcn-breadcrumbs.is-dark a:hover { color: #ffd54a; }
        .tcn-breadcrumbs.is-dark span.current { color: #ffd54a; }
        .tcn-breadcrumbs.is-dark .sep { color: rgba(255,255,255,0.25); }
      `}</style>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${i}`}>
            {last ? (
              <span className="current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link to={item.to || "/"}>
                {i === 0 && item.label.toLowerCase() === "home" ? <PiHouseDuotone size={12} /> : null}
                {item.label}
              </Link>
            )}
            {!last && <PiCaretRightBold size={9} className="sep" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
