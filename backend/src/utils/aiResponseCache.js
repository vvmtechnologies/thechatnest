// Short-lived cache for AI completions (Gemini / OpenAI / Claude).
//
// Why: the same prompt repeated within a few minutes — same provider, same
// system prompt, same message history — should not pay for two API calls.
// In practice this catches:
//   • Browser back-button retries
//   • Double-clicks on "Send" / "Regenerate"
//   • Multi-tab same-question scenarios
//   • Worker retries on transient HTTP failures
//
// Storage:
//   ai:resp:<provider>:<sha256(systemPrompt + messages JSON)>
//   value: JSON.stringify(reply string)
//   TTL: 5 minutes (configurable via AI_RESPONSE_CACHE_TTL_SEC)
//
// We deliberately SKIP caching when the most recent user message contains
// time-sensitive keywords ("now", "today", "current", "live", "right now",
// "abhi" etc). Those answers should reflect "as of right now".
//
// Failure mode: cache miss on any Redis error — just calls the provider
// like before. Never poisons response on hit failure either.

const crypto = require('crypto');
const { redisClient } = require('../config/redis');

const TTL_SEC = Number(process.env.AI_RESPONSE_CACHE_TTL_SEC) || 5 * 60;
const KEY_PREFIX = 'ai:resp:';

// Phrases that mean "answer based on right-now state" — caching these would
// serve stale data. Add Hindi/Hinglish variants since the project's users
// mix both.
const TEMPORAL_HINTS = [
  /\bnow\b/i,
  /\bright now\b/i,
  /\btoday\b/i,
  /\bcurrent\b/i,
  /\bcurrently\b/i,
  /\blive\b/i,
  /\blatest\b/i,
  /\babhi\b/i,
  /\baaj\b/i,
];

const isRedisReady = () =>
  redisClient && redisClient.isOpen && typeof redisClient.get === 'function';

const isTemporalPrompt = (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) return false;
  const last = messages[messages.length - 1];
  const text = String(last?.content || '');
  return TEMPORAL_HINTS.some((rx) => rx.test(text));
};

const buildCacheKey = (provider, systemPrompt, messages) => {
  const payload = JSON.stringify({
    p: String(provider || '').toLowerCase(),
    s: String(systemPrompt || ''),
    m: messages || [],
  });
  return KEY_PREFIX + crypto.createHash('sha256').update(payload).digest('hex');
};

/**
 * Look up a previously-cached reply for this prompt. Returns the string
 * reply on hit, or null on miss / temporal prompt / Redis error.
 */
const getCachedReply = async ({ provider, systemPrompt, messages }) => {
  if (!isRedisReady() || isTemporalPrompt(messages)) return null;
  try {
    const raw = await redisClient.get(buildCacheKey(provider, systemPrompt, messages));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Store a reply for future lookups. No-op on temporal prompts so we don't
 * cache "what time is it" type answers.
 */
const setCachedReply = async ({ provider, systemPrompt, messages, reply }) => {
  if (!isRedisReady() || isTemporalPrompt(messages) || !reply) return;
  try {
    await redisClient.setEx(
      buildCacheKey(provider, systemPrompt, messages),
      TTL_SEC,
      JSON.stringify(reply)
    );
  } catch {
    // ignore
  }
};

module.exports = {
  getCachedReply,
  setCachedReply,
};
