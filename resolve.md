# 📋 Resolve Backlog — TheChatNest

> Tracking list of known issues + planned fixes. Created 2026-05-31. Last update: 2026-05-31.
> Format: `[ ]` = pending, `[x]` = done. Add notes inline as work progresses.

---

## ✅ Shipped — 2026-05-31 (Tier A — safe, no breaking changes)

- [x] **Mobile dev blocker: datetimepicker bundle error** — Replaced `@react-native-community/datetimepicker` with a pure-JS `SimpleDateTimePicker.js` (FlatList scroll wheels). Zero native deps; works in Expo Go on Windows.
  - New: `mobileapp/src/components/SimpleDateTimePicker.js`
  - Updated imports: `mobileapp/app/meetings/create.js`, `mobileapp/app/meetings/[id].js`
  - Removed config plugin entry from `mobileapp/app.json`

- [x] **JWT algorithm pinning (HS256)** — Forged `alg:none` tokens now reject.
  - `backend/src/utils/jwt.js` — sign + new `verifyToken()` helper
  - `backend/src/middlewares/auth.js`
  - `backend/src/controllers/authController.js:362` (password-reset verify)
  - `backend/src/socket/index.js:325, 904` (socket handshake + refresh)

- [x] **`/diag/*` endpoints gated** — Wrapped in `if (NODE_ENV !== 'production')`. Dev unchanged, prod no longer leaks PII / OTP codes.
  - `backend/src/app.js`

- [x] **Hardcoded DB credentials removed** from seed scripts. Env-only with fail-fast error if `DATABASE_URL` missing.
  - `backend/scripts/run-106-seed.mjs`
  - `backend/scripts/run-107-seed.mjs`
  - `backend/scripts/check-users.mjs`

- [x] **Gemini API key → `x-goog-api-key` request header** instead of `?key=` URL parameter (no longer logged in proxy logs / referers).
  - `backend/src/controllers/liveAssistantController.js:102`

- [x] **Account enumeration fix** — `forgotPassword` and `resendOtp` now return identical generic 200 response regardless of whether email is registered or already verified.
  - `backend/src/controllers/authController.js:739-861, 863-1004`
  - Real work only runs for valid users; unknown emails get synthetic-but-identical payload + "If an account exists..." message.

- [x] **bcrypt rounds 10 → 12** (5 call sites). Only new hashes affected; existing logins keep working.
  - `backend/src/controllers/authController.js`

- [x] **Refresh token reuse grace 5s → 1s** — Compromised refresh-token detection window shrunk.
  - `backend/src/controllers/authController.js:112`

- [x] **Helmet HSTS** configured — 1 year, includeSubDomains, preload-ready.
  - `backend/src/app.js`

- [x] **JSON body limit 50MB → 2MB** — DoS surface area cut. File uploads use multer separately.
  - `backend/src/app.js`

- [x] **`captionHtml` sanitized** via `sanitizeComposerHtml` before `dangerouslySetInnerHTML`.
  - `frontend/src/components/conversation/messages/MessageItem.jsx:352`

- [x] **`.env.example`** real `CHAT_ENCRYPTION_KEY` and `JWT_SECRET` placeholders replaced with `<generate-with-the-command-above>` + inline instructions. `REFRESH_REUSE_GRACE_SECONDS=1` default.
  - `backend/.env.example`

- [x] **Env validation at startup** — Server now fails fast at boot if `JWT_SECRET` missing or matches known-placeholder strings (`change_this_secret`, `test`, `secret`, `password`, `changeme`). Warns on short secrets, missing chat encryption key, prod-only required keys. Existing short user secret (`team@#12Chatx`) still boots with a warning.
  - `backend/src/server.js`

- [x] **Stripe / PayPal webhook signature verification** — N/A — no webhook routes exist for either gateway. Both use polling/confirm-by-id flow. Razorpay's webhook signature is already correctly verified via `crypto.timingSafeEqual`.

---

## 🔥 Remaining dev blockers

- [ ] **WebRTC subpath warning (non-fatal)**
  - `Attempted to import the module "react-native-webrtc/node_modules/event-target-shim/index" which is not listed in the "exports"`
  - Cosmetic. Add `metro.config.js` with `resolver.unstable_enablePackageExports = false` to silence, or wait for upstream fix.

---

## 🟠 Tier B — Maintenance window / migration required

These are safe technically but cause user-visible side effects (forced logout, schema changes, browser compat testing). Schedule each behind announcement / off-hours deploy.

- [ ] **B1: Rotate JWT secret** `team@#12Chatx`
  - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
  - Update `backend/.env` `JWT_SECRET=<new-value>` on Render
  - ⚠️ **All users logged out** — schedule maintenance window + in-app banner ("Please log in again after our security update at HH:MM")
  - Boot will warn until rotated (env-validation flag in `server.js`).

- [ ] **B2: SMTP password encrypt-at-rest in DB**
  - File: `backend/src/models/smtpSettingsModel.js:18` (`smtp_pass VARCHAR(255)` column)
  - Migration plan:
    1. Add `smtp_pass_encrypted BYTEA` column
    2. Backfill: for each existing row, encrypt `smtp_pass` with AES-256-GCM (key from env)
    3. Update `smtpSettingsModel.findActive()` / `update()` to read/write encrypted column
    4. After 1 release cycle, drop the plaintext column
  - Encryption pattern: copy from `backend/src/utils/paymentGatewaySecrets.js`

- [ ] **B4: Hash refresh tokens before DB store**
  - File: `backend/src/utils/jwt.js:29-35` — `hashToken()` defined but unused at storage time
  - Migration: add `refresh_token_hash` column to `refresh_tokens` table, store SHA-256 hash instead of raw token
  - ⚠️ **All existing refresh tokens become invalid** — users logged out on next refresh
  - Coordinate with B1 so the forced logout happens once, not twice

- [ ] **B5: OTP brute-force harden**
  - File: `backend/src/controllers/authController.js:1571-1600` + `backend/src/utils/rateLimiters.js:27`
  - Reduce attempts/OTP from 5 → 3
  - Add per-email cap: 2 total OTP-verify attempts across all OTPs in 1 hour
  - Exponential backoff (1s, 5s, 30s) between attempts
  - ⚠️ Test with users on flaky networks — too-aggressive can lock out legit users

- [ ] **B6: Password reset token revocation**
  - File: `backend/src/controllers/authController.js:351, 1134-1139`
  - Migration: new `revoked_tokens` table (`token_hash VARCHAR PRIMARY KEY, revoked_at TIMESTAMPTZ, purpose VARCHAR`)
  - On successful password reset, insert hash → reject if same token reused
  - Background job to prune expired entries

- [ ] **B7: Frontend — remove `localStorage` fallback for JWT**
  - Files: `frontend/src/utils/auth.js:80`, `frontend/src/utils/authApi.js:14-22`
  - Currently falls back to plaintext localStorage if secureStorage unavailable (XSS-stealable)
  - Fix: fail login with friendly error if secureStorage unavailable
  - ⚠️ Browser-compat testing required: Safari private mode, old Chrome, in-app browsers (LinkedIn, Instagram)
  - Decide: hard-fail (more secure) vs degrade with banner ("Your browser doesn't support secure storage — please use Chrome/Firefox")

---

## 🔴 Tier C — Regression risk, separate sprint

Each needs design + QA cycle. Don't fold into a routine sprint.

- [ ] **CSP header rollout**
  - File: `frontend/index.html` + backend response headers
  - **Must run in report-only mode for 1-2 weeks first** (`Content-Security-Policy-Report-Only`)
  - Whitelist: Google Analytics, Tawk, Razorpay checkout SDK, inline styles from MUI
  - Enforce after report-only catches all violations

- [ ] **Cookie `sameSite='strict'` in production**
  - File: `backend/src/utils/httpCookies.js:53` (currently `'none'` when `secure=true`)
  - ⚠️ Will break OAuth redirect flows (Stripe / PayPal / Razorpay return URLs)
  - Test plan: walk through every payment flow + every external link return path

- [ ] **DOMPurify XSS overhaul** — replace custom `richTextSanitizer` with battle-tested DOMPurify
  - Files: `frontend/src/components/conversation/messages/TextMsg.jsx:426`, `LiveAssistant/index.jsx:176`, `MessageItem.jsx:659` (✓ already calls `sanitizeComposerHtml` after the patch above), `dashboard/tools/impl/design.jsx:191`, `MarkdownPreviewDialog.jsx:319`
  - Install DOMPurify, configure allow-list (similar to existing `richTextSanitizer`)
  - Sanitize the FINAL merged HTML (after mention injection), not just the original
  - ⚠️ Heavy QA — over-sanitization breaks existing valid messages; test mentions, links, formatting, lists, blockquotes

- [ ] **QR login CSRF + IP/UA binding**
  - File: `backend/src/controllers/authController.js:5068-5222`
  - Bind `qrConfirm` request to same IP / User-Agent as `qrGenerate` — reject mismatch
  - Add CSRF token to QR-status polling
  - Make QR token one-time-use immediately after `qrConfirm` (no replay window)
  - Edge cases: mobile/desktop on different networks, VPN switches, corporate proxies

- [ ] **zod / joi adoption for input validation**
  - Across all 40+ controllers in `backend/src/controllers/`
  - Replace scattered `Number(req.body.x)` / manual checks with declarative schemas
  - Change response error shape — frontend `authApi.js` + every page's error handling needs adjustment
  - **Massive refactor** — dedicate 1-2 sprints, do it module-by-module behind feature flag

---

## 🟢 Smaller follow-ups (P3 — drop into any sprint)

- [ ] CSRF token per-session regeneration (`backend/src/utils/httpCookies.js:97`)
- [ ] Webhook replay protection — timestamp window + idempotency key for Razorpay
- [ ] CSRF exemption audit — remove `/billing`, `/upload` from `CSRF_EXEMPT_PREFIXES` if they accept cookies
- [ ] CORS dev allow-list: require explicit env, not blanket localhost/192.168.* (`backend/src/app.js:64`)
- [ ] Mobile: proactive token rotation on AppState 'active' (instead of only on 401)
- [ ] Verify `generateTemporaryPassword()` uses `crypto.randomBytes` not `Math.random`
- [ ] SVG chat uploads: serve with `Content-Disposition: attachment` to prevent XSS
- [ ] Whitelist table/column names map instead of template-literal SQL (`backend/src/socket/index.js:1132`)
- [ ] Org isolation: validate `organization_id` membership early in `/auth/me` switch
- [ ] Logout: await socket disconnect ACK
- [ ] QR session cleanup job — periodic prune of expired rows
- [ ] Mobile permissions: verify each is feature-gated, not requested upfront
- [ ] SMTP env-vs-DB precedence: document, consider deprecating env fallback in production
- [ ] Password reset OTP: explicit purpose validation in resetPassword

---

## 🛠️ Feature Gaps — Chat

- [ ] Read receipts (M)
- [ ] Typing indicators (S)
- [ ] Threaded replies / nested threads (L)
- [ ] Message edit history view (M)
- [ ] Rich-text formatting toolbar (WYSIWYG) (M)
- [ ] Full-text message search with filters (from/to/date/reactions) (L)
- [ ] Draft auto-save (S)
- [ ] Slash commands engine (`/remind`, `/search`, `/invite`, custom) (L)
- [ ] Message reminders ("remind me about this in 2h") (M)
- [ ] Retention policy UI (auto-delete old messages) (M)
- [ ] Disappearing messages polish (S)
- [ ] Thread @-mention notify only (not all replies) (S)
- [ ] Custom reaction packs (S)

---

## 🛠️ Feature Gaps — Meetings

- [ ] Server-side recording (L)
- [ ] Live transcription (L)
- [ ] Live captions for accessibility (L)
- [ ] Virtual backgrounds (M)
- [ ] Breakout rooms (L)
- [ ] Whiteboard (collaborative sketching) (L)
- [ ] Meeting polls / quizzes (M)
- [ ] ICS calendar export (S)
- [ ] AI meeting summary (action items + decisions) (L)
- [ ] Screen-share annotations (M)
- [ ] Waiting-room admit/deny (backend events missing — `meeting:host:admit`/`deny`)
- [ ] Audio device picker — Bluetooth/Speaker/Earpiece (needs `react-native-incall-manager` + EAS prebuild)
- [ ] Picture-in-Picture (Android) (needs `react-native-pip-android` + EAS prebuild)

---

## 🛠️ Feature Gaps — Admin / Compliance / Enterprise

- [ ] Detailed audit logs (M)
- [ ] Granular RBAC (channel/file-level perms) (L)
- [ ] SAML/SSO integration (L)
- [ ] SCIM user provisioning (L)
- [ ] Custom branding / white-label (M)
- [ ] Bulk data export (GDPR right-to-be-forgotten) (L)
- [ ] IP allow-list (M)
- [ ] Session management (view/revoke devices) (M)
- [ ] Usage analytics dashboard (M)
- [ ] MFA enforcement policy per org (S)
- [ ] Secrets vault per organization (M)
- [ ] Data residency controls (L)
- [ ] DLP (block CC#, SSN, API key patterns) (L)
- [ ] Legal hold (M)
- [ ] Billing alerts at usage thresholds (S)
- [ ] Retention policies UI (M)
- [ ] Profanity filter config (S)
- [ ] Per-org API rate limits (M)

---

## 🛠️ Feature Gaps — Mobile

- [ ] Offline mode (queue + reconcile) (L)
- [ ] Biometric unlock — Face/fingerprint (M)
- [ ] Push notifications via Expo Push (S)
- [ ] Home-screen widgets (unread badge) (M)
- [ ] Share-to-app (forward from other apps) (S)
- [ ] Apple Watch companion (L)
- [ ] Background sync (M)

---

## 🛠️ Feature Gaps — Integrations & Automation

- [ ] Slack workspace import (L)
- [ ] Google Workspace integration (Meet/Calendar/Drive) (M)
- [ ] Microsoft 365 integration (Teams/OneDrive) (M)
- [ ] Notion / Coda block embeds (M)
- [ ] GitHub / GitLab PR webhooks (M)
- [ ] Linear / Jira issue tracker sync (M)
- [ ] Zoom / Google Meet fallback join (S)
- [ ] Webhooks / custom bots framework (L)
- [ ] Zapier / IFTTT connector (M)
- [ ] Public REST API + docs + SDKs (L)
- [ ] Scheduled messages (M)
- [ ] Auto-moderation rules engine (L)

---

## 🛠️ Feature Gaps — Marketing Site

- [ ] Changelog / release notes page (S)
- [ ] Blog with tagging + SEO (M)
- [ ] Dark mode for marketing pages (S)
- [ ] Integrations directory page (M)
- [ ] Multi-language (i18n) (L)

---

## 🛠️ Feature Gaps — Owner Tools (`/app/tools`)

- [ ] Markdown editor with live preview (S)
- [ ] Diagram/flowchart builder (Excalidraw-style) (M)
- [ ] CSV/Excel parser + transformer (S)

---

## 📌 Outstanding manual actions from prior work

- [ ] **Run migration `108_allow_razorpay_in_checkout_sessions.sql`** on Neon production DB (Razorpay checkout was failing without it)
- [ ] **Run migration `109_dedupe_feature_items_ci.sql`** on Neon production DB (fixes duplicate "One-on-One Messaging" on /features page)
- [ ] Deploy backend + frontend with today's security fixes (HSTS, body-limit cap, diag gating, JWT pinning, Gemini header, account-enum fix, bcrypt 12, refresh grace 1s, captionHtml sanitize, env validation)
- [ ] Mobile: build new APK (Meetings tab, screen share, reactions, spotlight, lock, attendance, QR share, edit-meeting, global incoming-invite popup, pure-JS datetime picker)
- [ ] **`.env` git history check** — `git log --all --diff-filter=A -- "**/.env"`; if committed, scrub via `git filter-repo` + rotate AWS / JWT / SMTP / Redis / VAPID / Neon secrets

---

## 🗓️ Recommended order

1. **Deploy now:** All ✅ shipped items in the top section — zero breaking changes.
2. **Next maintenance window (Tier B):** B1 + B4 together (one forced-logout event), then B5/B6 (OTP + reset token), then B2 (SMTP encryption), then B7 (frontend localStorage removal).
3. **Separate sprint (Tier C):** CSP report-only → enforce, DOMPurify swap, QR login rewrite, sameSite=strict, zod adoption.
4. **Ongoing:** Smaller P3 follow-ups, then feature gaps grouped by area.

---

*Last updated: 2026-05-31 — 13 Tier A security fixes shipped, datetimepicker dev blocker resolved.*
