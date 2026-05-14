#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# TheChatNest — Daily Postgres backup → Cloudflare R2 (or any S3 bucket)
# ─────────────────────────────────────────────────────────────────────
#
# Cron entry (installed by postgres-backup-install.sh):
#   0 3 * * * /opt/thechatnest/deploy/postgres-backup.sh
#
# What it does:
#   1. pg_dump | gzip → /var/backups/thechatnest/YYYYMMDD.sql.gz
#   2. Uploads the gzip to s3://$R2_BUCKET/postgres/ using `aws` CLI
#      (works with Cloudflare R2 via --endpoint-url)
#   3. Keeps 7 days of local backups, deletes older ones
#   4. Logs to /var/log/thechatnest-backup.log
#
# Required env (set in /etc/thechatnest-backup.env):
#   PGUSER, PGDATABASE, PGPASSWORD
#   R2_ENDPOINT_URL   — e.g. https://<account-id>.r2.cloudflarestorage.com
#   R2_ACCESS_KEY_ID
#   R2_SECRET_ACCESS_KEY
#   R2_BUCKET         — e.g. tcn-backups
#
# Discord/Slack alert on failure: set BACKUP_WEBHOOK_URL in the env file.

set -euo pipefail

# Load secrets
ENV_FILE="/etc/thechatnest-backup.env"
[ -f "$ENV_FILE" ] || { echo "[backup] Missing $ENV_FILE"; exit 1; }
# shellcheck disable=SC1090
. "$ENV_FILE"

LOG_FILE="/var/log/thechatnest-backup.log"
BACKUP_DIR="/var/backups/thechatnest"
DATE_TAG="$(date -u +%Y%m%dT%H%M%SZ)"
DUMP_FILE="${BACKUP_DIR}/thechatnest-${DATE_TAG}.sql.gz"

mkdir -p "$BACKUP_DIR"
touch "$LOG_FILE"

log() { echo "[$(date -u +%FT%TZ)] $*" | tee -a "$LOG_FILE" >&2; }
alert() {
  local msg="$1"
  log "ALERT: $msg"
  if [ -n "${BACKUP_WEBHOOK_URL:-}" ]; then
    curl -sS -m 5 -H "Content-Type: application/json" \
      -d "{\"content\":\"⚠️ TheChatNest backup failed: $msg\"}" \
      "$BACKUP_WEBHOOK_URL" >/dev/null || true
  fi
}

trap 'alert "Script exited with code $?"' ERR

log "Backup started"

# ─── 1. Dump + compress ─────────────────────────────────────────────
log "Dumping $PGDATABASE → $DUMP_FILE"
PGPASSWORD="$PGPASSWORD" pg_dump \
  --host=127.0.0.1 \
  --username="$PGUSER" \
  --no-owner \
  --no-privileges \
  --format=plain \
  "$PGDATABASE" \
  | gzip -9 > "$DUMP_FILE"

DUMP_SIZE_HUMAN=$(du -h "$DUMP_FILE" | cut -f1)
log "Local dump complete: $DUMP_SIZE_HUMAN"

# ─── 2. Upload to R2 ────────────────────────────────────────────────
if [ -n "${R2_ENDPOINT_URL:-}" ] && [ -n "${R2_BUCKET:-}" ]; then
  if ! command -v aws >/dev/null 2>&1; then
    log "Installing aws-cli (one-time)…"
    apt-get install -y -qq awscli || pip install --quiet awscli
  fi

  export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
  export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
  export AWS_DEFAULT_REGION="auto"

  REMOTE_KEY="postgres/$(basename "$DUMP_FILE")"
  log "Uploading to s3://${R2_BUCKET}/${REMOTE_KEY}…"
  aws s3 cp "$DUMP_FILE" "s3://${R2_BUCKET}/${REMOTE_KEY}" \
    --endpoint-url "$R2_ENDPOINT_URL" \
    --only-show-errors
  log "Upload complete"
else
  log "R2_ENDPOINT_URL / R2_BUCKET not set — skipping remote upload"
fi

# ─── 3. Rotate local backups (keep last 7) ──────────────────────────
log "Pruning local backups older than 7 days…"
find "$BACKUP_DIR" -name "thechatnest-*.sql.gz" -mtime +7 -delete

log "Backup finished successfully"
