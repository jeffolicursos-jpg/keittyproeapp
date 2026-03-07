// Apply migrations and seed admin user in Supabase/Postgres using DB_URL
// Usage: node scripts/db-ops/applyAndSeed.js
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config(); // also load .env if present

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { validateDbUrl } = require('../../src/lib/validateDbUrl.js');

function getEnv(key, fallback) {
  const v = process.env[key];
  if (v && v.trim().length > 0) return v;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing env: ${key}`);
}
const DB_URL = getEnv('DB_URL');

async function readSql(relative) {
  const p = path.join(process.cwd(), relative);
  return fs.readFileSync(p, 'utf-8');
}

async function ensureSchemaMigrations(client) {
  const sql = await readSql('sql/migrations/000_schema_migrations.sql');
  await client.query(sql);
  console.log('[ok] 000_schema_migrations.sql');
}

async function run() {
  try {
    // Informative log: where DB_URL is likely coming from
    const dotEnvLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(dotEnvLocalPath) && process.env.DB_URL) {
      console.log('Database URL loaded from .env.local');
    }
  } catch {}
  validateDbUrl(DB_URL);
  console.log('Database URL validated successfully');
  const pool = new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  const client = await pool.connect();
  try {
    console.log('Applying migrations...');
    // 1) Ensure schema_migrations exists
    await ensureSchemaMigrations(client);

    // 2) Read and sort all *.sql in sql/migrations
    const dir = path.join(process.cwd(), 'sql', 'migrations');
    const files = fs.readdirSync(dir)
      .filter(f => f.toLowerCase().endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

    // 3) Apply each migration once using schema_migrations ledger
    for (const file of files) {
      // Skip the schema_migrations bootstrap file after ensuring it's created
      if (file === '000_schema_migrations.sql') continue;
      const check = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1 LIMIT 1',
        [file]
      );
      if (check.rows && check.rows.length > 0) {
        console.log(`[skip] migration already executed: ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        console.log(`[ok] migration applied: ${file}`);
      } catch (err) {
        const code = err && err.code;
        const msg = (err && err.message) || '';
        const isAlreadyExists =
          code === '42P07' /* duplicate_table */ ||
          code === '42710' /* duplicate_object */ ||
          /already exists/i.test(msg);
        if (isAlreadyExists) {
          console.warn(`[skip] harmless duplicate during migration: ${file} (code=${code || 'n/a'})`);
          // Record as applied to keep ledger deterministic
          try {
            await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
          } catch (e2) {
            console.warn(`[warn] could not record skipped migration: ${file} -> ${e2 && e2.message || e2}`);
          }
          continue;
        }
        console.error(`[fail] migration error: ${file} -> ${msg} (code=${code || 'n/a'})`);
        throw err;
      }
    }
    console.log('Migrations finished successfully');

    console.log('Seeding admin user...');
    const email = 'admin@seusistema.com';
    const nome = 'Admin';
    const role = 'admin';
    const status = 'ativo';
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 12);

    // Insert admin user
    const upsertUserSql = `
      INSERT INTO users (nome, email, senha_hash, role, status)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (email) DO UPDATE SET
        nome=EXCLUDED.nome,
        senha_hash=EXCLUDED.senha_hash,
        role=EXCLUDED.role,
        status=EXCLUDED.status,
        updated_at=now()
      RETURNING id, email, role, status, created_at, updated_at
    `;
    const userRes = await client.query(upsertUserSql, [nome, email, hash, role, status]);
    const user = userRes.rows[0];
    console.log('Admin user:', user);

    // Create active subscription
    const subSql = `
      INSERT INTO subscriptions (user_id, gateway, status, data_inicio, renovacao_automatica, historico)
      VALUES ($1,$2,$3, CURRENT_DATE, TRUE, $4)
      RETURNING id, user_id, gateway, status, data_inicio, created_at
    `;
    const historico = { gateway_id: 'sub_123' };
    await client.query(subSql, [user.id, 'kiwify', 'ativa', JSON.stringify(historico)]);

    // Confirmations
    const confirmUser = await client.query(
      'SELECT id, nome, email, role, status, created_at, updated_at FROM users WHERE email=$1',
      [email]
    );
    const confirmSubs = await client.query(
      'SELECT id, user_id, gateway, status, data_inicio, data_fim, renovacao_automatica, historico FROM subscriptions WHERE user_id=$1 ORDER BY created_at DESC',
      [user.id]
    );

    console.log('Confirmation: users row');
    console.log(confirmUser.rows);
    console.log('Confirmation: subscriptions rows');
    console.log(confirmSubs.rows);
  } catch (err) {
    console.error('Failed to apply migrations/seed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
