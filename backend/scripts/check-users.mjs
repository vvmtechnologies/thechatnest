// Quick diagnostic — list users + org memberships so we can see why
// /contacts returns an empty list for some logged-in user.
import dns from 'node:dns/promises';
import pg from 'pg';

const conn = process.env.DATABASE_URL;
if (!conn) {
  console.error('✗ DATABASE_URL env var is required.');
  process.exit(1);
}
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

const { rows: users } = await client.query(`
  SELECT
    u.user_id, u.email, u.name, u.status,
    om.organization_id, om.role_id, om.status AS membership_status,
    o.name AS org_name
  FROM users u
  LEFT JOIN organization_members om ON om.user_id = u.user_id
  LEFT JOIN organizations o ON o.organization_id = om.organization_id
  ORDER BY u.user_id;
`);

console.log('\n— ALL USERS + ORG MEMBERSHIPS —\n');
for (const r of users) {
  console.log(
    `  #${String(r.user_id).padEnd(3)} ${r.email.padEnd(34)} ` +
      `org=${r.organization_id || '—'} (${r.org_name || '—'}) role=${r.role_id || '—'} ${r.membership_status || ''}`
  );
}

const { rows: orgs } = await client.query(`SELECT organization_id, name AS org_name FROM organizations ORDER BY organization_id`);
console.log(`\n— ORGANIZATIONS — (${orgs.length})\n`);
orgs.forEach((o) => console.log(`  org_id=${o.organization_id}  ${o.org_name}`));

await client.end();
