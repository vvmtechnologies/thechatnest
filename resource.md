# TheChatNest — Resource Planning & Hostinger VPS Recommendation

_Last updated: 2026-05-14_

This doc answers three questions:

1. **What does TheChatNest actually need to run?** (RAM, CPU, disk, bandwidth)
2. **Which Hostinger VPS plan is the right fit at each scale?**
3. **Can I run EVERYTHING (Postgres + Redis + Node) on one VPS?** → **Yes, on KVM 2.**

It also covers what NOT to host on the VPS (mail, files), so you can compare honest total cost vs. the "all-on-one-box" approach.

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
- **Option A** (managed): Neon Pro ₹1,600/mo, zero ops, built-in backups + PITR
- **Option B** (self-host): On the same VPS — ₹0 incremental, but you own backups + tuning. **Works comfortably on KVM 2 up to ~1,500 concurrent users.**

### Redis 7
- Used for: Socket.io adapter (multi-worker rooms), rate-limit counters, session cache
- Workload at <1,000 concurrent users: **~250-300 MB RAM, <5% CPU idle**
- Self-host on the same VPS — no managed alternative needed at this scale

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

## 4. Resource breakdown on KVM 2 (all-in-one)

If you run **Node + Postgres + Redis** all on the same KVM 2 (the cheapest viable plan):

| Service | RAM (peak) | CPU (peak) | Disk |
|---------|-----------:|-----------:|-----:|
| Node (PM2 × 2 workers) | 800 MB | 40% of 1 core | 200 MB |
| Postgres 15 (2 GB shared_buffers) | 2.5 GB | 40% of 1 core | 20-50 GB (data) |
| Redis 7 (256 MB maxmemory cap) | 280 MB | <5% idle, 20% spike | 50 MB (AOF) |
| nginx + certbot | 100 MB | 1% | 20 MB |
| OS (Ubuntu 22.04) | 800 MB | 5% | 8 GB |
| **TOTAL** | **~4.5 GB / 8 GB** | **~1 core / 2 cores** | **~35 GB / 100 GB** |
| **Headroom** | **3.5 GB free** | **1+ core free** | **65 GB free** |

**Verdict: KVM 2 has ~40% spare capacity at 500 concurrent users.** You can grow into it before upgrading.

**Redis question (asked often):** yes, Redis runs comfortably on the same box. With a `maxmemory 256mb` cap and `maxmemory-policy allkeys-lru`, it stays under 300 MB RAM and uses <5% CPU at TheChatNest's chat workload. Cap is set in `deploy/redis.conf` (bundled in repo).

---

## 5. What to keep OFF the VPS

These services don't belong on a single-box deploy — purpose-built providers do them better:

| Component | Where | Why | Cost |
|-----------|-------|-----|------|
| **Files / attachments** | Cloudflare R2 / Backblaze B2 | Object storage is built for this. VPS disk is slow + small | R2: 10 GB free, $0.015/GB after. B2: $6/TB |
| **SMTP / email** | Postmark / Brevo / SES | VPS IPs get blocked by Gmail/Outlook. Don't fight this | Brevo: 300/day free. Postmark: 100/mo free, $15/10k after. SES $0.10/1k |
| **DNS / CDN** | Cloudflare | Free, globally cached, DDoS protection | Free |
| **Error tracking** | Sentry | Already wired in code | Free tier 5k events/mo |
| **Frontend hosting** | Vercel / Cloudflare Pages | CDN edge cache + auto-deploy from git. VPS bandwidth saved | Free |

**Net effect**: VPS handles Node API + Postgres + Redis. Everything else uses purpose-built services.

---

## 5. My honest recommendation for TheChatNest right now

### Phase 1 — Public launch (0–500 paying users)

| Service | Provider | Plan | Monthly |
|---------|----------|------|--------:|
| **VPS (Node + Postgres + Redis)** | Hostinger | KVM 2 | ₹599 |
| **Files** | Cloudflare R2 | Pay-as-you-go | ~₹100 (50 GB) |
| **Email** | Brevo | Free tier (300/day) | ₹0 |
| **Frontend** | Vercel | Hobby (free) | ₹0 |
| **DNS + CDN** | Cloudflare | Free | ₹0 |
| **Domain** | Hostinger | .com renewal | ₹100 |
| **Error tracking** | Sentry | Free (5k events) | ₹0 |
| **Total** | | | **~₹800 / month (~$10)** |

vs. the "managed everything" approach:
- Render backend ($7) + Neon Pro (₹1,600) + R2 + Vercel + Brevo = **₹2,400/mo**
- **Savings: ₹1,600/mo (~₹19,200/year)** — covers domain + email + 10× over

### Phase 2 — 500–2,000 paying users

| Service | Plan change | Monthly |
|---------|-------------|--------:|
| VPS | KVM 4 (Postgres still on box) | ₹999 |
| Files | R2 (~500 GB) | ₹600 |
| Email | Postmark 50k tier | ₹1,200 |
| Frontend | Vercel Pro (if needed) | ₹1,700 |
| Sentry | Team tier | ₹2,200 |
| **Total** | | **~₹6,700 / month (~$80)** |

### Phase 3 — 2,000+ paying users
- **Move Postgres OFF VPS** → Neon Scale or AWS RDS (₹5,000+/mo)
- Horizontal scale Node: 2-3× KVM 4 behind a Hostinger Load Balancer
- Move Redis to Upstash (free tier covers most of this)

---

## 7. VPS setup — what runs on it

A clean KVM 2 setup for TheChatNest (all-in-one):

```
Hostinger KVM 2 (Ubuntu 22.04)
├── nginx                   ← TLS + reverse proxy (80/443)
├── Node 18 (PM2 cluster)   ← TheChatNest API + Socket.io (2 workers)
├── Postgres 15             ← TheChatNest database
│   ├── shared_buffers = 2GB
│   ├── work_mem = 16MB
│   └── max_connections = 100
├── Redis 7                 ← Socket.io adapter + rate-limit cache
│   └── maxmemory = 256MB
├── certbot                 ← Auto-renew TLS via Let's Encrypt
├── fail2ban                ← Block brute-force SSH + login attempts
├── ufw                     ← Firewall (only 80/443/SSH open)
└── pg_backup cron          ← Daily pg_dump → Cloudflare R2
```

**Setup**: Use the bundled `deploy/setup.sh` script — one command, ~10 minutes for fresh Ubuntu 22.04.

```bash
# SSH into your fresh KVM 2 as root
ssh root@your-vps-ip

# Pull and run the one-shot installer
curl -fsSL https://raw.githubusercontent.com/vvmtechnologies/thechatnest/main/deploy/setup.sh | bash

# Then drop your .env file at /opt/thechatnest/backend/.env and start:
pm2 start /opt/thechatnest/backend/server.js --name thechatnest -i 2
pm2 save
```

The script installs nginx, Node 18, Postgres 15, Redis 7, certbot, fail2ban, ufw — all hardened with sensible defaults — and clones the repo into `/opt/thechatnest`. See `deploy/setup.sh` for the full annotated source.

## 8. Backup strategy — CRITICAL when self-hosting Postgres

**Without managed Postgres, backups are LIFE.** Three layers:

### Layer 1 — Daily logical dump → object storage
`deploy/postgres-backup.sh` runs every night at 3 AM IST:
- `pg_dump | gzip` the whole DB
- Upload to Cloudflare R2 (cheap, geographically separate)
- Keep 7 days local + 30 days remote

### Layer 2 — WAL archiving (optional, for PITR)
- Enable `archive_mode = on` in postgresql.conf
- Continuous WAL → R2 bucket
- Enables point-in-time recovery to any second in the last 7 days

### Layer 3 — VPS disk snapshot
Hostinger lets you snapshot the entire VPS image. Take one before risky changes (migrations, OS upgrades).

**TEST RESTORE quarterly.** A backup is a wish until you've restored from it.

---

## 9. Cost comparison — Render vs Hostinger VPS

| Service | Current (Render Free + Neon) | Hostinger KVM 2 (all-in-one) |
|---------|----------------------------:|----------------------------:|
| Backend | Free (sleeps after 15min idle) | ₹599 (always-on) |
| Cold-start delay | 50+ seconds | <1 sec |
| RAM | 512 MB | 8 GB |
| Postgres | Neon Pro ₹1,600/mo | Included in VPS |
| Redis | Not available on Render free | Included in VPS |
| Cron / background jobs | Not supported on free | Native |
| Custom domain + TLS | Free (auto) | Free via certbot |
| WebSocket support | Yes | Yes |

**Trade-off**: Render free has zero ops cost but **kills your backend after 15 min idle** — users hitting `https://api.thechatnest.com` at 2 AM IST wait 50+ seconds for first response. **Production-killer for a chat app.**

**Hostinger KVM 2 at ₹599 includes everything Render+Neon costs ₹2,200 for.** VPS wins ~3× on price at this scale.

---

## 10. Migration plan (Render → Hostinger, all-in-one)

### Pre-launch checklist
1. ✅ Frontend on Vercel (already done — no migration needed)
2. 🟡 Provision Hostinger KVM 2 — 5 min
3. 🟡 SSH in, run `deploy/setup.sh` — 10 min
4. 🟡 Dump Neon Postgres → restore on VPS — 15 min
   ```bash
   pg_dump $NEON_URL | psql -d thechatnest_prod
   ```
5. 🟡 Copy `.env` from Render dashboard to VPS — 10 min
6. 🟡 Update `api.thechatnest.com` A record → VPS IP — 5 min (10-min DNS propagation)
7. 🟡 Test all routes from frontend — 30 min
8. 🟡 Set up daily backup cron — 5 min
9. 🟡 Cancel Render + Neon Pro — 1 min

**Total migration**: ~1.5 hours. **Zero downtime** if you cut DNS at low-traffic hour.

---

## 11. Cheaper alternatives (under ₹400/mo)

If ₹599/mo is too much for launch, here are 5 plans that still handle 100-200 concurrent users:

### Tier A — Under ₹400/mo (best for first 100-200 users)

| Provider | Plan | RAM | vCPU | Disk | DC | ₹/mo | Verdict |
|----------|------|----:|-----:|-----:|----|-----:|---------|
| **Hetzner Cloud** | **CPX11** | **2 GB** | **2 AMD** | **40 GB NVMe** | EU only | **~₹180** | ✅ Cheapest serious option |
| **Contabo** | VPS S | 4 GB | 4 | 50 GB NVMe | EU/US/Asia | ~₹250 | ✅ Best RAM/₹ ratio |
| **OVH** | VPS Starter | 2 GB | 1 | 40 GB | Mumbai ✅ | ~₹350 | ✅ India DC |
| **Hostinger** | **KVM 1** | **4 GB** | **1** | **50 GB NVMe** | **Mumbai ✅** | **₹399** (₹299 on 24m) | ✅ India + best balance |
| **DigitalOcean** | Basic | 1 GB | 1 | 25 GB | Bangalore ✅ | ~₹400 | ✅ Reputable, India DC |

### Tier B — FREE / under ₹100/mo (PoC / pre-revenue)

| Provider | Plan | RAM | vCPU | Catch | ₹/mo |
|----------|------|----:|-----:|-------|-----:|
| **Oracle Cloud Always Free** | Ampere A1 ARM | **24 GB** | **4 cores** | Hard to get approved, but **FREE FOREVER** if you do | **₹0** |
| **Google Cloud Free** | e2-micro | 1 GB | 0.25 vCPU | Free forever in select US regions | ₹0 |
| **AWS Free Tier** | t3.micro | 1 GB | 2 (burst) | Free for 12 months only | ₹0 |
| **Railway** | Hobby | 512 MB | shared | $5/mo credits = ~₹400, sleeps when idle | ~₹0-400 |
| **Fly.io** | Hobby | 256 MB | shared | 3 free machines, sleeps after 5 min | ₹0 |

### 🏆 My honest cheapest recommendation: **Hostinger KVM 1 (24-month upfront)**

- **₹299/month effective** on a 24-month plan (saves ₹2,400/year vs month-to-month)
- ₹399/mo if you pay monthly
- **Mumbai datacenter** — Indian users get <50ms latency
- **4 GB RAM** is enough for Node + Postgres + Redis at launch (under 200 concurrent)
- Same `deploy/setup.sh` works — just halve Postgres `shared_buffers` to 1 GB

### 🥈 Honorable mention: **Contabo VPS S**

- **₹250/mo** (~$3)
- **4 GB RAM, 4 vCPU, 50 GB NVMe** — 4× the CPU of Hostinger KVM 1 at lower price
- Catch: only EU/US datacenters — Indian users get 200-300ms latency
- Use this if your customers are global, not India-focused

### 🥉 Power-user option: **Oracle Cloud Always Free**

- **Free forever** — no card required after signup
- **24 GB RAM, 4 ARM cores** on Ampere A1 instances
- Catches:
  - Hard to get account approved (rejects most signups — try again with different email/card)
  - ARM architecture means some Node packages may need rebuild (TheChatNest stack works fine)
  - Account reclaimed if you don't log in for 6 months
- Use this if you want zero cloud cost and can deal with the friction

### Phase 1 BUDGET option (₹349/mo total)

| Service | Plan | Monthly |
|---------|------|--------:|
| **VPS** | Hostinger KVM 1 (24m upfront) | ₹299 |
| **Files** | Cloudflare R2 (10 GB free tier) | ₹0 |
| **Email** | Brevo (300/day free) | ₹0 |
| **Frontend** | Vercel Hobby | ₹0 |
| **DNS** | Cloudflare | ₹0 |
| **Domain** | Hostinger .com (yearly /12) | ₹50 |
| **Sentry** | Free 5k events | ₹0 |
| **Total** | | **~₹349 / month** |

vs. the KVM 2 recommendation at ₹800/mo. **₹450/mo saved** — covers a month of ads. Will handle the first **100 paid seats / 30-50 concurrent active users** comfortably.

**Upgrade trigger**: when `free -h` shows >50% swap usage, or Node OOMs once a week — bump to KVM 2.

### Phase 1 ULTRA-BUDGET (₹50/mo if you can get Oracle approved)

| Service | Plan | Monthly |
|---------|------|--------:|
| **VPS** | Oracle Cloud Always Free (24 GB ARM) | ₹0 |
| **Files** | Cloudflare R2 (free tier) | ₹0 |
| **Email** | Brevo (300/day free) | ₹0 |
| **Frontend** | Vercel Hobby | ₹0 |
| **DNS** | Cloudflare | ₹0 |
| **Domain** | Hostinger .com (yearly /12) | ₹50 |
| **Total** | | **~₹50 / month** |

The catch: **Oracle's signup approval is notoriously hard.** Many people get auto-rejected. Try with a credit card that hasn't been used on Oracle before. Once you're in, you have 24 GB / 4 cores **forever** — easily the best free tier in cloud.

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

Three honest tracks depending on budget:

### 🚀 Smart launch — ₹349/mo
1. **Hostinger KVM 1 (24-month upfront) — ₹299/mo**
2. Postgres + Redis self-hosted on the VPS
3. Cloudflare R2 + Brevo + Vercel + Cloudflare DNS — all free
4. Capacity: **100 paid seats / 30-50 concurrent active**
5. Upgrade trigger: when memory swap kicks in regularly

### 💪 Comfortable launch — ₹800/mo (recommended once you have ANY revenue)
1. **Hostinger KVM 2 — ₹599/mo** (24-month = ₹450/mo effective)
2. Postgres + Redis self-hosted on the VPS
3. Cloudflare R2 + Brevo + Vercel + Cloudflare DNS
4. Capacity: **500 concurrent active = 3-5k paid seats**
5. Best price/perf ratio for an Indian SaaS launch

### 🆓 Free forever — ₹50/mo (if Oracle approves you)
1. **Oracle Cloud Always Free (24 GB ARM)** — ₹0
2. Same software stack, only domain cost (~₹50/mo amortized)
3. Capacity: easily 500+ concurrent (24 GB RAM is overkill)
4. Catch: signup is a coin flip. Try, but have Plan B ready.

**Once you cross 500 concurrent or 5k paid seats**, bump to KVM 4 (₹999/mo). By then you'll have revenue to cover it 100×.

---

## Appendix: alternative VPS providers (for comparison)

| Provider | Plan | RAM | vCPU | Disk | India DC | ₹/mo | Notes |
|----------|------|----:|-----:|-----:|----------|-----:|-------|
| **Oracle Cloud** | **Always Free ARM** | **24 GB** | **4** | **200 GB** | **Mumbai ✅** | **₹0** | Hard to approve |
| Hetzner | CPX11 | 2 GB | 2 | 40 GB | ❌ EU only | ₹180 | Cheapest pro VPS |
| Contabo | VPS S | 4 GB | 4 | 50 GB | ❌ EU/US | ₹250 | Best ₹/RAM |
| **Hostinger** | **KVM 1 (24m)** | **4 GB** | **1** | **50 GB** | **Mumbai ✅** | **₹299** | **Cheapest India** |
| OVH | Starter | 2 GB | 1 | 40 GB | Mumbai ✅ | ₹350 | |
| Linode | Nanode | 1 GB | 1 | 25 GB | Mumbai ✅ | ₹420 | |
| DigitalOcean | Basic | 1 GB | 1 | 25 GB | Bangalore ✅ | ₹420 | |
| **Hostinger** | **KVM 2 (24m)** | **8 GB** | **2** | **100 GB** | **Mumbai ✅** | **₹450** | **Best value India** |
| AWS Lightsail | 4 GB | 4 GB | 2 | 80 GB | Mumbai ✅ | ₹1,600 | Big-name, big bill |
| DigitalOcean | Premium AMD | 4 GB | 2 | 80 GB | Bangalore ✅ | ₹2,000 | |
| Vultr | High Frequency | 4 GB | 2 | 128 GB | Mumbai ✅ | ₹2,400 | |

### Honest take

- **Cheapest with India latency**: Hostinger KVM 1 24m plan at **₹299/mo**.
- **Best free option**: Oracle Cloud (24 GB ARM forever) — if you can get past their signup screen.
- **Best price/perf at scale**: Hostinger KVM 2 24m plan at **₹450/mo** effective.
- **Avoid for launch**: AWS, DigitalOcean Premium, Vultr — too expensive for what they give.

Hostinger's only catch is slower customer service vs DigitalOcean/Vultr. For a chat backend that rarely needs support tickets, that's a fair trade.
