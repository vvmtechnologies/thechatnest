/**
 * Run all SQL migrations in order against the database.
 * Usage: node run-migrations.js
 * Reads DATABASE_URL from environment (or .env file).
 *
 * If the `users` table is missing, applies neon-schema.sql + neon-data.sql
 * first to bootstrap the base schema (migrations 001-055 equivalent),
 * then runs incremental migrations 056+.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const sslConfig = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: sslConfig }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME,
        ssl: sslConfig,
      }
);

const migrationsDir = path.join(__dirname, 'migrations');
const bootstrapSchemaFile = path.join(__dirname, 'neon-schema.sql');
const bootstrapDataFile = path.join(__dirname, 'neon-data.sql');

const tableExists = async (name) => {
  const { rows } = await pool.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1",
    [name]
  );
  return rows.length > 0;
};

const applyBootstrap = async (label, file) => {
  if (!fs.existsSync(file)) {
    console.log(`SKIP bootstrap ${label} (file not found: ${path.basename(file)})`);
    return;
  }
  const sql = fs.readFileSync(file, 'utf-8');
  console.log(`BOOTSTRAP ${label} from ${path.basename(file)}...`);
  await pool.query(sql);
  console.log(`BOOTSTRAP ${label} done.`);
};

(async () => {
  try {
    const usersExists = await tableExists('users');
    if (!usersExists) {
      console.log('Base schema not detected (users table missing). Running bootstrap...');
      await applyBootstrap('schema', bootstrapSchemaFile);
      await applyBootstrap('data', bootstrapDataFile);
    } else {
      console.log('Base schema already present. Skipping bootstrap.');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const { rows: executed } = await pool.query('SELECT name FROM _migrations ORDER BY name');
    const executedSet = new Set(executed.map((r) => r.name));

    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let ran = 0;
    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`SKIP  ${file} (already executed)`);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      console.log(`RUN   ${file}...`);
      try {
        await pool.query(sql);
        await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        ran++;
        console.log(`DONE  ${file}`);
      } catch (err) {
        // If bootstrap already provided this content, mark as executed and continue
        const benign = /already exists|duplicate key|duplicate column/i.test(err.message);
        if (benign) {
          console.log(`SKIP  ${file} (already applied via bootstrap: ${err.message.split('\n')[0]})`);
          await pool.query(
            'INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
            [file]
          );
          continue;
        }
        throw err;
      }
    }

    console.log(`\nMigrations complete. ${ran} new, ${files.length - ran} skipped.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
})();
