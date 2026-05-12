import React from "react";

// "A day in the nest" — an editorial timeline of a typical work-day inside
// TheChatNest. Sits between V2Anatomy and V2Quote.
const MOMENTS = [
  {
    time: "08:42",
    tag: "morning",
    title: "Coffee, then catch-up",
    body:
      "Your AI summary of the 142 messages you missed overnight is waiting at the top of the inbox. Read it in 90 seconds. Star three threads. Move on.",
    accent: "gold",
  },
  {
    time: "10:15",
    tag: "deep work",
    title: "Do Not Disturb, automatically",
    body:
      "Calendar says you're heads-down for two hours. Notifications mute themselves. Anyone urgent can override with a single tap — but only twice a week.",
    accent: "violet",
  },
  {
    time: "13:00",
    tag: "midday",
    title: "Standup, but better",
    body:
      "Instead of a 30-min call, three async voice notes in #eng-standup. Auto-transcribed. Searchable forever. The new hire from Bratislava replays at her own time.",
    accent: "gold",
  },
  {
    time: "15:30",
    tag: "ship",
    title: "Ship, review, celebrate",
    body:
      "PR merged. Bot drops the release note into #launches. Custom emoji shower. Someone @-mentions you in a thread — you reply from your phone, on the metro.",
    accent: "violet",
  },
  {
    time: "18:45",
    tag: "sunset",
    title: "Hand off, log off",
    body:
      "Mark unread on tomorrow's blockers. The app politely greys itself. Your laptop sleeps. Your team in San Francisco is just waking up — they pick up where you left.",
    accent: "gold",
  },
];

const V2Day = () => {
  return (
    <section className="v2-day" aria-label="A day in the nest">
      <div className="v2-wrap">
        <header className="v2-day-head">
          <div className="v2-day-head-left">
            <span className="v2-mono v2-mono-gold">CHAPTER · 02</span>
            <h2 className="v2-day-title">
              A day <em>in the nest</em>.
            </h2>
          </div>
          <p className="v2-day-sub">
            Real workflows from real teams. No screenshots —
            because the moment a screenshot ships, it's already out of date.
          </p>
        </header>

        <ol className="v2-day-timeline">
          {MOMENTS.map((m, i) => (
            <li
              key={m.time}
              className={`v2-day-moment ${m.accent === "violet" ? "is-violet" : "is-gold"} ${
                i % 2 === 1 ? "is-right" : "is-left"
              }`}
            >
              <div className="v2-day-spine" aria-hidden>
                <span className="v2-day-dot" />
              </div>
              <article className="v2-day-card">
                <div className="v2-day-card-head">
                  <span className="v2-day-time">{m.time}</span>
                  <span className="v2-day-tag">{m.tag}</span>
                </div>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
                <div className="v2-day-edge" aria-hidden />
              </article>
            </li>
          ))}
        </ol>

        <footer className="v2-day-foot">
          <span className="v2-mono v2-mono-gold">END · CHAPTER 02</span>
          <p>
            The point isn't more features. It's <em>fewer interruptions</em>{" "}
            for the work that actually matters.
          </p>
        </footer>
      </div>
    </section>
  );
};

export default V2Day;
