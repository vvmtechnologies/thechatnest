// JWT access-token denylist (Redis-backed, ephemeral).
//
// Access tokens are 15-minute JWTs — they can't be "unsigned" once issued.
// To honour an explicit logout (and stop a stolen-but-not-yet-expired token
// from doing damage), we keep a short-lived denylist in Redis. Keys auto-
// expire when the token would have expired anyway, so the set never grows
// unbounded.
//
// This is the canonical pattern; the alternatives are much worse:
//   • DB lookup on every request → adds 10–20 ms per call.
//   • Asymmetric keys + per-user version → forces full re-login.
//
// Storage shape:
//   denylist:jwt:<sha256(token)>  →  "1"  with TTL = remaining-lifetime
//
// Fallback: if Redis is down or disabled, all checks return "not revoked"
// (fail open). The next layer of defence is the JWT's own 15-minute expiry.

const crypto = require('crypto');
const { redisClient } = require('../config/redis');

const DEFAULT_TTL_SECONDS = 15 * 60; // matches JWT_EXPIRES_IN=15m default
const KEY_PREFIX = 'denylist:jwt:';

const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token)).digest('hex');

const isRedisReady = () =>
  redisClient && redisClient.isOpen && typeof redisClient.setEx === 'function';

// Pull `exp` (unix seconds) out of the JWT payload without re-verifying. We
// only use this to compute how long the denylist entry needs to live; the
// caller has already verified the signature before invoking us.
const remainingLifetimeSeconds = (token) => {
  try {
    const [, payloadB64] = String(token).split('.');
    if (!payloadB64) return DEFAULT_TTL_SECONDS;
    const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(json);
    if (typeof payload?.exp !== 'number') return DEFAULT_TTL_SECONDS;
    const remaining = payload.exp - Math.floor(Date.now() / 1000);
    if (remaining <= 0) return 1; // expired anyway; minimum-1s entry is fine
    if (remaining > 24 * 60 * 60) return 24 * 60 * 60; // hard cap 24h sanity
    return remaining;
  } catch {
    return DEFAULT_TTL_SECONDS;
  }
};

/**
 * Mark an access token as revoked. Idempotent.
 *
 * Cost: 1 SETEX. ~1 ms. Never throws — Redis outages should not break
 * logout, the user's client clears its own copy regardless.
 */
const revokeAccessToken = async (token) => {
  if (!token || !isRedisReady()) return;
  try {
    await redisClient.setEx(
      KEY_PREFIX + hashToken(token),
      remainingLifetimeSeconds(token),
      '1'
    );
  } catch {
    // ignore — see comment above
  }
};

/**
 * True if the token was explicitly revoked since it was issued.
 *
 * Cost: 1 EXISTS. ~1 ms. Returns false on Redis errors (fail open) so a
 * Redis outage degrades to "JWT expiry only" instead of locking everyone
 * out.
 */
const isAccessTokenRevoked = async (token) => {
  if (!token || !isRedisReady()) return false;
  try {
    const value = await redisClient.get(KEY_PREFIX + hashToken(token));
    return value === '1';
  } catch {
    return false;
  }
};

module.exports = {
  revokeAccessToken,
  isAccessTokenRevoked,
};
