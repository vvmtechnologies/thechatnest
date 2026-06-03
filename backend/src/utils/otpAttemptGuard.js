// Per-email OTP attempt cap (Redis-backed).
//
// The IP-keyed `authLimiter` already caps OTP-verify attempts at 5 per 15
// min per IP. That helps but doesn't stop a distributed attacker hitting
// the same email from many IPs (residential proxies, mobile NAT, etc.).
// This module keys attempts by EMAIL so the cap follows the target user
// no matter where the requests come from.
//
// resolve.md ties this to B5 ("OTP brute-force harden").
//
// Storage:
//   otp:attempts:<email>          counter (INCR)  TTL 1h
//   otp:lock:<email>              "1"             TTL 30 min  (set after threshold)
//
// Failure mode: if Redis is down, both functions return permissive
// defaults (`isLocked → false`, attempts not counted). The IP limiter
// remains as the next line of defence.

const { redisClient } = require('../config/redis');

const MAX_ATTEMPTS = Number(process.env.OTP_ATTEMPTS_PER_EMAIL_MAX) || 5;
const ATTEMPT_WINDOW_SEC = 60 * 60;        // 1 hour rolling window
const LOCK_DURATION_SEC = 30 * 60;         // 30 min lockout once tripped

const isRedisReady = () =>
  redisClient && redisClient.isOpen && typeof redisClient.incr === 'function';

const attemptKey = (email) => `otp:attempts:${String(email).toLowerCase()}`;
const lockKey = (email) => `otp:lock:${String(email).toLowerCase()}`;

/**
 * Check whether this email is currently locked out from OTP attempts.
 * Returns { locked: bool, retryAfterSec: number }.
 */
const isLocked = async (email) => {
  if (!email || !isRedisReady()) return { locked: false, retryAfterSec: 0 };
  try {
    const ttl = await redisClient.ttl(lockKey(email));
    if (ttl > 0) return { locked: true, retryAfterSec: ttl };
    return { locked: false, retryAfterSec: 0 };
  } catch {
    return { locked: false, retryAfterSec: 0 };
  }
};

/**
 * Record a failed OTP attempt. Returns the new attempt count and whether
 * this attempt tripped the lock. Idempotent on Redis errors (returns 0).
 */
const recordFailedAttempt = async (email) => {
  if (!email || !isRedisReady()) return { count: 0, locked: false };
  try {
    const key = attemptKey(email);
    const count = await redisClient.incr(key);
    if (count === 1) {
      // First failure starts the rolling window.
      await redisClient.expire(key, ATTEMPT_WINDOW_SEC);
    }
    if (count >= MAX_ATTEMPTS) {
      await redisClient.setEx(lockKey(email), LOCK_DURATION_SEC, '1');
      return { count, locked: true };
    }
    return { count, locked: false };
  } catch {
    return { count: 0, locked: false };
  }
};

/**
 * Clear all attempt state for this email — call on successful OTP
 * verification so the user starts fresh next time.
 */
const resetAttempts = async (email) => {
  if (!email || !isRedisReady()) return;
  try {
    await redisClient.del(attemptKey(email));
    await redisClient.del(lockKey(email));
  } catch {
    // ignore
  }
};

module.exports = {
  isLocked,
  recordFailedAttempt,
  resetAttempts,
  MAX_ATTEMPTS,
  LOCK_DURATION_SEC,
};
