#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# TheChatNest — One-shot VPS installer for Ubuntu 22.04 (KVM 1 / 2 / 4)
# ─────────────────────────────────────────────────────────────────────
#
# Run as root on a fresh Ubuntu 22.04 server:
#   curl -fsSL https://raw.githubusercontent.com/vvmtechnologies/thechatnest/main/deploy/setup.sh | bash
#
# Or clone first and inspect before running:
#   git clone https://github.com/vvmtechnologies/thechatnest.git /opt/thechatnest
#   bash /opt/thechatnest/deploy/setup.sh
#
# Installs: nginx, Node 18, Postgres 15, Redis 7, certbot, fail2ban, ufw, PM2.
# Total time: ~10 minutes on a fresh KVM 2.
#
# ⚠️ Idempotent. Safe to re-run.

set -euo pipefail

# ─── Configurable variables ─────────────────────────────────────────
APP_USER="thechatnest"
APP_DIR="/opt/thechatnest"
REPO_URL="${REPO_URL:-https://github.com/vvmtechnologies/thechatnest.git}"
NODE_MAJOR="${NODE_MAJOR:-18}"
PG_VERSION="${PG_VERSION:-15}"
POSTGRES_DB="${POSTGRES_DB:-thechatnest_prod}"
POSTGRES_USER="${POSTGRES_USER:-thechatnest}"
# Auto-generate a strong password if not set; printed at the end
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(openssl rand -hex 16)}"
REDIS_MAXMEMORY="${REDIS_MAXMEMORY:-256mb}"
# Tune Postgres shared_buffers based on KVM size (1GB if VM has <6GB RAM)
TOTAL_RAM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
if [ "$TOTAL_RAM_MB" -lt 6000 ]; then
  PG_SHARED_BUFFERS="1GB"
  PG_EFFECTIVE_CACHE="2GB"
else
  PG_SHARED_BUFFERS="2GB"
  PG_EFFECTIVE_CACHE="4GB"
fi

# ─── Colors for log output ──────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
log()  { echo -e "${GREEN}[setup]${NC} $*"; }
warn() { echo -e "${YELLOW}[setup]${NC} $*"; }
die()  { echo -e "${RED}[setup]${NC} $*"; exit 1; }

# ─── Pre-flight checks ──────────────────────────────────────────────
[ "$(id -u)" -eq 0 ] || die "Run this script as root (or with sudo)."
[ -f /etc/os-release ] || die "Cannot detect OS — Ubuntu 22.04 required."
. /etc/os-release
[ "${ID:-}" = "ubuntu" ] || warn "This script is tested on Ubuntu only. Continue at your own risk."

log "Detected ${PRETTY_NAME:-Linux}, total RAM = ${TOTAL_RAM_MB} MB"
log "Postgres tuning: shared_buffers=${PG_SHARED_BUFFERS}, effective_cache_size=${PG_EFFECTIVE_CACHE}"

# ─── 1. System hardening + base packages ────────────────────────────
log "Updating apt + installing base packages…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  curl wget git build-essential ca-certificates \
  nginx certbot python3-certbot-nginx \
  redis-server \
  fail2ban ufw \
  unattended-upgrades \
  htop iotop ncdu \
  jq

# ─── 2. Firewall ────────────────────────────────────────────────────
log "Configuring ufw firewall…"
ufw --force reset >/dev/null
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ─── 3. App user ────────────────────────────────────────────────────
if ! id "$APP_USER" >/dev/null 2>&1; then
  log "Creating app user '$APP_USER'…"
  useradd -m -s /bin/bash "$APP_USER"
fi

# ─── 4. Node.js + PM2 ───────────────────────────────────────────────
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt "$NODE_MAJOR" ]; then
  log "Installing Node ${NODE_MAJOR}…"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y -qq nodejs
fi
log "Node version: $(node -v)"

if ! command -v pm2 >/dev/null; then
  log "Installing PM2…"
  npm install -g pm2@latest
fi

# ─── 5. PostgreSQL ──────────────────────────────────────────────────
if ! command -v psql >/dev/null; then
  log "Installing PostgreSQL ${PG_VERSION}…"
  install -d /usr/share/postgresql-common/pgdg
  curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor -o /usr/share/keyrings/pgdg.gpg
  echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] https://apt.postgresql.org/pub/repos/apt $(. /etc/os-release; echo $VERSION_CODENAME)-pgdg main" \
    > /etc/apt/sources.list.d/pgdg.list
  apt-get update -qq
  apt-get install -y -qq "postgresql-${PG_VERSION}" "postgresql-contrib-${PG_VERSION}"
fi

PG_CONF="/etc/postgresql/${PG_VERSION}/main/postgresql.conf"
PG_HBA="/etc/postgresql/${PG_VERSION}/main/pg_hba.conf"

log "Tuning Postgres for ${TOTAL_RAM_MB} MB RAM…"
sed -i \
  -e "s|^#*shared_buffers = .*|shared_buffers = ${PG_SHARED_BUFFERS}|" \
  -e "s|^#*effective_cache_size = .*|effective_cache_size = ${PG_EFFECTIVE_CACHE}|" \
  -e "s|^#*work_mem = .*|work_mem = 16MB|" \
  -e "s|^#*maintenance_work_mem = .*|maintenance_work_mem = 128MB|" \
  -e "s|^#*max_connections = .*|max_connections = 100|" \
  -e "s|^#*random_page_cost = .*|random_page_cost = 1.1|" \
  -e "s|^#*effective_io_concurrency = .*|effective_io_concurrency = 200|" \
  "$PG_CONF"

# Restart Postgres before touching roles
systemctl enable --now "postgresql"
systemctl restart "postgresql"

log "Creating database '$POSTGRES_DB' and user '$POSTGRES_USER'…"
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${POSTGRES_USER}') THEN
    CREATE ROLE ${POSTGRES_USER} WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
  ELSE
    ALTER ROLE ${POSTGRES_USER} WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${POSTGRES_DB}')\gexec
GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER};
SQL

# ─── 6. Redis ───────────────────────────────────────────────────────
log "Configuring Redis (maxmemory=${REDIS_MAXMEMORY}, allkeys-lru)…"
sed -i \
  -e "s|^#* *maxmemory .*|maxmemory ${REDIS_MAXMEMORY}|" \
  -e "s|^#* *maxmemory-policy .*|maxmemory-policy allkeys-lru|" \
  -e "s|^bind .*|bind 127.0.0.1 -::1|" \
  /etc/redis/redis.conf
systemctl enable --now redis-server
systemctl restart redis-server

# ─── 7. Clone repo + install deps ───────────────────────────────────
if [ ! -d "$APP_DIR/.git" ]; then
  log "Cloning $REPO_URL → $APP_DIR…"
  git clone "$REPO_URL" "$APP_DIR"
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

if [ -d "$APP_DIR/backend" ]; then
  log "Installing backend dependencies…"
  sudo -u "$APP_USER" bash -c "cd '$APP_DIR/backend' && npm ci --omit=dev"
fi

# ─── 8. .env scaffold ───────────────────────────────────────────────
ENV_FILE="$APP_DIR/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  log "Writing initial .env at $ENV_FILE (fill in secrets after this script)…"
  cat > "$ENV_FILE" <<ENV
NODE_ENV=production
PORT=10000

# Database (local Postgres set up by this script)
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@127.0.0.1:5432/${POSTGRES_DB}
DB_SSL=false

# Redis (local)
REDIS_ENABLED=true
REDIS_URL=redis://127.0.0.1:6379

# JWT (rotate before launch)
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Encryption keys (rotate before launch)
CHAT_ENCRYPTION_KEY=$(openssl rand -hex 32)
PAYMENT_GATEWAY_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Cookies
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax

# Frontend / CORS (set these to your real domain)
FRONTEND_ORIGIN=https://www.thechatnest.com
CORS_ORIGIN=https://www.thechatnest.com
FRONTEND_URL=https://www.thechatnest.com

# Branding
APP_NAME=TheChatNest

# AWS S3 (fill in if using R2/S3)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=auto
AWS_S3_BUCKET=

# SMTP (fill in for Brevo / Postmark / SES)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM="TheChatNest <support@thechatnest.com>"

# Stripe (fill in)
STRIPE_SECRET_KEY=
ENV
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
fi

# ─── 9. Run migrations ──────────────────────────────────────────────
if [ -f "$APP_DIR/backend/run-migrations.js" ]; then
  log "Running database migrations…"
  sudo -u "$APP_USER" bash -c "cd '$APP_DIR/backend' && node run-migrations.js" || \
    warn "Migrations failed — fix .env and re-run: sudo -u $APP_USER bash -c 'cd $APP_DIR/backend && node run-migrations.js'"
fi

# ─── 10. PM2 service ────────────────────────────────────────────────
log "Starting app under PM2…"
sudo -u "$APP_USER" bash -c "cd '$APP_DIR/backend' && pm2 start npm --name thechatnest -i 2 -- start" || true
sudo -u "$APP_USER" bash -c "pm2 save"
pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" | tail -1 | bash || \
  warn "PM2 systemd integration step needed manual confirmation — re-run: pm2 startup"

# ─── 11. nginx reverse proxy ────────────────────────────────────────
NGINX_SITE="/etc/nginx/sites-available/thechatnest"
if [ ! -f "$NGINX_SITE" ]; then
  log "Writing nginx config at $NGINX_SITE…"
  cat > "$NGINX_SITE" <<'NGINX'
# TheChatNest API — reverse proxy to Node on :10000
# Replace `api.thechatnest.com` with your real domain before running certbot.
server {
    listen 80;
    server_name api.thechatnest.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:10000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 90s;
        proxy_send_timeout 90s;
    }
}
NGINX
  ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/thechatnest
  rm -f /etc/nginx/sites-enabled/default
fi
nginx -t && systemctl reload nginx

# ─── 12. fail2ban ───────────────────────────────────────────────────
log "Enabling fail2ban…"
systemctl enable --now fail2ban

# ─── 13. Unattended security upgrades ───────────────────────────────
log "Enabling unattended security upgrades…"
dpkg-reconfigure -plow unattended-upgrades || true

# ─── Final summary ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ TheChatNest VPS setup complete${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  📂 App:         $APP_DIR"
echo "  📄 env file:    $ENV_FILE"
echo "  🗄️  Database:    postgresql://${POSTGRES_USER}@127.0.0.1:5432/${POSTGRES_DB}"
echo "  🔑 DB password: ${POSTGRES_PASSWORD}"
echo "  💾 Redis:       redis://127.0.0.1:6379"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "  1. Edit $ENV_FILE — fill in SMTP, AWS/R2, Stripe, FRONTEND_ORIGIN, etc."
echo "  2. Point your DNS A record (api.thechatnest.com) at this server's IP."
echo "  3. Once DNS resolves, get TLS:"
echo "       certbot --nginx -d api.thechatnest.com"
echo "  4. Restart the app:"
echo "       sudo -u $APP_USER pm2 restart thechatnest"
echo "  5. Schedule daily Postgres backups:"
echo "       bash $APP_DIR/deploy/postgres-backup-install.sh"
echo ""
echo -e "${GREEN}Done.${NC}"
