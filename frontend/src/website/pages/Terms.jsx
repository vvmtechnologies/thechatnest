import React from "react";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import LegalLayout from "../components/layout/LegalLayout.jsx";

export default function Terms() {
  const { brandName } = useSiteBranding();
  const brand = brandName || "TheChatNest";

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of terms",
      body: (
        <>
          <p>
            By accessing or using <strong>{brand}</strong> (the "Service"), operated by
            <strong> VVM Technologies Private Limited</strong> ("Company", "we", "us"),
            you agree to be bound by these Terms of Service ("Terms"). If you do not
            agree to these Terms, do not use the Service.
          </p>
          <p>
            These Terms constitute a legally binding agreement between you (or the
            organization you represent) and the Company.
          </p>
        </>
      ),
    },
    {
      id: "eligibility",
      title: "2. Eligibility",
      body: (
        <>
          <p>You must be at least 18 years old to use the Service. By creating an account, you represent and warrant that:</p>
          <ul>
            <li>You are of legal age to form a binding contract.</li>
            <li>The information you provide is accurate and complete.</li>
            <li>You will keep your account credentials secure and confidential.</li>
            <li>You are not barred from using the Service under applicable Indian or foreign law.</li>
          </ul>
        </>
      ),
    },
    {
      id: "account",
      title: "3. Account & responsibilities",
      body: (
        <>
          <p>
            You are responsible for all activity on your account. You must immediately notify us
            at <a href="mailto:security@thechatnest.com">security@thechatnest.com</a> of any
            unauthorized use or security breach.
          </p>
          <p>You agree NOT to:</p>
          <ul>
            <li>Share your password or transfer your account to another person.</li>
            <li>Use the Service to send spam, malware, or illegal content.</li>
            <li>Reverse-engineer, decompile, or attempt to extract source code.</li>
            <li>Circumvent rate limits, security controls, or paid feature gates.</li>
            <li>Scrape or harvest user data without explicit written permission.</li>
            <li>Use the Service to harass, defame, or harm any third party.</li>
          </ul>
        </>
      ),
    },
    {
      id: "subscription",
      title: "4. Subscription & billing",
      body: (
        <>
          <p>
            <strong>Free trial:</strong> All plans include a 14-day free trial. No credit card
            is required to start. Trial accounts may have feature limitations.
          </p>
          <p>
            <strong>Paid subscriptions:</strong> After the trial, continued use of paid features
            requires a subscription. Subscriptions are billed in advance on a monthly or annual
            basis via Stripe, Razorpay, or PayPal. All prices are in INR unless otherwise stated
            and are exclusive of applicable taxes (GST will be added at 18% for Indian customers).
          </p>
          <p>
            <strong>Auto-renewal:</strong> Subscriptions auto-renew at the end of each billing
            cycle unless cancelled. We will send a reminder email 14 days before renewal. You
            can cancel anytime from Settings → Billing.
          </p>
          <p>
            <strong>Price changes:</strong> We will provide at least 30 days' notice before any
            price increase. Customers who subscribed before May 14, 2026 are price-locked for
            24 months from their subscription date.
          </p>
        </>
      ),
    },
    {
      id: "refunds",
      title: "5. Refunds",
      body: (
        <p>
          Refund eligibility is governed by our separate{" "}
          <a href="/refund-policy">Refund Policy</a>. In summary: first-time subscribers may
          request a full refund within 30 days of initial purchase, no questions asked. Refunds
          are processed within 7-10 business days to the original payment method.
        </p>
      ),
    },
    {
      id: "data",
      title: "6. Your data & ownership",
      body: (
        <>
          <p>
            <strong>You own your data.</strong> Messages, files, recordings, and any content
            you create on the Service remain your property. We claim no ownership over
            customer content.
          </p>
          <p>
            <strong>We host it securely.</strong> We use AES-256-GCM encryption at rest,
            TLS 1.3 in transit, and store data in regional datacenters (Mumbai for Indian
            customers by default). See our <a href="/saas-privacy">Privacy Policy</a> for
            full details.
          </p>
          <p>
            <strong>You can export anytime.</strong> Full workspace data export (messages,
            files, audit logs) is available as a ZIP from Settings → Export. No support
            ticket required.
          </p>
          <p>
            <strong>We will not sell your data.</strong> We will never sell, lease, or share
            your message content with third parties for advertising, training, or any other
            commercial purpose.
          </p>
        </>
      ),
    },
    {
      id: "ip",
      title: "7. Intellectual property",
      body: (
        <>
          <p>
            The Service, including its design, code, logos, trademarks, and content (excluding
            customer content), is owned by VVM Technologies Private Limited and protected by
            Indian and international copyright, trademark, and other laws.
          </p>
          <p>
            We grant you a limited, non-exclusive, non-transferable license to use the Service
            in accordance with these Terms. This license terminates immediately upon any
            violation of these Terms.
          </p>
        </>
      ),
    },
    {
      id: "availability",
      title: "8. Service availability",
      body: (
        <>
          <p>
            We aim for 99.5% uptime but do not guarantee uninterrupted access. Scheduled
            maintenance windows will be announced in advance via the <a href="/status">Status
            page</a> and email notifications. We are not liable for downtime caused by:
          </p>
          <ul>
            <li>Your internet connection or device issues.</li>
            <li>Third-party services we depend on (cloud provider, DNS, email delivery).</li>
            <li>Force majeure events (natural disasters, government actions, cyberattacks).</li>
            <li>Maintenance windows with reasonable prior notice.</li>
          </ul>
        </>
      ),
    },
    {
      id: "termination",
      title: "9. Termination",
      body: (
        <>
          <p>
            <strong>By you:</strong> You may cancel your subscription anytime from Settings →
            Billing. Cancellation takes effect at the end of the current billing period.
          </p>
          <p>
            <strong>By us:</strong> We may suspend or terminate your account if you violate
            these Terms, fail to pay outstanding invoices for more than 30 days, or use the
            Service in a way that damages our reputation or infrastructure. We will provide
            at least 14 days' notice except in cases of severe abuse.
          </p>
          <p>
            <strong>Data after termination:</strong> Upon account closure, you have 90 days
            to export your data. After that, we permanently delete it from our systems
            (backups purged within 30 additional days).
          </p>
        </>
      ),
    },
    {
      id: "liability",
      title: "10. Limitation of liability",
      body: (
        <>
          <p>
            To the maximum extent permitted by Indian law, our total liability to you for any
            claim arising from or related to the Service is limited to the amount you paid us
            in the 12 months preceding the claim, or ₹5,000, whichever is higher.
          </p>
          <p>
            We are not liable for indirect, incidental, consequential, or punitive damages,
            including lost profits, lost data, or business interruption — even if we have been
            advised of the possibility of such damages.
          </p>
          <p>
            The Service is provided "as is" without warranties of any kind, express or implied,
            including warranties of merchantability, fitness for a particular purpose, or
            non-infringement.
          </p>
        </>
      ),
    },
    {
      id: "indemnification",
      title: "11. Indemnification",
      body: (
        <p>
          You agree to indemnify and hold harmless VVM Technologies Private Limited, its
          directors, employees, and agents from any claims, damages, losses, or expenses
          (including reasonable legal fees) arising from your use of the Service, your
          violation of these Terms, or your infringement of any third-party rights.
        </p>
      ),
    },
    {
      id: "governing-law",
      title: "12. Governing law & jurisdiction",
      body: (
        <p>
          These Terms are governed by the laws of India. Any dispute arising from these Terms
          or your use of the Service shall be subject to the exclusive jurisdiction of the
          courts in Bengaluru, Karnataka. Both parties agree to attempt good-faith mediation
          before initiating litigation.
        </p>
      ),
    },
    {
      id: "changes",
      title: "13. Changes to terms",
      body: (
        <p>
          We may update these Terms periodically. Material changes will be notified via email
          and in-app banners at least 30 days before they take effect. Continued use of the
          Service after the effective date constitutes acceptance of the updated Terms.
        </p>
      ),
    },
    {
      id: "contact",
      title: "14. Contact us",
      body: (
        <>
          <p>For questions, concerns, or legal notices regarding these Terms, please contact:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:legal@thechatnest.com">legal@thechatnest.com</a></li>
            <li><strong>Support:</strong> <a href="mailto:support@thechatnest.com">support@thechatnest.com</a></li>
            <li><strong>Security:</strong> <a href="mailto:security@thechatnest.com">security@thechatnest.com</a></li>
            <li><strong>Registered office:</strong> VVM Technologies Private Limited, Bengaluru, Karnataka, India</li>
          </ul>
          <p>
            For our full company details (CIN, GSTIN, registered address, MSME registration),
            please see our <a href="/about">About page</a>.
          </p>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms of Service"
      lead={`The legal agreement that governs your use of ${brand}. Last updated: May 14, 2026. Effective date: May 14, 2026.`}
      sections={sections}
      seoTitle="Terms of Service"
      seoDescription={`Terms of Service governing use of ${brand}. Acceptance, account responsibilities, billing, refunds, data ownership, liability, and governing law.`}
    />
  );
}
