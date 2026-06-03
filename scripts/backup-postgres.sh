#!/bin/bash
# ─── TheChatNest — daily Postgres backup ────────────────────────────────
# Run nightly via cron.daily. Dumps the thechatnest database, gzips it,
# rotates local copies (keep last 14 days), and optionally pushes the
# newest archive to S3 if AWS_S3_BUCKET is configured.
#
# Reads credentials from /root/.thechatnest/secrets (DB_PASSWORD) and
# the app's .env (AWS_*). No secrets inside this script.
#
# Cron install (done once by deploy.sh):
#   ln -sf /var/www/thechatnest/scripts/backup-postgres.sh \
#          /etc/cron.daily/thechatnest-postgres-backup
#
# Restore:
#   gunzip -c /var/backups/thechatnest/db-YYYY-MM-DD.sql.gz | \
#     PGPASSWORD=... psql -U thechatnest -h localhost -d thechatnest
# ────────────────────────────────────────────────────────────────────────

set -e

BACKUP_DIR=/var/backups/thechatnest
LOG=/var/log/thechatnest/backup.log
KEEP_DAYS=14

mkdir -p "$BACKUP_DIR" /var/log/thechatnest

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG"
}

# Source DB password (file is chmod 600, root-only).
if [ -f /root/.thechatnest/secrets ]; then
  # shellcheck disable=SC1091
  . /root/.thechatnest/secrets
else
  log "FATAL: /root/.thechatnest/secrets missing"
  exit 1
fi

if [ -z "${DB_PASSWORD:-}" ]; then
  log "FATAL: DB_PASSWORD not set"
  exit 1
fi

STAMP=$(date +%Y-%m-%d_%H%M%S)
ARCHIVE="$BACKUP_DIR/db-${STAMP}.sql.gz"

log "━━━ Backup started → $ARCHIVE ━━━"

# pg_dump streams the dump straight into gzip — never materialises the
# uncompressed file on disk. --no-owner / --no-acl keep the dump
# restorable into a fresh role + database without permission drama.
PGPASSWORD="$DB_PASSWORD" pg_dump \
  --no-owner --no-acl \
  -U thechatnest -h localhost -d thechatnest \
  | gzip -6 > "$ARCHIVE"

SIZE=$(du -h "$ARCHIVE" | cut -f1)
log "  ✓ Dump complete: $SIZE"

# Best-effort S3 upload — never fail the cron if S3 is misconfigured.
# AWS creds are read from the app's .env (same set used by multer/file
# uploads), so a fresh VPS picks them up automatically after deploy.
ENV_FILE=/var/www/thechatnest/backend/.env
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set +e
  AWS_ACCESS_KEY_ID=$(grep '^AWS_ACCESS_KEY_ID=' "$ENV_FILE" | cut -d= -f2-)
  AWS_SECRET_ACCESS_KEY=$(grep '^AWS_SECRET_ACCESS_KEY=' "$ENV_FILE" | cut -d= -f2-)
  AWS_REGION=$(grep '^AWS_REGION=' "$ENV_FILE" | cut -d= -f2-)
  AWS_S3_BUCKET=$(grep '^AWS_S3_BUCKET=' "$ENV_FILE" | cut -d= -f2-)
  export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_DEFAULT_REGION="$AWS_REGION"

  if command -v aws >/dev/null 2>&1 && [ -n "$AWS_S3_BUCKET" ]; then
    log "  → Uploading to s3://$AWS_S3_BUCKET/backups/postgres/..."
    aws s3 cp "$ARCHIVE" "s3://$AWS_S3_BUCKET/backups/postgres/" --quiet \
      && log "  ✓ S3 upload OK" \
      || log "  ✗ S3 upload failed (continuing — local copy kept)"
  fi
  set -e
fi

# Rotate: keep last KEEP_DAYS days locally; older ones are deleted.
# S3 copies persist independently — set a lifecycle rule on the bucket
# if you need to age those out too.
DELETED=$(find "$BACKUP_DIR" -name 'db-*.sql.gz' -mtime "+$KEEP_DAYS" -delete -print | wc -l)
log "  ✓ Rotated: removed $DELETED archives older than $KEEP_DAYS days"

REMAINING=$(ls -1 "$BACKUP_DIR"/db-*.sql.gz 2>/dev/null | wc -l)
log "━━━ Backup done. $REMAINING archives in $BACKUP_DIR ━━━"
