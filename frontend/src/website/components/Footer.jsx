import React, { useMemo } from "react";
import {
  PiFacebookLogo,
  PiTwitterLogo,
  PiInstagramLogo,
  PiYoutubeLogo,
  PiLinkedinLogo,
  PiPinterestLogo,
  PiEnvelopeSimpleDuotone,
  PiShieldCheckDuotone,
} from "react-icons/pi";
import { Link } from "react-router-dom";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";

const linkGroups = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/features" },
      { label: "Pricing", to: "/pricing" },
      { label: "Compare", to: "/compare" },
      { label: "Downloads", to: "/downloads" },
      { label: "What's new", to: "/versions" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Home", to: "/" },
      { label: "How it Works", to: "/how-it-works" },
      { label: "Contact", to: "/contact" },
      { label: "Book a Demo", to: "/demo" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/help" },
      { label: "FAQs", to: "/help" },
      { label: "How-to guides", to: "/help" },
      { label: "Contact support", to: "/help" },
    ],
  },
  {
    title: "Privacy & Legal",
    links: [
      { label: "Privacy Policy", to: "/saas-privacy" },
      { label: "GDPR", to: "/gdpr" },
      { label: "Refund Policy", to: "/refund-policy" },
    ],
  },
];

const socials = [
  { key: "facebook", Icon: PiFacebookLogo, label: "Facebook" },
  { key: "twitter", Icon: PiTwitterLogo, label: "Twitter" },
  { key: "linkedin", Icon: PiLinkedinLogo, label: "LinkedIn" },
  { key: "instagram", Icon: PiInstagramLogo, label: "Instagram" },
  { key: "youtube", Icon: PiYoutubeLogo, label: "YouTube" },
  { key: "pinterest", Icon: PiPinterestLogo, label: "Pinterest" },
];

const Footer = () => {
  const { brandName, logoUrl, social, emails } = useSiteBranding();

  const contactEmails = useMemo(() => {
    const cleanEmail = (raw) =>
      String(raw || "")
        .trim()
        .replace(/@teamchatx\.com$/i, "@thechatnest.com")
        .replace(/@aabhyasa\.com$/i, "@thechatnest.com");

    const apiEmails = Array.isArray(emails)
      ? emails
          .filter((row) => String(row?.status || "active").toLowerCase() !== "inactive")
          .map((row) => cleanEmail(row?.email_address))
          .filter(Boolean)
      : [];

    if (apiEmails.length) return apiEmails;
    return ["support@thechatnest.com", "sales@thechatnest.com"];
  }, [emails]);

  const socialLinks = useMemo(
    () => ({
      facebook: social?.facebook || "#",
      twitter: social?.twitter || "#",
      instagram: social?.instagram || "#",
      youtube: social?.youtube || "#",
      linkedin: social?.linkedin || "#",
      pinterest: social?.pinterest || "#",
    }),
    [social]
  );

  return (
    <footer className="tcn-footer">
      <div className="container">
        <div className="tcn-footer-top">
          {/* Brand column */}
          <div className="tcn-footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <img
                src="/chat.png"
                alt={brandName || "TheChatNest"}
                style={{ height: 56, width: "auto", display: "block" }}
              />
            </div>
            <p className="tcn-footer-tagline">
              The secure team workspace for messaging, calls, file sharing, and AI —
              built for businesses that own their data.
            </p>

            <div className="tcn-footer-contact">
              {contactEmails.map((email) => (
                <a key={email} href={`mailto:${email}`} className="tcn-footer-email">
                  <PiEnvelopeSimpleDuotone size={18} />
                  {email}
                </a>
              ))}
            </div>

            <div className="tcn-footer-socials">
              {socials.map(({ key, Icon, label }) => (
                <a
                  key={key}
                  href={socialLinks[key]}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="tcn-social-btn"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="tcn-footer-links">
            {linkGroups.map((group) => (
              <div key={group.title} className="tcn-footer-col">
                <h6>{group.title}</h6>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="tcn-footer-bottom">
          <div className="tcn-footer-copyright">
            &copy; {new Date().getFullYear()} {brandName || "TheChatNest"}. All rights reserved.
          </div>
          <div className="tcn-footer-badges">
            <span className="tcn-footer-badge">
              <PiShieldCheckDuotone size={14} />
              SOC 2 · GDPR · AES-256
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
