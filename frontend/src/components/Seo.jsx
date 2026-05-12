import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE = "https://www.thechatnest.com";
const DEFAULT_OG = `${SITE}/og-cover.svg`;

/**
 * Per-page SEO + Open Graph + Twitter card. Drop one at the top of any
 * page component. All fields optional except `title`.
 */
const Seo = ({
  title,
  description,
  keywords,
  image = DEFAULT_OG,
  noIndex = false,
  type = "website",
}) => {
  const { pathname } = useLocation();
  const canonical = `${SITE}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;
  const fullTitle = title
    ? `${title} · TheChatNest`
    : "TheChatNest — Secure Team Messaging, Calls & AI";

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="TheChatNest" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default Seo;
