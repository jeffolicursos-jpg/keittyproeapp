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
            ingredients_text, preparation_steps_text, tip, status
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
        status = COALESCE($17, status)
     WHERE id=$1
     RETURNING id, name, description, calories, protein, carbs, fat, created_at,
               prep_minutes, cook_minutes, image_url, portions, temperature, total_time,
               ingredients_text, preparation_steps_text, tip, status`,
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
      data.status ?? null
    ]
  );
  return r.rows[0] || null;
}
