import React from "react";
import { Link } from "react-router-dom";
import { PiArrowRightBold, PiSparkleDuotone } from "react-icons/pi";

/**
 * Reusable dark gradient CTA banner used at the bottom of most pages.
 */
const FinalCta = ({
  eyebrow = "Try it free",
  eyebrowIcon: EyebrowIcon = PiSparkleDuotone,
  title,
  description,
  primaryLabel = "Start free trial",
  primaryTo = "/auth/register",
  secondaryLabel,
  secondaryTo,
}) => {
  return (
    <section className="tcn-page-cta">
      <div className="container">
        <div className="tcn-page-cta-inner">
          {eyebrow && (
            <span
              className="eyebrow"
              style={{
                background: "rgba(255,213,74,0.12)",
                color: "#ffd54a",
                borderColor: "rgba(255,213,74,0.25)",
                marginBottom: "1.25rem",
                display: "inline-flex",
              }}
            >
              {EyebrowIcon && <EyebrowIcon size={12} />}
              {eyebrow}
            </span>
          )}
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
          <div className="btns">
            <Link to={primaryTo} className="btn-gold">
              {primaryLabel} <PiArrowRightBold size={16} />
            </Link>
            {secondaryLabel && (
              <Link to={secondaryTo} className="btn-ghost">
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
