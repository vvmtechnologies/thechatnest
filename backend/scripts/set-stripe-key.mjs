// Sets the Stripe secret + publishable key on the payment_gateways row
// for the "stripe" gateway. Required because the production backend
// returns 500 from /billing/checkout-session when config_json is empty
// AND no STRIPE_SECRET_KEY env var is set on Render.
//
// Usage:
//   STRIPE_SECRET_KEY=sk_test_xxx \
//   STRIPE_PUBLISHABLE_KEY=pk_test_xxx \
//   STRIPE_MODE=test \
//   node scripts/set-stripe-key.mjs
//
// If no env vars are set, this script prints what to paste instead of
// editing — safer when credentials shouldn't be on this machine.

import dns from 'node:dns/promises';
import pg from 'pg';

const SK = (process.env.STRIPE_SECRET_KEY || '').trim();
const PK = (process.env.STRIPE_PUBLISHABLE_KEY || '').trim();
// Backend's toMode() treats anything except 'live' as 'sandbox' — so the
// config key for test mode MUST be "sandbox" (not "test").
const MODE = SK.startsWith('sk_live_') ? 'live' : 'sandbox';

if (!SK) {
  console.log(`\nUsage (Git Bash):
  STRIPE_SECRET_KEY=sk_test_xxx \\
  STRIPE_PUBLISHABLE_KEY=pk_test_xxx \\
  node scripts/set-stripe-key.mjs

Usage (PowerShell):
  $env:STRIPE_SECRET_KEY="sk_test_xxx"
  $env:STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
  node scripts/set-stripe-key.mjs

OR manually run in Neon SQL editor (test mode):
  UPDATE payment_gateways
  SET config_json = jsonb_build_object(
    'active_mode', 'sandbox',
    'sandbox', jsonb_build_object(
      'secret_key', '<your sk_test_...>',
      'publishable_key', '<your pk_test_...>'
    )
  ),
  is_enabled = true,
  status = 'active',
  updated_at = NOW()
  WHERE gateway_key = 'stripe';
`);
  process.exit(0);
}

if (SK.startsWith('pk_')) {
  console.error('✗ STRIPE_SECRET_KEY looks like a publishable key (pk_...). You need the SECRET key (sk_...).');
  process.exit(1);
}
if (!SK.startsWith('sk_')) {
  console.error('✗ STRIPE_SECRET_KEY must start with sk_test_ or sk_live_.');
  process.exit(1);
}

const DEFAULT_CONN =
  'postgresql://neondb_owner:npg_ixJXWI3FT7Pq@ep-muddy-wildflower-ap2ulhoz-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const conn = process.env.DATABASE_URL || DEFAULT_CONN;
const parsed = new URL(conn);

const resolver = new dns.Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);
const [ip] = await resolver.resolve4(parsed.hostname);

const client = new pg.Client({
  host: ip,
  port: Number(parsed.port) || 5432,
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.slice(1).split('?')[0] || 'neondb',
  ssl: { rejectUnauthorized: false, servername: parsed.hostname },
});

await client.connect();

const credentials = { secret_key: SK };
if (PK) credentials.publishable_key = PK;

const config = {
  active_mode: MODE,             // "sandbox" or "live"
  [MODE]: credentials,           // resolved by resolveGatewayRuntimeConfig
};

const res = await client.query(
  `UPDATE payment_gateways
   SET config_json = $1::jsonb,
       is_enabled = true,
       status = 'active',
       updated_at = NOW()
   WHERE gateway_key = 'stripe'
   RETURNING payment_gateway_id, gateway_key, is_enabled, status,
             jsonb_object_keys(config_json) AS top_level_keys;`,
  [JSON.stringify(config)]
);

if (!res.rows.length) {
  console.error('✗ No stripe row found to update.');
} else {
  console.log('✓ Updated payment_gateways for stripe:');
  res.rows.forEach((r) =>
    console.log(`  id=${r.payment_gateway_id}  enabled=${r.is_enabled}  status=${r.status}  config keys=${r.top_level_keys}`)
  );
  console.log(`\n✓ Mode: ${MODE}  ·  SK: ${SK.slice(0, 8)}...${SK.slice(-4)}  ·  PK: ${PK ? PK.slice(0, 8) + '...' : '(not provided)'}`);
  console.log('\nNext: hit /billing/checkout-session from the app again — 500 should be gone.');
}

await client.end();
