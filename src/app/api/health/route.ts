import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await query('SELECT 1')
    const users = await query(`SELECT to_regclass('public.users') AS t`)
    const subs = await query(`SELECT to_regclass('public.subscriptions') AS t`)
    const migs = await query(`SELECT to_regclass('public.schema_migrations') AS t`)
    const ok =
      !!users.rows?.[0]?.t &&
      !!subs.rows?.[0]?.t &&
      !!migs.rows?.[0]?.t
    if (!ok) {
      return NextResponse.json({ status: 'error', database: 'schema missing' }, { status: 503 })
    }
    const res = NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
    console.log('[health] status ok')
    return res
  } catch {
    return NextResponse.json({ status: 'error', database: 'not reachable' }, { status: 503 })
  }
}

