import React from "react";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import LegalLayout from "../components/layout/LegalLayout.jsx";

export default function AirGappedPrivacy() {
  const { brandName } = useSiteBranding();
  const brand = brandName || "TheChatNest";

  const sections = [
    {
      id: "intro",
      title: "Introduction",
      body: (
        <p>
          This Privacy Policy applies to air-gapped deployments of{" "}
          <strong>{brand}</strong> — installations that operate on isolated
          networks with no internet connectivity. Air-gapped deployment offers
          the highest level of data security for organizations handling
          classified, sensitive, or regulated information.
        </p>
      ),
    },
    {
      id: "isolation",
      title: "Complete data isolation",
      body: (
        <>
          <p>In an air-gapped deployment:</p>
          <ul>
            <li>Zero data leaves your network — no outbound connections of any kind</li>
            <li>No telemetry, no update checks, no external API calls</li>
            <li>{brand} operates 100% offline after initial installation</li>
            <li>All features work without internet: messaging, calls, file sharing, admin panel</li>
            <li>GIF search and external integrations are disabled by design</li>
            <li>WebRTC calls route through your internal TURN server only</li>
          </ul>
        </>
      ),
    },
    {
      id: "no-collection",
      title: "Data collection by us",
      body: (
        <p>
          In an air-gapped environment, {brand} (the company) collects
          absolutely <strong>no data</strong> from your deployment. We have no
          technical capability to access your systems. The only interaction is
          the initial license key validation, which can be performed offline
          via a signed license file.
        </p>
      ),
    },
    {
      id: "architecture",
      title: "Deployment architecture",
      body: (
        <>
          <p>Air-gapped {brand} runs entirely within your secure network:</p>
          <ul>
            <li>Application server deployed on your internal infrastructure</li>
            <li>PostgreSQL database on your internal database server</li>
            <li>File storage on local disk or internal S3-compatible storage (MinIO)</li>
            <li>Internal STUN/TURN server for WebRTC calls</li>
            <li>Internal SMTP server for email notifications (optional)</li>
            <li>No CDN, no cloud dependencies, no external DNS lookups</li>
          </ul>
        </>
      ),
    },
    {
      id: "updates",
      title: "Updates & maintenance",
      body: (
        <p>
          Software updates are delivered via secure offline media (USB, secure
          file transfer). Your security team can review all update packages
          before deployment. No automatic updates — your team has full control
          over the update cycle and timing.
        </p>
      ),
    },
    {
      id: "compliance",
      title: "Compliance",
      body: (
        <>
          <p>Air-gapped {brand} is designed for environments requiring:</p>
          <ul>
            <li>Government and military classified networks</li>
            <li>Healthcare organizations (HIPAA compliance)</li>
            <li>Financial institutions with strict data residency requirements</li>
            <li>Research facilities with intellectual property protection needs</li>
            <li>Organizations operating under ITAR, FedRAMP, or similar frameworks</li>
          </ul>
        </>
      ),
    },
    {
      id: "responsibilities",
      title: "Your responsibilities",
      body: (
        <p>
          As the operator of an air-gapped deployment, your organization is
          solely responsible for all data protection, access control, backup
          management, user privacy, incident response, and compliance with
          applicable regulations within your network perimeter.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <p>
          For air-gapped deployment support, contact us at{" "}
          <a href="mailto:enterprise@thechatnest.com">
            enterprise@thechatnest.com
          </a>
          . We offer on-site deployment assistance for enterprise customers.
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      eyebrow="Isolated network deployment"
      title={
        <>
          Air-gapped{" "}
          <span className="gradient-word">privacy policy</span>
        </>
      }
      lead={`The highest level of data isolation — ${brand} runs entirely offline inside your secure perimeter.`}
      lastUpdated="April 1, 2026"
      sections={sections}
      ctaTitle="Need an air-gapped install?"
      ctaDescription="Our enterprise team handles signed offline installers, license files, and on-site deployment. ITAR, FedRAMP, and HIPAA-friendly."
    />
  );
}
