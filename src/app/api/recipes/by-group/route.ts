import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function whereForGrupo(grupo: string) {
  const g = (grupo || '').toLowerCase();
  if (g === 'cafe_da_manha') return "tags::text[] && ARRAY['cafe','Café da Manhã']::text[]";
  if (g === 'lanche') return "tags::text[] && ARRAY['lanche']::text[]";
  if (g === 'jantar') return "tags::text[] && ARRAY['janta','cena']::text[]";
  if (g === 'almoco') return "tags::text[] && ARRAY['almoço','almoco','principal']::text[]";
  return 'TRUE';
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const grupo = searchParams.get('grupo') || '';
  try {
    const where = whereForGrupo(grupo);
    const r = await query(
      `SELECT recipe_number, name, calorias_kcal, tags
       FROM recipes
       WHERE ${where}
         AND COALESCE(plano_minimo,'basico') IN ('basico','premium','vip')
       ORDER BY updated_at DESC LIMIT 50`
    );
    const items = r.rows.map((row: any) => ({
      recipe_id: Number(row.recipe_number),
      nome: row.name,
      calorias: row.calorias_kcal == null ? 250 : Number(row.calorias_kcal),
      tags: row.tags || []
    }));
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}

