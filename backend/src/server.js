const dotenv = require('dotenv');
dotenv.config();
const os = require('node:os');
const http = require('node:http');
const dns = require('node:dns');

// ─── Env validation ────────────────────────────────────────────────────
// Fail fast at boot if a required secret is missing or obviously wrong.
// Cheaper to crash on startup than to discover the misconfig at first
// request — and surfaces issues in CI / deploy pipelines immediately.
(() => {
  const isProd = process.env.NODE_ENV === 'production';
  const errors = [];
  const warnings = [];

  // Hard requirements (every environment)
  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is not set. Generate via: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
  } else if (/^(change_this_secret|change_this|test|secret|password|changeme)$/i.test(process.env.JWT_SECRET)) {
    // Only fail on obvious placeholder strings — short-but-real secrets
    // get a warning so we don't break existing deployments that haven't
    // rotated their secret yet (B1 in resolve.md tracks the rotation).
    errors.push('JWT_SECRET is a known placeholder value. Replace it with a random 32-byte secret.');
  } else if (process.env.JWT_SECRET.length < 24) {
    warnings.push(`JWT_SECRET is short (${process.env.JWT_SECRET.length} chars). Rotate to a 32-byte random string when possible. See resolve.md B1.`);
  }

  // DB connectivity — DATABASE_URL or DB_* must be present
  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    errors.push('Neither DATABASE_URL nor DB_HOST is set — cannot connect to Postgres.');
  }

  // Production-only requirements
  if (isProd) {
    if (!process.env.CHAT_ENCRYPTION_KEY) {
      errors.push('CHAT_ENCRYPTION_KEY required in production for chat-at-rest encryption.');
    }
    if (!process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY) {
      warnings.push('PAYMENT_GATEWAY_ENCRYPTION_KEY missing — payment gateway credentials will fall back to plaintext storage.');
    }
    if (!process.env.CORS_ORIGIN && !process.env.FRONTEND_ORIGIN) {
      warnings.push('CORS_ORIGIN / FRONTEND_ORIGIN unset in production — only localhost callers will be allowed.');
    }
  } else {
    if (!process.env.CHAT_ENCRYPTION_KEY) {
      warnings.push('CHAT_ENCRYPTION_KEY missing (dev only) — encryption features may be disabled.');
    }
  }

  warnings.forEach((w) => console.warn('[env] WARN:', w));
  if (errors.length) {
    console.error('\n[env] FATAL — required environment variables are missing or invalid:');
    errors.forEach((e) => console.error('  ✗', e));
    console.error('\nSee backend/.env.example for the full list.\n');
    process.exit(1);
  }
})();

// Force the DNS resolver to return IPv4 addresses first for every outbound
// lookup made in this process. Node 18+ defaults to "verbatim" ordering,
// which can hand back AAAA (IPv6) records first — and managed hosts like
// Render don't route outbound IPv6, so the first connect dies with
// ENETUNREACH. SMTP (Gmail), Stripe, S3, webhook deliveries etc. all
// benefit. Individual sockets can still opt back into v6 with `family: 6`.
try { dns.setDefaultResultOrder('ipv4first'); } catch { /* Node < 18 */ }

const app = require('./app');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const smtpSettingsModel = require('./models/smtpSettingsModel');
const { initSocket } = require('./socket');
const { startMeetingScheduler } = require('./schedulers/meetingScheduler');

const BASE_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_ATTEMPTS = 5;

const startExpress = (port) =>
  new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(port, () => resolve(server));
    server.on('error', (err) => reject({ err, server }));
  });

const attachShutdownHooks = (server) => {
  const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Closing server...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
};

const startServer = async (port = BASE_PORT, attempt = 1) => {
  try {
    await connectDatabase();
    await smtpSettingsModel.createTableIfNotExists();

    try {
      await connectRedis();
    } catch (error) {
      console.warn('Redis connection skipped:', error.message);
    }

    const server = await startExpress(port);

    // Increase timeout for large file uploads (10 minutes)
    server.timeout = 10 * 60 * 1000;
    server.headersTimeout = 10 * 60 * 1000 + 1000;
    server.keepAliveTimeout = 5 * 60 * 1000;

    // Attach Socket.IO to the same HTTP server
    initSocket(server);

    // Meeting reminder + recurrence scheduler
    startMeetingScheduler();

    console.log(`Server running on port ${port}`);
    console.log(
      `Runtime: host=${os.hostname()} platform=${os.platform()} arch=${os.arch()} cpus=${os.cpus()?.length || 0} node=${process.version}`
    );
    attachShutdownHooks(server);
  } catch (payload) {
    const error = payload.err || payload;

    if (error.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      console.warn(`Port ${port} in use. Trying ${nextPort}...`);
      return startServer(nextPort, attempt + 1);
    }

    console.error('Failed to start server', error.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection', reason);
  process.exit(1);
});

startServer();
