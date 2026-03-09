import { NextRequest, NextResponse } from 'next/server'
import { verifyAccess } from '@/lib/jwt'
import { markMealConsumed, getMealById } from '@/repositories/dailyMeals.repo'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = req.cookies.get('access')?.value || ''
  const data = access ? verifyAccess(access) : null
  if (!data?.sub) return NextResponse.json({ error: 'no_access' }, { status: 401 })
  const userId = data.sub
  const { id } = await params
  const updated = await markMealConsumed(id, userId)
  if (!updated) return NextResponse.json({ error: 'already_consumed_or_not_found' }, { status: 400 })
  const meal = await getMealById(id, userId)
  const kcal = Number(meal?.calories || 0)
  const date = String(meal?.date || new Date().toISOString().slice(0, 10))
  await query(
    `INSERT INTO daily_calories (user_id, data, calorias_consumidas, agua_ml, updated_at)
     VALUES ($1,$2,$3,0, now())
     ON CONFLICT (user_id, data) DO UPDATE SET calorias_consumidas = daily_calories.calorias_consumidas + EXCLUDED.calorias_consumidas, updated_at=now()`,
    [userId, date, kcal]
  )
  return NextResponse.json({ ok: true, id, calories_added: kcal })
}
