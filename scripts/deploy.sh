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

# Restart PM2. `--update-env` re-reads the .env file in case it was
# edited out-of-band (rare, but harmless).
log "Restarting PM2..."
cd "$BACKEND"
pm2 restart thechatnest-api --update-env 2>&1 | tail -3 | tee -a "$LOG"

# Give the app a moment to boot before the GitHub Action's health check
# runs. Most boots complete in < 2s, but pad to absorb cold-cache cases.
sleep 3

log "━━━ Deploy complete: $OLD_COMMIT → $NEW_COMMIT ━━━"
