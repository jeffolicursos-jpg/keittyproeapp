import { NextRequest, NextResponse } from 'next/server';
import { verifyAccess } from '@/lib/jwt';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toGrupo(tags: string[] = []) {
  const flat = tags.map(t => t.toLowerCase());
  if (flat.some(t => t.includes('cafe'))) return 'cafe_da_manha';
  if (flat.some(t => t.includes('lanche'))) return 'lanche';
  if (flat.some(t => t.includes('janta') || t.includes('cena'))) return 'jantar';
  if (flat.some(t => t.includes('almoço') || t.includes('almoco') || t.includes('principal'))) return 'almoco';
  return 'almoco';
}

export async function GET(req: NextRequest) {
  const access = req.cookies.get('access')?.value || '';
  const data = access ? verifyAccess(access) : null;
  const userId = data?.sub || null;
  try {
    // meta diária
    let meta = 1700;
    if (userId) {
      const r = await query('SELECT meta_diaria FROM user_profile WHERE user_id=$1 LIMIT 1', [userId]);
      meta = Number(r.rows[0]?.meta_diaria || meta);
    }
    // receitas (seguras para basico por padrão)
    const rcv = await query(
      `SELECT recipe_number, name, calorias_kcal, tags
       FROM recipes
       WHERE COALESCE(plano_minimo,'basico') IN ('basico','premium','vip')`
    );
    const all: Array<{ id: number; nome: string; calorias: number; tags: string[]; grupo: 'cafe_da_manha'|'almoco'|'lanche'|'jantar' }> = rcv.rows.map((r: any) => ({
      id: Number(r.recipe_number),
      nome: r.name as string,
      calorias: r.calorias_kcal == null ? 250 : Number(r.calorias_kcal),
      tags: Array.isArray(r.tags) ? r.tags : [],
      grupo: toGrupo(Array.isArray(r.tags) ? r.tags : [])
    }));
    const groups: Array<{ key: 'cafe_da_manha' | 'almoco' | 'lanche' | 'jantar'; pct: number }> = [
      { key: 'cafe_da_manha', pct: 0.15 },
      { key: 'almoco', pct: 0.35 },
      { key: 'lanche', pct: 0.20 },
      { key: 'jantar', pct: 0.30 }
    ];
    const refeicoes: any[] = [];
    for (const g of groups) {
      const target = Math.round(meta * g.pct);
      const pool = all.filter((a) => a.grupo === g.key);
      let pick = pool
        .filter((p) => p.calorias <= target)
        .sort((a, b) => b.calorias - a.calorias)[0];
      if (!pick) {
        pick = pool.sort((a, b) => Math.abs(a.calorias - target) - Math.abs(b.calorias - target))[0];
      }
      if (!pick) {
        const any = all.sort((a, b) => Math.abs(a.calorias - target) - Math.abs(b.calorias - target))[0];
        if (any) pick = any;
      }
      if (pick) {
        refeicoes.push({ grupo: g.key, recipe_id: pick.id, nome: pick.nome, calorias: pick.calorias });
      }
    }
    return NextResponse.json({ meta_calorias: meta, refeicoes });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}
