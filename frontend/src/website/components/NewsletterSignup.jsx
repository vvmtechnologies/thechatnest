import React, { useState } from "react";
import {
  PiEnvelopeOpenDuotone,
  PiCheckBold,
  PiSparkleDuotone,
} from "react-icons/pi";
import { API_BASE_URL } from "../../config/apiBaseUrl";

// Lightweight newsletter form. Posts to the existing /contact-us endpoint
// with a [NEWSLETTER] marker so backend doesn't need a new table — it
// shows up in the admin inbox as a low-noise newsletter signup.
// `variant="inline"` keeps it compact (footer), `variant="card"` is a
// fuller card (about pages / blog).

const isValidEmail = (s) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || "").trim());

const NewsletterSignup = ({ variant = "inline" }) => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState({ kind: "idle", msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      setState({ kind: "error", msg: "Please enter a valid email." });
      return;
    }
    if (!API_BASE_URL) {
      setState({ kind: "error", msg: "Backend unavailable. Try again later." });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/contact-us`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: trimmed.split("@")[0] || "Subscriber",
          country_code: "+91",
          mobile_number: "0000000000",
          email_address: trimmed,
          company_name: "Newsletter",
          total_users: 1,
          requirement_details: "[NEWSLETTER] Asked to subscribe to TheChatNest newsletter.",
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Could not subscribe.");
      }
      setState({ kind: "success", msg: "You're in. We'll be respectful with your inbox." });
      setEmail("");
    } catch (err) {
      setState({ kind: "error", msg: err?.message || "Something went wrong." });
    } finally {
      setBusy(false);
    }
  };

  const isInline = variant === "inline";

  return (
    <div className={`tcn-news ${isInline ? "tcn-news--inline" : "tcn-news--card"}`}>
      <style>{`
        .tcn-news--inline {
          width: 100%;
        }
        .tcn-news--inline form {
          display: flex;
          gap: 0.5rem;
          align-items: stretch;
        }
        .tcn-news--inline .tcn-news-input {
          flex: 1;
          min-width: 0;
          padding: 0.7rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.06);
          color: #fff;
          font-size: 0.9rem;
          font-family: inherit;
          outline: none;
          transition: all 0.18s ease;
        }
        .tcn-news--inline .tcn-news-input::placeholder { color: rgba(255,255,255,0.45); }
        .tcn-news--inline .tcn-news-input:focus {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,213,74,0.5);
        }
        .tcn-news--inline .tcn-news-btn {
          padding: 0.7rem 1.25rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a;
          font-weight: 800;
          font-size: 0.88rem;
          border: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
          transition: transform 0.18s ease;
          white-space: nowrap;
        }
        .tcn-news--inline .tcn-news-btn:hover { transform: translateY(-1px); }
        .tcn-news--inline .tcn-news-btn:disabled { opacity: 0.6; cursor: wait; }
        .tcn-news--inline .tcn-news-state {
          font-size: 0.78rem;
          margin-top: 0.55rem;
          padding-left: 1.1rem;
          line-height: 1.4;
        }
        .tcn-news--inline .tcn-news-state.error { color: #fda4af; }
        .tcn-news--inline .tcn-news-state.success { color: #86efac; }

        .tcn-news--card {
          max-width: 640px;
          margin: 0 auto;
          padding: 2.25rem 2.25rem;
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          border: 1px solid rgba(255,213,74,0.3);
          border-radius: 22px;
          color: #fff;
          text-align: center;
          box-shadow: 0 24px 60px rgba(15,23,42,0.18);
        }
        .tcn-news--card .tcn-news-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(255,213,74,0.16);
          color: #ffd54a;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 0.85rem;
        }
        .tcn-news--card h3 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(1.5rem, 3vw, 1.95rem);
          line-height: 1.2;
          letter-spacing: -0.015em;
          margin: 0 0 0.5rem;
          color: #fff;
        }
        .tcn-news--card p {
          color: rgba(255,255,255,0.7);
          font-size: 0.96rem;
          line-height: 1.55;
          margin: 0 0 1.5rem;
        }
        .tcn-news--card form {
          display: flex;
          gap: 0.5rem;
          align-items: stretch;
          max-width: 460px;
          margin: 0 auto;
        }
        .tcn-news--card .tcn-news-input {
          flex: 1;
          padding: 0.85rem 1.15rem;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.06);
          color: #fff;
          font-size: 0.95rem;
          font-family: inherit;
          outline: none;
          transition: all 0.18s ease;
        }
        .tcn-news--card .tcn-news-input::placeholder { color: rgba(255,255,255,0.45); }
        .tcn-news--card .tcn-news-input:focus {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,213,74,0.5);
        }
        .tcn-news--card .tcn-news-btn {
          padding: 0.85rem 1.4rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a;
          font-weight: 800;
          font-size: 0.95rem;
          border: 0;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: inherit;
          transition: transform 0.18s ease;
        }
        .tcn-news--card .tcn-news-btn:hover { transform: translateY(-1px); }
        .tcn-news--card .tcn-news-btn:disabled { opacity: 0.6; cursor: wait; }
        .tcn-news--card .tcn-news-state {
          font-size: 0.85rem;
          margin-top: 1rem;
        }
        .tcn-news--card .tcn-news-state.error { color: #fda4af; }
        .tcn-news--card .tcn-news-state.success { color: #86efac; }
        .tcn-news--card .tcn-news-foot {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.5);
          margin-top: 1rem;
        }
      `}</style>

      {!isInline && (
        <>
          <span className="tcn-news-eyebrow">
            <PiSparkleDuotone size={11} /> Field notes · monthly
          </span>
          <h3>Get our monthly build notes.</h3>
          <p>
            What we shipped, what broke, what we learned — written by the team, never by marketing.
            One email a month, max. Unsubscribe in one click.
          </p>
        </>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={isInline ? "your@work.email" : "Enter your work email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="tcn-news-input"
          aria-label="Email for newsletter"
          required
        />
        <button type="submit" className="tcn-news-btn" disabled={busy}>
          {state.kind === "success"
            ? <><PiCheckBold size={13} /> Subscribed</>
            : busy
              ? "Subscribing…"
              : <><PiEnvelopeOpenDuotone size={14} /> Subscribe</>}
        </button>
      </form>

      {state.kind !== "idle" && (
        <div className={`tcn-news-state ${state.kind}`}>{state.msg}</div>
      )}

      {!isInline && (
        <div className="tcn-news-foot">
          We never sell your email. See our <a href="/saas-privacy" style={{ color: "#ffd54a" }}>privacy policy</a>.
        </div>
      )}
    </div>
  );
};

export default NewsletterSignup;
