import React from "react";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import LegalLayout from "../components/layout/LegalLayout.jsx";

export default function Gdpr() {
  const { brandName } = useSiteBranding();
  const brand = brandName || "TheChatNest";

  const sections = [
    {
      id: "commitment",
      title: "Our commitment",
      body: (
        <p>
          <strong>{brand}</strong> is committed to protecting the privacy and
          rights of individuals in accordance with the General Data Protection
          Regulation (GDPR). Whether you use our cloud-hosted service or deploy
          on-premise, we provide the tools and transparency required for full
          GDPR compliance.
        </p>
      ),
    },
    {
      id: "lawful-basis",
      title: "Lawful basis for processing",
      body: (
        <>
          <p>We process personal data under the following legal bases:</p>
          <ul>
            <li><strong>Contract performance:</strong> Processing necessary to provide the {brand} service as agreed in our Terms of Service.</li>
            <li><strong>Legitimate interest:</strong> Security monitoring, fraud prevention, and service improvement.</li>
            <li><strong>Consent:</strong> Marketing communications and optional analytics (you can withdraw at any time).</li>
            <li><strong>Legal obligation:</strong> Tax records, financial reporting, and responding to legal requests.</li>
          </ul>
        </>
      ),
    },
    {
      id: "your-rights",
      title: "Your rights under GDPR",
      body: (
        <>
          <p>As a data subject, you have the following rights:</p>
          <ul>
            <li><strong>Right of access (Art. 15):</strong> Request a copy of all personal data we hold about you.</li>
            <li><strong>Right to rectification (Art. 16):</strong> Correct inaccurate personal data via your profile settings.</li>
            <li><strong>Right to erasure (Art. 17):</strong> Delete your account and all data from Settings → Delete Account.</li>
            <li><strong>Right to data portability (Art. 20):</strong> Export your chat history as text files from the app.</li>
            <li><strong>Right to restrict processing (Art. 18):</strong> Request limited processing of your data.</li>
            <li><strong>Right to object (Art. 21):</strong> Object to processing based on legitimate interests.</li>
            <li><strong>Right to withdraw consent (Art. 7):</strong> Withdraw consent at any time without affecting prior processing.</li>
          </ul>
        </>
      ),
    },
    {
      id: "dpa",
      title: "Data processing agreement (DPA)",
      body: (
        <>
          <p>For organizations using {brand} cloud service, we offer a DPA that covers:</p>
          <ul>
            <li>Scope and purpose of data processing</li>
            <li>Types of personal data processed</li>
            <li>Duration of processing</li>
            <li>Sub-processor list and notification of changes</li>
            <li>Technical and organizational security measures</li>
            <li>Data breach notification procedures (within 72 hours)</li>
            <li>Audit rights and inspection provisions</li>
            <li>Data return and deletion upon contract termination</li>
          </ul>
        </>
      ),
    },
    {
      id: "measures",
      title: "Data protection measures",
      body: (
        <ul>
          <li>AES-256-GCM encryption for all messages at rest</li>
          <li>TLS 1.3 for all data in transit</li>
          <li>Role-based access control with admin audit trails</li>
          <li>Device limit enforcement (max 3 simultaneous sessions)</li>
          <li>IP and platform restrictions for access control</li>
          <li>Server-side XSS sanitization on all user input</li>
          <li>Automated blocking of dangerous file types</li>
          <li>Regular security assessments and penetration testing</li>
        </ul>
      ),
    },
    {
      id: "transfers",
      title: "Data transfers",
      body: (
        <p>
          For cloud-hosted deployments, data may be processed in data centers
          outside the EU. We ensure adequate protection through Standard
          Contractual Clauses (SCCs) approved by the European Commission. For
          on-premise and air-gapped deployments, all data remains within your
          chosen jurisdiction — no international transfers occur.
        </p>
      ),
    },
    {
      id: "breach",
      title: "Data breach notification",
      body: (
        <>
          <p>In the event of a personal data breach affecting cloud-hosted customers, we will:</p>
          <ul>
            <li>Notify affected organizations within 72 hours of becoming aware of the breach</li>
            <li>Provide details of the nature of the breach, categories of data affected, and approximate number of records</li>
            <li>Describe the measures taken to address and mitigate the breach</li>
            <li>Cooperate with supervisory authorities as required</li>
          </ul>
        </>
      ),
    },
    {
      id: "subprocessors",
      title: "Sub-processors",
      body: (
        <>
          <p>Current sub-processors for cloud-hosted {brand}:</p>
          <ul>
            <li><strong>AWS</strong> — Cloud infrastructure and S3 file storage</li>
            <li><strong>Stripe</strong> — Payment processing</li>
            <li><strong>Neon</strong> — Database hosting</li>
            <li><strong>Tenor (Google)</strong> — GIF search API (search queries only)</li>
          </ul>
        </>
      ),
    },
    {
      id: "self-hosted",
      title: "Self-hosted compliance",
      body: (
        <p>
          Organizations deploying {brand} on-premise or in air-gapped
          environments act as independent Data Controllers. {brand} provides
          the software tools for GDPR compliance (account deletion, data
          export, access controls) but the organization is responsible for
          implementing appropriate data protection policies for their deployment.
        </p>
      ),
    },
    {
      id: "dpo",
      title: "Data protection officer",
      body: (
        <p>
          For GDPR-related inquiries, data subject requests, or to request a
          Data Processing Agreement, contact our Data Protection team at{" "}
          <a href="mailto:dpo@thechatnest.com">dpo@thechatnest.com</a>.
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      eyebrow="GDPR · EU compliance"
      title={
        <>
          <span className="gradient-word">GDPR</span> compliance
        </>
      }
      lead={`How ${brand} supports your rights under the EU General Data Protection Regulation.`}
      lastUpdated="April 1, 2026"
      sections={sections}
      ctaTitle="Need a DPA or sub-processor list?"
      ctaDescription="Our Data Protection team handles agreements, questionnaires, and breach notifications within 24 hours."
    />
  );
}
