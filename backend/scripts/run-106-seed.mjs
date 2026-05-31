// One-shot runner for migration 106_seed_test_team.sql against Neon.
//
// Why this script exists: the user's local DNS resolver fails on Neon's
// AWS subdomains (`*.c-7.us-east-1.aws.neon.tech` returns ENOTFOUND via
// the default OS resolver — same reason the Neon dashboard showed
// "Failed to fetch"). This script resolves the hostname via Cloudflare
// (1.1.1.1) + Google (8.8.8.8) DNS at the application layer, then
// passes the resolved IP to `pg` while keeping the original hostname
// for SNI/TLS verification.
//
// Usage:
//   node scripts/run-106-seed.mjs
//
// Safe to re-run — migration is idempotent.

import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns/promises';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_PATH = path.resolve(__dirname, '..', 'migrations', '106_seed_test_team.sql');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('✗ DATABASE_URL env var is required.');
  console.error('  Example: $env:DATABASE_URL = "postgresql://user:pass@host/db?sslmode=require"');
  console.error('  (do NOT commit the value — keep it in .env which is gitignored)');
  process.exit(1);
}
const parsed = new URL(connectionString);
const hostname = parsed.hostname;

(async () => {
  console.log(`→ Resolving ${hostname} via Cloudflare DNS…`);

  // Force public resolvers — bypass broken local DNS
  const resolver = new dns.Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1']);

  let ip;
  try {
    const addrs = await resolver.resolve4(hostname);
    if (!addrs?.length) throw new Error('No A records returned');
    ip = addrs[0];
    console.log(`✓ Resolved to ${ip}`);
  } catch (err) {
    console.error('✗ DNS resolution failed via public resolvers:', err.message);
    process.exit(1);
  }

  // Connect using the IP, but pass the original hostname for TLS SNI.
  const client = new pg.Client({
    host: ip,
    port: Number(parsed.port) || 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1).split('?')[0] || 'neondb',
    ssl: {
      rejectUnauthorized: false,
      servername: hostname, // SNI must use real hostname for TLS validation
    },
  });

  console.log('→ Connecting to Neon…');
  await client.connect();
  console.log('✓ Connected');

  const sql = fs.readFileSync(SQL_PATH, 'utf8');
  console.log(`→ Running ${path.basename(SQL_PATH)} (${sql.length} chars)…`);

  client.on('notice', (msg) => console.log('  NOTICE:', msg.message));

  try {
    await client.query(sql);
    console.log('✓ Migration applied successfully');
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    if (err.detail) console.error('  detail:', err.detail);
    if (err.hint) console.error('  hint:', err.hint);
    if (err.where) console.error('  where:', err.where);
    process.exitCode = 1;
  } finally {
    try {
      const u = await client.query(
        "SELECT email, name FROM users WHERE email LIKE '%@thechatnest.com' ORDER BY email"
      );
      console.log(`\n— ${u.rows.length} test users in DB —`);
      u.rows.forEach((r) => console.log(`  ${r.email.padEnd(32)} ${r.name}`));

      const g = await client.query(
        "SELECT group_name, group_description FROM groups ORDER BY group_name"
      );
      console.log(`\n— ${g.rows.length} groups in DB —`);
      g.rows.forEach((r) =>
        console.log(`  ${r.group_name.padEnd(28)} ${r.group_description || ''}`)
      );
    } catch (e) {
      console.warn('  (could not list verification rows:', e.message + ')');
    }

    await client.end();
    console.log('\n✓ Done');
  }
})().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
