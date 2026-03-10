import { NextRequest, NextResponse } from 'next/server'
import { verifyAccess } from '@/lib/jwt'
import { getMealById, swapDailyMeal } from '@/repositories/dailyMeals.repo'
import { findRecipesByFilters } from '@/repositories/recipes.repo'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = req.cookies.get('access')?.value || ''
  const data = access ? verifyAccess(access) : null
  if (!data?.sub) return NextResponse.json({ error: 'no_access' }, { status: 401 })
  const userId = data.sub
  const { id } = await params
  const current = await getMealById(id, userId)
  if (!current) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const profRes = await query('SELECT objetivo FROM public.user_profile WHERE user_id=$1 LIMIT 1', [userId])
  const objetivo: 'perder' | 'manter' | 'ganhar' = String(profRes.rows[0]?.objetivo || 'manter') as any
  const target = Number(current.calories || 0)
  const min = Math.round(target * 0.85)
  const max = Math.round(target * 1.15)
  let candidates = await findRecipesByFilters({ meal_type: current.meal_type, goal_fit: objetivo, calories_min: min, calories_max: max, limit: 10 })
  if (!candidates.length) {
    const min2 = Math.round(target * 0.7)
    const max2 = Math.round(target * 1.3)
    candidates = await findRecipesByFilters({ meal_type: current.meal_type, goal_fit: objetivo, calories_min: min2, calories_max: max2, limit: 10 })
  }
  const pick = candidates.find((c: any) => String(c.id) !== String(current.recipe_id)) || candidates[0]
  if (!pick) return NextResponse.json({ error: 'no_candidates' }, { status: 404 })
  const updated = await swapDailyMeal(id, userId, { id: String(pick.id), calories: Number(pick.calories || target) })
  return NextResponse.json({ item: updated })
}
