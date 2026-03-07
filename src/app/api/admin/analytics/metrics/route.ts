import { NextRequest, NextResponse } from 'next/server'
import { getActor } from '@/lib/adminGuard'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const actor = await getActor(req)
  if (!(actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  try {
    const totalUsersRes = await query('SELECT COUNT(*)::int AS count FROM users', [])
    const activeSubsRes = await query("SELECT COUNT(*)::int AS count FROM subscriptions WHERE status = $1", ['ativa'])
    const cancelledSubsRes = await query("SELECT COUNT(*)::int AS count FROM subscriptions WHERE status = $1", ['cancelada'])
    const newUsers30Res = await query("SELECT COUNT(*)::int AS count FROM users WHERE created_at >= now() - interval '30 days'", [])
    const totalUsers = Number(totalUsersRes.rows?.[0]?.count || 0)
    const activeSubscriptions = Number(activeSubsRes.rows?.[0]?.count || 0)
    const cancelledSubscriptions = Number(cancelledSubsRes.rows?.[0]?.count || 0)
    const newUsersLast30Days = Number(newUsers30Res.rows?.[0]?.count || 0)
    const estimatedMRR = Number((activeSubscriptions * 39.9).toFixed(2))
    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      cancelledSubscriptions,
      newUsersLast30Days,
      estimatedMRR
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 })
  }
}

