import { NextRequest, NextResponse } from 'next/server';
import { verifyAccess } from '@/lib/jwt';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}
const GOALS = [7,14,21,30,60,90,180,360];

export async function GET(req: NextRequest) {
  const access = req.cookies.get('access')?.value || '';
  const data = access ? verifyAccess(access) : null;
  if (!data) return NextResponse.json({ error: 'no_access' }, { status: 401 });
  const userId = data.sub;
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - 29);
  try {
    const rows = await query(
      `SELECT data, tipo, streak_atual
       FROM streaks
       WHERE user_id=$1 AND data BETWEEN $2 AND $3`,
      [userId, iso(start), iso(today)]
    );
    const map: Record<string, { treino?: boolean; agua?: boolean; calorias?: boolean }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      map[iso(d)] = { treino: false, agua: false, calorias: false };
    }
    for (const r of rows.rows) {
      const k = iso(new Date(r.data));
      if (map[k]) {
        if (r.tipo === 'treino') map[k].treino = true;
        if (r.tipo === 'agua') map[k].agua = true;
        if (r.tipo === 'calorias') map[k].calorias = true;
      }
    }
    const heatmap = Object.entries(map).map(([date, v]) => ({ date, ...v }));
    const cur = await query(
      `SELECT tipo, streak_atual FROM streaks WHERE user_id=$1 AND data=$2`,
      [userId, iso(today)]
    );
    const current: Record<string, number> = { treino: 0, agua: 0, calorias: 0 };
    for (const r of cur.rows) current[r.tipo] = Number(r.streak_atual || 0);
    const badges = await query(
      `SELECT nome, emoji, req_streak, req_pontos, desbloqueado_em FROM badges WHERE user_id=$1 ORDER BY desbloqueado_em ASC NULLS LAST, created_at ASC`,
      [userId]
    );
    // global
    const curGlobal = await query(
      `SELECT streak_atual FROM streaks WHERE user_id=$1 AND data=$2 AND tipo='global_streak' LIMIT 1`,
      [userId, iso(today)]
    );
    const current_global_streak = Number(curGlobal.rows[0]?.streak_atual || 0);
    const next_goal_days = GOALS.find(g => g > current_global_streak) || null;
    return NextResponse.json({
      heatmap_30dias: heatmap,
      current,
      current_global_streak,
      next_goal_days,
      badges_desbloqueados: badges.rows || [],
      targets: { treino: 7, agua: 30, calorias: 22 }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 });
  }
}
