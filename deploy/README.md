# TheChatNest — `deploy/` scripts

One-shot scripts for spinning up a fresh Ubuntu 22.04 VPS as a complete
TheChatNest production host.

## Files

| Script | Purpose |
|--------|---------|
| `setup.sh` | One-shot installer. Installs nginx + Node + Postgres + Redis + PM2 + certbot + fail2ban + ufw. Clones the repo into `/opt/thechatnest`. Writes a `.env` scaffold. |
| `postgres-backup.sh` | Daily `pg_dump → gzip → Cloudflare R2`. Reads secrets from `/etc/thechatnest-backup.env`. Keeps 7 local + 30 remote. Optional Discord/Slack webhook on failure. |
| `postgres-backup-install.sh` | Installs the backup cron + creates the env scaffold (pulls DB credentials from the app .env automatically). |

## Quick start

```bash
# 1. SSH into your fresh VPS as root
ssh root@your-vps-ip

# 2. One-shot install
curl -fsSL https://raw.githubusercontent.com/vvmtechnologies/thechatnest/main/deploy/setup.sh | bash

# 3. Fill in secrets in /opt/thechatnest/backend/.env (SMTP, R2, Stripe, etc.)

# 4. Point DNS at this server, then get TLS:
certbot --nginx -d api.thechatnest.com

# 5. Schedule daily backups:
bash /opt/thechatnest/deploy/postgres-backup-install.sh

# 6. Edit /etc/thechatnest-backup.env with R2 credentials, test:
/opt/thechatnest/deploy/postgres-backup.sh
```

## What you get

- nginx reverse proxy on 80/443
- Node 18 backend on 127.0.0.1:10000 (PM2 cluster, 2 workers)
- Postgres 15 with tuned `shared_buffers` based on VM RAM
- Redis 7 with 256 MB cap, allkeys-lru eviction
- ufw firewall (only SSH + 80 + 443 inbound)
- fail2ban for SSH brute-force protection
- Unattended security upgrades
- Daily Postgres backups → Cloudflare R2 with 7+30 retention

## Variables you can override

Set before running `setup.sh` to customize:

```bash
REPO_URL=https://github.com/yourfork/thechatnest.git \
NODE_MAJOR=20 \
PG_VERSION=16 \
POSTGRES_DB=mydb \
POSTGRES_USER=myuser \
REDIS_MAXMEMORY=512mb \
  bash setup.sh
```

## Resource requirements

| Plan | RAM | vCPU | Disk | Capacity | ₹/mo (24m) |
|------|-----|------|------|----------|------------|
| Hostinger KVM 1 | 4 GB | 1 | 50 GB | 100 paid / 30 concurrent | ₹299 |
| Hostinger KVM 2 | 8 GB | 2 | 100 GB | 5,000 paid / 500 concurrent | ₹450 |
| Hostinger KVM 4 | 16 GB | 4 | 200 GB | 20,000 paid / 2,000 concurrent | ₹750 |

See `../resource.md` for the full breakdown and cheaper alternatives.

## Idempotency

`setup.sh` is safe to re-run. It detects existing installs (Node version
check, Postgres role existence, app user, nginx config, etc.) and skips
or upgrades them in place. Re-running won't reset your DB password or
overwrite an existing `.env`.

## Security defaults

- `.env` is `chmod 600` and owned by the `thechatnest` user
- Postgres `bind 127.0.0.1` only — no external access
- Redis `bind 127.0.0.1` only — no external access
- nginx adds X-Frame-Options, X-Content-Type-Options, Referrer-Policy headers
- Generated JWT_SECRET, CHAT_ENCRYPTION_KEY, PAYMENT_GATEWAY_ENCRYPTION_KEY
  via `openssl rand -hex 32` — unique per install
