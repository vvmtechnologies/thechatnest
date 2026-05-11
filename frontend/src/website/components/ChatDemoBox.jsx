import React from "react";
import { PiChatTextDuotone, PiCalendarDuotone, PiArrowRightBold } from "react-icons/pi";
import { Link, useNavigate } from "react-router-dom";

const ChatDemoBox = () => {
  const navigate = useNavigate();

  const handleStartChat = () => {
    navigate("/help", { state: { activeTab: "support" } });
  };

  return (
    <section style={{ padding: "5rem 0" }}>
      <div className="container">
        <div
          style={{
            position: "relative",
            borderRadius: "var(--tcn-radius-lg)",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #0b0f1e 0%, #1a1f3a 50%, #2d2563 100%)",
            padding: "4rem 3rem",
            color: "#fff",
            textAlign: "center",
            boxShadow: "var(--tcn-shadow-lg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(600px 300px at 20% 0%, rgba(255,213,74,0.18), transparent 60%), radial-gradient(600px 300px at 80% 100%, rgba(109,93,252,0.3), transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
            <h2 style={{ color: "#fff", marginBottom: "0.75rem" }}>
              Ready to bring your team together?
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.78)",
                fontSize: "1.1rem",
                marginBottom: "2rem",
              }}
            >
              Start a free 14-day trial — no credit card required. Or book a
              live walkthrough with our team.
            </p>

            <div
              style={{
                display: "flex",
                gap: "0.85rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                to="/auth/register"
                className="main-btn"
                style={{ fontSize: "1rem", padding: "0.9rem 1.85rem" }}
              >
                Start free trial <PiArrowRightBold size={18} style={{ marginLeft: 6 }} />
              </Link>
              <Link
                to="/demo"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.9rem 1.75rem",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1rem",
                  backdropFilter: "blur(8px)",
                }}
              >
                <PiCalendarDuotone size={20} /> Book a demo
              </Link>
              <button
                onClick={handleStartChat}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.9rem 1.75rem",
                  borderRadius: 999,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "rgba(255,255,255,0.9)",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                <PiChatTextDuotone size={20} /> Chat with us
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatDemoBox;
