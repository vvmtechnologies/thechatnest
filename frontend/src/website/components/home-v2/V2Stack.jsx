import React from "react";

// "What we replace" — brutal honesty about cost.
// All prices are illustrative listings teams typically pay (per user / month).
const ROWS = [
  { idx: "01", name: "Slack",        replaces: "team chat",       price: "$8.75" },
  { idx: "02", name: "Zoom Pro",     replaces: "audio + video",   price: "$15.00" },
  { idx: "03", name: "Google Drive", replaces: "file sharing",    price: "$6.00" },
  { idx: "04", name: "Otter.ai",     replaces: "meeting notes",   price: "$10.00" },
  { idx: "05", name: "ChatGPT Team", replaces: "AI assistant",    price: "$25.00" },
];

const V2Stack = () => {
  return (
    <section className="v2-stack">
      <div className="v2-wrap">
        <div className="v2-stack-head">
          <h2 className="v2-fade">
            Replaces <em>five</em><br />tools.
          </h2>
          <p className="v2-fade d2">
            The average growing team pays roughly{" "}
            <strong style={{ color: "var(--v2-gold)" }}>$64.75</strong>{" "}
            per user, per month, across messaging, calls, storage, transcription
            and AI. We do that work — but in one place, for the price of one.
          </p>
        </div>

        <div className="v2-stack-table">
          {/* Column headers */}
          <div className="v2-stack-row">
            <div className="idx">#</div>
            <div className="idx" style={{ borderBottomStyle: "solid" }}>
              VENDOR
            </div>
            <div className="idx">DOES</div>
            <div className="idx" style={{ justifyContent: "flex-end" }}>
              /SEAT/MO
            </div>
          </div>

          {ROWS.map((r) => (
            <div className="v2-stack-row v2-fade" key={r.idx}>
              <div className="idx">{r.idx}</div>
              <div className="name">
                <s>{r.name}</s>
              </div>
              <div className="replaces">{r.replaces}</div>
              <div className="price">{r.price}</div>
            </div>
          ))}

          <div className="v2-stack-totalrow">
            <div className="label">YOU&apos;RE PAYING</div>
            <div className="total">
              <s>$64.75</s>
              <b>$2.39</b>
              <small
                style={{
                  fontFamily: "var(--v2-font-mono)",
                  fontSize: 12,
                  alignSelf: "flex-end",
                  marginLeft: 8,
                  marginBottom: 6,
                  color: "rgba(244,240,232,0.55)",
                }}
              >
                /seat/mo
              </small>
            </div>
          </div>
        </div>

        <div className="v2-stack-savings">
          &lt;&lt;&nbsp; that&apos;s <b>96.3% less</b> for a 50-person team —
          ~$37,400 saved a year.
        </div>
      </div>
    </section>
  );
};

export default V2Stack;
