import React from "react";
import {
  PiLockKeyDuotone,
  PiShieldCheckDuotone,
  PiCloudCheckDuotone,
  PiUserGearDuotone,
  PiWifiHighDuotone,
  PiHandshakeDuotone,
} from "react-icons/pi";

const pillars = [
  {
    icon: PiLockKeyDuotone,
    title: "End-to-end encryption",
    desc: "AES-256-GCM at rest, TLS 1.3 in transit. Your keys, your control.",
  },
  {
    icon: PiShieldCheckDuotone,
    title: "SOC 2 & GDPR ready",
    desc: "Audited controls, data residency, and right-to-erasure built in.",
  },
  {
    icon: PiCloudCheckDuotone,
    title: "99.9% uptime SLA",
    desc: "Multi-region failover, automated backups, real-time health.",
  },
  {
    icon: PiUserGearDuotone,
    title: "Granular admin",
    desc: "RBAC, SSO/SAML, SCIM provisioning, audit logs, retention policies.",
  },
  {
    icon: PiWifiHighDuotone,
    title: "Air-gapped option",
    desc: "Self-host on-premises or in your private cloud. Zero data egress.",
  },
  {
    icon: PiHandshakeDuotone,
    title: "Compliance partner",
    desc: "DPAs, sub-processor lists, and security questionnaires on request.",
  },
];

const Security = () => {
  return (
    <section className="section-dark" style={{ padding: "6rem 0" }}>
      <div className="container">
        <div className="section-title" style={{ textAlign: "center" }}>
          <span
            className="eyebrow"
            style={{
              background: "rgba(255,213,74,0.12)",
              color: "#ffd54a",
            }}
          >
            Security & Scale
          </span>
          <h2 style={{ marginTop: "1rem", color: "#fff", textAlign: "center" }}>
            Built for teams that take privacy seriously
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>
            Bank-grade encryption, granular admin controls, and self-hosted options —
            so your conversations stay yours.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "var(--tcn-radius-lg)",
                padding: "1.75rem",
                backdropFilter: "blur(8px)",
                transition: "background 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,213,74,0.25)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, rgba(255,213,74,0.18), rgba(109,93,252,0.18))",
                  color: "#ffd54a",
                  marginBottom: "1.25rem",
                }}
              >
                <Icon size={28} />
              </div>
              <h3 style={{ color: "#fff", fontSize: "1.15rem", marginBottom: "0.5rem", fontWeight: 700 }}>
                {title}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: "0.95rem" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Security;
