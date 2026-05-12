import React from "react";

const LEFT_FEATURES = [
  {
    idx: "F.01",
    title: "Threaded channels",
    desc: "Topic-first, not noisy. Slash-commands you can teach your team in five minutes.",
  },
  {
    idx: "F.02",
    title: "AI that reads context",
    desc: "Summaries, drafts and search trained on what your team actually says — not the internet.",
  },
  {
    idx: "F.03",
    title: "HD calls in-thread",
    desc: "Hop on a call from any channel. Notes auto-attach when the call ends.",
  },
];

const RIGHT_FEATURES = [
  {
    idx: "F.04",
    title: "Sealed file transfer",
    desc: "Drag any file. Encrypted at rest in AES-256-GCM, audit log entry per access.",
  },
  {
    idx: "F.05",
    title: "Role-aware permissions",
    desc: "RBAC, SSO/SAML, per-channel guests, device caps — what your CISO asked for.",
  },
  {
    idx: "F.06",
    title: "Self-host in 30 minutes",
    desc: "One bundle. Your servers, your keys, your data sovereignty.",
  },
];

const V2Anatomy = () => {
  return (
    <section className="v2-anatomy">
      <div className="v2-wrap">
        <div className="v2-anatomy-head">
          <div className="v2-mono v2-fade">FIG. 03 — ANATOMY OF A WORKSPACE</div>
          <h2 className="v2-fade d2">
            Six moving parts. One <em>quiet</em> workspace.
          </h2>
        </div>

        <div className="v2-anatomy-board v2-fade d3">
          {/* LEFT column callouts */}
          <div className="v2-anatomy-callout">
            {LEFT_FEATURES.map((f) => (
              <div className="v2-anatomy-feature" key={f.idx}>
                <span className="idx">{f.idx}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
                <span className="leader" />
              </div>
            ))}
          </div>

          {/* CENTER illustration — stylized chat window */}
          <div className="v2-anatomy-figure">
            <div className="v2-anatomy-figure-bar">
              <i /><i /><i />
              <span>app.thechatnest.com — #design</span>
            </div>
            <div className="v2-anatomy-figure-body">
              <div className="v2-anatomy-bubble in">
                <span className="who">Aanya</span>
                Hey — the new pricing page looks great. ✦
              </div>
              <div className="v2-anatomy-bubble out">
                <span className="who">You</span>
                Pushed to staging. Run the audit?
              </div>
              <div className="v2-anatomy-bubble in">
                <span className="who">AI · Summary</span>
                3 new threads. 1 needs a decision.
              </div>
              <div className="v2-anatomy-bubble out">
                <span className="who">You</span>
                Ship it.
              </div>
            </div>
            <div className="v2-anatomy-figure-input">
              <span>›</span>
              <span style={{ flex: 1 }}>Write a message…</span>
              <span className="send">↑</span>
            </div>
            <div className="v2-anatomy-figure-stamp">SHIPPING · 2026</div>
          </div>

          {/* RIGHT column callouts */}
          <div className="v2-anatomy-callout right">
            {RIGHT_FEATURES.map((f) => (
              <div className="v2-anatomy-feature" key={f.idx}>
                <span className="idx">{f.idx}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
                <span className="leader" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default V2Anatomy;
