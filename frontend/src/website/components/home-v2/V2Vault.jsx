import React from "react";
import { Link } from "react-router-dom";

const CERTS = [
  {
    idx: "C.01",
    name: "AES-256-GCM",
    desc: "All messages, files and metadata encrypted at rest with rotating per-tenant keys.",
    stamp: "live",
  },
  {
    idx: "C.02",
    name: "TLS 1.3",
    desc: "Modern transport across web, desktop and mobile. HSTS preloaded.",
    stamp: "live",
  },
  {
    idx: "C.03",
    name: "SOC 2 Type II",
    desc: "Independent audit of the controls protecting your data. Report on request.",
    stamp: "audited",
  },
  {
    idx: "C.04",
    name: "GDPR · DPA",
    desc: "Standard contractual clauses, sub-processor registry, right-to-erasure flows.",
    stamp: "compliant",
  },
  {
    idx: "C.05",
    name: "RBAC + SSO/SAML",
    desc: "Granular role permissions, SSO via Okta / Azure AD / Google, SCIM provisioning.",
    stamp: "configurable",
  },
  {
    idx: "C.06",
    name: "Device limits",
    desc: "Cap simultaneous sessions per user. Remote-wipe lost devices in one click.",
    stamp: "enforced",
  },
  {
    idx: "C.07",
    name: "Audit logs",
    desc: "Every action — sign-in, file access, role change — written to an immutable trail.",
    stamp: "live",
  },
  {
    idx: "C.08",
    name: "Air-gapped option",
    desc: "Self-host in your private cloud or behind your firewall. Zero outbound calls.",
    stamp: "available",
  },
];

const V2Vault = () => {
  return (
    <section className="v2-vault">
      <div className="v2-wrap">
        <div className="v2-vault-head">
          <div className="marker v2-fade">SEC.05&nbsp;/&nbsp;THE&nbsp;VAULT</div>
          <h2 className="v2-fade d2">
            Security as a <em>shipping feature</em>,<br />
            not a checkbox.
          </h2>
        </div>

        <div className="v2-vault-grid">
          {CERTS.map((c, i) => (
            <div
              className={`v2-vault-cert v2-fade d${Math.min(i, 5)}`}
              key={c.idx}
            >
              <span className="idx">{c.idx}</span>
              <span className="name">{c.name}</span>
              <p className="desc">{c.desc}</p>
              <span className="stamp">{c.stamp}</span>
            </div>
          ))}
        </div>

        <div className="v2-vault-foot">
          <span>
            Full security overview, sub-processor list, and DPA are public.
          </span>
          <Link to="/saas-privacy">read the security paper&nbsp;→</Link>
        </div>
      </div>
    </section>
  );
};

export default V2Vault;
