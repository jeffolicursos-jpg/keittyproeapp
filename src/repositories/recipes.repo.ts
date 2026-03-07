import { query } from '@/lib/db';

export async function getRecipeByNumber(id: number) {
  const r = await query('SELECT * FROM recipes WHERE recipe_number=$1 LIMIT 1', [id]);
  return r.rows[0] || null;
}

export async function getRecipeById(id: string) {
  const r = await query(
    'SELECT id, name, description, calories, protein, carbs, fat, created_at FROM recipes WHERE id=$1 LIMIT 1',
    [id]
  );
  return r.rows[0] || null;
}

export async function upsertRecipe(payload: any) {
  await query(
    `INSERT INTO recipes (recipe_number,name,image_url,image_hint,portions,temperature,total_time,tip,protein_grams,tags,status,user_id,plano_minimo,cronometro,calorias_kcal,updated_at,created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,now(),now())
     ON CONFLICT (recipe_number) DO UPDATE SET
       name=EXCLUDED.name,
       image_url=EXCLUDED.image_url,
       image_hint=EXCLUDED.image_hint,
       portions=EXCLUDED.portions,
       temperature=EXCLUDED.temperature,
       total_time=EXCLUDED.total_time,
       tip=EXCLUDED.tip,
       protein_grams=EXCLUDED.protein_grams,
       tags=EXCLUDED.tags,
       status=EXCLUDED.status,
       user_id=EXCLUDED.user_id,
       plano_minimo=EXCLUDED.plano_minimo,
       cronometro=EXCLUDED.cronometro,
       calorias_kcal=EXCLUDED.calorias_kcal,
       updated_at=now()`,
    [
      payload.recipeNumber,
      payload.name,
      payload.imageUrl,
      payload.imageHint || '',
      payload.portions,
      payload.temperature,
      payload.totalTime,
      payload.tip || '',
      payload.proteinGrams || null,
      payload.tags || [],
      payload.status || 'published',
      payload.user_id || null,
      payload.plano_minimo || null,
      payload.cronometro || null,
      payload.calorias_kcal ?? null,
    ]
  );
}

export async function listRecipes(limit = 20, offset = 0) {
  // Real production schema (confirmed):
  // id uuid, name text, description text, calories int, protein numeric, carbs numeric, fat numeric, created_at timestamptz
  // Keep selection minimal and compatible
  const r = await query(
    'SELECT id, name, created_at FROM recipes ORDER BY created_at DESC NULLS LAST LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return r.rows;
}

export async function listRecipesByPlan(plano?: 'basico'|'premium'|'vip', limit = 20, offset = 0) {
  if (!plano || plano === 'basico') {
    const r = await query(
      'SELECT recipe_number, name, image_url, status, updated_at, cronometro, plano_minimo, calorias_kcal FROM recipes ORDER BY recipe_number ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return r.rows;
  }
  if (plano === 'premium') {
    const r = await query(
      "SELECT recipe_number, name, image_url, status, updated_at, cronometro, plano_minimo, calorias_kcal FROM recipes WHERE COALESCE(plano_minimo,'basico') IN ('basico','premium') ORDER BY recipe_number ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return r.rows;
  }
  // vip
  const r = await query(
    "SELECT recipe_number, name, image_url, status, updated_at, cronometro, plano_minimo, calorias_kcal FROM recipes WHERE COALESCE(plano_minimo,'basico') IN ('basico','premium','vip') ORDER BY recipe_number ASC LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return r.rows;
}

export async function deleteRecipeByNumber(recipeNumber: number) {
  await query('DELETE FROM recipes WHERE recipe_number=$1', [recipeNumber]);
}
