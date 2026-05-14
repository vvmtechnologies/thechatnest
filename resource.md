# TheChatNest — Resource Planning & Hostinger VPS Recommendation

_Last updated: 2026-05-14_

This doc answers two questions:

1. **What does TheChatNest actually need to run?** (RAM, CPU, disk, bandwidth)
2. **Which Hostinger VPS plan is the right fit at each scale?**

It also covers what NOT to host on the VPS (database, files, email), so you can compare honest total cost vs. the "all-on-one-box" approach.

---

## 1. The stack — what's actually running

### Backend (Node.js Express + Socket.io)
- **Runtime**: Node 18+ (LTS)
- **Framework**: Express 4
- **Realtime**: Socket.io for messaging + presence + typing indicators
- **DB driver**: `pg` (node-postgres) connecting to Postgres
- **Auth**: JWT (15-min access + 30-day refresh)
- **File storage**: AWS S3 (or compatible — Backblaze B2, Cloudflare R2, MinIO)
- **Mail**: SMTP via transactional provider (SES / Postmark / Brevo)
- **Payments**: Stripe + PayPal SDKs

**Process model**: 1 Node process (or PM2 cluster with 2 workers if 4+ vCPU). Sticky sessions required for Socket.io.

### Frontend (Vite/React SPA)
- Static build = `frontend/dist/` folder (~12 MB gzipped, ~56 MB uncompressed)
- Served by Caddy / Nginx as static files
- All API calls go cross-origin to backend
- Can be served from same VPS OR (better) from a CDN edge (Cloudflare Pages, Vercel, Netlify — all free)

### Database (Postgres)
- Schema has **~50 tables** (users, organizations, threads, messages, files, payments, etc.)
- Active app load: ~200 reads + ~30 writes per active user per hour
- **Strong recommendation**: keep on managed Postgres (Neon / Supabase / RDS), NOT on the same VPS

### File storage (S3)
- Average user uploads ~50 MB / month (avatars, images, voice notes, attachments)
- Per 100 users: ~5 GB / month
- Per 1000 users: ~50 GB / month
- **Strong recommendation**: keep on real S3 / R2 / B2, NOT on VPS disk

---

## 2. Resource needs by team size

| Concurrent active users | RAM (Node) | vCPU | Disk | Bandwidth / month | Notes |
|-------------------------|-----------|------|------|-------------------|-------|
| 25                      | 512 MB    | 1    | 20 GB | 50 GB            | Single proc, sqlite-ish workload |
| 100                     | 1 GB      | 1    | 40 GB | 200 GB           | Comfortable headroom |
| 500                     | 2 GB      | 2    | 50 GB | 600 GB           | PM2 cluster, 2 Node workers |
| 1,000                   | 4 GB      | 2-4  | 80 GB | 1.5 TB           | Add Redis for Socket.io adapter |
| 2,500                   | 8 GB      | 4    | 120 GB | 3 TB            | Redis + Node cluster mandatory |
| 5,000+                  | 16 GB+    | 8+   | 250 GB | 6 TB+           | Time to scale horizontally |

**"Concurrent active" ≠ total users.** A 1,000-seat workspace typically has 100-150 concurrent active users at peak (10-15% rule).

So if you sell **TheChatNest Standard at 1000 paid seats**, real concurrent load = ~150 users = "100 concurrent" tier above = **1 GB RAM Node is enough**.

---

## 3. Hostinger VPS — which plan?

Hostinger has 4 KVM-based VPS tiers (as of May 2026). Indian + EU + US datacenters available.

### KVM 1 — ₹399/mo (~$4.79)
- **1 vCPU · 4 GB RAM · 50 GB NVMe · 4 TB bandwidth**
- ✅ Good for: launch / first 100 users
- ❌ Limit: starts to feel tight past 200 concurrent

### KVM 2 — ₹599/mo (~$7.19)
- **2 vCPU · 8 GB RAM · 100 GB NVMe · 8 TB bandwidth**
- ✅ Good for: 100–500 concurrent active users
- ✅ **MERA RECOMMENDATION FOR LAUNCH** — comfortable headroom, easy to grow into

### KVM 4 — ₹999/mo (~$11.99)
- **4 vCPU · 16 GB RAM · 200 GB NVMe · 16 TB bandwidth**
- ✅ Good for: 500–2,000 concurrent active users
- ✅ Right tier once you have ~500 paid seats / steady traffic

### KVM 8 — ₹1,799/mo (~$21.59)
- **8 vCPU · 32 GB RAM · 400 GB NVMe · 32 TB bandwidth**
- ✅ Good for: 2,000–5,000 concurrent
- 💡 Past this tier, **horizontal scaling** (2× KVM 4 with a load balancer) beats vertical

**Why KVM, not "Cloud Hosting"?** KVM gives you **full root + dedicated resources**. Hostinger's shared "Cloud Hosting" can throttle under load and doesn't give SSH for proper deploys.

---

## 4. What to keep OFF the VPS (and where to put it)

| Component | Where | Why | Cost |
|-----------|-------|-----|------|
| **Postgres** | Neon / Supabase / Aiven | Backups, point-in-time recovery, scale separately | Neon free tier → ₹0; Pro $19/mo ~ ₹1,600 |
| **Files / attachments** | Cloudflare R2 / Backblaze B2 | Disk on VPS is slow + small. Object storage is built for this. | R2: 10 GB free, then $0.015/GB. B2: $6/TB. |
| **SMTP / email** | Postmark / SES / Brevo | VPS IPs get blocked by Gmail/Outlook. Don't fight this. | Postmark 100 free / mo, then $15 / 10k. SES $0.10 / 1k. |
| **DNS / CDN** | Cloudflare | Free, globally cached, DDoS protection | Free |
| **Error tracking** | Sentry | Already wired in code | Free tier 5k events/mo |
| **Frontend hosting** | Vercel / Cloudflare Pages | CDN edge cache + auto-deploy from git. VPS bandwidth saved. | Free |

**Net effect**: VPS handles only the Node API + Socket.io, which is what it's actually good at. Everything else uses purpose-built services.

---

## 5. My honest recommendation for TheChatNest right now

### Phase 1 — Public launch (0–500 paying users)

| Service | Provider | Plan | Monthly |
|---------|----------|------|--------:|
| **VPS (Node + Socket.io)** | Hostinger | KVM 2 | ₹599 |
| **Postgres** | Neon | Pro | ₹1,600 |
| **Files** | Cloudflare R2 | Pay-as-you-go | ~₹100 (50 GB) |
| **Email** | Brevo | Free tier (300/day) | ₹0 |
| **Frontend** | Vercel | Hobby (free) | ₹0 |
| **DNS + CDN** | Cloudflare | Free | ₹0 |
| **Domain** | Hostinger | .com renewal | ₹100 |
| **Error tracking** | Sentry | Free (5k events) | ₹0 |
| **Total** | | | **~₹2,400 / month (~$29)** |

### Phase 2 — 500–2,000 paying users

| Service | Plan change | Monthly |
|---------|-------------|--------:|
| VPS | KVM 4 | ₹999 |
| Postgres | Neon Scale | ₹5,000 |
| Files | R2 (~500 GB) | ₹600 |
| Email | Postmark 50k tier | ₹1,200 |
| Frontend | Vercel Pro (if needed) | ₹1,700 |
| Sentry | Team tier | ₹2,200 |
| **Total** | | **~₹11,700 / month (~$140)** |

### Phase 3 — 2,000+ paying users
- Horizontal scale: 2-3× KVM 4 behind a Hostinger Load Balancer
- Add Redis (Upstash free tier covers most of this)
- Move to dedicated DB cluster

---

## 6. VPS setup — what runs on it

A clean KVM 2 setup for TheChatNest:

```
Hostinger KVM 2 (Ubuntu 22.04)
├── nginx / Caddy           ← TLS + reverse proxy
├── Node 18 (PM2 cluster)   ← TheChatNest API + Socket.io (2 workers)
├── Redis 7                 ← Socket.io adapter + rate limit cache
├── certbot                 ← Auto-renew TLS via Let's Encrypt
├── fail2ban                ← Block brute-force SSH + login attempts
└── ufw                     ← Firewall (only 80/443/SSH open)
```

**Setup commands** (high level):

```bash
# OS hardening
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot redis-server fail2ban ufw

# Node + PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Deploy code
git clone git@github.com:vvmtechnologies/thechatnest.git
cd thechatnest/backend
npm ci --omit=dev
pm2 start npm --name thechatnest -i 2 -- start

# TLS
sudo certbot --nginx -d api.thechatnest.com
```

---

## 7. Cost comparison — Render vs Hostinger VPS

| Service | Current (Render Free) | Hostinger KVM 2 |
|---------|---------------------:|----------------:|
| Backend | Free (sleeps after 15min idle) | ₹599 (always-on) |
| Cold-start delay | 50+ seconds | <1 sec |
| RAM | 512 MB | 8 GB |
| Cron / background jobs | Not supported on free | Native |
| Custom domain + TLS | Free (auto) | Free via certbot |
| WebSocket support | Yes | Yes |
| Database | External (Neon) | External (Neon) |

**Trade-off**: Render free has zero ops cost but **kills your backend after 15 min idle** — users hitting `https://api.thechatnest.com` at 2 AM IST wait 50+ seconds for first response. **Production-killer for a chat app.**

**Render paid** ($7/mo Starter = ₹600) ≈ Hostinger KVM 2 cost but Hostinger gives **8 GB RAM vs Render's 512 MB**. **VPS wins on price/perf at this scale.**

---

## 8. Migration plan (Render → Hostinger)

### Pre-launch checklist
1. ✅ Frontend on Vercel (already done — no migration needed)
2. ✅ Postgres on Neon (already done — no migration needed)
3. ✅ Domain on Hostinger (already done)
4. 🟡 Provision Hostinger KVM 2 — 5 min
5. 🟡 SSH in, install nginx + Node + PM2 + Redis — 30 min
6. 🟡 Copy `.env` from Render dashboard to VPS — 10 min
7. 🟡 Update `api.thechatnest.com` A record from Render IP to VPS IP — 5 min (10-min DNS propagation)
8. 🟡 Test all routes from frontend — 30 min
9. 🟡 Decommission Render — 1 min

**Total migration**: ~1.5 hours for someone comfortable with SSH. **Zero downtime** if you cut DNS at low-traffic hour.

---

## 9. When to upgrade

| Symptom | Action |
|---------|--------|
| Node process restarts (OOM) | Bump RAM (KVM 2 → KVM 4) |
| `pm2 list` shows >80% CPU sustained | Add vCPU |
| Socket.io disconnects spike | Add Redis adapter; if already there → horizontal scale |
| API response p95 > 500 ms | Profile DB queries first, then upgrade |
| Disk > 70% full | Move uploads to R2/B2 if not already |
| Outbound bandwidth limit | Cloudflare CDN saves 60-80% of egress |

---

## 10. TL;DR — what to buy today

1. **Hostinger KVM 2 — ₹599/mo** (24-month plan = ~₹450/mo effective)
2. **Keep Neon Postgres** (already provisioned)
3. **Cloudflare R2 for files** (sign up free, configure after)
4. **Brevo for email** (free tier covers launch volume)
5. **Cloudflare DNS** in front of everything (free, faster, DDoS protection)

**Monthly cost at launch**: **~₹2,400 (~$29)** for everything.
**Capacity**: comfortably handles **500 concurrent active users** = roughly **3,000-5,000 total paid seats**.

When you hit that scale, bump to KVM 4 for ₹999/mo. By then you'll have revenue to cover it 100×.

---

## Appendix: alternative VPS providers (for comparison)

| Provider | Plan | RAM | vCPU | Disk | India DC | ₹/mo |
|----------|------|----:|-----:|-----:|----------|-----:|
| **Hostinger** | **KVM 2** | **8 GB** | **2** | **100 GB NVMe** | **✅ Mumbai** | **₹599** |
| DigitalOcean | Premium AMD | 4 GB | 2 | 80 GB | ✅ Bangalore | ₹2,000 |
| Vultr | High Frequency | 4 GB | 2 | 128 GB NVMe | ✅ Mumbai/Bangalore | ₹2,400 |
| AWS Lightsail | 4 GB | 4 GB | 2 | 80 GB | ✅ Mumbai | ₹1,600 |
| Linode (Akamai) | Nanode | 1 GB | 1 | 25 GB | ✅ Mumbai | ₹500 |
| Contabo | Cloud VPS S | 8 GB | 4 | 200 GB | ❌ EU/US only | ₹500 |

**Hostinger KVM 2 dominates on price/perf for an India-launching SaaS.** 8 GB RAM for ₹599 is unmatched. Only catch: customer service is slower than DO/Vultr. For a chat backend that rarely needs support, that's a fair trade.
