import { Pool } from 'pg'

let executed = false

async function tableExists(pool: any, name: string) {
  const r = await pool.query(`SELECT to_regclass($1) AS t`, [`public.${name}`])
  return !!r.rows?.[0]?.t
}

export async function ensureDbGuard(pool: any) {
  if (executed) return
  executed = true
  try {
    console.log('[db] guard verifying schema')
    const okUsers = await tableExists(pool, 'users')
    const okSubs = await tableExists(pool, 'subscriptions')
    const okMigs = await tableExists(pool, 'schema_migrations')
    if (!okUsers || !okSubs || !okMigs) {
      console.warn('[db] missing tables detected')
    } else {
      console.log('[db] schema verified')
    }
  } catch (e) {
    console.error('[db] guard error', (e as any)?.message || e)
  }
}
