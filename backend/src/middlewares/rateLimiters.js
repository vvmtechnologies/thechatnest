// Rate limiters for the auth surface.
//
// The socket layer has its own per-event in-memory limiter; this module is
// for the REST endpoints that are most attractive to attackers — login,
// password reset, OTP send/verify, refresh-token rotation. Limits are
// intentionally tight on the "guess credentials / spam OTP" routes and
// looser on routes that simply read state (e.g. /auth/me).
//
// Storage: Redis-backed when REDIS_ENABLED=true (counters persist across
// PM2 restarts AND across nodes if the app is ever scaled horizontally).
// Falls back to express-rate-limit's in-memory store when Redis is
// disabled or unavailable — that's safer than failing closed.
//
// All limiters key by IP. We honour the X-Forwarded-For header when behind
// nginx / Render's proxy (set in app.js via app.set('trust proxy', 1)).
//
// Failure response shape matches the rest of the API ({ status: "error",
// message }), so the existing client error toasts read it cleanly.

const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient } = require('../config/redis');

const formatHandler = (windowLabel) => (req, res /*, next, options */) => {
  res.status(429).json({
    status: 'error',
    code: 'rate_limited',
    message: `Too many requests. Please wait ${windowLabel} and try again.`,
  });
};

// Build a Redis-backed store if Redis is open. We use the prefix to keep
// rate-limit keys partitioned from cache keys (different TTL semantics, and
// easier to spot in `redis-cli KEYS rl:*`).
//
// IMPORTANT: returns undefined when Redis is unavailable so express-rate-limit
// silently falls back to its in-memory store. That keeps the API protected
// during a Redis outage instead of failing open.
const buildStore = (prefix) => {
  if (!redisClient || !redisClient.isOpen || typeof redisClient.sendCommand !== 'function') {
    return undefined;
  }
  return new RedisStore({
    prefix: `rl:${prefix}:`,
    // node-redis v4 client compatibility shim required by rate-limit-redis.
    sendCommand: (...args) => redisClient.sendCommand(args),
  });
};

const make = ({ windowMs, max, message, prefix, windowLabel }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: buildStore(prefix),
    message: { status: 'error', code: 'rate_limited', message },
    handler: formatHandler(windowLabel),
  });

// 5 attempts / 15 minutes — covers credentials-stuffing on /auth/login and
// the OTP guess flow on /auth/verify-otp / /auth/forgot-verify.
const authLimiter = make({
  windowMs: 15 * 60 * 1000,
  max: 5,
  prefix: 'auth',
  windowLabel: '15 minutes',
  message: 'Too many login attempts. Try again in 15 minutes.',
});

// 3 password-reset emails per hour per IP — slows enumeration of registered
// emails (each request reveals "yes, this email exists" via timing or wording).
const passwordResetLimiter = make({
  windowMs: 60 * 60 * 1000,
  max: 3,
  prefix: 'pwreset',
  windowLabel: '1 hour',
  message: 'Too many reset requests. Try again in 1 hour.',
});

// 5 OTP resends per 10 minutes per IP — generous enough for legitimate retry
// (network blips on SMS/email delivery) but caps abusive spam.
const otpResendLimiter = make({
  windowMs: 10 * 60 * 1000,
  max: 5,
  prefix: 'otp',
  windowLabel: '10 minutes',
  message: 'Too many OTP requests. Try again in 10 minutes.',
});

// 60 refreshes per 15 minutes per IP — refresh tokens rotate naturally, so
// any IP hitting this is either misconfigured or attempting token reuse.
const refreshLimiter = make({
  windowMs: 15 * 60 * 1000,
  max: 60,
  prefix: 'refresh',
  windowLabel: '15 minutes',
  message: 'Too many refresh attempts.',
});

// Loose registration limiter — 10 new accounts per IP per hour. Stops a
// single IP signing up bots while allowing a small office NAT to onboard.
const registrationLimiter = make({
  windowMs: 60 * 60 * 1000,
  max: 10,
  prefix: 'register',
  windowLabel: '1 hour',
  message: 'Too many registration attempts. Try again in 1 hour.',
});

// Public-form limiter — 6 submissions per IP per hour for /contact-us
// (and any other unauthenticated lead-capture endpoints). Combined with
// the honeypot field and submit-dwell check on the client, this is enough
// to keep automated form-spam manageable without blocking real prospects.
const publicFormLimiter = make({
  windowMs: 60 * 60 * 1000,
  max: 6,
  prefix: 'pubform',
  windowLabel: '1 hour',
  message: 'Too many submissions. Please try again later.',
});

module.exports = {
  authLimiter,
  passwordResetLimiter,
  otpResendLimiter,
  refreshLimiter,
  registrationLimiter,
  publicFormLimiter,
};
