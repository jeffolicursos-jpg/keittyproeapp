import { query } from '@/lib/db';

export async function getRecipeById(id: string) {
  const r = await query(
    'SELECT id, name, description, calories, protein, carbs, fat, created_at FROM recipes WHERE id=$1 LIMIT 1',
    [id]
  );
  return r.rows[0] || null;
}

export async function listRecipes(limit = 20, offset = 0) {
  const r = await query(
    'SELECT id, name, description, calories, protein, carbs, fat, created_at FROM recipes ORDER BY created_at DESC NULLS LAST LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return r.rows;
}
