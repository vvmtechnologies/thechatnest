import React from "react";
import {
  PiChatCircleDotsDuotone,
  PiUsersThreeDuotone,
  PiVideoCameraDuotone,
  PiFileLockDuotone,
  PiSparkleDuotone,
  PiShieldCheckDuotone,
} from "react-icons/pi";

const featureList = [
  {
    icon: PiChatCircleDotsDuotone,
    color: "#6d5dfc",
    title: "Instant Messaging",
    desc: "1:1, group, and channel chat with read receipts, threads, reactions, and search.",
  },
  {
    icon: PiVideoCameraDuotone,
    color: "#0ea5e9",
    title: "HD Audio & Video",
    desc: "Crystal-clear group calls, screen sharing, and meetings — built right into chat.",
  },
  {
    icon: PiUsersThreeDuotone,
    color: "#22c55e",
    title: "Smart Group Chat",
    desc: "Organize teams into channels, projects, and broadcasts. Permissions you control.",
  },
  {
    icon: PiFileLockDuotone,
    color: "#f59e0b",
    title: "Secure File Sharing",
    desc: "Send any file with end-to-end encryption, previews, and granular access controls.",
  },
  {
    icon: PiSparkleDuotone,
    color: "#ec4899",
    title: "Built-in AI Assistant",
    desc: "Summarize threads, draft replies, translate, and search across your workspace.",
  },
  {
    icon: PiShieldCheckDuotone,
    color: "#14b8a6",
    title: "Enterprise Security",
    desc: "SOC 2, GDPR, AES-256-GCM at rest, RBAC, audit logs, and SSO/SAML on demand.",
  },
];

const Features = () => {
  return (
    <section className="section-soft" style={{ padding: "6rem 0" }}>
      <div className="container">
        <div className="section-title">
          <span className="eyebrow">Features</span>
          <h2 style={{ marginTop: "1rem" }}>Everything your team needs, in one place</h2>
          <p>
            From quick 1:1 chats to all-hands broadcasts, secure file transfers, AI shortcuts,
            and HD calls — TheChatNest replaces a dozen tools with one focused workspace.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {featureList.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="feature-card fade-up">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${color}15`,
                  color,
                  marginBottom: "1.25rem",
                }}
              >
                <Icon size={32} />
              </div>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", fontWeight: 700 }}>
                {title}
              </h3>
              <p style={{ margin: 0, color: "var(--tcn-ink-500)", fontSize: "0.97rem" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
