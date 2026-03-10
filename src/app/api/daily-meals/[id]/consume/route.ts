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
  try {
    const today = new Date()
    const iso = (d: Date) => d.toISOString().slice(0, 10)
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
    const prev = await query(
      `SELECT streak_atual FROM streaks WHERE user_id=$1 AND data=$2 AND tipo='calorias' LIMIT 1`,
      [userId, iso(yesterday)]
    )
    const prevStreak = Number(prev.rows[0]?.streak_atual || 0)
    const newStreak = prevStreak > 0 ? prevStreak + 1 : 1
    await query(
      `INSERT INTO streaks (user_id, data, tipo, streak_atual, created_at, updated_at)
       VALUES ($1,$2,'calorias',$3, now(), now())
       ON CONFLICT (user_id, data, tipo) DO UPDATE SET streak_atual = GREATEST(streaks.streak_atual, EXCLUDED.streak_atual), updated_at=now()`,
      [userId, iso(today), newStreak]
    )
    const prevG = await query(
      `SELECT streak_atual FROM streaks WHERE user_id=$1 AND data=$2 AND tipo='global_streak' LIMIT 1`,
      [userId, iso(yesterday)]
    )
    const prevGVal = Number(prevG.rows[0]?.streak_atual || 0)
    const newG = prevGVal > 0 ? prevGVal + 1 : 1
    await query(
      `INSERT INTO streaks (user_id, data, tipo, streak_atual, created_at, updated_at)
       VALUES ($1,$2,'global_streak',$3, now(), now())
       ON CONFLICT (user_id, data, tipo) DO UPDATE SET streak_atual = GREATEST(streaks.streak_atual, EXCLUDED.streak_atual), updated_at=now()`,
      [userId, iso(today), newG]
    )
  } catch {}
  return NextResponse.json({ ok: true, id, calories_added: kcal })
}
