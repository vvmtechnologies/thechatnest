import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TextField, MenuItem, InputAdornment } from "@mui/material";
import {
  PiCalendarDuotone,
  PiPhoneCallDuotone,
  PiVideoCameraDuotone,
  PiCheckCircleDuotone,
  PiClockDuotone,
  PiUsersThreeDuotone,
  PiSparkleDuotone,
  PiArrowRightBold,
} from "react-icons/pi";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import Seo from "../../components/Seo.jsx";

const HIGHLIGHTS = [
  {
    Icon: PiVideoCameraDuotone,
    tint: "#6d5dfc",
    title: "30-minute live walkthrough",
    desc: "We show every feature your team will actually use — no generic slide deck.",
  },
  {
    Icon: PiUsersThreeDuotone,
    tint: "#22c55e",
    title: "Tailored to your team size",
    desc: "From 10-person startups to 5000-seat orgs — we tune the demo to your scale.",
  },
  {
    Icon: PiSparkleDuotone,
    tint: "#ffd54a",
    title: "Admin + user flows side-by-side",
    desc: "See exactly how admins manage and how end users experience day-to-day.",
  },
  {
    Icon: PiClockDuotone,
    tint: "#f59e0b",
    title: "Same-day scheduling",
    desc: "Most demos confirmed within 4 hours. Pick any slot that works for you.",
  },
];

const Demo = () => {
  const { brandName } = useSiteBranding();
  const brand = brandName || "TheChatNest";

  const [values, setValues] = useState({
    name: "",
    companyName: "",
    companySize: "11-50",
    mobile: "",
    email: "",
    scheduledAt: "",
    timezone: "GMT +5:30",
    query: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (k, v) => {
    const s = String(v || "").trim();
    if (k === "name") return !s ? "Please enter your name." : s.length < 2 ? "Name looks too short." : "";
    if (k === "companyName") return !s ? "Company name is required." : "";
    if (k === "mobile") {
      const d = s.replace(/[^\d]/g, "");
      return !d ? "Mobile number is required." : d.length < 7 ? "Mobile number is too short." : "";
    }
    if (k === "email") {
      if (!s) return "Work email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return "Enter a valid email address.";
      return "";
    }
    if (k === "scheduledAt") return !s ? "Pick a preferred date / time." : "";
    return "";
  };

  const update = (k) => (e) => {
    const v = e.target.value;
    setValues((prev) => ({ ...prev, [k]: v }));
    if (touched[k]) setErrors((prev) => ({ ...prev, [k]: validate(k, v) }));
  };

  const handleBlur = (k) => (e) => {
    setTouched((prev) => ({ ...prev, [k]: true }));
    setErrors((prev) => ({ ...prev, [k]: validate(k, e.target.value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const required = ["name", "companyName", "mobile", "email", "scheduledAt"];
    const all = Object.fromEntries(required.map((k) => [k, validate(k, values[k])]));
    setErrors(all);
    setTouched(Object.fromEntries(required.map((k) => [k, true])));
    if (Object.values(all).some(Boolean)) return;
    setSubmitted(true);
  };

  return (
    <div className="tcn-demo">
      <Seo
        title="Book a demo"
        description="See TheChatNest in action with a 30-minute live walkthrough tailored to your team size and workflow."
        keywords="thechatnest demo, book a demo, product walkthrough"
      />
      <style>{`
        .tcn-demo { background: #fff; }
        .tcn-demo-hero {
          background:
            radial-gradient(1200px 600px at 80% -10%, rgba(109,93,252,0.32), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.1), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          padding: 8rem 0 5rem;
          position: relative;
          overflow: hidden;
        }
        .tcn-demo-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%);
          pointer-events: none;
        }
        .tcn-demo-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 3rem;
          align-items: start;
        }
        .tcn-demo-intro h1 {
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.025em;
          line-height: 1.08;
          margin: 1.25rem 0 1rem;
        }
        .tcn-demo-intro h1 .g {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-demo-intro p.lead {
          color: rgba(255,255,255,0.7);
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 2rem;
          max-width: 480px;
        }
        .tcn-demo-highlights {
          display: grid;
          gap: 0.85rem;
        }
        .tcn-demo-hl {
          display: flex;
          gap: 12px;
          padding: 1rem 1.1rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          backdrop-filter: blur(8px);
        }
        .tcn-demo-hl .ico {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: var(--card-tint-soft);
          color: var(--card-tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tcn-demo-hl h4 {
          color: #fff;
          font-size: 0.96rem;
          font-weight: 700;
          margin: 0 0 0.2rem;
        }
        .tcn-demo-hl p {
          color: rgba(255,255,255,0.62);
          font-size: 0.85rem;
          margin: 0;
          line-height: 1.5;
        }

        .tcn-demo-form {
          background: rgba(255,255,255,0.98);
          border-radius: 20px;
          padding: 2.25rem;
          box-shadow: 0 30px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
          color: var(--tcn-ink-900);
        }
        .tcn-demo-form h2 {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 0 0 0.3rem;
          letter-spacing: -0.02em;
        }
        .tcn-demo-form .form-sub {
          font-size: 0.92rem;
          color: var(--tcn-ink-500);
          margin: 0 0 1.5rem;
        }
        .tcn-demo-form .MuiOutlinedInput-root {
          border-radius: 12px !important;
          background: #fafbff;
          font-family: var(--tcn-font-sans) !important;
        }
        .tcn-demo-form .Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: var(--tcn-violet-600) !important;
          border-width: 2px !important;
        }
        .tcn-demo-form .MuiInputLabel-root.Mui-focused { color: var(--tcn-violet-600) !important; }
        .tcn-demo-submit {
          flex: 1;
          padding: 0.95rem 1.5rem;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--tcn-navy-900), #4d3eff);
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          box-shadow: 0 8px 24px rgba(109,93,252,0.35);
          transition: transform 0.18s ease;
        }
        .tcn-demo-submit:hover { transform: translateY(-2px); }
        .tcn-demo-reset {
          padding: 0.95rem 1.4rem;
          border-radius: 999px;
          background: transparent;
          color: var(--tcn-ink-700);
          font-weight: 600;
          font-size: 0.95rem;
          border: 1px solid var(--tcn-border);
          cursor: pointer;
          font-family: inherit;
        }
        .tcn-demo-reset:hover { background: var(--tcn-bg-soft); }

        @media (max-width: 992px) {
          .tcn-demo-grid { grid-template-columns: 1fr; gap: 2.5rem; }
        }
        @media (max-width: 768px) {
          .tcn-demo-hero { padding: 6.5rem 0 3rem; }
          .tcn-demo-form { padding: 1.75rem; }
        }
      `}</style>

      <section className="tcn-demo-hero">
        <div className="container">
          <div className="tcn-demo-grid">
            {/* Left intro + highlights */}
            <div className="tcn-demo-intro">
              <span
                className="eyebrow"
                style={{
                  background: "rgba(255,213,74,0.12)",
                  color: "#ffd54a",
                  borderColor: "rgba(255,213,74,0.25)",
                  display: "inline-flex",
                }}
              >
                <PiVideoCameraDuotone size={12} /> Book a live walkthrough
              </span>
              <h1>
                See {brand} in action — <span className="g">live</span> and personalized
              </h1>
              <p className="lead">
                30 minutes with a product specialist who shows the features your team will
                actually use, tailored to your size and workflow.
              </p>

              <div className="tcn-demo-highlights">
                {HIGHLIGHTS.map(({ Icon, tint, title, desc }) => (
                  <div
                    key={title}
                    className="tcn-demo-hl"
                    style={{
                      "--card-tint": tint,
                      "--card-tint-soft": `${tint}1a`,
                    }}
                  >
                    <span className="ico">
                      <Icon size={20} />
                    </span>
                    <div>
                      <h4>{title}</h4>
                      <p>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right form */}
            <form className="tcn-demo-form" onSubmit={handleSubmit} noValidate>
              <h2>Schedule your demo</h2>
              <p className="form-sub">Pick a slot — we confirm within 4 business hours.</p>

              {submitted && (
                <div style={{
                  padding: "0.9rem 1rem",
                  marginBottom: "1rem",
                  borderRadius: 12,
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.35)",
                  color: "#15803d",
                  fontSize: "0.92rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <PiCheckCircleDuotone size={18} /> Got it! We'll email you a confirmed slot within 4 business hours.
                </div>
              )}

              <div style={{ display: "grid", gap: "1rem" }}>
                <TextField
                  fullWidth
                  label="Your name"
                  required
                  value={values.name}
                  onChange={update("name")}
                  onBlur={handleBlur("name")}
                  error={Boolean(errors.name)}
                  helperText={errors.name || " "}
                  size="small"
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
                  <TextField
                    fullWidth
                    label="Company"
                    required
                    value={values.companyName}
                    onChange={update("companyName")}
                    onBlur={handleBlur("companyName")}
                    error={Boolean(errors.companyName)}
                    helperText={errors.companyName || " "}
                    size="small"
                  />
                  <TextField
                    fullWidth
                    select
                    label="Team size"
                    required
                    value={values.companySize}
                    onChange={update("companySize")}
                    size="small"
                  >
                    <MenuItem value="1-10">1-10</MenuItem>
                    <MenuItem value="11-50">11-50</MenuItem>
                    <MenuItem value="51-200">51-200</MenuItem>
                    <MenuItem value="200+">200+</MenuItem>
                  </TextField>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    type="tel"
                    required
                    value={values.mobile}
                    onChange={update("mobile")}
                    onBlur={handleBlur("mobile")}
                    error={Boolean(errors.mobile)}
                    helperText={errors.mobile || " "}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PiPhoneCallDuotone size={18} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Work email"
                    type="email"
                    required
                    value={values.email}
                    onChange={update("email")}
                    onBlur={handleBlur("email")}
                    error={Boolean(errors.email)}
                    helperText={errors.email || " "}
                    size="small"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
                  <TextField
                    fullWidth
                    label="Preferred date / time"
                    required
                    value={values.scheduledAt}
                    onChange={update("scheduledAt")}
                    onBlur={handleBlur("scheduledAt")}
                    error={Boolean(errors.scheduledAt)}
                    helperText={errors.scheduledAt || " "}
                    size="small"
                    placeholder="e.g. Tue 3:00 PM"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <PiCalendarDuotone size={18} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    select
                    label="Timezone"
                    required
                    value={values.timezone}
                    onChange={update("timezone")}
                    size="small"
                  >
                    <MenuItem value="GMT +5:30">(GMT +5:30) Asia / Calcutta</MenuItem>
                    <MenuItem value="GMT +0:00">(GMT +0:00) Europe / London</MenuItem>
                    <MenuItem value="GMT -5:00">(GMT -5:00) US / Eastern</MenuItem>
                    <MenuItem value="GMT -8:00">(GMT -8:00) US / Pacific</MenuItem>
                  </TextField>
                </div>
                <TextField
                  fullWidth
                  label="What would you like to see in the demo?"
                  multiline
                  rows={3}
                  value={values.query}
                  onChange={update("query")}
                />

                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    type="button"
                    className="tcn-demo-reset"
                    onClick={() =>
                      setValues({
                        name: "",
                        companyName: "",
                        companySize: "11-50",
                        mobile: "",
                        email: "",
                        scheduledAt: "",
                        timezone: "GMT +5:30",
                        query: "",
                      })
                    }
                  >
                    Reset
                  </button>
                  <button type="submit" className="tcn-demo-submit">
                    Request demo <PiArrowRightBold size={16} />
                  </button>
                </div>

                <p style={{ fontSize: "0.78rem", color: "var(--tcn-ink-500)", margin: 0, textAlign: "center" }}>
                  <PiCheckCircleDuotone size={14} style={{ color: "#22c55e", verticalAlign: -2 }} /> No
                  credit card needed. We respond within 4 business hours.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="tcn-page-cta">
        <div className="container">
          <div className="tcn-page-cta-inner">
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
              <PiSparkleDuotone size={12} /> Or skip the call
            </span>
            <h2>Already convinced? Start your trial</h2>
            <p>
              14 days free, no credit card. You can always book a demo later if you have questions.
            </p>
            <div className="btns">
              <Link to="/auth/register" className="btn-gold">
                Start free trial <PiArrowRightBold size={16} />
              </Link>
              <Link to="/pricing" className="btn-ghost">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Demo;
