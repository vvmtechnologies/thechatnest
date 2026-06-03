#!/bin/bash
# ─── TheChatNest backend auto-deploy ───────────────────────────────────
# Called by GitHub Actions over SSH. Pulls latest code, installs new
# dependencies (if package.json changed), and restarts PM2.
#
# Idempotent — safe to run multiple times. Skips npm install if the
# package-lock hash is unchanged, so most deploys complete in ~5 seconds.
# ────────────────────────────────────────────────────────────────────────

set -e
exec 2>&1

REPO=/var/www/thechatnest
BACKEND="$REPO/backend"
LOG=/var/log/thechatnest/deploy.log
mkdir -p /var/log/thechatnest

# Stamp every line so the log is debuggable later.
log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG"
}

log "━━━ Deploy started ━━━"

cd "$REPO"

# Capture the current package-lock hash so we know if `npm install` is needed.
OLD_LOCK_HASH=$(sha256sum "$BACKEND/package-lock.json" 2>/dev/null | cut -c1-12 || echo "missing")
OLD_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

log "Current commit: $OLD_COMMIT, lock: $OLD_LOCK_HASH"

# Pull the latest. --ff-only keeps history clean — if someone force-pushed
# or rewrote history, fail loudly so a human can investigate.
log "Fetching..."
git fetch --depth=1 origin
BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "On branch: $BRANCH"
git reset --hard "origin/$BRANCH"

NEW_COMMIT=$(git rev-parse --short HEAD)
NEW_LOCK_HASH=$(sha256sum "$BACKEND/package-lock.json" 2>/dev/null | cut -c1-12 || echo "missing")
log "New commit: $NEW_COMMIT, lock: $NEW_LOCK_HASH"

if [ "$OLD_COMMIT" = "$NEW_COMMIT" ]; then
  log "No new commits — nothing to deploy."
  exit 0
fi

# Only reinstall dependencies if package-lock changed. Saves ~2-3 min
# on most deploys.
if [ "$OLD_LOCK_HASH" != "$NEW_LOCK_HASH" ]; then
  log "package-lock changed — running npm install..."
  cd "$BACKEND"
  npm install --omit=dev 2>&1 | tail -5 | tee -a "$LOG"
else
  log "package-lock unchanged — skipping npm install"
fi

# Sync Nginx config if the repo version differs from the live file.
# Repo is the source of truth — any direct edits on the VPS get
# overwritten next deploy. `nginx -t` runs before reload so a bad
# config never reaches the live socket.
NGINX_SRC="$REPO/scripts/nginx/api.thechatnest.com.conf"
NGINX_LIVE=/etc/nginx/sites-available/api.thechatnest.com
if [ -f "$NGINX_SRC" ]; then
  if ! cmp -s "$NGINX_SRC" "$NGINX_LIVE" 2>/dev/null; then
    log "Nginx config changed — syncing + reloading..."
    cp "$NGINX_SRC" "$NGINX_LIVE"
    if nginx -t 2>&1 | tee -a "$LOG"; then
      systemctl reload nginx
      log "  ✓ Nginx reloaded"
    else
      log "  ✗ Nginx config invalid — reverting!"
      # Roll back to whatever was live before this deploy attempted the
      # swap. The next git pull will bring back the broken file again,
      # so a human still needs to fix the repo before the next deploy.
      cd "$REPO" && git show "$OLD_COMMIT:scripts/nginx/api.thechatnest.com.conf" > "$NGINX_LIVE" 2>/dev/null
      systemctl reload nginx || true
      exit 1
    fi
  fi
fi

# Install/refresh pm2-logrotate module — keeps /root/.pm2/logs/*.log
# bounded (10 MB per file, 7-day retention). Without this, error logs
# can grow unbounded and fill the disk over months. Idempotent.
if ! pm2 list 2>/dev/null | grep -q pm2-logrotate; then
  log "Installing pm2-logrotate..."
  pm2 install pm2-logrotate >/dev/null 2>&1 || true
  pm2 set pm2-logrotate:max_size 10M >/dev/null 2>&1 || true
  pm2 set pm2-logrotate:retain 7 >/dev/null 2>&1 || true
  pm2 set pm2-logrotate:compress true >/dev/null 2>&1 || true
fi

# Wire the postgres backup script into cron.daily (symlink → repo file
# so updates to the script ship via git pull, no manual sync needed).
BACKUP_SCRIPT="$REPO/scripts/backup-postgres.sh"
BACKUP_CRON=/etc/cron.daily/thechatnest-postgres-backup
if [ -f "$BACKUP_SCRIPT" ]; then
  chmod +x "$BACKUP_SCRIPT"
  if [ ! -L "$BACKUP_CRON" ] || [ "$(readlink "$BACKUP_CRON")" != "$BACKUP_SCRIPT" ]; then
    log "Wiring backup-postgres.sh into cron.daily..."
    ln -sf "$BACKUP_SCRIPT" "$BACKUP_CRON"
  fi
fi

# Add logrotate rules for /var/log/thechatnest/*.log (app.log, deploy.log,
# backup.log) — keeps each under 50 MB with 14-day retention. logrotate
# already runs daily via systemd timer, so no extra cron needed.
LOGROTATE_RULE=/etc/logrotate.d/thechatnest
if [ ! -f "$LOGROTATE_RULE" ]; then
  log "Installing logrotate rule for /var/log/thechatnest/*.log..."
  cat > "$LOGROTATE_RULE" <<'LOGROTATE'
/var/log/thechatnest/*.log {
    daily
    rotate 14
    size 50M
    missingok
    notifempty
    compress
    delaycompress
    copytruncate
}
LOGROTATE
fi

# Restart PM2. `--update-env` re-reads the .env file in case it was
# edited out-of-band (rare, but harmless).
log "Restarting PM2..."
cd "$BACKEND"
pm2 restart thechatnest-api --update-env 2>&1 | tail -3 | tee -a "$LOG"

# Give the app a moment to boot before the GitHub Action's health check
# runs. Most boots complete in < 2s, but pad to absorb cold-cache cases.
sleep 3

log "━━━ Deploy complete: $OLD_COMMIT → $NEW_COMMIT ━━━"
