import { NextRequest, NextResponse } from 'next/server';
import { verifyAccess } from '@/lib/jwt';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    // receitas: usar somente schema novo
    const rcv = await query(
      `SELECT id, name, calories
       FROM recipes
       WHERE calories IS NOT NULL
       ORDER BY created_at DESC NULLS LAST
       LIMIT 200`
    );
    const all: Array<{ id: string; nome: string; calorias: number }> = rcv.rows
      .map((r: any) => ({
        id: String(r.id),
        nome: String(r.name || ''),
        calorias: Number(r.calories || 0)
      }))
      .filter((r: { id: string; nome: string; calorias: number }) => !!r.id && !!r.nome && r.calorias > 0);

    const groups: Array<{ key: 'cafe_da_manha' | 'almoco' | 'lanche' | 'jantar'; pct: number }> = [
      { key: 'cafe_da_manha', pct: 0.15 },
      { key: 'almoco', pct: 0.35 },
      { key: 'lanche', pct: 0.20 },
      { key: 'jantar', pct: 0.30 }
    ];
    const taken = new Set<string>();
    const refeicoes: any[] = [];
    for (const g of groups) {
      const target = Math.round(meta * g.pct);
      const candidates = all
        .filter(it => !taken.has(it.id))
        .sort((a, b) => Math.abs(a.calorias - target) - Math.abs(b.calorias - target));
      const pick = candidates[0];
      if (pick) {
        taken.add(pick.id);
        refeicoes.push({ grupo: g.key, recipe_id: pick.id, nome: pick.nome, calorias: pick.calorias });
      }
    }
    return NextResponse.json({ meta_calorias: meta, refeicoes });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 });
  }
}
