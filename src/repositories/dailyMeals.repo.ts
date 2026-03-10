import { query } from '@/lib/db'

export async function listDailyMealsByDate(userId: string, date: string) {
  const r = await query(
    `SELECT dm.id, dm.user_id, dm.recipe_id, dm.meal_type, dm.calories, dm.date, dm.consumed, dm.consumed_at, dm.created_at,
            r.name as recipe_name, r.image_url as recipe_image_url
     FROM daily_meals dm
     JOIN recipes r ON r.id = dm.recipe_id
     WHERE dm.user_id=$1 AND dm.date=$2
     ORDER BY CASE dm.meal_type
       WHEN 'cafe_da_manha' THEN 1
       WHEN 'almoco' THEN 2
       WHEN 'lanche_da_tarde' THEN 3
       WHEN 'jantar' THEN 4
       ELSE 5
     END ASC`,
    [userId, date]
  )
  return r.rows
}

export async function existsDailyMealsForDate(userId: string, date: string) {
  const r = await query(
    `SELECT 1 FROM daily_meals WHERE user_id=$1 AND date=$2 LIMIT 1`,
    [userId, date]
  )
  return !!r.rows[0]
}

export type NewMeal = { recipe_id: string; meal_type: 'cafe_da_manha' | 'almoco' | 'lanche_da_tarde' | 'jantar'; calories: number }

export async function createDailyMealsForDate(userId: string, date: string, meals: NewMeal[]) {
  for (const m of meals) {
    await query(
      `INSERT INTO daily_meals (user_id, recipe_id, meal_type, calories, date, consumed, created_at)
       VALUES ($1,$2,$3,$4,$5,false, now())
       ON CONFLICT (user_id, date, meal_type) DO NOTHING`,
      [userId, m.recipe_id, m.meal_type, m.calories, date]
    )
  }
  return listDailyMealsByDate(userId, date)
}

export async function markMealConsumed(id: string, userId: string) {
  const r = await query(
    `UPDATE daily_meals SET consumed=true, consumed_at=now()
     WHERE id=$1 AND user_id=$2 AND consumed=false
     RETURNING id, user_id, recipe_id, meal_type, calories, date, consumed, consumed_at`,
    [id, userId]
  )
  return r.rows[0] || null
}

export async function getMealById(id: string, userId: string) {
  const r = await query(
    `SELECT dm.*, r.name as recipe_name, r.image_url as recipe_image_url
     FROM daily_meals dm
     JOIN recipes r ON r.id=dm.recipe_id
     WHERE dm.id=$1 AND dm.user_id=$2 LIMIT 1`,
    [id, userId]
  )
  return r.rows[0] || null
}

export async function swapDailyMeal(id: string, userId: string, recipe: { id: string; calories: number }) {
  const r = await query(
    `UPDATE daily_meals SET recipe_id=$3, calories=$4, consumed=false, consumed_at=NULL
     WHERE id=$1 AND user_id=$2
     RETURNING id, user_id, recipe_id, meal_type, calories, date, consumed, consumed_at`,
    [id, userId, recipe.id, recipe.calories]
  )
  return r.rows[0] || null
}
