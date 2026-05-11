import React from "react";
import { Link } from "react-router-dom";
import {
  PiChatCircleDotsDuotone,
  PiUsersThreeDuotone,
  PiPhoneCallDuotone,
  PiGearSixDuotone,
  PiBellDuotone,
  PiSparkleDuotone,
  PiPaperPlaneTiltDuotone,
  PiSmileyDuotone,
  PiPaperclipDuotone,
  PiMagnifyingGlassDuotone,
  PiCheckBold,
} from "react-icons/pi";

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container wrapper">
        <div className="content">
          <span
            className="eyebrow fade-up"
            style={{
              background: "rgba(255,213,74,0.12)",
              color: "#ffd54a",
              borderColor: "rgba(255,213,74,0.2)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#ffd54a" }} />
            Built for modern teams
          </span>

          <h1 className="fade-up fade-up-d1" style={{ marginTop: "1.25rem" }}>
            One workspace to{" "}
            <span className="tcn-hero-rotator">
              <span className="tcn-hero-word">Chat</span>
              <span className="tcn-hero-word">Meet</span>
              <span className="tcn-hero-word">Share</span>
              <span className="tcn-hero-word">Create</span>
            </span>
          </h1>

          <p
            className="fade-up fade-up-d2"
            style={{
              color: "rgba(255,255,255,0.78)",
              fontSize: "1.18rem",
              maxWidth: 680,
              margin: "1.5rem auto 2.25rem",
              lineHeight: 1.6,
            }}
          >
            Secure messaging, HD calls, file sharing, and AI assistance — built for teams that move fast and care about privacy.
          </p>

          <div
            className="fade-up fade-up-d3"
            style={{
              display: "flex",
              gap: "0.85rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/auth/register" className="main-btn" style={{ fontSize: "1rem", padding: "0.85rem 1.75rem" }}>
              Start free trial
            </Link>
            <Link
              to="/features"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.85rem 1.5rem",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.95)",
                fontWeight: 600,
                fontSize: "1rem",
                backdropFilter: "blur(8px)",
              }}
            >
              See features →
            </Link>
          </div>

          <div className="trust-strip fade-up fade-up-d3">
            <span className="trust-chip">🔒 AES-256-GCM</span>
            <span className="trust-chip">✅ SOC 2 Ready</span>
            <span className="trust-chip">🇪🇺 GDPR Compliant</span>
            <span className="trust-chip">⚡ 99.9% Uptime</span>
            <span className="trust-chip">💚 24/7 Support</span>
          </div>

          <div className="tcn-hero-preview fade-up" style={{ animationDelay: "0.45s" }}>
            <ChatPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

const ChatPreview = () => {
  return (
    <div className="tcn-chat-frame">
      {/* Browser chrome */}
      <div className="tcn-chat-chrome">
        <span className="tcn-chrome-dot" style={{ background: "#ff5f57" }} />
        <span className="tcn-chrome-dot" style={{ background: "#febc2e" }} />
        <span className="tcn-chrome-dot" style={{ background: "#28c840" }} />
        <div className="tcn-chrome-url">
          <span style={{ opacity: 0.55 }}>🔒</span> app.thechatnest.com
        </div>
      </div>

      <div className="tcn-chat-body">
        {/* Sidebar rail */}
        <aside className="tcn-chat-rail">
          <div className="tcn-rail-logo">
            <span>TCN</span>
          </div>
          <button className="tcn-rail-btn active"><PiChatCircleDotsDuotone size={20} /></button>
          <button className="tcn-rail-btn"><PiUsersThreeDuotone size={20} /></button>
          <button className="tcn-rail-btn"><PiPhoneCallDuotone size={20} /></button>
          <button className="tcn-rail-btn"><PiSparkleDuotone size={20} /></button>
          <button className="tcn-rail-btn"><PiBellDuotone size={20} /></button>
          <div style={{ flex: 1 }} />
          <button className="tcn-rail-btn"><PiGearSixDuotone size={20} /></button>
        </aside>

        {/* Chat list */}
        <aside className="tcn-chat-list">
          <div className="tcn-list-head">
            <div style={{ fontWeight: 700, fontSize: 14 }}>Inbox</div>
            <div className="tcn-list-search">
              <PiMagnifyingGlassDuotone size={14} />
              <span>Search…</span>
            </div>
          </div>
          {[
            { i: "AS", n: "Aanya Sharma", m: "Just pushed the new pricing page 🚀", t: "now", b: true, c: "#6d5dfc" },
            { i: "RK", n: "Rohan Kapoor", m: "Can we hop on a quick call?", t: "2m", b: true, c: "#22c55e" },
            { i: "DT", n: "Design Team", m: "Meera: shared 3 mockups", t: "12m", b: false, c: "#ec4899" },
            { i: "EN", n: "Engineering", m: "Build passed ✓ Deploy ready", t: "1h", b: false, c: "#0ea5e9" },
            { i: "HR", n: "HR Updates", m: "Holiday calendar attached", t: "3h", b: false, c: "#f59e0b" },
          ].map((row, i) => (
            <div key={i} className={`tcn-list-row ${i === 0 ? "active" : ""}`}>
              <div className="tcn-list-avatar" style={{ background: row.c }}>{row.i}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="tcn-list-row-top">
                  <span className="tcn-list-name">{row.n}</span>
                  <span className="tcn-list-time">{row.t}</span>
                </div>
                <div className="tcn-list-msg">{row.m}</div>
              </div>
              {row.b && <span className="tcn-list-dot" />}
            </div>
          ))}
        </aside>

        {/* Conversation */}
        <main className="tcn-chat-conv">
          <header className="tcn-conv-head">
            <div className="tcn-list-avatar" style={{ background: "#6d5dfc", width: 36, height: 36, fontSize: 12 }}>AS</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Aanya Sharma</div>
              <div style={{ fontSize: 11, color: "#22c55e", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "#22c55e" }} /> Online
              </div>
            </div>
            <button className="tcn-icon-btn"><PiPhoneCallDuotone size={16} /></button>
            <button className="tcn-icon-btn"><PiSparkleDuotone size={16} /></button>
          </header>

          <div className="tcn-conv-body">
            <div className="tcn-msg-day">Today</div>

            <div className="tcn-msg in">
              <div className="tcn-bubble">Hey! Did you get a chance to review the new pricing page? 👀</div>
              <div className="tcn-meta">10:42</div>
            </div>

            <div className="tcn-msg out">
              <div className="tcn-bubble">Yes — looking great. The new card hierarchy is much clearer.</div>
              <div className="tcn-meta">
                10:43 <PiCheckBold size={11} /><PiCheckBold size={11} style={{ marginLeft: -6 }} />
              </div>
            </div>

            <div className="tcn-msg in">
              <div className="tcn-bubble">Awesome 🎉 I'll push it to staging now.</div>
              <div className="tcn-meta">10:44</div>
            </div>

            <div className="tcn-msg in">
              <div className="tcn-bubble file">
                <div className="tcn-file-icon">📎</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>pricing-spec-v2.pdf</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>1.4 MB · PDF</div>
                </div>
              </div>
              <div className="tcn-meta">10:45</div>
            </div>

            <div className="tcn-msg out">
              <div className="tcn-bubble ai">
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#ffd54a", marginBottom: 4 }}>
                  <PiSparkleDuotone size={12} /> AI summary
                </div>
                3 plans · Yearly saves 20% · Trial requires no card.
              </div>
              <div className="tcn-meta">
                10:46 <PiCheckBold size={11} /><PiCheckBold size={11} style={{ marginLeft: -6 }} />
              </div>
            </div>

            <div className="tcn-typing">
              <div className="tcn-list-avatar" style={{ background: "#6d5dfc", width: 22, height: 22, fontSize: 9 }}>AS</div>
              <div className="tcn-typing-bubble">
                <span /><span /><span />
              </div>
            </div>
          </div>

          <footer className="tcn-conv-input">
            <button className="tcn-icon-btn"><PiPaperclipDuotone size={16} /></button>
            <div className="tcn-input-field">Type a message…</div>
            <button className="tcn-icon-btn"><PiSmileyDuotone size={16} /></button>
            <button className="tcn-send-btn"><PiPaperPlaneTiltDuotone size={16} /></button>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Hero;
