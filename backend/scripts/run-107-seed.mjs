// One-shot runner for migration 107_seed_alltoolhub_team.sql against Neon.
// Same DNS-bypass pattern as run-106-seed.mjs (local resolver fails on
// *.aws.neon.tech, we resolve via Cloudflare and pass IP + SNI).

import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns/promises';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SQL_PATH = path.resolve(__dirname, '..', 'migrations', '107_seed_alltoolhub_team.sql');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('✗ DATABASE_URL env var is required.');
  process.exit(1);
}
const parsed = new URL(connectionString);

const resolver = new dns.Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1']);

console.log(`→ Resolving ${parsed.hostname}…`);
const [ip] = await resolver.resolve4(parsed.hostname);
console.log(`✓ ${parsed.hostname} → ${ip}`);

const client = new pg.Client({
  host: ip,
  port: Number(parsed.port) || 5432,
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.slice(1).split('?')[0] || 'neondb',
  ssl: { rejectUnauthorized: false, servername: parsed.hostname },
});

await client.connect();
console.log('✓ Connected to Neon');

client.on('notice', (msg) => console.log('  NOTICE:', msg.message));

const sql = fs.readFileSync(SQL_PATH, 'utf8');
console.log(`→ Running ${path.basename(SQL_PATH)}…`);

try {
  await client.query(sql);
  console.log('✓ Migration applied');
} catch (err) {
  console.error('✗ Migration failed:', err.message);
  if (err.detail) console.error('  detail:', err.detail);
  if (err.hint) console.error('  hint:', err.hint);
  if (err.where) console.error('  where:', err.where);
  process.exitCode = 1;
}

// Verify
try {
  const { rows: u } = await client.query(`
    SELECT u.email, u.name, om.role_id, d.name AS dept
    FROM users u
    JOIN organization_members om ON om.user_id = u.user_id
    LEFT JOIN departments d ON d.department_id = om.department_id
    WHERE u.email LIKE '%@alltoolhub.com'
    ORDER BY u.user_id;
  `);
  console.log(`\n— ${u.length} ALLTOOLHUB users —`);
  u.forEach((r) =>
    console.log(`  ${r.email.padEnd(34)} ${(r.name || '').padEnd(20)} ${r.dept || '—'}`)
  );

  const { rows: g } = await client.query(`
    SELECT g.group_name,
           (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.group_id AND gm.status='active') AS members
    FROM groups g
    JOIN organizations o ON o.organization_id = g.organization_id
    WHERE LOWER(o.name) = LOWER('ALLTOOLHUB')
    ORDER BY g.group_name;
  `);
  console.log(`\n— ${g.length} ALLTOOLHUB groups —`);
  g.forEach((r) => console.log(`  ${r.group_name.padEnd(28)} ${r.members} members`));
} catch (e) {
  console.warn('  (verification query failed:', e.message + ')');
}

await client.end();
console.log('\n✓ Done');
