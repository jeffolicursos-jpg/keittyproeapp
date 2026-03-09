import { query } from '@/lib/db';

export async function getRecipeById(id: string) {
  const r = await query(
    `SELECT id, name, description, calories, protein, carbs, fat, created_at,
            prep_minutes, cook_minutes, image_url, portions, temperature, total_time,
            ingredients_text, preparation_steps_text, tip, status
     FROM recipes WHERE id=$1 LIMIT 1`,
    [id]
  );
  return r.rows[0] || null;
}

export async function listRecipes(limit = 20, offset = 0) {
  const r = await query(
    `SELECT id, name, description, calories, protein, carbs, fat, created_at,
            prep_minutes, cook_minutes, image_url, portions, temperature, total_time,
            ingredients_text, preparation_steps_text, tip, status, meal_type, goal_fit
     FROM recipes
     ORDER BY created_at DESC NULLS LAST
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return r.rows;
}

export type RecipeUpdateInput = {
  name?: string | null;
  description?: string | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  prep_minutes?: number | null;
  cook_minutes?: number | null;
  image_url?: string | null;
  portions?: string | null;
  temperature?: string | null;
  total_time?: string | null;
  ingredients_text?: string | null;
  preparation_steps_text?: string | null;
  tip?: string | null;
  status?: 'draft' | 'published' | null;
  meal_type?: 'cafe_da_manha' | 'almoco' | 'lanche_da_tarde' | 'jantar' | null;
  goal_fit?: 'perder' | 'manter' | 'ganhar' | null;
};

export async function updateRecipeById(id: string, data: RecipeUpdateInput) {
  const r = await query(
    `UPDATE recipes SET
       name = COALESCE($2, name),
       description = COALESCE($3, description),
       calories = COALESCE($4, calories),
       protein = COALESCE($5, protein),
       carbs = COALESCE($6, carbs),
       fat = COALESCE($7, fat),
       prep_minutes = COALESCE($8, prep_minutes),
       cook_minutes = COALESCE($9, cook_minutes),
       image_url = COALESCE($10, image_url),
       portions = COALESCE($11, portions),
       temperature = COALESCE($12, temperature),
       total_time = COALESCE($13, total_time),
       ingredients_text = COALESCE($14, ingredients_text),
       preparation_steps_text = COALESCE($15, preparation_steps_text),
       tip = COALESCE($16, tip),
        status = COALESCE($17, status),
        meal_type = COALESCE($18, meal_type),
        goal_fit = COALESCE($19, goal_fit)
     WHERE id=$1
     RETURNING id, name, description, calories, protein, carbs, fat, created_at,
               prep_minutes, cook_minutes, image_url, portions, temperature, total_time,
               ingredients_text, preparation_steps_text, tip, status, meal_type, goal_fit`,
    [
      id,
      data.name ?? null,
      data.description ?? null,
      data.calories ?? null,
      data.protein ?? null,
      data.carbs ?? null,
      data.fat ?? null,
      data.prep_minutes ?? null,
      data.cook_minutes ?? null,
      data.image_url ?? null,
      data.portions ?? null,
      data.temperature ?? null,
      data.total_time ?? null,
      data.ingredients_text ?? null,
      data.preparation_steps_text ?? null,
      data.tip ?? null,
      data.status ?? null,
      data.meal_type ?? null,
      data.goal_fit ?? null
    ]
  );
  return r.rows[0] || null;
}

export async function findRecipesByFilters(opts: {
  meal_type?: 'cafe_da_manha' | 'almoco' | 'lanche_da_tarde' | 'jantar';
  goal_fit?: 'perder' | 'manter' | 'ganhar';
  calories_min?: number;
  calories_max?: number;
  limit?: number;
}) {
  const conditions: string[] = ['status = $1'];
  const params: any[] = ['published'];
  let idx = 2;
  if (opts.meal_type) { conditions.push(`meal_type = $${idx++}`); params.push(opts.meal_type); }
  if (opts.goal_fit) { conditions.push(`goal_fit = $${idx++}`); params.push(opts.goal_fit); }
  if (typeof opts.calories_min === 'number') { conditions.push(`calories >= $${idx++}`); params.push(opts.calories_min); }
  if (typeof opts.calories_max === 'number') { conditions.push(`calories <= $${idx++}`); params.push(opts.calories_max); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = typeof opts.limit === 'number' ? opts.limit : 20;
  const sql = `
    SELECT id, name, image_url, calories, status, meal_type, goal_fit
    FROM recipes
    ${where}
    ORDER BY ABS(coalesce(calories,0) - coalesce($${idx},0)) ASC, created_at DESC
    LIMIT ${limit}
  `;
  params.push(((opts.calories_min || 0) + (opts.calories_max || 0)) / 2 || 0);
  const r = await query(sql, params);
  return r.rows;
}
