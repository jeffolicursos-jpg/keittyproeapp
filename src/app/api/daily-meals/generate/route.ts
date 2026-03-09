import { NextRequest, NextResponse } from 'next/server'
import { verifyAccess } from '@/lib/jwt'
import { query } from '@/lib/db'
import { findRecipesByFilters } from '@/repositories/recipes.repo'
import { createDailyMealsForDate, existsDailyMealsForDate, listDailyMealsByDate } from '@/repositories/dailyMeals.repo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function pctSplit(meta: number) {
  const cm = Math.round(meta * 0.25)
  const al = Math.round(meta * 0.35)
  const lt = Math.round(meta * 0.15)
  const ja = Math.round(meta * 0.25)
  return { cafe_da_manha: cm, almoco: al, lanche_da_tarde: lt, jantar: ja }
}

export async function POST(req: NextRequest) {
  const access = req.cookies.get('access')?.value || ''
  const data = access ? verifyAccess(access) : null
  if (!data?.sub) return NextResponse.json({ error: 'no_access' }, { status: 401 })
  const userId = data.sub
  const today = new Date().toISOString().slice(0, 10)
  try {
    const profRes = await query('SELECT objetivo, meta_diaria FROM user_profile WHERE user_id=$1 LIMIT 1', [userId])
    const prof = profRes.rows[0] || null
    const objetivo: 'perder' | 'manter' | 'ganhar' = (prof?.objetivo || 'manter') as any
    const meta = Number(prof?.meta_diaria || 0)
    if (!meta) return NextResponse.json({ error: 'no_profile' }, { status: 400 })
    const exists = await existsDailyMealsForDate(userId, today)
    if (exists) {
      const rows = await listDailyMealsByDate(userId, today)
      return NextResponse.json({ items: rows })
    }
    const targets = pctSplit(meta)
    const plan: Array<{ meal_type: 'cafe_da_manha' | 'almoco' | 'lanche_da_tarde' | 'jantar'; calories: number }> = [
      { meal_type: 'cafe_da_manha', calories: targets.cafe_da_manha },
      { meal_type: 'almoco', calories: targets.almoco },
      { meal_type: 'lanche_da_tarde', calories: targets.lanche_da_tarde },
      { meal_type: 'jantar', calories: targets.jantar },
    ]
    const chosen: { recipe_id: string; meal_type: any; calories: number }[] = []
    for (const slot of plan) {
      const target = slot.calories
      const min1 = Math.round(target * 0.85)
      const max1 = Math.round(target * 1.15)
      let candidates = await findRecipesByFilters({ meal_type: slot.meal_type, goal_fit: objetivo, calories_min: min1, calories_max: max1, limit: 10 })
      if (!candidates.length) {
        const min2 = Math.round(target * 0.7)
        const max2 = Math.round(target * 1.3)
        candidates = await findRecipesByFilters({ meal_type: slot.meal_type, goal_fit: objetivo, calories_min: min2, calories_max: max2, limit: 10 })
      }
      const pick = candidates[0]
      if (!pick) continue
      const cal = Number(pick.calories || target)
      chosen.push({ recipe_id: String(pick.id), meal_type: slot.meal_type, calories: cal })
    }
    if (!chosen.length) return NextResponse.json({ error: 'no_candidates' }, { status: 404 })
    const rows = await createDailyMealsForDate(userId, today, chosen as any)
    return NextResponse.json({ items: rows })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'bad_request' }, { status: 400 })
  }
}
