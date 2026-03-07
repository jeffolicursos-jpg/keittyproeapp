import { ENV } from '@/lib/env';
import { ensureDbGuard } from '@/lib/dbGuard';

let pool: any = null;
let guardActivated = false;

function getPg() {
  const { Pool } = require('pg');
  return Pool;
}

export function getDb() {
  if (pool) return pool;

  const Pool = getPg();

  pool = new Pool({
    connectionString: ENV.DB_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    max: 10,
  });
  console.log('[db] connected');

  return pool;
}

export async function query(sql: string, params: any[] = []) {
  const db = getDb();
  if (!guardActivated) {
    await ensureDbGuard(db);
    guardActivated = true;
    console.log('[db] guard active');
    console.log('[db] migrations verified');
  }
  return db.query(sql, params);
}
