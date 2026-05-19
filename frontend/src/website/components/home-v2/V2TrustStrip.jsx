import React from "react";

// Trust strip — sits between V2Hero and V2Field. Five credibility
// signals: hosted in India, encryption, compliance, uptime, India-built.
// Designed to address the "is this real / can I trust it" question
// within the first scroll, without screenshots of fake testimonials.
//
// Style follows V2Field's mono-label + magazine grid pattern.
const V2TrustStrip = () => {
  return (
    <section className="v2-trust" aria-label="Trust signals">
      <div className="v2-wrap">
        <div className="v2-trust-rule" aria-hidden />

        <header className="v2-trust-head">
          <span className="v2-mono v2-mono-gold">PROOF · OO</span>
          <p className="v2-trust-eyebrow">
            What every serious buyer asks before the first call.
          </p>
        </header>

        <div className="v2-trust-grid">
          <article className="v2-trust-card">
            <span className="v2-trust-icon" aria-hidden>🇮🇳</span>
            <div className="v2-trust-body">
              <h3>Hosted in India</h3>
              <p>
                Mumbai &amp; Bengaluru regions.
                <br />
                No data leaves the country.
              </p>
            </div>
          </article>

          <article className="v2-trust-card">
            <span className="v2-trust-icon icon-shield" aria-hidden />
            <div className="v2-trust-body">
              <h3>E2E encryption</h3>
              <p>
                Messages, files, calls — all
                <br />
                end-to-end encrypted by default.
              </p>
            </div>
          </article>

          <article className="v2-trust-card">
            <span className="v2-trust-icon icon-cert" aria-hidden />
            <div className="v2-trust-body">
              <h3>DPDP &amp; GDPR ready</h3>
              <p>
                Compliance baked in. DPA on
                <br />
                request, EU SCCs included.
              </p>
            </div>
          </article>

          <article className="v2-trust-card">
            <span className="v2-trust-icon icon-uptime" aria-hidden>99.9</span>
            <div className="v2-trust-body">
              <h3>Uptime SLA</h3>
              <p>
                Public status page,
                <br />
                incident-free for 90 days.
              </p>
            </div>
          </article>

          <article className="v2-trust-card">
            <span className="v2-trust-icon icon-india" aria-hidden />
            <div className="v2-trust-body">
              <h3>Built in Bengaluru</h3>
              <p>
                By VVM Technologies Pvt Ltd
                <br />
                MSME &middot; GST &middot; CIN registered.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default V2TrustStrip;
