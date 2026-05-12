import React from "react";

const V2Quote = () => {
  return (
    <section className="v2-quote">
      <span className="v2-quote-mark">&ldquo;</span>
      <div className="v2-quote-body">
        <blockquote className="v2-fade">
          One workspace for{" "}
          <span className="accent">chat, calls, files, and AI</span>{" "}
          — without sending your team's conversations to a third-party
          server you can't audit. That's the whole pitch.
        </blockquote>
        <div className="attribution v2-fade d2">
          <strong>Built for teams that care about their data</strong>
          <span>Self-hosted or cloud · Your choice</span>
          <span>Start free for 14 days — no credit card</span>
        </div>
      </div>
    </section>
  );
};

export default V2Quote;
