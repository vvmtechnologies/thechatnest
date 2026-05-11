import React from "react";
import {
  PiSignInDuotone,
  PiUsersThreeDuotone,
  PiChatCircleDotsDuotone,
  PiRocketDuotone,
  PiCalendarDuotone,
  PiArrowRightBold,
  PiPlayCircleDuotone,
} from "react-icons/pi";
import { useSiteBranding } from "../../contexts/SiteBrandingContext.jsx";
import PageHero from "../components/layout/PageHero.jsx";
import FinalCta from "../components/layout/FinalCta.jsx";

const HowItWorks = () => {
  const { brandName } = useSiteBranding();
  const brand = brandName || "TheChatNest";

  const steps = [
    {
      n: "01",
      Icon: PiSignInDuotone,
      tint: "#6d5dfc",
      title: "Sign up as admin",
      desc: `Create your ${brand} workspace in 60 seconds. Pick a workspace name, set your password, and you're in. No credit card required for the trial.`,
      bullets: ["Free 14-day trial", "Email + OTP verification", "Pick your domain"],
    },
    {
      n: "02",
      Icon: PiUsersThreeDuotone,
      tint: "#22c55e",
      title: "Add your team",
      desc: "Import users in bulk or invite them one-by-one. Map departments, designations, and reporting hierarchy so everyone lands in the right channels.",
      bullets: ["CSV bulk upload", "Departments & roles", "Auto-join groups"],
    },
    {
      n: "03",
      Icon: PiChatCircleDotsDuotone,
      tint: "#ffd54a",
      title: "Start collaborating",
      desc: "Your team logs in, picks up where they left off (web, desktop, or mobile), and starts chatting, meeting, and shipping. We handle the rest.",
      bullets: ["1:1, group, and broadcasts", "HD audio + video calls", "AI assistant baked in"],
    },
  ];

  return (
    <div style={{ background: "#fff" }}>
      <style>{`
        .tcn-hiw-section { padding: 5rem 0; }
        .tcn-hiw-steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          max-width: 1180px;
          margin: 0 auto;
          position: relative;
        }
        .tcn-hiw-step {
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 22px;
          padding: 2rem 1.7rem;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          position: relative;
          overflow: hidden;
        }
        .tcn-hiw-step::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--card-tint);
          opacity: 0;
          transition: opacity 0.22s ease;
        }
        .tcn-hiw-step:hover {
          transform: translateY(-6px);
          border-color: var(--card-tint);
          box-shadow: 0 18px 44px rgba(15,23,42,0.1);
        }
        .tcn-hiw-step:hover::before { opacity: 1; }

        .tcn-hiw-num {
          position: absolute;
          top: 1.25rem;
          right: 1.6rem;
          font-size: 4.5rem;
          font-weight: 800;
          line-height: 1;
          color: var(--card-tint-soft);
          letter-spacing: -0.04em;
          pointer-events: none;
        }
        .tcn-hiw-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: var(--card-tint-soft);
          color: var(--card-tint);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .tcn-hiw-step h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--tcn-ink-900);
          margin: 0 0 0.5rem;
          letter-spacing: -0.02em;
        }
        .tcn-hiw-step p {
          color: var(--tcn-ink-500);
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0 0 1.25rem;
        }
        .tcn-hiw-bullets {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-top: 1px solid var(--tcn-border);
          padding-top: 1.25rem;
        }
        .tcn-hiw-bullets li {
          font-size: 0.88rem;
          color: var(--tcn-ink-700);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tcn-hiw-bullets li::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--card-tint);
          flex-shrink: 0;
        }

        /* Why us strip */
        .tcn-hiw-why {
          padding: 4rem 0;
          background: var(--tcn-bg-soft);
        }
        .tcn-hiw-why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          max-width: 1080px;
          margin: 2.5rem auto 0;
        }
        .tcn-hiw-why-card {
          background: #fff;
          border: 1px solid var(--tcn-border);
          border-radius: 16px;
          padding: 1.5rem;
        }
        .tcn-hiw-why-card .ico {
          width: 44px;
          height: 44px;
          border-radius: 11px;
          background: rgba(109,93,252,0.1);
          color: var(--tcn-violet-600);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
        }
        .tcn-hiw-why-card h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--tcn-ink-900);
          margin: 0 0 0.3rem;
        }
        .tcn-hiw-why-card p {
          font-size: 0.85rem;
          color: var(--tcn-ink-500);
          margin: 0;
          line-height: 1.55;
        }
      `}</style>

      <PageHero
        eyebrow="How it works"
        eyebrowIcon={PiPlayCircleDuotone}
        title={
          <>
            From sign-up to first message in{" "}
            <span className="gradient-word">three steps</span>
          </>
        }
        lead={`No long onboarding. No consultants needed. Most teams are live on ${brand} within an hour.`}
      />

      <section className="tcn-hiw-section">
        <div className="container">
          <div className="tcn-hiw-steps">
            {steps.map((s) => (
              <div
                key={s.n}
                className="tcn-hiw-step"
                style={{
                  "--card-tint": s.tint,
                  "--card-tint-soft": `${s.tint}1a`,
                }}
              >
                <span className="tcn-hiw-num">{s.n}</span>
                <div className="tcn-hiw-icon">
                  <s.Icon size={28} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <ul className="tcn-hiw-bullets">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tcn-hiw-why">
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto" }}>
            <span className="eyebrow">Why teams switch</span>
            <h2 style={{ marginTop: "1rem", fontSize: "clamp(1.5rem, 2.5vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Built for the way real teams actually work
            </h2>
          </div>

          <div className="tcn-hiw-why-grid">
            <div className="tcn-hiw-why-card">
              <div className="ico"><PiRocketDuotone size={20} /></div>
              <h4>Setup in 60 seconds</h4>
              <p>No engineering team, no IT ticket. One person can get the whole org running.</p>
            </div>
            <div className="tcn-hiw-why-card">
              <div className="ico"><PiUsersThreeDuotone size={20} /></div>
              <h4>Works the way you work</h4>
              <p>1:1, channels, broadcasts, threads — every conversation shape your team needs.</p>
            </div>
            <div className="tcn-hiw-why-card">
              <div className="ico"><PiChatCircleDotsDuotone size={20} /></div>
              <h4>Calls + AI baked in</h4>
              <p>HD audio/video, AI summaries, smart replies — without juggling four apps.</p>
            </div>
            <div className="tcn-hiw-why-card">
              <div className="ico"><PiSignInDuotone size={20} /></div>
              <h4>Your data stays yours</h4>
              <p>End-to-end encryption on cloud, or self-host on your own infrastructure.</p>
            </div>
          </div>
        </div>
      </section>

      <FinalCta
        eyebrow="Get started"
        eyebrowIcon={PiRocketDuotone}
        title="Ready to onboard your team?"
        description={`Start your free 14-day trial — no credit card. Or book a quick walkthrough with us.`}
        primaryLabel="Start free trial"
        primaryTo="/auth/register"
        secondaryLabel="Book a demo"
        secondaryTo="/demo"
      />
    </div>
  );
};

export default HowItWorks;
