import React from "react";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import LegalLayout from "../components/layout/LegalLayout.jsx";

export default function SaasPrivacy() {
  const { brandName } = useSiteBranding();
  const brand = brandName || "TheChatNest";

  const sections = [
    {
      id: "intro",
      title: "Introduction",
      body: (
        <p>
          This Privacy Policy describes how <strong>{brand}</strong> ("we", "our",
          or "us") collects, uses, and protects your personal information when
          you use our cloud-hosted (SaaS) messaging platform. By using {brand},
          you agree to the practices described in this policy.
        </p>
      ),
    },
    {
      id: "info-we-collect",
      title: "Information we collect",
      body: (
        <ul>
          <li><strong>Account information:</strong> Name, email, phone number, organization name, and role provided during registration.</li>
          <li><strong>Profile data:</strong> Avatar image, display name, status, and designation.</li>
          <li><strong>Communication data:</strong> Messages, files, images, voice recordings, and other content shared through the platform. All data is encrypted at rest using AES-256-GCM.</li>
          <li><strong>Usage data:</strong> Login timestamps, device information, IP addresses, browser type, and feature usage analytics.</li>
          <li><strong>Payment data:</strong> Billing address and payment method details processed securely through Stripe. We do not store credit card numbers on our servers.</li>
          <li><strong>Device data:</strong> Device identifiers for trusted device management, biometric verification status, and push notification tokens.</li>
        </ul>
      ),
    },
    {
      id: "how-we-use",
      title: "How we use your information",
      body: (
        <ul>
          <li>Provide and maintain the {brand} messaging service.</li>
          <li>Authenticate users and manage device sessions (maximum 3 devices).</li>
          <li>Process payments and manage subscriptions.</li>
          <li>Send transactional emails (OTP, meeting invitations, password resets).</li>
          <li>Improve product features through aggregated analytics.</li>
          <li>Enforce security measures including XSS prevention, file blocking, and rate limiting.</li>
          <li>Comply with legal obligations and respond to lawful requests.</li>
        </ul>
      ),
    },
    {
      id: "storage-security",
      title: "Data storage & security",
      body: (
        <>
          <p>Your data is stored on secure cloud infrastructure with the following protections:</p>
          <ul>
            <li>AES-256-GCM encryption for all messages at rest</li>
            <li>TLS 1.3 encryption for all data in transit</li>
            <li>File storage on AWS S3 with server-side encryption</li>
            <li>Database backups encrypted and stored in geographically separate locations</li>
            <li>Role-based access control (RBAC) for administrative functions</li>
            <li>Server-side input sanitization to prevent XSS and injection attacks</li>
            <li>Dangerous file type blocking (.exe, .bat, .sh, macros)</li>
            <li>JWT-based authentication with secure token management</li>
          </ul>
        </>
      ),
    },
    {
      id: "data-sharing",
      title: "Data sharing",
      body: (
        <>
          <p>We do not sell your personal data. We may share data with:</p>
          <ul>
            <li><strong>Stripe</strong> — for payment processing (PCI-DSS compliant)</li>
            <li><strong>AWS</strong> — for file storage and hosting infrastructure</li>
            <li><strong>Tenor / Google</strong> — for GIF search (search queries only, no personal data)</li>
            <li><strong>Law enforcement</strong> — when required by law, court order, or to protect our legal rights</li>
          </ul>
        </>
      ),
    },
    {
      id: "retention",
      title: "Data retention",
      body: (
        <p>
          We retain your data for as long as your account is active or as needed
          to provide services. Upon account deletion (Settings → Delete Account),
          we permanently remove all personal data including messages, files, and
          profile information within 30 days. Backup copies are purged within 90 days.
        </p>
      ),
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: (
        <ul>
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Rectification:</strong> Update or correct inaccurate information through profile settings</li>
          <li><strong>Deletion:</strong> Delete your account and all associated data from Settings</li>
          <li><strong>Portability:</strong> Export your chat history as text files</li>
          <li><strong>Restriction:</strong> Request limited processing of your data</li>
          <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
        </ul>
      ),
    },
    {
      id: "cookies",
      title: "Cookies & tracking",
      body: (
        <p>
          {brand} uses essential cookies for authentication and session
          management. We do not use third-party advertising cookies or cross-site
          tracking. Analytics data is collected in aggregate form and cannot
          identify individual users.
        </p>
      ),
    },
    {
      id: "children",
      title: "Children's privacy",
      body: (
        <p>
          {brand} is designed for business use and is not intended for
          individuals under 16 years of age. We do not knowingly collect personal
          information from children.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: (
        <p>
          We may update this Privacy Policy periodically. We will notify
          registered users of material changes via email or in-app notification.
          Continued use of the service after changes constitutes acceptance of
          the updated policy.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <p>
          For privacy-related inquiries, contact us at{" "}
          <a href="mailto:privacy@thechatnest.com">privacy@thechatnest.com</a> or
          through the <a href="/contact">Contact page</a>.
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      eyebrow="Cloud-hosted platform"
      title={
        <>
          SaaS{" "}
          <span className="gradient-word">privacy policy</span>
        </>
      }
      lead={`How ${brand} collects, stores, and protects your data on our cloud-hosted platform.`}
      lastUpdated="April 1, 2026"
      sections={sections}
      ctaTitle="Privacy questions?"
      ctaDescription="Our security team responds within one business day. DPAs, sub-processor lists, and questionnaires available on request."
    />
  );
}
