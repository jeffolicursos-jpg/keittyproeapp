import { NextRequest, NextResponse } from 'next/server'
import { verifyAccess } from '@/lib/jwt'
import { listDailyMealsByDate } from '@/repositories/dailyMeals.repo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const access = req.cookies.get('access')?.value || ''
  const data = access ? verifyAccess(access) : null
  if (!data?.sub) return NextResponse.json({ error: 'no_access' }, { status: 401 })
  const userId = data.sub
  const today = new Date().toISOString().slice(0, 10)
  const rows = await listDailyMealsByDate(userId, today)
  return NextResponse.json({ items: rows })
}
