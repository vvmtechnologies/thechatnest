import React from "react";
import { Link } from "react-router-dom";
import {
  PiBuildingsDuotone,
  PiCertificateDuotone,
  PiReceiptDuotone,
  PiMapPinDuotone,
  PiEnvelopeDuotone,
  PiPhoneDuotone,
  PiUsersThreeDuotone,
  PiCalendarDuotone,
  PiSparkleDuotone,
  PiArrowRightBold,
  PiCheckCircleDuotone,
  PiHandshakeDuotone,
  PiShieldCheckDuotone,
} from "react-icons/pi";
import Seo from "../../components/Seo.jsx";

// ─── Company registry — UPDATE THESE WITH YOUR REAL DETAILS ──────────
const COMPANY = {
  legalName: "VVM Technologies Private Limited",
  brandName: "TheChatNest",
  founded: "2025",
  cin: "U72200KA2025PTC000000",          // ← replace with your real CIN
  gstin: "29AAACV0000A1Z0",              // ← replace with your real GSTIN
  pan: "AAACV0000A",                     // ← replace with your real PAN
  udyam: "UDYAM-KA-03-0000000",          // ← replace with real Udyam Registration
  msmeCategory: "Micro Enterprise",       // ← Micro / Small / Medium
  msmeActivity: "Services",               // ← Services / Manufacturing
  registeredOffice: {
    line1: "VVM Technologies Pvt Ltd",
    line2: "[Floor / Building Name]",
    line3: "[Street Address]",
    city: "Varanasi",
    state: "Uttar Pradesh",
    pincode: "221001",
    country: "India",
  },
  contact: {
    email: "legal@thechatnest.com",
    support: "support@thechatnest.com",
    sales: "sales@thechatnest.com",
    phone: "+91 80 0000 0000",            // ← replace with real number
  },
  team: {
    size: "Small team",
    location: "Varanasi, India",
  },
};

const FACTS = [
  { Icon: PiCalendarDuotone, label: "Founded",        value: COMPANY.founded,           tint: "#2065D1" },
  { Icon: PiMapPinDuotone,   label: "Headquartered",  value: "Varanasi, India",        tint: "#16a34a" },
  { Icon: PiUsersThreeDuotone,label: "Team",           value: COMPANY.team.size,         tint: "#a855f7" },
  { Icon: PiSparkleDuotone,  label: "Mission",        value: "Affordable, honest team chat", tint: "#f59e0b" },
];

const LEGAL_REGISTRY = [
  {
    Icon: PiBuildingsDuotone,
    label: "Legal Entity Name",
    value: COMPANY.legalName,
    note: "Registered under the Companies Act, 2013, India",
  },
  {
    Icon: PiCertificateDuotone,
    label: "Corporate Identification Number (CIN)",
    value: COMPANY.cin,
    note: "Issued by Ministry of Corporate Affairs (MCA), Government of India",
  },
  {
    Icon: PiReceiptDuotone,
    label: "GSTIN",
    value: COMPANY.gstin,
    note: "Goods & Services Tax Identification Number — used on all invoices",
  },
  {
    Icon: PiCertificateDuotone,
    label: "PAN (Permanent Account Number)",
    value: COMPANY.pan,
    note: "Issued by the Income Tax Department of India",
  },
  {
    Icon: PiHandshakeDuotone,
    label: "Udyam Registration (MSME)",
    value: COMPANY.udyam,
    note: `${COMPANY.msmeCategory} · ${COMPANY.msmeActivity} · verifiable at udyamregistration.gov.in`,
  },
];

const About = () => {
  const { registeredOffice: addr } = COMPANY;

  return (
    <div className="tcn-about">
      <Seo
        title="About"
        description={`${COMPANY.brandName} is built by ${COMPANY.legalName}, a Varanasi-based MSME-registered company. Full company details, registered office, CIN, GSTIN, and contact information.`}
        keywords="thechatnest company, about us, vvm technologies, CIN, GSTIN, MSME, registered office, Varanasi"
        breadcrumbs={[
          { label: "Home", to: "/" },
          { label: "About", to: "/about" },
        ]}
      />

      <style>{`
        .tcn-about {
          background: linear-gradient(180deg, #fafbff 0%, #fff 50%);
          color: #0b0f1e;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          min-height: 100vh;
        }

        /* ── Hero ── */
        .tcn-about-hero {
          position: relative;
          padding: 7rem 0 4rem;
          background:
            radial-gradient(1100px 600px at 78% -10%, rgba(32,101,209,0.32), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.12), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          overflow: hidden;
        }
        .tcn-about-hero::before {
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
        .tcn-about-hero > .container { position: relative; z-index: 1; text-align: center; }
        .tcn-about-eyebrow {
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
        .tcn-about-hero h1 {
          font-family: "Fraunces", Georgia, serif;
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 500;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0 0 1rem;
          color: #fff;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        .tcn-about-hero h1 em {
          font-style: italic;
          color: #ffd54a;
        }
        .tcn-about-hero p.lede {
          color: rgba(255,255,255,0.72);
          font-size: 1.1rem;
          line-height: 1.6;
          max-width: 640px;
          margin: 0 auto;
        }

        /* ── Quick facts strip ── */
        .tcn-about-facts {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          max-width: 1100px;
          margin: 3rem auto 0;
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255,255,255,0.1);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          position: relative;
          z-index: 1;
        }
        .tcn-about-fact {
          text-align: center;
          padding: 0 1rem;
          position: relative;
        }
        .tcn-about-fact:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 18%;
          bottom: 18%;
          right: 0;
          width: 1px;
          background: rgba(255,255,255,0.08);
        }
        .tcn-about-fact .ic {
          color: #ffd54a;
          margin-bottom: 0.45rem;
        }
        .tcn-about-fact .lbl {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin-bottom: 0.25rem;
        }
        .tcn-about-fact .val {
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
        }
        @media (max-width: 720px) {
          .tcn-about-facts { grid-template-columns: repeat(2, 1fr); gap: 1.5rem 0; }
          .tcn-about-fact::after { display: none !important; }
        }

        /* ── Section common ── */
        .tcn-about-section { padding: 5rem 0; }
        .tcn-about-section + .tcn-about-section { border-top: 1px solid rgba(15,23,42,0.08); }
        .tcn-about-section-head { text-align: center; max-width: 680px; margin: 0 auto 3rem; }
        .tcn-about-section-head .tag {
          display: inline-block;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #2065D1;
          margin-bottom: 1rem;
        }
        .tcn-about-section-head h2 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(1.85rem, 3.5vw, 2.6rem);
          letter-spacing: -0.015em;
          line-height: 1.15;
          margin: 0 0 0.85rem;
          color: #0b0f1e;
        }
        .tcn-about-section-head h2 em { font-style: italic; color: #2065D1; }
        .tcn-about-section-head p {
          color: rgba(15,23,42,0.6);
          font-size: 1.02rem;
          line-height: 1.6;
          margin: 0;
        }

        /* ── Legal registry table ── */
        .tcn-about-registry {
          max-width: 880px;
          margin: 0 auto;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(15,23,42,0.06);
        }
        .tcn-about-row {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 1.25rem;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(15,23,42,0.06);
          align-items: flex-start;
        }
        .tcn-about-row:last-child { border-bottom: 0; }
        .tcn-about-row .ic {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: rgba(32,101,209,0.08);
          color: #2065D1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tcn-about-row .label {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: rgba(15,23,42,0.55);
          text-transform: uppercase;
          margin-bottom: 0.3rem;
        }
        .tcn-about-row .value {
          font-family: "JetBrains Mono", monospace;
          font-size: 1rem;
          font-weight: 700;
          color: #0b0f1e;
          letter-spacing: 0.02em;
          margin-bottom: 0.35rem;
          word-break: break-all;
        }
        .tcn-about-row .note {
          font-size: 0.85rem;
          color: rgba(15,23,42,0.6);
          line-height: 1.55;
        }
        @media (max-width: 640px) {
          .tcn-about-row { padding: 1.25rem 1.25rem; }
          .tcn-about-row .value { font-size: 0.9rem; }
        }

        /* ── Address block ── */
        .tcn-about-address {
          max-width: 880px;
          margin: 0 auto;
          padding: 2.5rem 2.5rem;
          background: linear-gradient(135deg, rgba(255,153,51,0.04), rgba(19,136,8,0.04)), #fff;
          border: 1px solid rgba(15,23,42,0.1);
          border-radius: 22px;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1.85rem;
          align-items: flex-start;
        }
        .tcn-about-address .flag {
          width: 72px;
          height: 72px;
          border-radius: 14px;
          background: linear-gradient(180deg, #ff9933 0%, #ff9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%, #138808 100%);
          flex-shrink: 0;
          box-shadow: 0 12px 28px rgba(15,23,42,0.12);
          position: relative;
        }
        .tcn-about-address .flag::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 14px;
          background-image: radial-gradient(circle, rgba(0,0,128,0.4) 0%, transparent 22%);
        }
        .tcn-about-address h3 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: 1.35rem;
          letter-spacing: -0.01em;
          color: #0b0f1e;
          margin: 0 0 0.85rem;
        }
        .tcn-about-address-lines {
          color: rgba(15,23,42,0.78);
          font-size: 0.96rem;
          line-height: 1.65;
          margin: 0 0 1.25rem;
        }
        .tcn-about-address-lines strong {
          display: block;
          color: #0b0f1e;
          font-weight: 800;
          font-size: 1rem;
          margin-bottom: 0.2rem;
        }
        .tcn-about-address-contact {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
        }
        .tcn-about-address-contact a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 0.95rem;
          border-radius: 999px;
          background: rgba(32,101,209,0.08);
          color: #2065D1 !important;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none !important;
          transition: all 0.18s ease;
        }
        .tcn-about-address-contact a:hover {
          background: rgba(32,101,209,0.16);
          transform: translateY(-1px);
        }
        @media (max-width: 640px) {
          .tcn-about-address { grid-template-columns: 1fr; padding: 1.75rem 1.5rem; }
        }

        /* ── Why this matters (B2B trust signals) ── */
        .tcn-about-trust {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .tcn-about-trust-card {
          padding: 1.85rem 1.65rem 1.65rem;
          border-radius: 18px;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          transition: all 0.22s ease;
        }
        .tcn-about-trust-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 32px rgba(15,23,42,0.08);
          border-color: var(--tint);
        }
        .tcn-about-trust-card .ic {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--tint-soft);
          color: var(--tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .tcn-about-trust-card h3 {
          font-size: 1.05rem;
          font-weight: 800;
          margin: 0 0 0.45rem;
          color: #0b0f1e;
        }
        .tcn-about-trust-card p {
          color: rgba(15,23,42,0.62);
          font-size: 0.92rem;
          line-height: 1.55;
          margin: 0;
        }

        /* ── CTA ── */
        .tcn-about-cta {
          padding: 4rem 0 6rem;
          text-align: center;
        }
        .tcn-about-cta h2 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(1.7rem, 3vw, 2.3rem);
          letter-spacing: -0.015em;
          line-height: 1.2;
          margin: 0 0 0.75rem;
          color: #0b0f1e;
        }
        .tcn-about-cta h2 em { font-style: italic; color: #2065D1; }
        .tcn-about-cta p {
          color: rgba(15,23,42,0.6);
          font-size: 1rem;
          max-width: 520px;
          margin: 0 auto 1.85rem;
        }
        .tcn-about-cta-btns {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-about-cta-btns a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.85rem 1.6rem;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none !important;
          transition: transform 0.18s ease;
        }
        .tcn-about-cta-btns .gold {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          box-shadow: 0 10px 26px rgba(255,213,74,0.4);
        }
        .tcn-about-cta-btns .gold:hover { transform: translateY(-2px); color: #1a1f3a !important; }
        .tcn-about-cta-btns .ghost {
          background: #fff;
          border: 1.5px solid rgba(15,23,42,0.15);
          color: #0b0f1e !important;
        }
      `}</style>

      {/* ── Hero ── */}
      <section className="tcn-about-hero">
        <div className="container">
          <span className="tcn-about-eyebrow">
            <PiBuildingsDuotone size={12} /> About the company
          </span>
          <h1>
            Built by a registered <em>Indian business.</em>
          </h1>
          <p className="lede">
            TheChatNest is a product of <strong style={{ color: "#fff" }}>{COMPANY.legalName}</strong> —
            a Varanasi-based, MSME-registered private limited company. Full details below for
            your procurement team's records.
          </p>

          <div className="tcn-about-facts">
            {FACTS.map((f) => (
              <div key={f.label} className="tcn-about-fact">
                <div className="ic"><f.Icon size={20} /></div>
                <div className="lbl">{f.label}</div>
                <div className="val">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Legal Registry ── */}
      <section className="tcn-about-section">
        <div className="container">
          <div className="tcn-about-section-head">
            <span className="tag">Company Registry</span>
            <h2>
              Everything procurement <em>needs to see.</em>
            </h2>
            <p>
              All the IDs, registrations, and certificates that prove we're a real,
              verifiable Indian business. Copy any value with the icon next to it —
              we know B2B onboarding paperwork is a thing.
            </p>
          </div>

          <div className="tcn-about-registry">
            {LEGAL_REGISTRY.map((row) => (
              <div key={row.label} className="tcn-about-row">
                <div className="ic"><row.Icon size={20} /></div>
                <div>
                  <div className="label">{row.label}</div>
                  <div className="value">{row.value}</div>
                  <div className="note">{row.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Registered Office ── */}
      <section className="tcn-about-section">
        <div className="container">
          <div className="tcn-about-section-head">
            <span className="tag">Registered Office</span>
            <h2>
              Where to send <em>official correspondence.</em>
            </h2>
            <p>
              Legal notices, GST documents, partnership paperwork — anything that needs to
              reach a real address goes here.
            </p>
          </div>

          <div className="tcn-about-address">
            <div className="flag" aria-hidden />
            <div>
              <h3>{COMPANY.legalName}</h3>
              <div className="tcn-about-address-lines">
                <strong>{addr.line1}</strong>
                {addr.line2 && <>{addr.line2}<br /></>}
                {addr.line3 && <>{addr.line3}<br /></>}
                {addr.city}, {addr.state} — {addr.pincode}<br />
                {addr.country}
              </div>
              <div className="tcn-about-address-contact">
                <a href={`mailto:${COMPANY.contact.email}`}>
                  <PiEnvelopeDuotone size={13} /> {COMPANY.contact.email}
                </a>
                <a href={`mailto:${COMPANY.contact.sales}`}>
                  <PiEnvelopeDuotone size={13} /> {COMPANY.contact.sales}
                </a>
                {COMPANY.contact.phone && (
                  <a href={`tel:${COMPANY.contact.phone.replace(/\s/g, "")}`}>
                    <PiPhoneDuotone size={13} /> {COMPANY.contact.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why this matters ── */}
      <section className="tcn-about-section">
        <div className="container">
          <div className="tcn-about-section-head">
            <span className="tag">Why this page exists</span>
            <h2>
              We're <em>fully verifiable.</em>
            </h2>
            <p>
              Most Indian SaaS companies hide their company details behind a "Contact us" form.
              We publish ours. Here's why it matters to you.
            </p>
          </div>

          <div className="tcn-about-trust">
            <article
              className="tcn-about-trust-card"
              style={{ "--tint": "#16a34a", "--tint-soft": "rgba(22,163,74,0.1)" }}
            >
              <div className="ic"><PiCheckCircleDuotone size={22} /></div>
              <h3>Procurement-friendly</h3>
              <p>
                CIN, GSTIN, PAN, registered address — all the IDs your finance team needs to
                add us as a vendor. No back-and-forth emails, no NDA required.
              </p>
            </article>
            <article
              className="tcn-about-trust-card"
              style={{ "--tint": "#2065D1", "--tint-soft": "rgba(32,101,209,0.1)" }}
            >
              <div className="ic"><PiShieldCheckDuotone size={22} /></div>
              <h3>GST input credit</h3>
              <p>
                Every invoice we issue includes our GSTIN. Your business gets full input tax
                credit on the 18% GST portion — so the effective cost is lower than the sticker.
              </p>
            </article>
            <article
              className="tcn-about-trust-card"
              style={{ "--tint": "#f59e0b", "--tint-soft": "rgba(245,158,11,0.1)" }}
            >
              <div className="ic"><PiHandshakeDuotone size={22} /></div>
              <h3>MSME benefits</h3>
              <p>
                As a registered Udyam (MSME) supplier, we're eligible under your Public
                Procurement Policy and entitle you to certain priority terms in many tenders.
              </p>
            </article>
            <article
              className="tcn-about-trust-card"
              style={{ "--tint": "#a855f7", "--tint-soft": "rgba(168,85,247,0.1)" }}
            >
              <div className="ic"><PiBuildingsDuotone size={22} /></div>
              <h3>Real-world accountability</h3>
              <p>
                We've put our company name, our registered address, and our director details
                in writing on a public website. We can't disappear overnight.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="tcn-about-cta">
        <div className="container">
          <h2>
            Need anything else for <em>procurement?</em>
          </h2>
          <p>
            Vendor onboarding forms, MSME certificate PDF, GST registration certificate,
            cancelled cheque — email <a href={`mailto:${COMPANY.contact.email}`}>{COMPANY.contact.email}</a>{" "}
            and we'll send everything within 24 hours.
          </p>
          <div className="tcn-about-cta-btns">
            <Link to="/contact" className="gold">
              Contact sales <PiArrowRightBold size={14} />
            </Link>
            <Link to="/why-thechatnest" className="ghost">
              Why TheChatNest
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
