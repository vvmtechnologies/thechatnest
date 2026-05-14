#!/usr/bin/env bash
# Installs the daily Postgres backup cron + env scaffold.
# Run once as root after setup.sh:
#   bash /opt/thechatnest/deploy/postgres-backup-install.sh

set -euo pipefail

ENV_FILE="/etc/thechatnest-backup.env"
SCRIPT_PATH="/opt/thechatnest/deploy/postgres-backup.sh"
CRON_FILE="/etc/cron.d/thechatnest-backup"

[ -f "$SCRIPT_PATH" ] || { echo "Missing $SCRIPT_PATH — run setup.sh first."; exit 1; }

chmod +x "$SCRIPT_PATH"

# Pull DB creds from app .env if we can — saves the user retyping them.
APP_ENV="/opt/thechatnest/backend/.env"
PG_USER_DEFAULT="thechatnest"
PG_DB_DEFAULT="thechatnest_prod"
PG_PASS_DEFAULT=""
if [ -f "$APP_ENV" ]; then
  DB_URL=$(grep -E "^DATABASE_URL=" "$APP_ENV" | head -1 | cut -d= -f2-)
  if [[ "$DB_URL" =~ postgresql://([^:]+):([^@]+)@[^/]+/(.+)$ ]]; then
    PG_USER_DEFAULT="${BASH_REMATCH[1]}"
    PG_PASS_DEFAULT="${BASH_REMATCH[2]}"
    PG_DB_DEFAULT="${BASH_REMATCH[3]}"
  fi
fi

if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<ENV
# TheChatNest backup secrets — used by postgres-backup.sh
# Filled in from /opt/thechatnest/backend/.env where possible.

PGUSER=${PG_USER_DEFAULT}
PGDATABASE=${PG_DB_DEFAULT}
PGPASSWORD=${PG_PASS_DEFAULT}

# Cloudflare R2 bucket (or any S3-compatible). Leave blank to keep
# backups local-only (NOT recommended for production).
R2_ENDPOINT_URL=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=

# Optional Discord / Slack webhook for failure alerts
BACKUP_WEBHOOK_URL=
ENV
  chmod 600 "$ENV_FILE"
  echo "✓ Created $ENV_FILE — edit it to fill in R2 credentials."
fi

cat > "$CRON_FILE" <<CRON
# TheChatNest — daily Postgres backup at 03:00 IST (21:30 UTC).
# Edit /etc/thechatnest-backup.env to configure R2 destination.
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
30 21 * * * root $SCRIPT_PATH >> /var/log/thechatnest-backup.log 2>&1
CRON
chmod 644 "$CRON_FILE"

echo "✓ Cron installed at $CRON_FILE — runs daily at 21:30 UTC (03:00 IST)."
echo ""
echo "Next steps:"
echo "  1. Edit $ENV_FILE — fill in R2_ENDPOINT_URL + R2_ACCESS_KEY_ID +"
echo "     R2_SECRET_ACCESS_KEY + R2_BUCKET (create the bucket on Cloudflare R2 first)."
echo "  2. Test a backup right now:"
echo "       $SCRIPT_PATH"
echo "  3. Check the log:"
echo "       tail -50 /var/log/thechatnest-backup.log"
