import React from "react";

const V2Quote = () => {
  return (
    <section className="v2-quote">
      <span className="v2-quote-mark">&ldquo;</span>
      <div className="v2-quote-body">
        <blockquote className="v2-fade">
          We replaced{" "}
          <span className="accent">four subscriptions</span>{" "}
          with TheChatNest and our engineering team finally stopped
          tab-juggling. The AI summaries alone saved us 9 hours of standup
          recaps a week.
        </blockquote>
        <div className="attribution v2-fade d2">
          <strong>Meera Iyer</strong>
          <span>VP Engineering · Folio Studio</span>
          <span>50-person remote team · India</span>
        </div>
      </div>
    </section>
  );
};

export default V2Quote;
