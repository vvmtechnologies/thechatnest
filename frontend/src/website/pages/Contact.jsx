import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  CircularProgress,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  PiEnvelopeSimpleDuotone,
  PiPhoneCallDuotone,
  PiMapPinDuotone,
  PiPaperPlaneTiltBold,
  PiCheckCircleDuotone,
  PiChatTextDuotone,
  PiHeadsetDuotone,
  PiClockDuotone,
  PiArrowRightBold,
  PiBuildingsDuotone,
} from "react-icons/pi";
import { API_BASE_URL } from "../../config/apiBaseUrl";

const cleanLegacyEmail = (raw) =>
  String(raw || "")
    .trim()
    .replace(/@teamchatx\.com$/i, "@thechatnest.com")
    .replace(/@aabhyasa\.com$/i, "@thechatnest.com");

const cleanLegacyText = (raw) =>
  String(raw || "")
    .replace(/TeamChatX|TeamChatx|Teamchatx/g, "TheChatNest")
    .replace(/teamChatx|teamchatX|teamchatx/g, "thechatnest")
    .replace(/Aabhyasa/g, "Thechatnest")
    .replace(/aabhyasa/g, "thechatnest");

const Contact = () => {
  const [formValues, setFormValues] = useState({
    name: "",
    emailAddress: "",
    countryCode: "+91",
    mobileNumber: "",
    totalUsers: "",
    requirementDetails: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCountriesLoading, setIsCountriesLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [siteProfile, setSiteProfile] = useState(null);
  const [countries, setCountries] = useState([]);

  const normalizeDialCode = (value) => {
    const digits = String(value || "").replace(/[^\d]/g, "");
    return digits ? `+${digits}` : "";
  };

  useEffect(() => {
    let ignore = false;
    const loadSiteDetails = async () => {
      if (!API_BASE_URL) return;
      try {
        const res = await fetch(`${API_BASE_URL}/site-details`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const payload = await res.json();
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const active =
          rows.find((r) => String(r?.status || "").toLowerCase() === "active") ||
          rows[0] ||
          null;
        if (!ignore) setSiteProfile(active);
      } catch {
        /* fall through to defaults */
      }
    };
    loadSiteDetails();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadCountries = async () => {
      if (!API_BASE_URL) return;
      setIsCountriesLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/geo/countries?limit=500&offset=0`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const payload = await res.json().catch(() => ({}));
        const rows = Array.isArray(payload?.data?.rows) ? payload.data.rows : [];
        const parsed = rows
          .map((row) => ({
            id: Number(row?.country_id || 0),
            isoCode: String(row?.iso_code || "").trim().toUpperCase(),
            name: String(row?.name || "").trim(),
            dialCode: normalizeDialCode(row?.phonecode) || "",
          }))
          .filter((r) => r.name)
          .sort((a, b) => a.name.localeCompare(b.name));
        if (!ignore) {
          setCountries(parsed);
          const india = parsed.find((r) => r.isoCode === "IN");
          if (india?.dialCode) {
            setFormValues((prev) => ({ ...prev, countryCode: india.dialCode }));
          }
        }
      } catch {
        /* ignore */
      } finally {
        if (!ignore) setIsCountriesLoading(false);
      }
    };
    loadCountries();
    return () => {
      ignore = true;
    };
  }, []);

  const siteEmails = useMemo(() => {
    const rows = Array.isArray(siteProfile?.emails) ? siteProfile.emails : [];
    const parsed = rows
      .filter((r) => String(r?.status || "active").toLowerCase() !== "inactive")
      .map((r) => cleanLegacyEmail(r?.email_address))
      .filter(Boolean);
    return parsed.length ? parsed : ["support@thechatnest.com", "sales@thechatnest.com"];
  }, [siteProfile]);

  const sitePhones = useMemo(() => {
    const rows = Array.isArray(siteProfile?.phones) ? siteProfile.phones : [];
    const parsed = rows
      .filter((r) => String(r?.status || "active").toLowerCase() !== "inactive")
      .map((r) => String(r?.phone_number || "").trim())
      .filter(Boolean);
    return parsed.length ? parsed : ["+91 91217 55111", "+1 (732) 218-6668"];
  }, [siteProfile]);

  const primaryAddress = useMemo(() => {
    const rows = Array.isArray(siteProfile?.addresses) ? siteProfile.addresses : [];
    const preferred = rows.find((r) => Boolean(r?.is_primary)) || rows[0] || null;
    if (!preferred) {
      return ["7-10 Bateman's Row", "London", "EC2A 3HH"];
    }
    return [
      preferred.address_line_1,
      preferred.address_line_2,
      preferred.city,
      preferred.state,
      preferred.country,
      preferred.postal_code,
    ]
      .map((v) => cleanLegacyText(String(v || "").trim()))
      .filter(Boolean);
  }, [siteProfile]);

  const mapsUrl = useMemo(() => {
    const rows = Array.isArray(siteProfile?.addresses) ? siteProfile.addresses : [];
    const preferred = rows.find((r) => Boolean(r?.is_primary)) || rows[0] || null;
    const postal = String(preferred?.postal_code || "").trim();
    const query =
      postal ||
      [preferred?.address_line_1, preferred?.city, preferred?.country]
        .map((v) => String(v || "").trim())
        .filter(Boolean)
        .join(", ") ||
      primaryAddress.join(", ") ||
      "TheChatNest";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }, [siteProfile, primaryAddress]);

  const mapsEmbedUrl = useMemo(() => {
    const rows = Array.isArray(siteProfile?.addresses) ? siteProfile.addresses : [];
    const preferred = rows.find((r) => Boolean(r?.is_primary)) || rows[0] || null;
    const q =
      preferred
        ? [preferred.address_line_1, preferred.city, preferred.country, preferred.postal_code]
            .map((v) => String(v || "").trim())
            .filter(Boolean)
            .join(", ")
        : primaryAddress.join(", ");
    return `https://www.google.com/maps?q=${encodeURIComponent(q || "TheChatNest")}&output=embed`;
  }, [siteProfile, primaryAddress]);

  const brandName = useMemo(() => {
    const value = cleanLegacyText(String(siteProfile?.brand_name || "").trim());
    return value || "TheChatNest";
  }, [siteProfile]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormValues({
      name: "",
      emailAddress: "",
      countryCode: "+91",
      mobileNumber: "",
      totalUsers: "",
      requirementDetails: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const name = formValues.name.trim();
    const emailAddress = formValues.emailAddress.trim().toLowerCase();
    const countryCode = formValues.countryCode.trim() || "+91";
    const mobile = formValues.mobileNumber.trim();
    const requirementDetails = formValues.requirementDetails.trim();
    const totalUsers = Number(formValues.totalUsers);

    if (!name || !emailAddress || !mobile || !requirementDetails || !totalUsers) {
      setErrorMessage("Please fill name, email, mobile, total users, and requirement details.");
      return;
    }
    if (!API_BASE_URL) {
      setErrorMessage("API base URL is missing.");
      return;
    }
    const mobileNumber = mobile.replace(/[^\d]/g, "");
    if (!mobileNumber) {
      setErrorMessage("Please enter a valid mobile number.");
      return;
    }
    if (!Number.isInteger(totalUsers) || totalUsers <= 0) {
      setErrorMessage("Total users must be a positive integer.");
      return;
    }

    const companyName = emailAddress.split("@")[1]?.split(".")[0]?.trim() || "Individual";

    const requestBody = {
      name,
      country_code: countryCode,
      mobile_number: mobileNumber,
      email_address: emailAddress,
      company_name: companyName,
      total_users: totalUsers,
      requirement_details: requirementDetails,
    };

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/contact-us`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(payload?.message || "Unable to submit your request.");
        return;
      }
      setSuccessMessage(payload?.message || "Thanks! We'll be in touch within 24 hours.");
      resetForm();
    } catch {
      setErrorMessage("Network error while submitting request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tcn-contact">
      <style>{`
        .tcn-contact { background: #fff; }

        /* HERO + FORM */
        .tcn-contact-hero {
          background:
            radial-gradient(1200px 600px at 80% -10%, rgba(109,93,252,0.32), transparent 60%),
            radial-gradient(800px 500px at 10% 10%, rgba(255,213,74,0.1), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          padding: 8rem 0 4rem;
          position: relative;
          overflow: hidden;
        }
        .tcn-contact-hero::before {
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
        .tcn-contact-hero > .container { position: relative; z-index: 1; }

        .tcn-contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 3rem;
          align-items: start;
        }

        .tcn-contact-intro h1 {
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.025em;
          line-height: 1.08;
          margin: 1.25rem 0 1rem;
        }
        .tcn-contact-intro h1 .gradient-word {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-contact-intro p.lead {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.65;
          margin: 0 0 2rem;
          max-width: 480px;
        }

        .tcn-contact-quick {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 2rem;
        }
        .tcn-contact-quick a {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 1rem 1.1rem;
          border-radius: 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff !important;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
        }
        .tcn-contact-quick a:hover {
          background: rgba(255,213,74,0.08);
          border-color: rgba(255,213,74,0.35);
          transform: translateX(4px);
        }
        .tcn-contact-quick .qi-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: linear-gradient(135deg, rgba(255,213,74,0.18), rgba(109,93,252,0.18));
          color: #ffd54a;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tcn-contact-quick .qi-label {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.55);
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .tcn-contact-quick .qi-value {
          font-size: 0.95rem;
          color: #fff;
        }
        .tcn-contact-quick .qi-arrow {
          margin-left: auto;
          color: rgba(255,255,255,0.4);
        }

        .tcn-contact-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.6);
        }
        .tcn-contact-meta span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .tcn-contact-meta svg { color: #22c55e; }

        /* FORM CARD */
        .tcn-form-card {
          background: rgba(255,255,255,0.98);
          border-radius: 20px;
          padding: 2.25rem;
          box-shadow: 0 30px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          color: var(--tcn-ink-900);
        }
        .tcn-form-card .form-title {
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 0.4rem;
        }
        .tcn-form-card .form-sub {
          font-size: 0.92rem;
          color: var(--tcn-ink-500);
          margin: 0 0 1.6rem;
        }

        /* MUI overrides inside form */
        .tcn-form-card .MuiOutlinedInput-root {
          border-radius: 12px !important;
          background: #fafbff;
          font-family: var(--tcn-font-sans) !important;
        }
        .tcn-form-card .MuiOutlinedInput-notchedOutline {
          border-color: var(--tcn-border) !important;
        }
        .tcn-form-card .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: var(--tcn-violet-500) !important;
        }
        .tcn-form-card .Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: var(--tcn-violet-600) !important;
          border-width: 2px !important;
        }
        .tcn-form-card .MuiInputLabel-root {
          font-family: var(--tcn-font-sans) !important;
        }
        .tcn-form-card .MuiInputLabel-root.Mui-focused {
          color: var(--tcn-violet-600) !important;
        }

        .tcn-form-submit {
          width: 100%;
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
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          box-shadow: 0 8px 24px rgba(109,93,252,0.35);
        }
        .tcn-form-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(109,93,252,0.5);
        }
        .tcn-form-submit:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        /* CONTACT CARDS STRIP */
        .tcn-contact-strip {
          padding: 5rem 0 4rem;
          background: #fff;
        }
        .tcn-contact-strip .head {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 3rem;
        }
        .tcn-contact-strip .head h2 {
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--tcn-ink-900);
          margin: 1rem 0 0.7rem;
        }
        .tcn-contact-strip .head p {
          color: var(--tcn-ink-500);
          font-size: 1.02rem;
          margin: 0;
        }
        .tcn-contact-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
          max-width: 1080px;
          margin: 0 auto;
        }
        .tcn-contact-card {
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 20px;
          padding: 1.85rem 1.6rem;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          position: relative;
          overflow: hidden;
        }
        .tcn-contact-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--card-tint, #6d5dfc);
          opacity: 0;
          transition: opacity 0.22s ease;
        }
        .tcn-contact-card:hover {
          transform: translateY(-4px);
          border-color: var(--card-tint, #6d5dfc);
          box-shadow: 0 14px 36px rgba(15,23,42,0.08);
        }
        .tcn-contact-card:hover::before { opacity: 1; }
        .tcn-contact-card .ico {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--card-tint-soft, rgba(109,93,252,0.1));
          color: var(--card-tint, #6d5dfc);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.1rem;
        }
        .tcn-contact-card h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--tcn-ink-900);
          margin: 0 0 0.25rem;
        }
        .tcn-contact-card .desc {
          font-size: 0.86rem;
          color: var(--tcn-ink-500);
          margin: 0 0 1rem;
        }
        .tcn-contact-card .vals {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tcn-contact-card .vals a {
          color: var(--tcn-ink-900) !important;
          font-weight: 600;
          font-size: 0.94rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.18s ease, transform 0.18s ease;
        }
        .tcn-contact-card .vals a:hover {
          color: var(--card-tint, #6d5dfc) !important;
          transform: translateX(2px);
        }

        /* MAP SECTION */
        .tcn-map-section {
          padding: 4rem 0 5rem;
          background: linear-gradient(180deg, #fff 0%, #fafbff 100%);
        }
        .tcn-map-wrap {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2.5rem;
          align-items: stretch;
          max-width: 1180px;
          margin: 0 auto;
        }
        .tcn-map-info {
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 22px;
          padding: 2.25rem;
          box-shadow: var(--tcn-shadow-sm);
        }
        .tcn-map-info h2 {
          font-size: clamp(1.6rem, 2.5vw, 2rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--tcn-ink-900);
          margin: 0.85rem 0 1.4rem;
        }
        .tcn-map-info .addr-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          background: var(--tcn-violet-50);
          color: var(--tcn-violet-600);
          font-weight: 700;
          font-size: 0.72rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .tcn-map-info .lines {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          margin-bottom: 1.5rem;
        }
        .tcn-map-info .lines .ln {
          color: var(--tcn-ink-700);
          font-size: 0.96rem;
          line-height: 1.5;
        }
        .tcn-map-info .lines .ln.first {
          color: var(--tcn-ink-900);
          font-size: 1.1rem;
          font-weight: 700;
        }
        .tcn-map-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.8rem 1.3rem;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--tcn-navy-900), #2d2563);
          color: #fff !important;
          font-weight: 600;
          font-size: 0.92rem;
          text-decoration: none !important;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .tcn-map-cta:hover {
          transform: translateY(-2px);
          box-shadow: var(--tcn-shadow-md);
          color: #fff !important;
        }

        .tcn-map-frame {
          border-radius: 22px;
          overflow: hidden;
          box-shadow: var(--tcn-shadow-md);
          border: 1px solid var(--tcn-border);
          min-height: 380px;
          background: #f3f4f8;
        }
        .tcn-map-frame iframe {
          width: 100%;
          height: 100%;
          min-height: 380px;
          border: 0;
          display: block;
        }

        /* FINAL CTA */
        .tcn-contact-cta {
          padding: 5rem 0 6rem;
        }
        .tcn-contact-cta-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 4rem 3rem;
          border-radius: 24px;
          background: linear-gradient(135deg, #0b0f1e 0%, #1a1f3a 50%, #2d2563 100%);
          text-align: center;
          color: #fff;
          position: relative;
          overflow: hidden;
          box-shadow: var(--tcn-shadow-lg);
        }
        .tcn-contact-cta-inner::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(600px 300px at 20% 0%, rgba(255,213,74,0.2), transparent 60%),
            radial-gradient(600px 300px at 80% 100%, rgba(109,93,252,0.3), transparent 60%);
          pointer-events: none;
        }
        .tcn-contact-cta-inner > * { position: relative; z-index: 1; }
        .tcn-contact-cta h2 {
          color: #fff;
          font-size: clamp(1.7rem, 3vw, 2.4rem);
          font-weight: 800;
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
        }
        .tcn-contact-cta p {
          color: rgba(255,255,255,0.72);
          font-size: 1.05rem;
          max-width: 540px;
          margin: 0 auto 1.75rem;
        }
        .tcn-contact-cta .btns {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-contact-cta .btn-gold {
          padding: 0.9rem 1.85rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          font-weight: 800;
          font-size: 1rem;
          text-decoration: none !important;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 8px 24px rgba(255,213,74,0.35);
          transition: transform 0.18s ease;
        }
        .tcn-contact-cta .btn-gold:hover { transform: translateY(-2px); color: #1a1f3a !important; }
        .tcn-contact-cta .btn-ghost {
          padding: 0.9rem 1.75rem;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff !important;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none !important;
          backdrop-filter: blur(8px);
        }

        @media (max-width: 992px) {
          .tcn-contact-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .tcn-map-wrap { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .tcn-contact-hero { padding: 6.5rem 0 3rem; }
          .tcn-form-card { padding: 1.75rem; }
          .tcn-contact-cta-inner { padding: 3rem 1.5rem; }
        }
      `}</style>

      {/* ─── HERO + FORM ─────────────────────────────────── */}
      <section className="tcn-contact-hero">
        <div className="container">
          <div className="tcn-contact-grid">
            {/* Left: intro + quick contacts */}
            <div className="tcn-contact-intro">
              <span
                className="eyebrow"
                style={{
                  background: "rgba(255,213,74,0.12)",
                  color: "#ffd54a",
                  borderColor: "rgba(255,213,74,0.25)",
                  display: "inline-flex",
                }}
              >
                <PiChatTextDuotone size={12} />
                Let's talk
              </span>

              <h1>
                Get in touch with{" "}
                <span className="gradient-word">{brandName}</span>
              </h1>
              <p className="lead">
                Sales, support, partnerships, or just a quick demo — we'd love to hear what
                your team is building. We reply within one business day.
              </p>

              <div className="tcn-contact-quick">
                {siteEmails[0] && (
                  <a href={`mailto:${siteEmails[0]}`}>
                    <span className="qi-icon">
                      <PiEnvelopeSimpleDuotone size={20} />
                    </span>
                    <span>
                      <div className="qi-label">Email us</div>
                      <div className="qi-value">{siteEmails[0]}</div>
                    </span>
                    <PiArrowRightBold size={14} className="qi-arrow" />
                  </a>
                )}
                {sitePhones[0] && (
                  <a href={`tel:${sitePhones[0].replace(/[^\d+]/g, "")}`}>
                    <span className="qi-icon">
                      <PiPhoneCallDuotone size={20} />
                    </span>
                    <span>
                      <div className="qi-label">Call us</div>
                      <div className="qi-value">{sitePhones[0]}</div>
                    </span>
                    <PiArrowRightBold size={14} className="qi-arrow" />
                  </a>
                )}
              </div>

              <div className="tcn-contact-meta">
                <span>
                  <PiCheckCircleDuotone size={14} /> 24h response
                </span>
                <span>
                  <PiClockDuotone size={14} /> Mon–Fri, 9am–7pm IST
                </span>
                <span>
                  <PiHeadsetDuotone size={14} /> Free demos
                </span>
              </div>
            </div>

            {/* Right: form card */}
            <form className="tcn-form-card" onSubmit={handleSubmit}>
              <h2 className="form-title">Tell us about your team</h2>
              <p className="form-sub">
                Fill the form below and our team will get back within 24 hours.
              </p>

              <div style={{ display: "grid", gap: "1rem" }}>
                <TextField
                  name="name"
                  label="Your name"
                  variant="outlined"
                  fullWidth
                  required
                  value={formValues.name}
                  onChange={handleInputChange}
                  size="small"
                />

                <TextField
                  label="Work email"
                  variant="outlined"
                  fullWidth
                  required
                  type="email"
                  name="emailAddress"
                  value={formValues.emailAddress}
                  onChange={handleInputChange}
                  size="small"
                />

                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0.6rem" }}>
                  <TextField
                    name="countryCode"
                    label="Country"
                    variant="outlined"
                    fullWidth
                    select
                    value={formValues.countryCode}
                    onChange={handleInputChange}
                    disabled={isCountriesLoading}
                    size="small"
                  >
                    {!countries.length ? (
                      <MenuItem value={formValues.countryCode}>
                        {formValues.countryCode}
                      </MenuItem>
                    ) : null}
                    {countries.map((c) => (
                      <MenuItem key={`${c.id}-${c.isoCode}-${c.dialCode}`} value={c.dialCode}>
                        {c.name} ({c.dialCode})
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    name="mobileNumber"
                    label="Mobile number"
                    variant="outlined"
                    fullWidth
                    required
                    value={formValues.mobileNumber}
                    onChange={handleInputChange}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    size="small"
                  />
                </div>

                <TextField
                  name="totalUsers"
                  label="Team size (users)"
                  variant="outlined"
                  fullWidth
                  required
                  type="number"
                  value={formValues.totalUsers}
                  onChange={handleInputChange}
                  inputProps={{ min: 1 }}
                  size="small"
                />

                <TextField
                  name="requirementDetails"
                  label="What are you looking for?"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  required
                  value={formValues.requirementDetails}
                  onChange={handleInputChange}
                />

                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                {successMessage && <Alert severity="success">{successMessage}</Alert>}

                <button type="submit" className="tcn-form-submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={16} color="inherit" /> Sending…
                    </>
                  ) : (
                    <>
                      Send message <PiPaperPlaneTiltBold size={16} />
                    </>
                  )}
                </button>

                <p style={{ fontSize: "0.78rem", color: "var(--tcn-ink-500)", margin: 0, textAlign: "center" }}>
                  By submitting, you agree to our privacy policy. No spam, ever.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ─── CONTACT CARDS STRIP ─────────────────────────── */}
      <section className="tcn-contact-strip">
        <div className="container">
          <div className="head">
            <span className="eyebrow">Direct lines</span>
            <h2>Reach the right person faster</h2>
            <p>Pick the channel that works best for you.</p>
          </div>

          <div className="tcn-contact-cards">
            <div
              className="tcn-contact-card"
              style={{ "--card-tint": "#6d5dfc", "--card-tint-soft": "rgba(109,93,252,0.1)" }}
            >
              <div className="ico">
                <PiEnvelopeSimpleDuotone size={28} />
              </div>
              <h3>Email</h3>
              <p className="desc">For sales, support, or anything in between.</p>
              <div className="vals">
                {siteEmails.slice(0, 3).map((email) => (
                  <a key={email} href={`mailto:${email}`}>
                    {email}
                  </a>
                ))}
              </div>
            </div>

            <div
              className="tcn-contact-card"
              style={{ "--card-tint": "#22c55e", "--card-tint-soft": "rgba(34,197,94,0.1)" }}
            >
              <div className="ico">
                <PiPhoneCallDuotone size={28} />
              </div>
              <h3>Phone</h3>
              <p className="desc">Mon–Fri · 9am to 7pm IST. We pick up fast.</p>
              <div className="vals">
                {sitePhones.slice(0, 3).map((phone) => (
                  <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
                    {phone}
                  </a>
                ))}
              </div>
            </div>

            <div
              className="tcn-contact-card"
              style={{ "--card-tint": "#f59e0b", "--card-tint-soft": "rgba(245,158,11,0.1)" }}
            >
              <div className="ico">
                <PiBuildingsDuotone size={28} />
              </div>
              <h3>Office</h3>
              <p className="desc">Drop by — coffee's on us.</p>
              <div className="vals">
                {primaryAddress.slice(0, 3).map((line, i) => (
                  <span key={`${line}-${i}`} style={{ color: "var(--tcn-ink-700)", fontSize: "0.92rem" }}>
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAP SECTION ─────────────────────────────────── */}
      <section className="tcn-map-section">
        <div className="container">
          <div className="tcn-map-wrap">
            <div className="tcn-map-info">
              <span className="addr-pill">
                <PiMapPinDuotone size={12} /> HQ Location
              </span>
              <h2>How to find {brandName} HQ</h2>
              {primaryAddress.length ? (
                <div className="lines">
                  {primaryAddress.map((line, i) => (
                    <span key={`${line}-${i}`} className={`ln ${i === 0 ? "first" : ""}`}>
                      {line}
                    </span>
                  ))}
                </div>
              ) : null}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tcn-map-cta"
              >
                Open in Google Maps <PiArrowRightBold size={14} />
              </a>
            </div>
            <div className="tcn-map-frame">
              <iframe
                src={mapsEmbedUrl}
                title={`${brandName} HQ map`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────── */}
      <section className="tcn-contact-cta">
        <div className="container">
          <div className="tcn-contact-cta-inner">
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
              <PiCheckCircleDuotone size={12} />
              Why wait?
            </span>
            <h2>Try {brandName} before you talk to us</h2>
            <p>
              Start your free 14-day trial — no credit card required. Or book a quick demo
              if you'd rather see it live.
            </p>
            <div className="btns">
              <Link to="/auth/register" className="btn-gold">
                Start free trial <PiArrowRightBold size={16} />
              </Link>
              <Link to="/demo" className="btn-ghost">
                Book a demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
