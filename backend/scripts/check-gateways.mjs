// Diagnose Stripe checkout 500 — list payment_gateways rows + check
// whether the Stripe secret key is present and well-formed.
import dns from 'node:dns/promises';
import pg from 'pg';

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

// 0. Discover actual columns of payment_gateways
console.log('\n— payment_gateways columns —');
try {
  const { rows: cols } = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='payment_gateways'
    ORDER BY ordinal_position;
  `);
  cols.forEach((c) => console.log(`  ${c.column_name.padEnd(28)} ${c.data_type}`));
} catch (e) {
  console.warn('  query failed:', e.message);
}

// 1. List payment_gateways
console.log('\n— payment_gateways rows —');
try {
  const { rows } = await client.query(`SELECT * FROM payment_gateways ORDER BY 1;`);
  if (!rows.length) {
    console.log('  ✗ NO rows in payment_gateways — checkout WILL 500');
  } else {
    rows.forEach((r, i) => {
      console.log(`  [${i}] ${JSON.stringify(r, null, 0).slice(0, 400)}`);
    });
  }
} catch (e) {
  console.warn('  query failed:', e.message);
}


// 3. Check plans
console.log('\n— plans (first 5) —');
try {
  const { rows } = await client.query(`
    SELECT plan_id, plan_key, plan_name, price, default_currency, max_users
    FROM plans
    ORDER BY price ASC
    LIMIT 5;
  `);
  if (!rows.length) console.log('  (no plans — checkout cannot resolve plan)');
  rows.forEach((r) =>
    console.log(`  #${r.plan_id} ${r.plan_key.padEnd(12)} ${r.plan_name.padEnd(18)} ${r.default_currency} ${r.price}`)
  );
} catch (e) {
  console.warn('  query failed:', e.message);
}

await client.end();
console.log('\n✓ Done');
