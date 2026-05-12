import React from "react";

// Hero "field guide" — a magazine-style proof strip that grounds the giant
// editorial headline above with concrete, tactile details. Sits between
// V2Hero and V2Marquee.
const V2Field = () => {
  return (
    <section className="v2-field" aria-label="Quick field guide">
      <div className="v2-wrap">
        <div className="v2-field-rule" aria-hidden />

        <header className="v2-field-head">
          <span className="v2-mono v2-mono-gold">FIELD GUIDE · 01</span>
          <h2 className="v2-field-title">
            Built like a tool — <em>not a deck</em>.
          </h2>
          <p className="v2-field-sub">
            Four things every visitor asks within the first ten seconds.
            Here they are, without you having to scroll for them.
          </p>
        </header>

        <div className="v2-field-grid">
          {/* 1. Keyboard shortcuts */}
          <article className="v2-field-card">
            <div className="v2-field-card-head">
              <span className="v2-mono v2-mono-gold">01 · MOTION</span>
              <h3>Keyboard-first</h3>
            </div>
            <ul className="v2-field-kbd-list">
              <li>
                <span>Quick switcher</span>
                <kbd>⌘</kbd><kbd>K</kbd>
              </li>
              <li>
                <span>New chat</span>
                <kbd>⌘</kbd><kbd>N</kbd>
              </li>
              <li>
                <span>Toggle thread</span>
                <kbd>⌘</kbd><kbd>T</kbd>
              </li>
              <li>
                <span>Mark all read</span>
                <kbd>⇧</kbd><kbd>Esc</kbd>
              </li>
            </ul>
            <p className="v2-field-card-foot">
              Designed for hands that never leave the keyboard.
            </p>
          </article>

          {/* 2. Install command */}
          <article className="v2-field-card">
            <div className="v2-field-card-head">
              <span className="v2-mono v2-mono-gold">02 · INSTALL</span>
              <h3>Self-host in 30s</h3>
            </div>
            <pre className="v2-field-code" aria-label="One-liner install">
              <code>
                <span className="prompt">$</span>{" "}
                <span className="cmd">docker run -d</span>{" "}
                <span className="flag">-p</span> 443:443{" "}
                <span className="flag">--name</span> chatnest \
                {"\n    "}
                <span className="flag">-e</span> DOMAIN=team.acme.dev \
                {"\n    "}
                <span className="img">thechatnest/server:latest</span>
              </code>
            </pre>
            <p className="v2-field-card-foot">
              One Docker pull. Your data, your hardware, your call.
            </p>
          </article>

          {/* 3. Platforms */}
          <article className="v2-field-card">
            <div className="v2-field-card-head">
              <span className="v2-mono v2-mono-gold">03 · REACH</span>
              <h3>Everywhere your team is</h3>
            </div>
            <ul className="v2-field-plat">
              <li><span className="dot ok" /> macOS · 12+</li>
              <li><span className="dot ok" /> Windows · 10/11</li>
              <li><span className="dot ok" /> Linux · deb · rpm · AppImage</li>
              <li><span className="dot ok" /> iOS · 15+</li>
              <li><span className="dot ok" /> Android · 10+</li>
              <li><span className="dot ok" /> Web · any modern browser</li>
            </ul>
            <p className="v2-field-card-foot">
              Six surfaces. One conversation. Zero context loss.
            </p>
          </article>

          {/* 4. Security */}
          <article className="v2-field-card">
            <div className="v2-field-card-head">
              <span className="v2-mono v2-mono-gold">04 · TRUST</span>
              <h3>What's under the hood</h3>
            </div>
            <dl className="v2-field-spec">
              <div>
                <dt>At rest</dt>
                <dd>AES-256 (GCM)</dd>
              </div>
              <div>
                <dt>In transit</dt>
                <dd>TLS 1.3 · HSTS</dd>
              </div>
              <div>
                <dt>Auth</dt>
                <dd>JWT + OTP + 2FA-ready</dd>
              </div>
              <div>
                <dt>Audit</dt>
                <dd>Append-only activity log</dd>
              </div>
              <div>
                <dt>Privacy</dt>
                <dd>GDPR-aligned by design</dd>
              </div>
              <div>
                <dt>Data sold</dt>
                <dd>0 — ever, anywhere</dd>
              </div>
            </dl>
            <p className="v2-field-card-foot">
              Honest specs. No vague "enterprise-grade" hand-waving.
            </p>
          </article>
        </div>

        <div className="v2-field-rule" aria-hidden />
      </div>
    </section>
  );
};

export default V2Field;
