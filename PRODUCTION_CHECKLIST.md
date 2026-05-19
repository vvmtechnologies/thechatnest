# TheChatNest — Production Launch Checklist

Last updated: 2026-05-19

This file is for VVM Technologies Pvt Ltd internal use. Open this on launch day and tick items off as you go.

## Status legend

- ✅ Done in code
- ⏳ Done in code, needs you to flip a dashboard switch / paste an env var
- ❌ Pending — needs work

---

## P0 — Cannot launch without

| # | Item | Status | Where to act |
|---|---|---|---|
| 1 | Privacy Policy at `/privacy` | ✅ wired (canonical route) | — |
| 2 | Terms of Service at `/terms` | ✅ done | — |
| 3 | Refund Policy at `/refund-policy` | ✅ done | — |
| 4 | GDPR + DPDP page at `/gdpr` and `/dpdp` | ✅ wired | — |
| 5 | About page with CIN/GST/MSME | ✅ done | Replace placeholder IDs |
| 6 | Cookie consent banner (GDPR + DPDP) | ✅ wired in `<WebsiteLayout/>` | — |
| 7 | Contact form working (with honeypot + rate limit) | ✅ done | — |
| 8 | SSL/HTTPS | ✅ Vercel auto | — |
| 9 | Sentry error tracking | ⏳ code ready | **Vercel env**: `VITE_SENTRY_DSN=<dsn>` |
| 10 | Google Analytics 4 | ⏳ code ready | `index.html` has `G-R1EX9EP6NN` — verify it's your real GA |
| 11 | Tawk.to live chat | ⏳ code ready | `index.html` has Tawk src — verify it's the right widget |
| 12 | Structured data (JSON-LD) | ✅ Organization + Software + WebSite + FAQ | — |
| 13 | Sitemap.xml auto-generated | ✅ done | — |
| 14 | robots.txt | ✅ done | — |
| 15 | Service Worker chunk-error recovery | ✅ v4 deployed via merge | Merge the open PR |

## P0 — External dashboards (you do these)

| # | Item | Where | Notes |
|---|---|---|---|
| 16 | Verify domain on Google Search Console | search.google.com/search-console | Add `https://www.thechatnest.com` + submit sitemap |
| 17 | Submit to Bing Webmaster Tools | bing.com/webmasters | Bonus search traffic |
| 18 | DKIM + SPF + DMARC for `thechatnest.com` | Hostinger DNS | Mandatory for email deliverability |
| 19 | Add Sentry DSN to Vercel env | Vercel → Project → Settings → Env | `VITE_SENTRY_DSN` |
| 20 | UptimeRobot — monitor `/` + `/health` | uptimerobot.com (free 50 monitors) | Email alerts |
| 21 | Razorpay merchant verification | razorpay.com | Needs PAN + GST + bank account |
| 22 | Trademark file for "TheChatNest" + logo | ipindiaservices.gov.in | File asap, class 9 + 42 |

## P1 — First week (conversion lift)

| # | Item | Status | Notes |
|---|---|---|---|
| 23 | Customer testimonials (3-5) | ❌ | Even beta users — quote + name + role |
| 24 | Customer logo wall ("Trusted by") | ❌ | At least 5 placeholder logos |
| 25 | Live demo recording / Storylane tour | ❌ | Free on storylane.io / arcade.software |
| 26 | OG PNG cover (Twitter/LinkedIn fail on SVG) | ⏳ SVG works modern, PNG safer | Export 1200×630 PNG |
| 27 | Annual billing toggle on `/pricing` | ❌ | "Save 20%" |
| 28 | ROI calculator | ❌ | "Save ₹X switching from Slack" |
| 29 | Calendly embed on `/contact` for demo bookings | ❌ | calendly.com/<your-handle> |
| 30 | Trust badges row (Razorpay, Made in India, GDPR) | ❌ | Below hero on homepage |
| 31 | "Watch demo" video button on hero | ❌ | YouTube unlisted or self-hosted |
| 32 | 5-10 SEO blog posts | ❌ | See suggested list below |

## P2 — Growth (weeks 2-4)

| # | Item | Notes |
|---|---|---|
| 33 | `/whatsapp-alternative-for-business` page | Targets common B2B searches |
| 34 | `/slack-alternative-india` page | Localised value prop |
| 35 | `/microsoft-teams-alternative` page | Comparison table emphasis |
| 36 | Product Hunt launch prep | Schedule for Tuesday/Wednesday |
| 37 | LinkedIn company page + 10 posts | Pre-launch warmup |
| 38 | Google Ads first campaign | Budget ₹500/day, target India |
| 39 | YouTube channel + 3 demo videos | Embed in /demo |
| 40 | Newsletter signup component | ConvertKit / Mailerlite |
| 41 | Welcome email sequence (5 emails) | Day 0, 1, 3, 7, 14 |
| 42 | Microsoft Clarity heatmaps | clarity.microsoft.com — free |

## Suggested first 5 blog articles

1. **"Slack vs Microsoft Teams vs TheChatNest — Indian SaaS comparison 2026"** — comparison long-tail
2. **"DPDP Act 2023: What Indian businesses need to know about team chat"** — compliance + Indian audience
3. **"How we reduced team-chat costs by 70% (Indian-hosted alternative)"** — case study angle
4. **"WhatsApp for business is a security risk — here's the proof"** — controversial, shareable
5. **"Self-hosted vs cloud team chat: when to choose which"** — buyer education

## P0 — Operations (NOT in code)

- [ ] Razorpay merchant account verified
- [ ] Business bank account confirmed receiving payouts
- [ ] DKIM/SPF/DMARC configured on `thechatnest.com`
- [ ] support@, sales@, hello@ email aliases working
- [ ] Founder LinkedIn profile updated with TheChatNest
- [ ] Twitter/X handle `@thechatnest` registered
- [ ] LinkedIn company page created
- [ ] Trademark application filed (class 9 + 42)
- [ ] Terms of Service reviewed by lawyer (one-time)
- [ ] Privacy Policy reviewed by lawyer (one-time)

## Sanity checks before flipping launch

```bash
# Build clean
cd frontend && npm run build

# Lighthouse mobile audit
npx lighthouse https://www.thechatnest.com --preset=desktop --view

# Test critical paths
- Sign up flow → email → verify → login
- Forgot password → email → reset → login
- Pricing → click Buy → Stripe checkout
- Contact form → submit → email arrives
- Cookie banner shows → reject → no GA fires → accept → GA fires
- 404 page renders for /random-url
- Sitemap accessible at /sitemap.xml
- robots.txt accessible
- OG preview test → https://www.opengraph.xyz/url/https://www.thechatnest.com
```

## Mobile App launch

| # | Item | Status |
|---|---|---|
| M1 | EAS build APK | ✅ ready (`eas build --platform android --profile preview`) |
| M2 | Google Play Developer account ($25 one-time) | ❌ |
| M3 | Play Store listing — screenshots, video, description | ❌ |
| M4 | Privacy policy URL for Play Store | ✅ /privacy ready |
| M5 | Data safety form | ❌ |
| M6 | Internal testing track (closed beta) | ❌ |
| M7 | Production rollout | ❌ |

## Bottom line — do this in order

1. **Today**: file the trademark, Razorpay merchant verification, DKIM/SPF/DMARC
2. **Tomorrow**: add Sentry DSN + UptimeRobot, then submit Google Search Console
3. **Week 1**: collect 3-5 testimonials, record Storylane demo, write 3 blog posts
4. **Week 2**: launch on Product Hunt, run Google Ads ₹500/day pilot
5. **Week 3**: Play Store submission, first paid customer onboarding

Everything in code is shipped on the `mobile/floating-tab-bar-and-layouts` branch. Merge the PR → Vercel auto-deploys → SW v4 rollout begins → white-screen bug fixed for everyone.
