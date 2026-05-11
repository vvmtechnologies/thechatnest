import React from "react";
import { PiCalendarDuotone, PiShieldCheckDuotone } from "react-icons/pi";
import PageHero from "./PageHero.jsx";
import FinalCta from "./FinalCta.jsx";

/**
 * Shared layout for legal/policy pages: dark hero + sticky TOC + content body + final CTA.
 *
 * Sections shape:
 *   [{ id: "intro", title: "Introduction", body: <JSX>... }]
 */
const LegalLayout = ({
  eyebrow = "Policy",
  title,
  lead,
  lastUpdated,
  sections = [],
  ctaTitle,
  ctaDescription,
}) => {
  return (
    <div className="tcn-legal">
      <PageHero
        eyebrow={eyebrow}
        eyebrowIcon={PiShieldCheckDuotone}
        title={title}
        lead={lead}
      />

      <div className="tcn-legal-tocwrap">
        <aside className="tcn-legal-toc">
          <p className="toc-head">On this page</p>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="tcn-legal-content">
          {lastUpdated && (
            <span className="tcn-legal-meta">
              <PiCalendarDuotone size={14} />
              Last updated {lastUpdated}
            </span>
          )}
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2>{s.title}</h2>
              {s.body}
            </section>
          ))}
        </article>
      </div>

      <FinalCta
        eyebrow="Questions?"
        title={ctaTitle || "Talk to our team"}
        description={
          ctaDescription ||
          "We answer privacy, security, and compliance questions within one business day."
        }
        primaryLabel="Contact us"
        primaryTo="/contact"
        secondaryLabel="Read all policies"
        secondaryTo="/help"
      />
    </div>
  );
};

export default LegalLayout;
