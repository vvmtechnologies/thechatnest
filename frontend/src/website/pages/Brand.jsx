import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PiDownloadDuotone,
  PiCopyDuotone,
  PiCheckBold,
  PiPaletteDuotone,
  PiTextAaDuotone,
  PiSparkleDuotone,
  PiArrowRightBold,
  PiAtomDuotone,
} from "react-icons/pi";
import Seo from "../../components/Seo.jsx";

const COLORS = [
  { name: "Navy",         hex: "#0B0F1E", rgb: "11 15 30",   role: "Primary surface" },
  { name: "Navy Soft",    hex: "#11162A", rgb: "17 22 42",   role: "Secondary surface" },
  { name: "Violet",       hex: "#6D5DFC", rgb: "109 93 252", role: "Primary action" },
  { name: "Violet Deep",  hex: "#4D3EFF", rgb: "77 62 255",  role: "Hover / accent" },
  { name: "Gold",         hex: "#FFD54A", rgb: "255 213 74", role: "Highlight" },
  { name: "Gold Warm",    hex: "#FFB74D", rgb: "255 183 77", role: "Highlight 2" },
  { name: "Cream",        hex: "#F4F0E8", rgb: "244 240 232", role: "Paper" },
  { name: "Ink Soft",     hex: "#2A2F44", rgb: "42 47 68",   role: "Body text" },
];

const LOGO_DOWNLOADS = [
  {
    label: "Primary logo (PNG, gold + white)",
    href: "/chat.png",
    filename: "thechatnest-logo.png",
    desc: "Use on dark backgrounds. 512×512 transparent.",
  },
  {
    label: "Logo mark (PNG, gold)",
    href: "/thechatnest_logo_element.png",
    filename: "thechatnest-mark.png",
    desc: "Icon-only mark. Favicons, app tiles, social avatars.",
  },
  {
    label: "Social cover (SVG)",
    href: "/og-cover.svg",
    filename: "thechatnest-og.svg",
    desc: "Open Graph / Twitter card. 1200×630.",
  },
];

const FONTS = [
  { name: "Fraunces",         use: "Editorial headlines (serif)",   url: "https://fonts.google.com/specimen/Fraunces" },
  { name: "Inter Tight",      use: "Body & UI",                     url: "https://fonts.google.com/specimen/Inter+Tight" },
  { name: "JetBrains Mono",   use: "Mono / labels / code",          url: "https://fonts.google.com/specimen/JetBrains+Mono" },
];

const DO_DONT = [
  { do: true,  text: "Keep the wordmark and the gold mark together when introducing the brand for the first time." },
  { do: true,  text: "Maintain clear-space of at least the height of one nest icon around the wordmark." },
  { do: true,  text: "Use Gold (#FFD54A) only as accent — never as a body-text color on light surfaces." },
  { do: false, text: "Recolor the logo to match your slide deck or product palette." },
  { do: false, text: "Stretch, squish, rotate, or add drop-shadows to the wordmark." },
  { do: false, text: "Place the logo on busy photos without an overlay; readability suffers." },
];

const Brand = () => {
  const [copied, setCopied] = useState("");

  const copy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  };

  return (
    <div className="tcn-brand">
      <Seo
        title="Brand kit"
        description="Logos, colors, fonts and usage guidelines for press, partners and integrators using the TheChatNest brand."
        keywords="thechatnest brand, logo download, brand kit, press kit, media assets"
      />
      <style>{`
        .tcn-brand {
          background: linear-gradient(180deg, #fafbff 0%, #fff 60%);
          color: #0b0f1e;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          min-height: 100vh;
        }
        .tcn-brand-hero {
          position: relative;
          padding: 7rem 0 4rem;
          background:
            radial-gradient(1100px 600px at 78% -10%, rgba(109,93,252,0.32), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.12), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          overflow: hidden;
        }
        .tcn-brand-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%);
          pointer-events: none;
        }
        .tcn-brand-hero > .container { position: relative; z-index: 1; text-align: center; }
        .tcn-brand-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          background: rgba(255,213,74,0.14);
          border: 1px solid rgba(255,213,74,0.3);
          color: #ffd54a;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .tcn-brand-hero h1 {
          font-size: clamp(2rem, 4.5vw, 3.4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 1rem;
          color: #ffffff;
        }
        .tcn-brand-hero h1 .accent {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-brand-hero p.lede {
          color: rgba(255,255,255,0.72);
          font-size: 1.1rem;
          line-height: 1.55;
          max-width: 600px;
          margin: 0 auto;
        }

        .tcn-brand-section {
          padding: 4rem 0;
        }
        .tcn-brand-section + .tcn-brand-section {
          border-top: 1px solid rgba(15,23,42,0.08);
        }
        .tcn-brand-section h2 {
          font-size: clamp(1.6rem, 2.8vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.015em;
          margin: 0 0 0.4rem;
          color: #0b0f1e;
        }
        .tcn-brand-section h2 .ic {
          color: #2065D1;
          vertical-align: -3px;
          margin-right: 8px;
        }
        .tcn-brand-section p.section-lead {
          color: rgba(15,23,42,0.6);
          font-size: 1rem;
          margin: 0 0 2rem;
          max-width: 620px;
        }

        /* Logo grid */
        .tcn-brand-logos {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .tcn-brand-logo-card {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 18px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .tcn-brand-logo-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(15,23,42,0.08);
          border-color: rgba(32,101,209,0.4);
        }
        .tcn-brand-logo-preview {
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
        }
        .tcn-brand-logo-preview.light {
          background: #fafbff;
          border-bottom: 1px solid rgba(15,23,42,0.08);
        }
        .tcn-brand-logo-preview img {
          max-height: 100%;
          max-width: 80%;
          object-fit: contain;
        }
        .tcn-brand-logo-meta {
          padding: 1.2rem 1.3rem 1.4rem;
        }
        .tcn-brand-logo-meta h4 {
          font-size: 0.95rem;
          font-weight: 800;
          margin: 0 0 0.3rem;
          color: #0b0f1e;
        }
        .tcn-brand-logo-meta p {
          font-size: 0.83rem;
          color: rgba(15,23,42,0.55);
          margin: 0 0 1rem;
          line-height: 1.5;
        }
        .tcn-brand-download {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 0.95rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #2065D1, #1242a3);
          color: #fff !important;
          font-weight: 700;
          font-size: 0.82rem;
          text-decoration: none !important;
          box-shadow: 0 6px 14px rgba(32,101,209,0.32);
          transition: transform 0.18s ease;
        }
        .tcn-brand-download:hover { transform: translateY(-1px); color: #fff !important; }

        /* Color grid */
        .tcn-brand-colors {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.9rem;
        }
        .tcn-brand-color {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .tcn-brand-color:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15,23,42,0.06);
        }
        .tcn-brand-color-swatch {
          height: 110px;
          display: flex;
          align-items: flex-end;
          padding: 0.85rem 1rem;
          color: #fff;
          font-family: "JetBrains Mono", monospace;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.04em;
        }
        .tcn-brand-color-swatch.light { color: #0b0f1e; }
        .tcn-brand-color-meta {
          padding: 0.85rem 1rem 1rem;
        }
        .tcn-brand-color-meta h4 {
          font-size: 0.9rem;
          font-weight: 800;
          margin: 0 0 0.2rem;
          color: #0b0f1e;
        }
        .tcn-brand-color-meta .role {
          font-size: 0.75rem;
          color: rgba(15,23,42,0.55);
          margin-bottom: 0.65rem;
        }
        .tcn-brand-copy-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .tcn-brand-copy {
          flex: 1;
          padding: 0.4rem 0.65rem;
          border-radius: 6px;
          background: rgba(15,23,42,0.05);
          border: 1px solid rgba(15,23,42,0.08);
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 700;
          color: #0b0f1e;
          cursor: pointer;
          text-align: left;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          transition: all 0.15s ease;
        }
        .tcn-brand-copy:hover {
          background: rgba(32,101,209,0.08);
          border-color: rgba(32,101,209,0.3);
        }
        .tcn-brand-copy svg { color: rgba(15,23,42,0.4); flex-shrink: 0; }

        /* Fonts */
        .tcn-brand-fonts {
          display: grid;
          gap: 1rem;
        }
        .tcn-brand-font {
          padding: 1.4rem 1.5rem;
          border-radius: 14px;
          border: 1px solid rgba(15,23,42,0.08);
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .tcn-brand-font-name {
          font-size: 1.8rem;
          font-weight: 700;
          color: #0b0f1e;
          letter-spacing: -0.01em;
          line-height: 1.1;
        }
        .tcn-brand-font-meta {
          flex: 1;
          min-width: 200px;
        }
        .tcn-brand-font-meta p {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(15,23,42,0.55);
          margin: 0 0 0.35rem;
        }
        .tcn-brand-font-meta span { color: rgba(15,23,42,0.75); font-size: 0.92rem; }
        .tcn-brand-font-link {
          padding: 0.55rem 1rem;
          border-radius: 999px;
          background: rgba(32,101,209,0.1);
          color: #2065D1 !important;
          font-weight: 700;
          font-size: 0.85rem;
          text-decoration: none !important;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.18s ease;
        }
        .tcn-brand-font-link:hover { background: rgba(32,101,209,0.2); color: #2065D1 !important; }

        /* Do/Dont */
        .tcn-brand-do-dont {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .tcn-brand-rule {
          padding: 1.1rem 1.25rem;
          border-radius: 14px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          font-size: 0.92rem;
          line-height: 1.55;
        }
        .tcn-brand-rule .ic {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-weight: 800;
          font-family: "JetBrains Mono", monospace;
          font-size: 14px;
        }
        .tcn-brand-rule.do {
          background: rgba(22,163,74,0.08);
          border: 1px solid rgba(22,163,74,0.25);
          color: #0b3d1f;
        }
        .tcn-brand-rule.do .ic { background: rgba(22,163,74,0.18); color: #16a34a; }
        .tcn-brand-rule.dont {
          background: rgba(220,38,38,0.06);
          border: 1px solid rgba(220,38,38,0.22);
          color: #5b1717;
        }
        .tcn-brand-rule.dont .ic { background: rgba(220,38,38,0.16); color: #dc2626; }

        @media (max-width: 768px) {
          .tcn-brand-do-dont { grid-template-columns: 1fr; }
          .tcn-brand-section { padding: 3rem 0; }
        }

        /* Contact strip */
        .tcn-brand-contact {
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          color: #fff;
          padding: 3.5rem 0;
          text-align: center;
        }
        .tcn-brand-contact h2 { color: #fff; }
        .tcn-brand-contact p { color: rgba(255,255,255,0.72); max-width: 540px; margin: 0.4rem auto 1.5rem; line-height: 1.55; }
        .tcn-brand-contact a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.7rem 1.4rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none !important;
          box-shadow: 0 10px 26px rgba(255,213,74,0.45);
          transition: transform 0.18s ease;
        }
        .tcn-brand-contact a:hover { transform: translateY(-2px); color: #1a1f3a !important; }
      `}</style>

      <section className="tcn-brand-hero">
        <div className="container">
          <span className="tcn-brand-eyebrow">
            <PiSparkleDuotone size={12} /> Brand Kit · v1
          </span>
          <h1>
            Logos, colors and <span className="accent">how to use them.</span>
          </h1>
          <p className="lede">
            Everything you need to write about, integrate with, or partner with TheChatNest —
            in one place. Free for press, customers and integration partners.
          </p>
        </div>
      </section>

      {/* ─── Logos ─── */}
      <section className="tcn-brand-section">
        <div className="container">
          <h2>
            <PiAtomDuotone size={22} className="ic" />
            Logos
          </h2>
          <p className="section-lead">
            Use the primary logo whenever possible. The mark works as a square icon — favicons,
            app tiles, social avatars. All assets are PNG / SVG with transparent backgrounds.
          </p>

          <div className="tcn-brand-logos">
            {LOGO_DOWNLOADS.map((logo) => (
              <div key={logo.filename} className="tcn-brand-logo-card">
                <div className={`tcn-brand-logo-preview ${logo.href.endsWith(".svg") ? "light" : ""}`}>
                  <img src={logo.href} alt={logo.label} loading="lazy" />
                </div>
                <div className="tcn-brand-logo-meta">
                  <h4>{logo.label}</h4>
                  <p>{logo.desc}</p>
                  <a
                    href={logo.href}
                    download={logo.filename}
                    className="tcn-brand-download"
                  >
                    <PiDownloadDuotone size={13} /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Colors ─── */}
      <section className="tcn-brand-section">
        <div className="container">
          <h2>
            <PiPaletteDuotone size={22} className="ic" />
            Colors
          </h2>
          <p className="section-lead">
            Click any value to copy it to your clipboard. Navy carries the brand,
            gold accents draw the eye, violet powers actions.
          </p>

          <div className="tcn-brand-colors">
            {COLORS.map((c) => {
              const isLight = ["#FFD54A", "#FFB74D", "#F4F0E8"].includes(c.hex);
              return (
                <div key={c.hex} className="tcn-brand-color">
                  <div
                    className={`tcn-brand-color-swatch ${isLight ? "light" : ""}`}
                    style={{ background: c.hex }}
                  >
                    {c.hex}
                  </div>
                  <div className="tcn-brand-color-meta">
                    <h4>{c.name}</h4>
                    <div className="role">{c.role}</div>
                    <div className="tcn-brand-copy-row">
                      <button
                        type="button"
                        className="tcn-brand-copy"
                        onClick={() => copy(c.hex, `${c.hex}-hex`)}
                        aria-label={`Copy ${c.name} HEX`}
                      >
                        {copied === `${c.hex}-hex` ? "Copied!" : c.hex}
                        {copied === `${c.hex}-hex` ? <PiCheckBold size={11} /> : <PiCopyDuotone size={11} />}
                      </button>
                      <button
                        type="button"
                        className="tcn-brand-copy"
                        onClick={() => copy(`rgb(${c.rgb.replace(/ /g, ", ")})`, `${c.hex}-rgb`)}
                        aria-label={`Copy ${c.name} RGB`}
                      >
                        {copied === `${c.hex}-rgb` ? "Copied!" : "RGB"}
                        {copied === `${c.hex}-rgb` ? <PiCheckBold size={11} /> : <PiCopyDuotone size={11} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Fonts ─── */}
      <section className="tcn-brand-section">
        <div className="container">
          <h2>
            <PiTextAaDuotone size={22} className="ic" />
            Typography
          </h2>
          <p className="section-lead">
            Three open-source typefaces, all on Google Fonts. Together they cover editorial
            headlines, UI body text, and monospace labels.
          </p>

          <div className="tcn-brand-fonts">
            {FONTS.map((f) => (
              <div key={f.name} className="tcn-brand-font">
                <div className="tcn-brand-font-name" style={{ fontFamily: f.name }}>
                  {f.name}
                </div>
                <div className="tcn-brand-font-meta">
                  <p>{f.use}</p>
                  <span>Open source · Google Fonts</span>
                </div>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="tcn-brand-font-link"
                >
                  Get the font <PiArrowRightBold size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Do / Don't ─── */}
      <section className="tcn-brand-section">
        <div className="container">
          <h2>Usage do's and don'ts</h2>
          <p className="section-lead">
            We're easygoing — but a few rules keep the brand recognizable across every place it shows up.
          </p>
          <div className="tcn-brand-do-dont">
            {DO_DONT.map((rule, i) => (
              <div key={i} className={`tcn-brand-rule ${rule.do ? "do" : "dont"}`}>
                <span className="ic">{rule.do ? "✓" : "✗"}</span>
                <span>{rule.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact ─── */}
      <section className="tcn-brand-contact">
        <div className="container">
          <h2>Need something custom?</h2>
          <p>
            Press inquiry, partnership artwork, a particular asset size, or you want approval
            on a use case — we reply within one business day.
          </p>
          <Link to="/contact">
            Contact brand team <PiArrowRightBold size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Brand;
