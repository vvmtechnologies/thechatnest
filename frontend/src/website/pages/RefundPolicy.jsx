import React from "react";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import LegalLayout from "../components/layout/LegalLayout.jsx";

export default function RefundPolicy() {
  const { brandName } = useSiteBranding();
  const brand = brandName || "TheChatNest";

  const sections = [
    {
      id: "guarantee",
      title: "Money-back guarantee",
      body: (
        <p>
          <strong>{brand}</strong> offers a 30-day money-back guarantee on all
          paid plans. If you're not satisfied with the service within the first
          30 days of your initial subscription, you can request a full refund —
          no questions asked.
        </p>
      ),
    },
    {
      id: "eligibility",
      title: "Eligibility for refund",
      body: (
        <>
          <p>Refunds are available under the following conditions:</p>
          <ul>
            <li><strong>First-time subscription:</strong> Full refund if requested within 30 days of initial purchase.</li>
            <li><strong>Annual plan cancellation:</strong> Pro-rated refund for unused months if cancelled within the first 90 days.</li>
            <li><strong>Service outage:</strong> Credit or refund for extended service interruptions (exceeding 99.9% SLA).</li>
            <li><strong>Billing errors:</strong> Full refund for any duplicate or incorrect charges.</li>
            <li><strong>Unauthorized charges:</strong> Immediate refund upon verification.</li>
          </ul>
        </>
      ),
    },
    {
      id: "non-refundable",
      title: "Non-refundable items",
      body: (
        <ul>
          <li>Monthly subscriptions after the 30-day money-back period</li>
          <li>Annual subscriptions after the 90-day cancellation window (unless required by local law)</li>
          <li>Custom development, integration, or consulting services</li>
          <li>On-premise deployment and setup fees once deployment is completed</li>
          <li>Domain or SSL certificate costs purchased through {brand}</li>
        </ul>
      ),
    },
    {
      id: "how-to-request",
      title: "How to request a refund",
      body: (
        <>
          <p>To request a refund:</p>
          <ol>
            <li>
              Email{" "}
              <a href="mailto:billing@thechatnest.com">
                billing@thechatnest.com
              </a>{" "}
              with your account email and reason for refund
            </li>
            <li>Or contact us through the <a href="/contact">Contact page</a></li>
            <li>Include your transaction ID or invoice number (found in Admin Panel → Payments)</li>
            <li>Refund requests are processed within 5 business days</li>
            <li>Refunds are issued to the original payment method via Stripe</li>
          </ol>
        </>
      ),
    },
    {
      id: "cancellation",
      title: "Cancellation policy",
      body: (
        <ul>
          <li><strong>Monthly plans:</strong> Cancel anytime. Service continues until the end of the current billing cycle. No partial-month refunds.</li>
          <li><strong>Annual plans:</strong> Cancel anytime. If within 90 days, receive a pro-rated refund. After 90 days, service continues until the end of the annual term.</li>
          <li><strong>Self-hosted licenses:</strong> Perpetual licenses are non-cancellable. Annual support and update subscriptions can be cancelled at renewal.</li>
        </ul>
      ),
    },
    {
      id: "plan-changes",
      title: "Plan changes",
      body: (
        <ul>
          <li><strong>Upgrades:</strong> Pro-rated billing — you pay only the difference for the remaining period.</li>
          <li><strong>Downgrades:</strong> Applied at the next billing cycle. No refund for the current period difference.</li>
          <li><strong>User count changes:</strong> Added users billed immediately (pro-rated). Removed users reflected at next billing cycle.</li>
        </ul>
      ),
    },
    {
      id: "free-trial",
      title: "Free trial",
      body: (
        <p>
          {brand} offers a free trial period. No payment information is
          required to start a trial. You will not be charged unless you
          explicitly choose a paid plan after the trial ends.
        </p>
      ),
    },
    {
      id: "disputes",
      title: "Dispute resolution",
      body: (
        <p>
          If you disagree with a refund decision, please contact us at{" "}
          <a href="mailto:billing@thechatnest.com">billing@thechatnest.com</a>{" "}
          with additional details. We will review your case within 10 business
          days and provide a final resolution.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: (
        <p>
          We may update this refund policy. Changes will be communicated via
          email to billing contacts. The policy in effect at the time of your
          purchase applies to that transaction.
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      eyebrow="30-day money-back guarantee"
      title={
        <>
          <span className="gradient-word">Refund</span> policy
        </>
      }
      lead={`Try ${brand} risk-free. If it doesn't fit your team in the first 30 days, we'll refund every paisa — no forms, no awkward calls.`}
      lastUpdated="April 1, 2026"
      sections={sections}
      ctaTitle="Billing question?"
      ctaDescription="Email billing@thechatnest.com or contact us. Most refunds are processed within 5 business days."
    />
  );
}
