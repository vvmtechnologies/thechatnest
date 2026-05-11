import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PiArticleDuotone,
  PiArrowRightBold,
  PiClockDuotone,
  PiCalendarDuotone,
  PiShieldCheckDuotone,
  PiRocketDuotone,
  PiCoinsDuotone,
  PiBookOpenDuotone,
  PiScalesDuotone,
  PiSparkleDuotone,
} from "react-icons/pi";
import PageHero from "../components/layout/PageHero.jsx";
import FinalCta from "../components/layout/FinalCta.jsx";

const POSTS = [
  {
    id: 1,
    title: "Why self-hosted messaging is the future of enterprise communication",
    excerpt:
      "Cloud is convenient, but self-hosted gives enterprises full data sovereignty, compliance, and security. Here's why teams are switching.",
    category: "Security",
    date: "Apr 8, 2026",
    readTime: "6 min",
    featured: true,
  },
  {
    id: 2,
    title: "10 features every team chat app must have in 2026",
    excerpt:
      "From AI-powered smart compose to end-to-end encryption — the non-negotiables your team communication tool should offer.",
    category: "Product",
    date: "Mar 25, 2026",
    readTime: "5 min",
  },
  {
    id: 3,
    title: "How TheChatNest saves 60% compared to Slack and Microsoft Teams",
    excerpt:
      "We break down the real costs — licensing, hosting, storage, and hidden fees — and show how self-hosting changes the equation.",
    category: "Pricing",
    date: "Mar 12, 2026",
    readTime: "4 min",
  },
  {
    id: 4,
    title: "Setting up TheChatNest on your own server in under 30 minutes",
    excerpt:
      "A step-by-step guide to deploying TheChatNest on your infrastructure — from server requirements to SSL and first login.",
    category: "Guide",
    date: "Feb 28, 2026",
    readTime: "8 min",
  },
  {
    id: 5,
    title: "GDPR compliance for team messaging: what you need to know",
    excerpt:
      "Data processing agreements, user rights, data portability, and how TheChatNest helps you stay compliant in the EU.",
    category: "Compliance",
    date: "Feb 15, 2026",
    readTime: "7 min",
  },
  {
    id: 6,
    title: "AI in business communication: smart compose, translation, and beyond",
    excerpt:
      "How artificial intelligence is transforming team communication — grammar checks, auto-translation across 14 languages, and more.",
    category: "AI",
    date: "Feb 1, 2026",
    readTime: "5 min",
  },
];

const CATEGORY_META = {
  Security: { tint: "#ef4444", Icon: PiShieldCheckDuotone },
  Product: { tint: "#6d5dfc", Icon: PiRocketDuotone },
  Pricing: { tint: "#22c55e", Icon: PiCoinsDuotone },
  Guide: { tint: "#a855f7", Icon: PiBookOpenDuotone },
  Compliance: { tint: "#f59e0b", Icon: PiScalesDuotone },
  AI: { tint: "#0ea5e9", Icon: PiSparkleDuotone },
};

const CATEGORIES = ["All", ...Object.keys(CATEGORY_META)];

export default function Blogs() {
  const [category, setCategory] = useState("All");

  const featured = POSTS.find((p) => p.featured);
  const rest = useMemo(() => {
    const filtered = category === "All" ? POSTS : POSTS.filter((p) => p.category === category);
    return filtered.filter((p) => !p.featured || category !== "All");
  }, [category]);

  return (
    <div style={{ background: "#fff" }}>
      <style>{`
        .tcn-blog-filters {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          justify-content: center;
          margin: 2rem 0 3rem;
        }
        .tcn-blog-pill {
          padding: 0.5rem 1rem;
          border-radius: 999px;
          border: 1px solid var(--tcn-border);
          background: #fff;
          color: var(--tcn-ink-700);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.18s ease;
        }
        .tcn-blog-pill:hover {
          background: var(--tcn-violet-50);
          color: var(--tcn-violet-600);
          border-color: var(--tcn-violet-500);
        }
        .tcn-blog-pill.active {
          background: linear-gradient(135deg, var(--tcn-navy-900), var(--tcn-navy-800));
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(11,15,30,0.25);
        }

        .tcn-blog-featured {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 2rem;
          align-items: stretch;
          background: linear-gradient(135deg, var(--tcn-bg-soft), #fff);
          border: 1px solid var(--tcn-border);
          border-radius: 24px;
          overflow: hidden;
          margin-bottom: 3rem;
          transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
        }
        .tcn-blog-featured:hover {
          border-color: var(--card-tint);
          box-shadow: 0 20px 50px rgba(15,23,42,0.1);
          transform: translateY(-3px);
        }
        .tcn-blog-featured .visual {
          background:
            linear-gradient(135deg, var(--card-tint-soft), rgba(255,255,255,0.6)),
            radial-gradient(circle at 30% 30%, var(--card-tint-soft), transparent 70%);
          min-height: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .tcn-blog-featured .visual .big-icon {
          width: 120px;
          height: 120px;
          border-radius: 28px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(8px);
          color: var(--card-tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 14px 40px rgba(15,23,42,0.1);
        }
        .tcn-blog-featured .body {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .tcn-blog-featured .feat-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          width: max-content;
          margin-bottom: 1rem;
        }
        .tcn-blog-featured h2 {
          font-size: clamp(1.4rem, 2.6vw, 1.9rem);
          font-weight: 800;
          color: var(--tcn-ink-900);
          margin: 0 0 0.85rem;
          letter-spacing: -0.02em;
          line-height: 1.25;
        }
        .tcn-blog-featured p {
          color: var(--tcn-ink-500);
          font-size: 1rem;
          line-height: 1.6;
          margin: 0 0 1.5rem;
        }
        .tcn-blog-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.82rem;
          color: var(--tcn-ink-500);
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .tcn-blog-meta span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .tcn-blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .tcn-blog-card {
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          cursor: pointer;
        }
        .tcn-blog-card:hover {
          transform: translateY(-4px);
          border-color: var(--card-tint);
          box-shadow: 0 14px 36px rgba(15,23,42,0.08);
        }
        .tcn-blog-card .visual {
          height: 160px;
          background:
            linear-gradient(135deg, var(--card-tint-soft), rgba(255,255,255,0.6));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tcn-blog-card .visual .ico {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(255,255,255,0.85);
          color: var(--card-tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 18px rgba(15,23,42,0.06);
        }
        .tcn-blog-card .body {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .tcn-blog-card .cat {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          background: var(--card-tint-soft);
          color: var(--card-tint);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          width: max-content;
          margin-bottom: 0.75rem;
        }
        .tcn-blog-card h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--tcn-ink-900);
          margin: 0 0 0.5rem;
          line-height: 1.35;
        }
        .tcn-blog-card p {
          color: var(--tcn-ink-500);
          font-size: 0.9rem;
          line-height: 1.55;
          margin: 0 0 1rem;
          flex: 1;
        }
        .tcn-blog-card .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.85rem;
          border-top: 1px solid var(--tcn-border);
          font-size: 0.82rem;
          color: var(--tcn-ink-500);
        }
        .tcn-blog-card .read-more {
          color: var(--card-tint);
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .tcn-blog-empty {
          text-align: center;
          padding: 4rem 1rem;
          color: var(--tcn-ink-500);
        }

        @media (max-width: 768px) {
          .tcn-blog-featured { grid-template-columns: 1fr; }
          .tcn-blog-featured .visual { min-height: 200px; }
          .tcn-blog-featured .body { padding: 1.75rem; }
        }
      `}</style>

      <PageHero
        eyebrow="Blog"
        eyebrowIcon={PiArticleDuotone}
        title={
          <>
            Insights on{" "}
            <span className="gradient-word">team communication</span>
          </>
        }
        lead="Articles on security, productivity, AI, compliance, and product updates — from the team building TheChatNest."
      />

      <section style={{ padding: "4rem 0 5rem" }}>
        <div className="container">
          {/* Filters */}
          <div className="tcn-blog-filters">
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  className={`tcn-blog-pill ${category === cat ? "active" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {meta?.Icon && <meta.Icon size={13} />} {cat}
                </button>
              );
            })}
          </div>

          {/* Featured (only on All) */}
          {category === "All" && featured && (
            <div
              className="tcn-blog-featured"
              style={{
                "--card-tint": CATEGORY_META[featured.category].tint,
                "--card-tint-soft": `${CATEGORY_META[featured.category].tint}22`,
              }}
            >
              <div className="visual">
                <div className="big-icon">
                  {React.createElement(CATEGORY_META[featured.category].Icon, { size: 56 })}
                </div>
              </div>
              <div className="body">
                <span className="feat-badge">★ Featured</span>
                <span
                  className="cat"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "0.25rem 0.65rem",
                    borderRadius: 999,
                    background: `${CATEGORY_META[featured.category].tint}1a`,
                    color: CATEGORY_META[featured.category].tint,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    width: "max-content",
                    marginBottom: "0.85rem",
                  }}
                >
                  {React.createElement(CATEGORY_META[featured.category].Icon, { size: 12 })}
                  {featured.category}
                </span>
                <h2>{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <div className="tcn-blog-meta">
                  <span><PiCalendarDuotone size={14} /> {featured.date}</span>
                  <span><PiClockDuotone size={14} /> {featured.readTime} read</span>
                </div>
                <Link
                  to="#"
                  className="main-btn"
                  style={{
                    width: "max-content",
                    padding: "0.7rem 1.4rem",
                    fontSize: "0.92rem",
                  }}
                >
                  Read article <PiArrowRightBold size={14} style={{ marginLeft: 4 }} />
                </Link>
              </div>
            </div>
          )}

          {/* Grid */}
          {rest.length ? (
            <div className="tcn-blog-grid">
              {rest.map((post) => {
                const meta = CATEGORY_META[post.category];
                return (
                  <article
                    key={post.id}
                    className="tcn-blog-card"
                    style={{
                      "--card-tint": meta.tint,
                      "--card-tint-soft": `${meta.tint}1a`,
                    }}
                  >
                    <div className="visual">
                      <div className="ico">
                        <meta.Icon size={28} />
                      </div>
                    </div>
                    <div className="body">
                      <span className="cat">
                        <meta.Icon size={11} /> {post.category}
                      </span>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <div className="footer">
                        <span style={{ display: "inline-flex", gap: 12 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <PiCalendarDuotone size={13} />
                            {post.date}
                          </span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <PiClockDuotone size={13} />
                            {post.readTime}
                          </span>
                        </span>
                        <span className="read-more">
                          Read <PiArrowRightBold size={11} />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="tcn-blog-empty">
              <p>No articles in this category yet — check back soon!</p>
            </div>
          )}
        </div>
      </section>

      <FinalCta
        eyebrow="Stay in the loop"
        eyebrowIcon={PiSparkleDuotone}
        title="Get product updates in your inbox"
        description="No spam. One short email every two weeks with the latest releases, deep dives, and team productivity tips."
        primaryLabel="Start free trial"
        primaryTo="/auth/register"
        secondaryLabel="See features"
        secondaryTo="/features"
      />
    </div>
  );
}
