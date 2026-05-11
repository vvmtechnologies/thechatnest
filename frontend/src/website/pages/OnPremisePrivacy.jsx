import React from "react";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import LegalLayout from "../components/layout/LegalLayout.jsx";

export default function OnPremisePrivacy() {
  const { brandName } = useSiteBranding();
  const brand = brandName || "TheChatNest";

  const sections = [
    {
      id: "intro",
      title: "Introduction",
      body: (
        <p>
          This Privacy Policy applies to the on-premise (self-hosted) deployment
          of <strong>{brand}</strong>. When you deploy {brand} on your own
          infrastructure, your organization acts as the Data Controller. {brand}{" "}
          (the company) acts solely as the software provider and does not access,
          process, or store any of your communication data.
        </p>
      ),
    },
    {
      id: "your-control",
      title: "Your data, your control",
      body: (
        <>
          <p>With on-premise deployment:</p>
          <ul>
            <li>All data remains on YOUR servers — messages, files, user profiles, and logs never leave your infrastructure.</li>
            <li>{brand} has zero access to your data, conversations, or user information.</li>
            <li>Your IT team controls backups, retention policies, and data deletion.</li>
            <li>No telemetry, analytics, or usage data is sent to {brand} servers.</li>
            <li>Database credentials, encryption keys, and API secrets are managed entirely by your organization.</li>
          </ul>
        </>
      ),
    },
    {
      id: "limited-data",
      title: "Data processed by us (limited)",
      body: (
        <>
          <p>The only data {brand} processes in an on-premise deployment:</p>
          <ul>
            <li><strong>License key:</strong> Your organization's license key for activation and validation.</li>
            <li><strong>Update checks:</strong> Periodic version checks (can be disabled in air-gapped environments).</li>
            <li><strong>Support requests:</strong> Only information you voluntarily provide when contacting our support team.</li>
          </ul>
        </>
      ),
    },
    {
      id: "responsibilities",
      title: "Your responsibilities as data controller",
      body: (
        <>
          <p>As the operator of a self-hosted {brand} instance, your organization is responsible for:</p>
          <ul>
            <li>Complying with applicable data protection laws (GDPR, CCPA, etc.)</li>
            <li>Implementing appropriate security measures (firewalls, SSL, access controls)</li>
            <li>Managing user consent and privacy notices for your employees</li>
            <li>Handling data subject requests (access, deletion, portability)</li>
            <li>Configuring data retention and backup policies</li>
            <li>Maintaining server security patches and {brand} updates</li>
          </ul>
        </>
      ),
    },
    {
      id: "security",
      title: "Security recommendations",
      body: (
        <>
          <p>We recommend the following security measures for on-premise deployments:</p>
          <ul>
            <li>Deploy behind a reverse proxy with TLS 1.3</li>
            <li>Enable AES-256-GCM encryption for messages at rest</li>
            <li>Restrict database access to the application server only</li>
            <li>Enable IP and platform restrictions from the admin panel</li>
            <li>Configure device limits and trusted device management</li>
            <li>Enable XSS sanitization and dangerous file blocking (enabled by default)</li>
            <li>Perform regular backups and test restore procedures</li>
            <li>Monitor activity logs and OTP verification logs from the admin panel</li>
          </ul>
        </>
      ),
    },
    {
      id: "third-party",
      title: "Third-party services",
      body: (
        <>
          <p>On-premise {brand} may optionally connect to external services that you configure:</p>
          <ul>
            <li><strong>STUN/TURN servers</strong> — for WebRTC calls (configurable, can use your own servers)</li>
            <li><strong>Tenor API</strong> — for GIF search (can be disabled)</li>
            <li><strong>SMTP server</strong> — for email notifications (your own SMTP server)</li>
            <li><strong>S3-compatible storage</strong> — for file uploads (your own MinIO/S3 instance)</li>
          </ul>
        </>
      ),
    },
    {
      id: "updates",
      title: "Updates & patches",
      body: (
        <p>
          Software updates are provided as downloadable packages. No automatic
          updates are pushed to your servers. Your IT team controls when and how
          updates are applied. Security patches are communicated via email to
          the registered admin contact.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <p>
          For questions about on-premise privacy or deployment assistance,
          contact us at{" "}
          <a href="mailto:privacy@thechatnest.com">privacy@thechatnest.com</a>.
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      eyebrow="Self-hosted deployment"
      title={
        <>
          On-premise{" "}
          <span className="gradient-word">privacy policy</span>
        </>
      }
      lead={`When you self-host ${brand}, all data stays on your infrastructure. Here's exactly what that means.`}
      lastUpdated="April 1, 2026"
      sections={sections}
      ctaTitle="Planning a self-hosted rollout?"
      ctaDescription="Our deployment engineers help with sizing, hardening, and migration. Free architecture review for teams of 50+."
    />
  );
}
