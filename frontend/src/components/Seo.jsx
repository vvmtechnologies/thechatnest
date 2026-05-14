import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE = "https://www.thechatnest.com";
const DEFAULT_OG = `${SITE}/og-cover.svg`;

/**
 * Per-page SEO + Open Graph + Twitter card + Schema.org JSON-LD.
 *
 * Pass `breadcrumbs` (array of { label, to }) to emit BreadcrumbList
 * structured data — Google uses this to render breadcrumb trails in
 * search results.
 *
 * Pass `faq` (array of { q, a }) to emit FAQPage structured data —
 * eligible questions appear directly in search snippets.
 *
 * Pass `article` ({ author, datePublished, dateModified }) on blog
 * posts to emit Article structured data.
 */
const Seo = ({
  title,
  description,
  keywords,
  image = DEFAULT_OG,
  noIndex = false,
  type = "website",
  breadcrumbs,
  faq,
  article,
}) => {
  const { pathname } = useLocation();
  const canonical = `${SITE}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;
  const fullTitle = title
    ? `${title} · TheChatNest`
    : "TheChatNest — Secure Team Messaging, Calls & AI";

  const jsonLdGraph = [];

  if (Array.isArray(breadcrumbs) && breadcrumbs.length > 1) {
    jsonLdGraph.push({
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.label,
        item: b.to ? (b.to.startsWith("http") ? b.to : `${SITE}${b.to}`) : undefined,
      })),
    });
  }

  if (Array.isArray(faq) && faq.length) {
    jsonLdGraph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  if (article) {
    jsonLdGraph.push({
      "@type": "Article",
      headline: title,
      description,
      image,
      author: { "@type": "Organization", name: article.author || "TheChatNest" },
      publisher: {
        "@type": "Organization",
        name: "TheChatNest",
        logo: { "@type": "ImageObject", url: `${SITE}/chat.png` },
      },
      datePublished: article.datePublished,
      dateModified: article.dateModified || article.datePublished,
      mainEntityOfPage: canonical,
    });
  }

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

      {jsonLdGraph.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({ "@context": "https://schema.org", "@graph": jsonLdGraph })}
        </script>
      )}
    </Helmet>
  );
};

export default Seo;
