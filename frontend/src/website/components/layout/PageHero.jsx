import React from "react";

/**
 * Reusable dark gradient hero with grid texture used across redesigned pages.
 * Pass `eyebrow`, `title` (string or JSX), and optional `lead` (subtext) +
 * children (stats row / CTAs / form / etc.).
 */
const PageHero = ({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  lead,
  children,
  align = "center",
  tone = "default", // default | tight
}) => {
  return (
    <section className={`tcn-page-hero tcn-page-hero--${tone}`}>
      <div className="container">
        <div
          className={`tcn-page-hero-inner ${align === "left" ? "left" : ""}`}
        >
          {eyebrow && (
            <span
              className="eyebrow"
              style={{
                background: "rgba(255,213,74,0.12)",
                color: "#ffd54a",
                borderColor: "rgba(255,213,74,0.25)",
                display: "inline-flex",
                marginBottom: "1.25rem",
              }}
            >
              {EyebrowIcon ? <EyebrowIcon size={12} /> : (
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "#ffd54a" }} />
              )}
              {eyebrow}
            </span>
          )}

          {title && <h1>{title}</h1>}
          {lead && <p className="lead">{lead}</p>}
          {children}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
