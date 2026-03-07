import { getDb } from '@/lib/db'

export async function safeQuery<T = any>(sql: string, params: any[] = []) {
  const db = getDb()
  try {
    const res = await db.query(sql, params)
    return res as { rows: T[]; rowCount?: number }
  } catch (e: any) {
    console.error('[db] query error', e?.message || e)
    throw e
  }
}

