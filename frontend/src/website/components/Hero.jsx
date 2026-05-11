import React from "react";
import { Link } from "react-router-dom";
import chatWindowImg from "../assets/Images/chat-window.png";

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container wrapper">
        <div className="content">
          <span className="eyebrow fade-up" style={{ background: "rgba(255,213,74,0.12)", color: "#ffd54a", borderColor: "rgba(255,213,74,0.2)" }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#ffd54a" }} />
            Built for modern teams
          </span>

          <h1 className="fade-up fade-up-d1" style={{ marginTop: "1.25rem" }}>
            One workspace to <span className="superscript">Chat</span>,<br />
            Meet, Share &amp; Create.
          </h1>

          <p
            className="fade-up fade-up-d2"
            style={{
              color: "rgba(255,255,255,0.78)",
              fontSize: "1.18rem",
              maxWidth: 680,
              margin: "1.5rem auto 2.25rem",
              lineHeight: 1.6,
            }}
          >
            Secure messaging, HD calls, file sharing, and AI assistance — built for teams that move fast and care about privacy.
          </p>

          <div
            className="fade-up fade-up-d3"
            style={{
              display: "flex",
              gap: "0.85rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/auth/register" className="main-btn" style={{ fontSize: "1rem", padding: "0.85rem 1.75rem" }}>
              Start free trial
            </Link>
            <Link
              to="/features"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.85rem 1.5rem",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.95)",
                fontWeight: 600,
                fontSize: "1rem",
                backdropFilter: "blur(8px)",
              }}
            >
              See features →
            </Link>
          </div>

          <div className="trust-strip fade-up fade-up-d3">
            <span className="trust-chip">🔒 AES-256-GCM</span>
            <span className="trust-chip">✅ SOC 2 Ready</span>
            <span className="trust-chip">🇪🇺 GDPR Compliant</span>
            <span className="trust-chip">⚡ 99.9% Uptime</span>
            <span className="trust-chip">💚 24/7 Support</span>
          </div>

          <div className="chat-window-img fade-up" style={{ animationDelay: "0.45s" }}>
            <img src={chatWindowImg} className="img-fluid" alt="TheChatNest product preview" style={{ display: "block", width: "100%" }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
