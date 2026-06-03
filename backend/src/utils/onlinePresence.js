// Per-org online-user presence tracking (Redis SET).
//
// Socket.io tracks connections in-memory inside each Node process. That's
// fine for "is THIS particular socket connected", but it breaks the
// moment you want to ask cross-process / cross-server questions like:
//   • "How many people are online in org X right now?"
//   • "Is user Y online from any device?"
//
// Redis SET fixes that with O(1) add/remove and O(N) read. We key by org
// so the multi-tenant boundary is preserved.
//
// Storage:
//   presence:org:<orgId>           SET of user IDs (as strings)
//   presence:user:<userId>:sockets SET of socketIds currently connected
//
// Why two keys: a user can have multiple tabs / devices open. We only
// want to remove them from the org SET when their LAST socket disconnects.
//
// Both keys have a 24h fallback TTL — if a process crashes without
// running our disconnect handler, the entries clean themselves up by
// morning instead of accumulating forever.
//
// Failure mode: every function silently no-ops if Redis is down. The
// existing in-memory per-process tracking still works; reads from outside
// that process just return empty.

const { redisClient } = require('../config/redis');

const FALLBACK_TTL_SEC = 24 * 60 * 60; // 24h safety expiry

const isRedisReady = () =>
  redisClient && redisClient.isOpen && typeof redisClient.sAdd === 'function';

const orgKey = (orgId) => `presence:org:${orgId}`;
const userSocketsKey = (userId) => `presence:user:${userId}:sockets`;

/**
 * Mark a user as online. Idempotent — call on every socket connect.
 */
const markOnline = async ({ orgId, userId, socketId }) => {
  if (!isRedisReady() || !orgId || !userId || !socketId) return;
  try {
    await Promise.all([
      redisClient.sAdd(userSocketsKey(userId), String(socketId)),
      redisClient.expire(userSocketsKey(userId), FALLBACK_TTL_SEC),
      redisClient.sAdd(orgKey(orgId), String(userId)),
      redisClient.expire(orgKey(orgId), FALLBACK_TTL_SEC),
    ]);
  } catch {
    // ignore
  }
};

/**
 * Mark a socket as disconnected. Only removes the user from the org SET
 * when their last socket goes away — multi-tab / multi-device users stay
 * "online" until they close every window.
 *
 * Returns `{ stillOnline: boolean }` so the caller can decide whether to
 * broadcast a presence-changed event.
 */
const markOffline = async ({ orgId, userId, socketId }) => {
  if (!isRedisReady() || !orgId || !userId || !socketId) {
    return { stillOnline: false };
  }
  try {
    await redisClient.sRem(userSocketsKey(userId), String(socketId));
    const remaining = await redisClient.sCard(userSocketsKey(userId));
    if (remaining === 0) {
      await Promise.all([
        redisClient.del(userSocketsKey(userId)),
        redisClient.sRem(orgKey(orgId), String(userId)),
      ]);
      return { stillOnline: false };
    }
    return { stillOnline: true };
  } catch {
    return { stillOnline: false };
  }
};

/**
 * List currently-online user IDs in an org. Returns array of numeric IDs.
 */
const getOnlineUserIds = async (orgId) => {
  if (!isRedisReady() || !orgId) return [];
  try {
    const ids = await redisClient.sMembers(orgKey(orgId));
    return ids.map((s) => Number(s)).filter(Number.isFinite);
  } catch {
    return [];
  }
};

/**
 * Cheap O(1) head-count without paying for SMEMBERS — useful for big orgs.
 */
const getOnlineCount = async (orgId) => {
  if (!isRedisReady() || !orgId) return 0;
  try {
    return await redisClient.sCard(orgKey(orgId));
  } catch {
    return 0;
  }
};

/**
 * Is a specific user currently connected (from any device)?
 */
const isUserOnline = async (userId) => {
  if (!isRedisReady() || !userId) return false;
  try {
    return (await redisClient.sCard(userSocketsKey(userId))) > 0;
  } catch {
    return false;
  }
};

module.exports = {
  markOnline,
  markOffline,
  getOnlineUserIds,
  getOnlineCount,
  isUserOnline,
};
