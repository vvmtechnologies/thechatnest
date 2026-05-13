-- 105_seed_v2026_05_features.sql
--
-- Seed the features shipped in the May 2026 polish pass into the public
-- feature_items catalog. Idempotent — uses
-- (feature_category_id, title) ON CONFLICT DO NOTHING.

-- ─── Productivity (Tools hub + in-app utilities) ───────────────────────────
INSERT INTO feature_items (feature_category_id, title, description, display_order, status)
SELECT fc.feature_category_id, t.title, t.description, t.display_order, 'active'
FROM feature_categories fc, (VALUES
  ('Tools Hub (20 utilities)',
   'A dedicated in-app workspace with 20 client-side tools — JSON / YAML / CSV converters, regex tester, color converter, password generator, JWT decoder, hash generator, timezone converter, word counter, Unix timestamp converter, meeting cost calculator and more. Everything runs in your browser, nothing is sent to a server.',
   300),
  ('Meeting Cost Calculator',
   'Plug in team size, hourly rate and duration to see what each meeting actually costs — plus a yearly impact projection if you replaced it with an async voice note.',
   301),
  ('Markdown Preview in Composer',
   'Toggle a preview of how your message will render — headings, bold, italics, code blocks, lists, links — before you hit send.',
   302)
) AS t(title, description, display_order)
WHERE fc.category_key = 'productivity'
ON CONFLICT (feature_category_id, title) DO NOTHING;

-- ─── Security ──────────────────────────────────────────────────────────────
INSERT INTO feature_items (feature_category_id, title, description, display_order, status)
SELECT fc.feature_category_id, t.title, t.description, t.display_order, 'active'
FROM feature_categories fc, (VALUES
  ('Strong Password Generator',
   'One-tap crypto-random password generator in Settings → Change Password. Configurable length and character set, live strength meter, copy-to-clipboard, ambiguous chars excluded for readability.',
   300),
  ('JWT Decoder',
   'Paste any JWT to see header, payload, issued-at and expiry instantly — invaluable when debugging auth flows.',
   301),
  ('Hash Generator (MD5 / SHA-1/256/512)',
   'Compute file or text hashes locally in the browser. Useful for verifying downloads, signing tokens, or comparing payloads.',
   302)
) AS t(title, description, display_order)
WHERE fc.category_key = 'security'
ON CONFLICT (feature_category_id, title) DO NOTHING;

-- ─── Messaging ─────────────────────────────────────────────────────────────
INSERT INTO feature_items (feature_category_id, title, description, display_order, status)
SELECT fc.feature_category_id, t.title, t.description, t.display_order, 'active'
FROM feature_categories fc, (VALUES
  ('Share Meeting via QR',
   'Every upcoming meeting card has a "Share via QR" button — generates a scannable QR for the join link, complete with download-as-PNG.',
   300),
  ('Share My Contact via QR',
   'Tap the + menu in chat list → "Share my QR" — anyone scans to land on /auth/register with your invite pre-filled.',
   301),
  ('Chat Empty-State Tips',
   'When you have no conversations yet, the chat panel suggests three concrete next steps — 1-on-1 chat, create group, invite teammates — so first-run feels guided.',
   302)
) AS t(title, description, display_order)
WHERE fc.category_key = 'messaging'
ON CONFLICT (feature_category_id, title) DO NOTHING;

-- ─── Mobile & Desktop / UX polish ─────────────────────────────────────────
INSERT INTO feature_items (feature_category_id, title, description, display_order, status)
SELECT fc.feature_category_id, t.title, t.description, t.display_order, 'active'
FROM feature_categories fc, (VALUES
  ('Scroll-Down Floating Button',
   'On the marketing site, a gold scroll-down FAB appears near the top of the page and gracefully swaps with the scroll-up button as you scroll.',
   400),
  ('Light / Dark Aware Components',
   'Meeting invite cards, date/time pickers and chat surfaces now respect both light and dark themes — no more white-on-white invisible content.',
   401)
) AS t(title, description, display_order)
WHERE fc.category_key = 'mobile_desktop'
ON CONFLICT (feature_category_id, title) DO NOTHING;
