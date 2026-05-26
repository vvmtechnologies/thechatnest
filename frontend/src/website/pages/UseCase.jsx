import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PiCodeDuotone,
  PiChartLineUpDuotone,
  PiHouseLineDuotone,
  PiBriefcaseDuotone,
  PiSparkleDuotone,
  PiArrowRightBold,
  PiCheckCircleDuotone,
  PiQuotesDuotone,
} from "react-icons/pi";
import Seo from "../../components/Seo.jsx";

// Single template, 4 instances. Each defines its own headline, pains,
// chosen features, sample workflow, and seo metadata.

const USE_CASES = {
  engineering: {
    name: "Engineering teams",
    slug: "engineering",
    Icon: PiCodeDuotone,
    tint: "#6d5dfc",
    eyebrow: "FOR / ENGINEERING",
    title: "For engineering teams that ship before lunch.",
    accent: "ship before lunch.",
    lede: "Code review chatter, on-call handoffs, AI-summarized standups — and a sidebar quiet enough to actually think.",
    pains: [
      "Slack notification fatigue eating your deep-work hours",
      "Standup transcripts no one reads — but management wants",
      "Switching apps for chat, calls, and screen share",
      "Onboarding a new engineer means rebuilding tribal knowledge",
    ],
    wins: [
      { Icon: PiSparkleDuotone, t: "AI standup summaries", d: "Async voice notes → transcribed → key decisions auto-extracted. No more 15-minute videos." },
      { Icon: PiSparkleDuotone, t: "Code-block first composer", d: "Triple-backtick code blocks, inline diff snippets, monospace by default. Built by devs." },
      { Icon: PiSparkleDuotone, t: "Per-channel DND", d: "#prod-alerts pages you. #memes doesn't. Channel-level rules, not whole-app blunt mode." },
      { Icon: PiSparkleDuotone, t: "Semantic search", d: "\"That doc about Q4 latency\" finds the spec from 3 months ago — even if you don't remember the exact words." },
      { Icon: PiSparkleDuotone, t: "Self-hosted option", d: "Air-gapped deployment for regulated workloads. Bring your S3, bring your keys." },
      { Icon: PiSparkleDuotone, t: "AI tone adjuster", d: "Diplomatic mode before you hit reply on that PR review. Saves friendships." },
    ],
    workflow: [
      { time: "08:42", act: "Catch up on overnight PR threads with the AI summary instead of scrolling 142 messages." },
      { time: "10:00", act: "Drop a 2-minute voice note as your standup. It's transcribed, searchable, watchable at 2x." },
      { time: "13:30", act: "Sprint planning in #eng-shipping. Auto-translate keeps the Bratislava + Varanasi halves in sync." },
      { time: "17:45", act: "Mark unread on tomorrow's blockers, log off. The on-call rotation in #prod-alerts handles the night." },
    ],
    quote: "We replaced four subscriptions with TheChatNest and our team's deep-work time doubled in the first month.",
    quoteWhen: "Anonymized — happy to introduce on request",
  },
  sales: {
    name: "Sales teams",
    slug: "sales",
    Icon: PiChartLineUpDuotone,
    tint: "#16a34a",
    eyebrow: "FOR / SALES",
    title: "For sales teams that close on Friday afternoon.",
    accent: "close on Friday afternoon.",
    lede: "Customer threads, deal-room privacy, AI call summaries — and a way to share wins without bcc'ing your manager into oblivion.",
    pains: [
      "Customer chats scattered across email, WhatsApp, and Slack DMs",
      "Manager wants pipeline visibility but reps want privacy",
      "AI features locked behind enterprise tiers nobody can afford",
      "Recording a call means licensing Zoom + Otter + Notion",
    ],
    wins: [
      { Icon: PiSparkleDuotone, t: "Encrypted deal rooms", d: "Per-chat PIN lock keeps NDA'd customer threads private — even from the rest of the team." },
      { Icon: PiSparkleDuotone, t: "AI call notes", d: "Every meeting auto-summarized with action items. Drops into the deal channel before you've parked the car." },
      { Icon: PiSparkleDuotone, t: "Smart compose", d: "Draft a follow-up in seconds. The AI matches your tone, your customer's language, and your CRM context." },
      { Icon: PiSparkleDuotone, t: "Disappearing messages", d: "Internal coaching notes that auto-delete in 24 hours. Honest feedback without a paper trail." },
      { Icon: PiSparkleDuotone, t: "Built-in HD video", d: "Customer call right from the chat thread. No \"let me send you a Zoom link\" energy." },
      { Icon: PiSparkleDuotone, t: "Broadcast announcements", d: "Pricing updates to 200 prospects in one message. Replies stay 1-on-1. Each conversation is private." },
    ],
    workflow: [
      { time: "09:15", act: "Read AI summary of last week's customer call before the renewal meeting at 10." },
      { time: "10:30", act: "Run the renewal call inside TheChatNest. Auto-transcribed. Action items posted to #renewals." },
      { time: "14:00", act: "Send a broadcast to 80 prospects with the new pricing PDF. Each reply lands as a 1-on-1." },
      { time: "16:45", act: "Manager pings in the deal channel — you reply with a 30-second voice note and the deal stays moving." },
    ],
    quote: "We closed 22% more in Q1 just because our reps stopped hunting through three apps to find customer history.",
    quoteWhen: "VP Sales · 40-person SaaS team",
  },
  remote: {
    name: "Remote teams",
    slug: "remote",
    Icon: PiHouseLineDuotone,
    tint: "#f59e0b",
    eyebrow: "FOR / REMOTE",
    title: "For remote teams that work across time zones.",
    accent: "across time zones.",
    lede: "Async-first by design. Voice notes, auto-translation, do-not-disturb that respects everyone's working hours.",
    pains: [
      "5-hour meeting marathons because half the team can't read tone in text",
      "Slack notifications pinging at 2 AM in Berlin from Varanasi",
      "Language barriers in international teams",
      "New hires struggle to catch up on context",
    ],
    wins: [
      { Icon: PiSparkleDuotone, t: "Async voice notes", d: "Send a 90-second voice note, get a transcript and 1x/1.5x/2x playback. Async standups, async strategy." },
      { Icon: PiSparkleDuotone, t: "Auto-translate (14 languages)", d: "Hindi → English → Spanish → German in real-time. Your team writes in their own language, everyone reads in theirs." },
      { Icon: PiSparkleDuotone, t: "Timezone-aware DND", d: "Working hours per person. Notifications respect them automatically — even when you're across the world." },
      { Icon: PiSparkleDuotone, t: "Semantic search", d: "Find the decision your team made 2 months ago across a thousand threads — by meaning, not exact words." },
      { Icon: PiSparkleDuotone, t: "Offline message queue", d: "Type on a flight, ship on landing. Messages auto-deliver when you're back online." },
      { Icon: PiSparkleDuotone, t: "Per-chat wallpaper", d: "Visual context for different conversations. Mom's wallpaper ≠ client wallpaper. Small UX, big love." },
    ],
    workflow: [
      { time: "08:00 IST", act: "India team starts the day. Reads AI summary of overnight SF traffic in #engineering." },
      { time: "11:30 GMT", act: "Berlin teammate replies with a voice note in German. India side reads it in English (auto-translate)." },
      { time: "14:00 EST", act: "NYC team picks up the thread. The whole context is searchable, no \"can you catch me up?\" calls." },
      { time: "22:00 IST", act: "DND kicks in for India side. Berlin pings stay quiet until 8 AM the next morning. Sleep is sacred." },
    ],
    quote: "We had 4 meetings a week. Now we have one. The rest is async voice notes and our retention went up.",
    quoteWhen: "Founder · 25-person fully-remote startup",
  },
  agencies: {
    name: "Agencies",
    slug: "agencies",
    Icon: PiBriefcaseDuotone,
    tint: "#2065D1",
    eyebrow: "FOR / AGENCIES",
    title: "For agencies juggling 12 client accounts at once.",
    accent: "12 client accounts at once.",
    lede: "Client channels, NDA-grade privacy, white-label-ready branding, and a workspace your clients will actually want to log into.",
    pains: [
      "Clients hate using your Slack — too noisy, too much org context they shouldn't see",
      "Each client wants their own \"channel\" — but Slack guests cost ₹500 a head",
      "NDA'd deliverables sitting in Google Drive next to confidential RFPs",
      "Brand consistency across project messaging is impossible",
    ],
    wins: [
      { Icon: PiSparkleDuotone, t: "Per-client departments", d: "Isolate each client's channels, members, and files. They never see each other, you orchestrate from above." },
      { Icon: PiSparkleDuotone, t: "Chat lock with PIN", d: "Confidential creative reviews behind a 4-digit PIN. Loan your laptop to a freelancer without leaking strategy." },
      { Icon: PiSparkleDuotone, t: "Broadcast with attachments", d: "Send the same Q3 status PDF to 8 client leads in one shot. Each reply lands privately to you." },
      { Icon: PiSparkleDuotone, t: "Audit logs", d: "Every shared file, every message edit, every member added — timestamped for client compliance." },
      { Icon: PiSparkleDuotone, t: "Custom wallpapers per chat", d: "Each client's room gets their brand colors. Tiny touch, professional polish." },
      { Icon: PiSparkleDuotone, t: "Native invoicing", d: "Built-in Stripe invoicing means your billing trail lives next to your work trail. No reconciliation hell." },
    ],
    workflow: [
      { time: "Mon 10:00", act: "Kick off the week with a broadcast to all client leads: \"this week's deliverables\". 8 clients, one click." },
      { time: "Tue 14:30", act: "Designer drops a draft in #client-acme-creative. Locked behind PIN. NDA holds." },
      { time: "Wed 17:00", act: "Client approves via voice note. Auto-transcribed for the project log. Done." },
      { time: "Fri 16:00", act: "End-of-week status broadcast goes out. Each client gets it as a 1-on-1. Replies are private." },
    ],
    quote: "Onboarding new clients used to take a week. Now it takes 20 minutes. Their team just logs in and the context is already there.",
    quoteWhen: "Founder · 18-person creative agency",
  },
};

const ALL_SLUGS = Object.keys(USE_CASES);

const UseCase = () => {
  const { pathname } = useLocation();
  // pathname like /for-engineering — derive slug from it
  const match = pathname.match(/^\/for-([a-z]+)/i);
  const slug = match ? match[1].toLowerCase() : null;
  const data = USE_CASES[slug];

  if (!data) {
    return (
      <div style={{ padding: "8rem 1rem", textAlign: "center", fontFamily: "Inter Tight" }}>
        <Seo title="Use case not found" noIndex />
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>Use case not found</h1>
        <p style={{ color: "rgba(15,23,42,0.6)", marginBottom: "1.5rem" }}>
          Try one of the use-cases below.
        </p>
        <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {ALL_SLUGS.map((s) => (
            <Link
              key={s}
              to={`/for-${s}`}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: 999,
                background: "#0b0f1e",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              /for-{s}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tcn-uc">
      <Seo
        title={`For ${data.name.toLowerCase()}`}
        description={data.lede}
        keywords={`thechatnest for ${data.slug}, ${data.slug} chat tool, ${data.slug} team workspace, slack alternative for ${data.slug}`}
      />

      <style>{`
        .tcn-uc {
          background: linear-gradient(180deg, #fafbff 0%, #fff 50%);
          color: #0b0f1e;
          font-family: "Inter Tight", system-ui, -apple-system, sans-serif;
          min-height: 100vh;
        }
        .tcn-uc-hero {
          position: relative;
          padding: 7rem 0 4rem;
          background:
            radial-gradient(1000px 600px at 80% -10%, ${data.tint}3a, transparent 60%),
            linear-gradient(180deg, #0b0f1e 0%, #11162a 100%);
          color: #fff;
          overflow: hidden;
        }
        .tcn-uc-hero::before {
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
        .tcn-uc-hero > .container { position: relative; z-index: 1; }
        .tcn-uc-hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          align-items: center;
        }
        .tcn-uc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.4rem 1rem;
          border-radius: 999px;
          background: ${data.tint}28;
          border: 1px solid ${data.tint}55;
          color: ${data.tint};
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .tcn-uc-hero h1 {
          font-size: clamp(2.2rem, 5vw, 3.8rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 0 0 1rem;
          color: #fff;
          max-width: 880px;
        }
        .tcn-uc-hero h1 .accent {
          background: linear-gradient(135deg, ${data.tint}, ${data.tint}cc);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .tcn-uc-hero p.lede {
          color: rgba(255,255,255,0.72);
          font-size: 1.15rem;
          line-height: 1.55;
          max-width: 620px;
          margin: 0 0 2rem;
        }
        .tcn-uc-hero-btns {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
        }
        .tcn-uc-hero-btns a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.85rem 1.6rem;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none !important;
          transition: transform 0.18s ease;
        }
        .tcn-uc-hero-btns .gold {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          box-shadow: 0 10px 26px rgba(255,213,74,0.4);
        }
        .tcn-uc-hero-btns .gold:hover { transform: translateY(-2px); color: #1a1f3a !important; }
        .tcn-uc-hero-btns .ghost {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff !important;
        }
        .tcn-uc-hero-btns .ghost:hover { background: rgba(255,255,255,0.14); }

        /* Section common */
        .tcn-uc-section { padding: 5rem 0; border-top: 1px solid rgba(15,23,42,0.08); }
        .tcn-uc-section-head { text-align: center; max-width: 680px; margin: 0 auto 3rem; }
        .tcn-uc-section-head h2 {
          font-size: clamp(1.85rem, 3.5vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.015em;
          line-height: 1.15;
          margin: 0 0 0.75rem;
          color: #0b0f1e;
        }
        .tcn-uc-section-head h2 .accent { color: ${data.tint}; }
        .tcn-uc-section-head p {
          color: rgba(15,23,42,0.6);
          font-size: 1rem;
          line-height: 1.55;
          margin: 0;
        }

        /* Pains list */
        .tcn-uc-pains {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          max-width: 1080px;
          margin: 0 auto;
        }
        .tcn-uc-pain {
          padding: 1.5rem 1.5rem;
          background: rgba(220,38,38,0.04);
          border: 1px solid rgba(220,38,38,0.22);
          border-radius: 14px;
          color: rgba(15,23,42,0.78);
          font-size: 0.95rem;
          line-height: 1.55;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .tcn-uc-pain::before {
          content: "✗";
          color: #dc2626;
          font-weight: 800;
          font-family: "JetBrains Mono", monospace;
          font-size: 18px;
          flex-shrink: 0;
          line-height: 1.2;
        }

        /* Wins grid */
        .tcn-uc-wins {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }
        .tcn-uc-win {
          padding: 1.65rem 1.65rem 1.4rem;
          background: #fff;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 16px;
          transition: all 0.22s ease;
        }
        .tcn-uc-win:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 36px rgba(15,23,42,0.08);
          border-color: ${data.tint};
        }
        .tcn-uc-win .ic {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: ${data.tint}1a;
          color: ${data.tint};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.85rem;
        }
        .tcn-uc-win h3 {
          font-size: 1rem;
          font-weight: 800;
          margin: 0 0 0.35rem;
          color: #0b0f1e;
        }
        .tcn-uc-win p {
          color: rgba(15,23,42,0.6);
          font-size: 0.9rem;
          line-height: 1.55;
          margin: 0;
        }

        /* Workflow timeline */
        .tcn-uc-flow {
          max-width: 760px;
          margin: 0 auto;
          position: relative;
        }
        .tcn-uc-flow::before {
          content: "";
          position: absolute;
          left: 50px;
          top: 4px;
          bottom: 4px;
          width: 2px;
          background:
            repeating-linear-gradient(to bottom,
              rgba(15,23,42,0.25) 0, rgba(15,23,42,0.25) 4px,
              transparent 4px, transparent 9px);
        }
        .tcn-uc-flow-step {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          padding-bottom: 1.5rem;
        }
        .tcn-uc-flow-step:last-child { padding-bottom: 0; }
        .tcn-uc-flow-time {
          flex-shrink: 0;
          width: 100px;
          font-family: "JetBrains Mono", monospace;
          font-weight: 800;
          font-size: 0.85rem;
          color: ${data.tint};
          background: ${data.tint}14;
          border: 1px solid ${data.tint}30;
          padding: 0.4rem 0.5rem;
          text-align: center;
          border-radius: 6px;
          margin-top: 2px;
          letter-spacing: 0.04em;
        }
        .tcn-uc-flow-step p {
          color: rgba(15,23,42,0.78);
          font-size: 0.98rem;
          line-height: 1.65;
          margin: 0;
          padding-top: 0.35rem;
        }

        /* Pull quote */
        .tcn-uc-quote {
          padding: 5rem 0;
          background: linear-gradient(135deg, #0b0f1e, #1a1f3a);
          color: #fff;
          text-align: center;
        }
        .tcn-uc-quote .qmark {
          color: ${data.tint};
          opacity: 0.4;
          margin-bottom: 1rem;
        }
        .tcn-uc-quote blockquote {
          font-family: "Fraunces", Georgia, serif;
          font-style: italic;
          font-size: clamp(1.4rem, 2.8vw, 2.1rem);
          line-height: 1.4;
          font-weight: 500;
          margin: 0 auto 1.25rem;
          max-width: 820px;
          padding: 0 1.5rem;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .tcn-uc-quote cite {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-style: normal;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          font-weight: 700;
        }

        /* Other use-cases */
        .tcn-uc-others {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          max-width: 1080px;
          margin: 0 auto;
        }
        .tcn-uc-other {
          padding: 1.4rem 1.5rem;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 14px;
          background: #fff;
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.18s ease;
        }
        .tcn-uc-other:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(15,23,42,0.08);
          border-color: var(--otint);
          color: inherit;
        }
        .tcn-uc-other .ic {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--otint-soft);
          color: var(--otint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .tcn-uc-other .label {
          font-weight: 800;
          color: #0b0f1e;
          font-size: 0.95rem;
        }
        .tcn-uc-other .arrow {
          margin-left: auto;
          color: rgba(15,23,42,0.35);
        }

        /* CTA */
        .tcn-uc-cta {
          padding: 5rem 0 6rem;
          text-align: center;
        }
        .tcn-uc-cta h2 {
          font-size: clamp(1.85rem, 3.5vw, 2.6rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 0.85rem;
          color: #0b0f1e;
        }
        .tcn-uc-cta p {
          color: rgba(15,23,42,0.62);
          font-size: 1.05rem;
          max-width: 540px;
          margin: 0 auto 1.85rem;
        }
        .tcn-uc-cta-btns {
          display: flex;
          gap: 0.85rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tcn-uc-cta-btns a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.85rem 1.65rem;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.95rem;
          text-decoration: none !important;
          transition: transform 0.18s ease;
        }
        .tcn-uc-cta-btns .gold {
          background: linear-gradient(135deg, #ffd54a, #ffb74d);
          color: #1a1f3a !important;
          box-shadow: 0 10px 26px rgba(255,213,74,0.4);
        }
        .tcn-uc-cta-btns .gold:hover { transform: translateY(-2px); color: #1a1f3a !important; }
        .tcn-uc-cta-btns .ghost {
          background: #fff;
          border: 1.5px solid rgba(15,23,42,0.15);
          color: #0b0f1e !important;
        }
      `}</style>

      <section className="tcn-uc-hero">
        <div className="container">
          <span className="tcn-uc-eyebrow">
            <data.Icon size={13} /> {data.eyebrow}
          </span>
          <h1>
            {data.title.split(data.accent)[0]}
            <span className="accent">{data.accent}</span>
          </h1>
          <p className="lede">{data.lede}</p>
          <div className="tcn-uc-hero-btns">
            <Link to="/auth/register" className="gold">
              Start free trial <PiArrowRightBold size={13} />
            </Link>
            <Link to="/demo" className="ghost">
              Book a demo
            </Link>
          </div>
        </div>
      </section>

      {/* Pains */}
      <section className="tcn-uc-section">
        <div className="container">
          <div className="tcn-uc-section-head">
            <h2>
              The four things <span className="accent">{data.name.toLowerCase()}</span> tell us they hate.
            </h2>
            <p>You're not imagining it — these are real friction points we hear every week.</p>
          </div>
          <div className="tcn-uc-pains">
            {data.pains.map((p, i) => (
              <div key={i} className="tcn-uc-pain">
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wins */}
      <section className="tcn-uc-section">
        <div className="container">
          <div className="tcn-uc-section-head">
            <h2>
              How TheChatNest <span className="accent">solves it</span>.
            </h2>
            <p>Six things designed exactly for the way {data.name.toLowerCase()} actually work.</p>
          </div>
          <div className="tcn-uc-wins">
            {data.wins.map((w, i) => (
              <article key={i} className="tcn-uc-win">
                <div className="ic"><w.Icon size={20} /></div>
                <h3>{w.t}</h3>
                <p>{w.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="tcn-uc-section">
        <div className="container">
          <div className="tcn-uc-section-head">
            <h2>
              A day in your <span className="accent">workspace</span>.
            </h2>
            <p>Real workflow, real moments, real impact.</p>
          </div>
          <div className="tcn-uc-flow">
            {data.workflow.map((step, i) => (
              <div key={i} className="tcn-uc-flow-step">
                <div className="tcn-uc-flow-time">{step.time}</div>
                <p>{step.act}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="tcn-uc-quote">
        <PiQuotesDuotone size={42} className="qmark" />
        <blockquote>{data.quote}</blockquote>
        <cite>— {data.quoteWhen}</cite>
      </section>

      {/* Other use-cases */}
      <section className="tcn-uc-section">
        <div className="container">
          <div className="tcn-uc-section-head">
            <h2>Also great for…</h2>
          </div>
          <div className="tcn-uc-others">
            {ALL_SLUGS.filter((s) => s !== data.slug).map((s) => {
              const u = USE_CASES[s];
              return (
                <Link
                  key={s}
                  to={`/for-${s}`}
                  className="tcn-uc-other"
                  style={{
                    "--otint": u.tint,
                    "--otint-soft": `${u.tint}1a`,
                  }}
                >
                  <span className="ic"><u.Icon size={20} /></span>
                  <span className="label">{u.name}</span>
                  <PiArrowRightBold size={14} className="arrow" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="tcn-uc-cta">
        <div className="container">
          <h2>Try TheChatNest free for 14 days.</h2>
          <p>No credit card. No setup call required. Real product, real value, real fast.</p>
          <div className="tcn-uc-cta-btns">
            <Link to="/auth/register" className="gold">
              Start free trial <PiArrowRightBold size={14} />
            </Link>
            <Link to="/compare" className="ghost">
              How we compare
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UseCase;
