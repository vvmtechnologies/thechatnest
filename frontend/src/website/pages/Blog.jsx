import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  PiBookOpenDuotone,
  PiCalendarDuotone,
  PiClockDuotone,
  PiArrowRightBold,
  PiSparkleDuotone,
  PiTagDuotone,
  PiMagnifyingGlassDuotone,
  PiArrowLeftBold,
} from "react-icons/pi";
import Seo from "../../components/Seo.jsx";
import NewsletterSignup from "../components/NewsletterSignup.jsx";

// Three SEO-focused articles. Markdown-ish content rendered inline so we
// don't add a new dep. Each post has slug + meta + body sections.

const POSTS = [
  {
    slug: "slack-alternatives-2026",
    title: "10 Slack alternatives worth trying in 2026 (and how they actually compare)",
    excerpt: "Slack works — until the bill arrives. We benchmarked 10 alternatives across pricing, features, security, and self-hosting so you don't have to.",
    date: "2026-05-14",
    readMin: 9,
    tag: "Comparison",
    tagTint: "#6d5dfc",
    author: "TheChatNest team",
    sections: [
      {
        h: "Why Slack stops being the right answer at 30 people",
        p: [
          "Slack is brilliant at 5 people. It's still good at 15. Somewhere around 30, a few things happen at the same time:",
          "• Your bill crosses ₹1.5 lakh / month for Pro features your team uses casually",
          "• Notification fatigue eats actual work hours — Slack's own data says workers check it every 5 minutes",
          "• Customer threads, internal chats, vendor DMs, and tooling alerts all blur into one noisy stream",
          "• You start paying extra for guests, for Zoom integration, for transcripts, for AI — features that should be table stakes in 2026.",
          "If any of those sound familiar, you're not the problem. The product just isn't priced for a 30-person team anymore. Here are 10 alternatives worth a serious look.",
        ],
      },
      {
        h: "The 10 we benchmarked",
        p: [
          "We tried each one for a week with a 12-person team. Same use cases: 1:1 DMs, project channels, file sharing, video standups, async voice notes. Here's the short version:",
        ],
        list: [
          { t: "TheChatNest", d: "₹199/seat. Self-host or cloud. Native AI, calls, broadcasts, GDPR-aligned. Honest stance on what's shipped vs. roadmap." },
          { t: "Microsoft Teams", d: "Free if you're already on Microsoft 365. Best for Office-heavy orgs. UX heavy, slow on lower-end machines." },
          { t: "Mattermost", d: "Open source, self-hosted. Great for compliance-heavy industries. Slack-shaped UX so the migration is painless." },
          { t: "Rocket.Chat", d: "Open source. Marketplace of plugins. Self-host or cloud. Steeper learning curve but very flexible." },
          { t: "Twist", d: "From the Doist (Todoist) team. Async-first, thread-based. Calmer than Slack. Limited calls." },
          { t: "Pumble", d: "Slack clone with generous free tier. Strong for small teams on a budget." },
          { t: "Chanty", d: "Cheap, simple, video built-in. Smaller ecosystem, fewer integrations." },
          { t: "Element", d: "Built on Matrix protocol. Federated, end-to-end encrypted. Best for privacy-first teams comfortable with a learning curve." },
          { t: "Troop Messenger", d: "India-based. Solid feature list. Self-host available. UX feels like 2018." },
          { t: "Zulip", d: "Topic-based threading model. Polarising — engineers love it, sales reps hate it. Open source." },
        ],
      },
      {
        h: "What to actually look for",
        p: [
          "Don't pick on \"feature count.\" Pick on the four things that matter once you scale past 20 people:",
          "1. Total cost at 50 seats over 3 years — including the integrations you'll need to add",
          "2. Whether AI features (translate, summary, smart reply) are native or paid add-ons",
          "3. Self-host or cloud — and whether you can switch later without a migration",
          "4. How quickly your team can actually use it on day one. Onboarding friction is a hidden cost.",
        ],
      },
      {
        h: "The honest verdict",
        p: [
          "If your team is happy and your budget isn't bleeding, stay on Slack. It's a good product.",
          "If you're spending more than ₹2 lakh / year and still bolting on Otter, Loom, and Zoom on the side — try TheChatNest or Mattermost. Both bring those into one workspace. TheChatNest is faster to start; Mattermost gives you fuller control.",
          "If you're a privacy-first or regulated team, Element on Matrix is the most defensible long-term bet.",
          "Whatever you pick: budget two weeks of real use, not a 30-minute demo, before you decide.",
        ],
      },
    ],
  },
  {
    slug: "self-hosted-team-messaging-guide",
    title: "The complete guide to self-hosted team messaging in 2026",
    excerpt: "Self-hosting your team chat isn't just about saving money — it's about owning your data, your audit trail, and your destiny. Here's everything we wish someone had told us before we deployed our first instance.",
    date: "2026-05-12",
    readMin: 14,
    tag: "Self-host",
    tagTint: "#16a34a",
    author: "TheChatNest team",
    sections: [
      {
        h: "Who should self-host (and who really shouldn't)",
        p: [
          "Self-hosting team chat is a deliberate trade-off. You get total data control, custom integrations, and no per-seat bills past your initial spend — but you take on ops, security patches, and uptime responsibility.",
          "Self-host if: you're in a regulated industry (finance, healthcare, defense), you've hit Slack's per-seat ceiling, you need on-prem audit logging, or your customers contractually require data residency in your country.",
          "Don't self-host if: you're under 20 people without a dedicated ops person, you'd rather spend engineering time on your product, or your security team isn't equipped to patch CVEs on a 48-hour cycle.",
        ],
      },
      {
        h: "The architecture you actually need",
        p: [
          "Most self-hosted chat fits comfortably on three boxes:",
          "1. App server (Node.js / Java / Go depending on the platform) — 2 vCPU, 4 GB RAM is plenty for under 200 users",
          "2. Database (Postgres for most modern stacks) — 4 GB RAM, fast SSD, daily encrypted backups",
          "3. Object storage for files — S3, MinIO, or your cloud's equivalent. Don't try to serve attachments from your app server's local disk past day one.",
          "Optionally: a Redis cache, a dedicated WebSocket server if your platform separates them, and a reverse proxy (Caddy / Nginx) handling TLS termination.",
        ],
      },
      {
        h: "Five things that bite first-time self-hosters",
        p: ["These are the things we and our friends got wrong on instance #1:"],
        list: [
          { t: "TLS certs that auto-renew", d: "Let's Encrypt + Caddy is the lowest-friction path. Skip manual cert dances." },
          { t: "Database backups you've actually restored", d: "A backup is a wish until you've tested restoring from it. Do a dry-run quarterly." },
          { t: "Mail delivery is not a solved problem", d: "Self-hosted SMTP gets blocked by Google/Microsoft. Use a transactional service (SES, Postmark) for password resets." },
          { t: "Object storage retention policies", d: "Set lifecycle rules from day one. Old attachments + uncompressed images will silently blow up your bill." },
          { t: "Audit logging is mandatory before launch", d: "Whatever platform you pick, turn on activity logs before the first message. Don't try to backfill compliance." },
        ],
      },
      {
        h: "Picking your platform",
        p: [
          "Top 3 self-host-friendly options today:",
          "Mattermost — Slack-shaped, mature, big plugin ecosystem. Great for compliance-heavy teams.",
          "Rocket.Chat — Plugin-heavy, flexible, slightly more setup complexity. Self-host or cloud.",
          "TheChatNest — Newer (we're early!). Single-binary deployment via Docker. Sensible defaults, batteries-included AI features baked in. Bring your own S3 + Postgres.",
          "All three are MIT or AGPL-licensed. Read the license before assuming \"open source\" means \"do whatever you want.\"",
        ],
      },
      {
        h: "Going live: the 5-step checklist",
        p: ["Before you announce \"we're on the new chat\" to your team:"],
        list: [
          { t: "1. SSO test from at least 3 device types", d: "Mac, Windows, mobile. The day-one login experience matters." },
          { t: "2. File upload tested at the size limit", d: "Don't find out at 2 GB on launch day that your nginx limit is 100 MB." },
          { t: "3. Notifications test on a fresh device", d: "Push tokens are fiddly. Send a test push from the admin panel before opening it up." },
          { t: "4. Audit log monitor enabled", d: "Stream events to your SIEM or at least to a separate database. Day-zero is when you need this most." },
          { t: "5. Runbook for the 3 likely incidents", d: "DB down, disk full, TLS cert expired. Write down the recovery steps before they happen." },
        ],
      },
      {
        h: "What we wish someone had told us",
        p: [
          "Self-hosting is a year-one cost, not a year-one saving. You'll spend more in engineering hours in the first 6 months than you would on a SaaS subscription. That's fine — you're buying control, not cost cuts.",
          "The savings show up at year 2-3 when your team is 100+ and you'd be paying ₹15 lakh+ to a hosted vendor.",
          "And whatever platform you pick: write down your migration path. Not because you'll leave — because knowing you can is a feature.",
        ],
      },
    ],
  },
  {
    slug: "team-chat-security-2026",
    title: "Team chat security checklist: what to demand from any vendor in 2026",
    excerpt: "AES-256 in marketing copy is meaningless if your sessions leak or your admins can read every DM. Here's a vendor-agnostic checklist for evaluating team chat security in 2026.",
    date: "2026-05-10",
    readMin: 11,
    tag: "Security",
    tagTint: "#dc2626",
    author: "TheChatNest team",
    sections: [
      {
        h: "Why \"enterprise-grade encryption\" means nothing",
        p: [
          "Open any chat vendor's website in 2026 and you'll see \"AES-256, military-grade, enterprise-ready security\". The phrase is so overused it has lost meaning.",
          "Encryption only matters in context. AES-256 at rest is great. AES-256 at rest with the key sitting in the same database is theatre. The questions below are the ones that actually separate serious vendors from marketing-led ones.",
        ],
      },
      {
        h: "Data at rest: the questions to ask",
        list: [
          { t: "Where is the encryption key stored?", d: "If \"in the same database as the data\" — that's not encryption, that's obfuscation. Demand a separate KMS or HSM." },
          { t: "Can the vendor's engineers read my messages?", d: "Honest answer for most cloud vendors: yes, technically. End-to-end encryption is what changes that. Ask explicitly: \"can your support team read DMs in production?\"" },
          { t: "What about backups?", d: "Are backups encrypted? With which key? Who has access to that key? If your vendor can't answer in one sentence, walk." },
          { t: "Per-customer key support?", d: "Bring-Your-Own-Key (BYOK) means even the vendor's master admin can't decrypt your data. Increasingly standard on Enterprise tiers." },
        ],
      },
      {
        h: "Data in transit: more than \"we use HTTPS\"",
        list: [
          { t: "TLS 1.3 or fail", d: "TLS 1.2 was deprecated for new deployments years ago. TLS 1.0/1.1 is unconscionable. Check ssllabs.com for a real grade." },
          { t: "HSTS preload submitted", d: "Without HSTS preload, a victim's first request can be downgraded to HTTP. Ask if their domain is on the Chrome preload list." },
          { t: "Certificate pinning on mobile?", d: "Defends against MitM attacks on hostile networks. Less common — but a strong signal of a serious security team." },
          { t: "WebSocket connections wrapped?", d: "Many vendors forget: WSS (TLS-wrapped WebSocket) must be enforced, not just HTTPS for the API." },
        ],
      },
      {
        h: "Authentication: the boring stuff that breaks first",
        list: [
          { t: "Password storage", d: "Anything except bcrypt / argon2 / scrypt is a red flag. SHA-256 is not a password hash." },
          { t: "MFA / 2FA must be available", d: "TOTP app or hardware key. SMS-only 2FA is broken — sim-swap attacks are real and common." },
          { t: "Session token rotation", d: "Refresh tokens should rotate on every use. Long-lived static tokens are a goldmine for attackers." },
          { t: "Device limits", d: "Cap on simultaneous sessions per user (3 is reasonable) means a leaked credential has limited blast radius." },
          { t: "Rate limiting on OTP attempts", d: "If you can try 1,000 OTPs in a minute, the OTP is decorative. Demand exponential backoff." },
        ],
      },
      {
        h: "Audit & visibility: the difference between \"we have logs\" and \"you have logs\"",
        list: [
          { t: "Customer-accessible audit log", d: "You should be able to download admin actions, login attempts, and security events. \"Contact support and we'll send a CSV\" is not acceptable for compliance." },
          { t: "Tamper-evident logging", d: "Append-only logs are the minimum. Cryptographically chained logs (each entry hashes the previous) is the gold standard." },
          { t: "SIEM integration", d: "Can you stream events to your Splunk / Elastic / Datadog? If not, you can't correlate chat events with the rest of your security posture." },
          { t: "Data export & deletion", d: "GDPR / DPDP-aligned vendors offer full export AND verifiable deletion within 30 days of request. Demand both." },
        ],
      },
      {
        h: "The 10-minute vendor security smoke test",
        p: ["When evaluating a new vendor, ask these 10 questions in your first call. The quality of the answers tells you more than any whitepaper:"],
        list: [
          { t: "1. Where are the encryption keys stored?" },
          { t: "2. Can your engineers read DMs?" },
          { t: "3. What's your TLS Labs grade today?" },
          { t: "4. What hash function do you use for passwords?" },
          { t: "5. Do refresh tokens rotate?" },
          { t: "6. Can I export my full audit log right now?" },
          { t: "7. How fast do you patch a public CVE?" },
          { t: "8. When was your last penetration test, and can I see a summary?" },
          { t: "9. What's your DPDP / GDPR data deletion SLA?" },
          { t: "10. Show me where your status page lives." },
        ],
      },
      {
        h: "How we score against our own checklist",
        p: [
          "We try to be honest about where we are: TheChatNest is early. We've got AES-256 at rest, TLS 1.3 + HSTS, JWT with rotating refresh tokens, OTP-throttled auth, append-only audit logs, and customer-accessible data export. Roadmap items (BYOK, SOC 2 audit, certificate pinning on mobile) are clearly marked on our /security page — no fake badges.",
          "We're not the most credentialed vendor in this list. We are one of the most honest about what we are and aren't. For pre-enterprise teams that need real security without enterprise pricing, that's often the right trade.",
        ],
      },
    ],
  },
];

const slugify = (s) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const Blog = () => {
  const { slug } = useParams();
  const [query, setQuery] = useState("");

  if (slug) {
    const post = POSTS.find((p) => p.slug === slug);
    if (!post) {
      return (
        <div className="tcn-blog">
          <Seo title="Article not found" noIndex />
          <div className="container" style={{ padding: "8rem 1rem", textAlign: "center" }}>
            <h1>Article not found</h1>
            <Link to="/blog">← Back to all articles</Link>
          </div>
        </div>
      );
    }
    return <BlogPost post={post} />;
  }

  return <BlogIndex posts={POSTS} query={query} setQuery={setQuery} />;
};

const BlogIndex = ({ posts, query, setQuery }) => {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <div className="tcn-blog">
      <Seo
        title="Blog"
        description="Honest writing on team chat, self-hosted messaging, security, and how to actually run a remote engineering team. Written by the team building TheChatNest."
        keywords="thechatnest blog, team chat blog, slack alternatives, self-hosted messaging, team chat security"
      />

      <style>{`
        .tcn-blog {
          background: linear-gradient(180deg, #fafbff 0%, #fff 50%);
          color: #0b0f1e;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          min-height: 100vh;
        }
        .tcn-blog-hero {
          position: relative;
          padding: 7rem 0 4rem;
          background:
            radial-gradient(1100px 600px at 78% -10%, rgba(109,93,252,0.32), transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          overflow: hidden;
          text-align: center;
        }
        .tcn-blog-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%);
          pointer-events: none;
        }
        .tcn-blog-hero > .container { position: relative; z-index: 1; }
        .tcn-blog-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          background: rgba(255,213,74,0.14);
          border: 1px solid rgba(255,213,74,0.3);
          color: #ffd54a;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .tcn-blog-hero h1 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 1rem;
          color: #fff;
        }
        .tcn-blog-hero h1 em { font-style: italic; color: #ffd54a; }
        .tcn-blog-hero p.lede {
          color: rgba(255,255,255,0.72);
          font-size: 1.1rem;
          line-height: 1.55;
          max-width: 580px;
          margin: 0 auto 2rem;
        }
        .tcn-blog-search {
          max-width: 480px;
          margin: 0 auto;
          position: relative;
        }
        .tcn-blog-search input {
          width: 100%;
          padding: 0.95rem 1.2rem 0.95rem 3rem;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.08);
          color: #fff;
          font-size: 0.95rem;
          font-family: inherit;
          backdrop-filter: blur(8px);
          outline: none;
        }
        .tcn-blog-search input::placeholder { color: rgba(255,255,255,0.5); }
        .tcn-blog-search input:focus {
          border-color: rgba(255,213,74,0.6);
          background: rgba(255,255,255,0.14);
        }
        .tcn-blog-search svg {
          position: absolute;
          left: 1.1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.5);
        }

        .tcn-blog-grid-section { padding: 5rem 0; }
        .tcn-blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .tcn-blog-card {
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          transition: all 0.22s ease;
        }
        .tcn-blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 22px 50px rgba(15,23,42,0.1);
          border-color: var(--tint);
          color: inherit;
        }
        .tcn-blog-card-thumb {
          height: 160px;
          background: linear-gradient(135deg, var(--tint) 0%, var(--tint-deep) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }
        .tcn-blog-card-thumb .ic { opacity: 0.55; }
        .tcn-blog-card-body {
          padding: 1.6rem 1.65rem 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          flex: 1;
        }
        .tcn-blog-card .tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 999px;
          background: var(--tint-soft);
          color: var(--tint);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-family: "JetBrains Mono", monospace;
          align-self: flex-start;
        }
        .tcn-blog-card h3 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: 1.2rem;
          line-height: 1.25;
          letter-spacing: -0.01em;
          color: #0b0f1e;
          margin: 0;
        }
        .tcn-blog-card .excerpt {
          color: rgba(15,23,42,0.62);
          font-size: 0.92rem;
          line-height: 1.55;
          flex: 1;
        }
        .tcn-blog-card .meta {
          display: flex;
          gap: 1rem;
          font-size: 11px;
          color: rgba(15,23,42,0.5);
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.05em;
          padding-top: 0.85rem;
          margin-top: auto;
          border-top: 1px dashed rgba(15,23,42,0.12);
        }
        .tcn-blog-card .meta svg { vertical-align: -2px; margin-right: 4px; }

        .tcn-blog-news {
          padding: 4rem 0 6rem;
        }

        @media (max-width: 768px) {
          .tcn-blog-hero { padding: 5.5rem 0 3rem; }
        }
      `}</style>

      <section className="tcn-blog-hero">
        <div className="container">
          <span className="tcn-blog-eyebrow">
            <PiBookOpenDuotone size={12} /> Field notes
          </span>
          <h1>Honest writing on <em>team chat</em>.</h1>
          <p className="lede">
            Comparisons, how-tos, and lessons from the trenches — written by the team actually building the product.
          </p>
          <div className="tcn-blog-search">
            <PiMagnifyingGlassDuotone size={16} />
            <input
              type="text"
              placeholder="Search articles…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search articles"
            />
          </div>
        </div>
      </section>

      <section className="tcn-blog-grid-section">
        <div className="tcn-blog-grid">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="tcn-blog-card"
              style={{ "--tint": p.tagTint, "--tint-soft": `${p.tagTint}1a`, "--tint-deep": `${p.tagTint}` }}
            >
              <div className="tcn-blog-card-thumb">
                <PiBookOpenDuotone size={56} className="ic" />
              </div>
              <div className="tcn-blog-card-body">
                <span className="tag">
                  <PiTagDuotone size={10} /> {p.tag}
                </span>
                <h3>{p.title}</h3>
                <div className="excerpt">{p.excerpt}</div>
                <div className="meta">
                  <span><PiCalendarDuotone size={11} />{new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span><PiClockDuotone size={11} />{p.readMin} min read</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="tcn-blog-news">
        <NewsletterSignup variant="card" />
      </section>
    </div>
  );
};

const BlogPost = ({ post }) => {
  return (
    <div className="tcn-blog-post">
      <Seo
        title={post.title}
        description={post.excerpt}
        type="article"
        keywords={`thechatnest blog, ${post.tag.toLowerCase()}, ${post.slug.replace(/-/g, ' ')}`}
      />

      <style>{`
        .tcn-blog-post {
          background: #fff;
          color: #0b0f1e;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          min-height: 100vh;
        }
        .tcn-blog-post-hero {
          padding: 6rem 0 2.5rem;
          background: linear-gradient(180deg, #fafbff 0%, #fff 100%);
          border-bottom: 1px solid rgba(15,23,42,0.06);
        }
        .tcn-blog-post-hero .container { max-width: 760px; }
        .tcn-blog-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(15,23,42,0.55);
          font-weight: 600;
          font-size: 0.88rem;
          text-decoration: none !important;
          margin-bottom: 2rem;
        }
        .tcn-blog-back:hover { color: ${post.tagTint}; }
        .tcn-blog-post-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 11px;
          border-radius: 999px;
          background: ${post.tagTint}1a;
          color: ${post.tagTint};
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
        }
        .tcn-blog-post-hero h1 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(2rem, 4.5vw, 3.4rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 1.25rem;
          color: #0b0f1e;
        }
        .tcn-blog-post-meta {
          display: flex;
          gap: 1.5rem;
          font-size: 0.88rem;
          color: rgba(15,23,42,0.55);
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.04em;
          flex-wrap: wrap;
        }
        .tcn-blog-post-meta svg { vertical-align: -2px; margin-right: 4px; }

        .tcn-blog-post-body {
          padding: 3rem 0 5rem;
        }
        .tcn-blog-post-body .container { max-width: 760px; }
        .tcn-blog-post-excerpt {
          font-family: "Fraunces", Georgia, serif;
          font-style: italic;
          font-weight: 500;
          font-size: 1.2rem;
          line-height: 1.55;
          color: rgba(15,23,42,0.7);
          margin: 0 0 3rem;
          padding: 1.4rem 1.6rem;
          border-left: 3px solid ${post.tagTint};
          background: ${post.tagTint}06;
          border-radius: 0 12px 12px 0;
        }
        .tcn-blog-post-section { margin-bottom: 2.75rem; }
        .tcn-blog-post-section h2 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: clamp(1.4rem, 2.5vw, 1.85rem);
          letter-spacing: -0.015em;
          line-height: 1.2;
          color: #0b0f1e;
          margin: 0 0 1rem;
        }
        .tcn-blog-post-section p {
          color: rgba(15,23,42,0.78);
          font-size: 1.02rem;
          line-height: 1.75;
          margin: 0 0 1rem;
        }
        .tcn-blog-post-list {
          list-style: none;
          padding: 0;
          margin: 1.25rem 0;
          display: grid;
          gap: 0.85rem;
        }
        .tcn-blog-post-list li {
          padding: 1rem 1.25rem;
          background: rgba(15,23,42,0.03);
          border-left: 3px solid ${post.tagTint};
          border-radius: 0 10px 10px 0;
        }
        .tcn-blog-post-list strong {
          display: block;
          color: #0b0f1e;
          font-weight: 800;
          font-size: 0.98rem;
          margin-bottom: 4px;
        }
        .tcn-blog-post-list span {
          color: rgba(15,23,42,0.7);
          font-size: 0.93rem;
          line-height: 1.55;
        }

        .tcn-blog-post-cta {
          margin-top: 4rem;
          padding: 2.5rem 2rem;
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          color: #fff;
          border-radius: 22px;
          text-align: center;
        }
        .tcn-blog-post-cta h3 {
          font-family: "Fraunces", Georgia, serif;
          font-weight: 500;
          font-size: 1.5rem;
          color: #fff;
          margin: 0 0 0.75rem;
          letter-spacing: -0.01em;
        }
        .tcn-blog-post-cta p {
          color: rgba(255,255,255,0.7);
          margin: 0 0 1.5rem;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }
        .tcn-blog-post-cta a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.85rem 1.65rem;
          border-radius: 999px;
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none !important;
          box-shadow: 0 10px 26px rgba(255,213,74,0.45);
          transition: transform 0.18s ease;
        }
        .tcn-blog-post-cta a:hover { transform: translateY(-2px); color: #1a1f3a !important; }
      `}</style>

      <section className="tcn-blog-post-hero">
        <div className="container">
          <Link to="/blog" className="tcn-blog-back">
            <PiArrowLeftBold size={13} /> All articles
          </Link>
          <span className="tcn-blog-post-tag">
            <PiTagDuotone size={11} /> {post.tag}
          </span>
          <h1>{post.title}</h1>
          <div className="tcn-blog-post-meta">
            <span><PiCalendarDuotone size={12} />{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span><PiClockDuotone size={12} />{post.readMin} min read</span>
            <span><PiSparkleDuotone size={12} />{post.author}</span>
          </div>
        </div>
      </section>

      <section className="tcn-blog-post-body">
        <div className="container">
          <div className="tcn-blog-post-excerpt">{post.excerpt}</div>

          {post.sections.map((sec, i) => (
            <div key={i} className="tcn-blog-post-section">
              <h2>{sec.h}</h2>
              {sec.p?.map((para, j) => <p key={j}>{para}</p>)}
              {sec.list && (
                <ul className="tcn-blog-post-list">
                  {sec.list.map((item, k) => (
                    <li key={k}>
                      {item.t && <strong>{item.t}</strong>}
                      {item.d && <span>{item.d}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="tcn-blog-post-cta">
            <h3>Liked this read?</h3>
            <p>One email a month. What we shipped, what we learned, what we'd do differently.</p>
            <NewsletterSignup variant="inline" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
