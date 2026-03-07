import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getActor } from '@/lib/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const actor = await getActor(req);
  if (!(actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  try {
    const url = new URL(req.url);
    const plan = url.searchParams.get('plan') || '';
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const rows = await query(
      `
      WITH last_sub AS (
        SELECT DISTINCT ON (user_id)
          user_id, plano, last_login_at, status, updated_at
        FROM subscriptions
        ORDER BY user_id, updated_at DESC
      ),
      last_global AS (
        SELECT DISTINCT ON (user_id)
          user_id, streak_atual
        FROM streaks
        WHERE tipo='global_streak'
        ORDER BY user_id, data DESC, updated_at DESC
      ),
      points_30d AS (
        SELECT user_id, COUNT(*)::INT AS pts
        FROM streaks
        WHERE tipo IN ('treino','agua','calorias')
          AND data >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY user_id
      ),
      meals_week AS (
        SELECT user_id, COUNT(*)::INT AS refeicoes_ok
        FROM daily_calories
        WHERE data >= date_trunc('week', CURRENT_DATE)
          AND data <= date_trunc('week', CURRENT_DATE) + INTERVAL '6 days'
          AND COALESCE(calorias_consumidas,0) > 0
          AND (meta_diaria IS NULL OR calorias_consumidas <= meta_diaria)
        GROUP BY user_id
      )
      SELECT DISTINCT ON (u.id)
        u.id,
        COALESCE(s.nome, u.nome) AS nome,
        COALESCE(s.telefone, '') AS telefone,
        u.email,
        s.plano,
        s.last_login_at,
        s.status,
        COALESCE(g.streak_atual, 0) AS streak_global,
        COALESCE(p.pts, 0) AS pontos_30d,
        COALESCE(m.refeicoes_ok, 0) AS refeicoes_semana
      FROM users u
      LEFT JOIN last_sub s ON s.user_id = u.id
      LEFT JOIN last_global g ON g.user_id = u.id
      LEFT JOIN points_30d p ON p.user_id = u.id
      LEFT JOIN meals_week m ON m.user_id = u.id
      WHERE u.role IN ('usuario','admin')
      ORDER BY u.id, s.updated_at DESC
      `,
      []
    );
    let items: Array<{
      id: string; nome: string; telefone: string; email: string;
      plano: 'basico'|'premium'|'vip'|null; last_login_at: string|null;
      streak_global: number; pontos_ultimos_30d: number; refeicoes_completas_semana: number;
    }> = (rows.rows || []).map((r: any) => {
      const nome: string = r.nome || '';
      const email: string = r.email || '';
      const telefone: string = r.telefone || '';
      const plano: 'basico'|'premium'|'vip'|null = r.plano || null;
      const last_login_at: string | null = r.last_login_at ? new Date(r.last_login_at).toISOString() : null;
      const streak_global = Number(r.streak_global || 0);
      const pontos_ultimos_30d = Number(r.pontos_30d || 0);
      const refeicoes_completas_semana = Number(r.refeicoes_semana || 0);
      return { id: r.id, nome, telefone, email, plano, last_login_at, streak_global, pontos_ultimos_30d, refeicoes_completas_semana };
    });
    if (plan && (['basico','premium','vip'] as const).includes(plan as any)) {
      items = items.filter((i) => i.plano === (plan as any));
    }
    if (q) {
      items = items.filter((i) =>
        (i.nome || '').toLowerCase().includes(q) ||
        (i.email || '').toLowerCase().includes(q)
      );
    }
    // Aggregated metrics
    const totalUsers = items.length || 1;
    const withStreak7 = items.filter(i => i.streak_global >= 7).length;
    const withStreak30 = items.filter(i => i.streak_global >= 30).length;
    const pctStreak7 = Math.round((withStreak7 / totalUsers) * 100);
    const pctStreak30 = Math.round((withStreak30 / totalUsers) * 100);
    const avgPoints30d = items.length ? (items.reduce((s, i) => s + i.pontos_ultimos_30d, 0) / items.length) : 0;
    // % com dieta completa (média simples: usuários com refeicoes_completas_semana>0 na semana)
    const pctDieta7d = Math.round((items.filter(i => i.refeicoes_completas_semana > 0).length / totalUsers) * 100);
    // % com check-in hoje: conta na tabela streaks hoje
    const ciRes = await query(
      `SELECT COUNT(DISTINCT user_id)::INT AS c
       FROM streaks WHERE data = CURRENT_DATE AND tipo IN ('treino','agua','calorias')`
    );
    const checkinsHoje = Number(ciRes.rows[0]?.c || 0);
    const pctCheckinHoje = Math.round((checkinsHoje / totalUsers) * 100);
    // Por plano: streak médio e pontos médios
    const byPlan: Record<string, { streakMedio: number; pontosMedios: number }> = { basico: { streakMedio: 0, pontosMedios: 0 }, premium: { streakMedio: 0, pontosMedios: 0 }, vip: { streakMedio: 0, pontosMedios: 0 } };
    (['basico','premium','vip'] as const).forEach((p) => {
      const arr = items.filter(i => i.plano === p);
      const n = arr.length || 1;
      byPlan[p].streakMedio = arr.length ? Math.round(arr.reduce((s, i) => s + i.streak_global, 0) / n) : 0;
      byPlan[p].pontosMedios = arr.length ? Math.round(arr.reduce((s, i) => s + i.pontos_ultimos_30d, 0) / n) : 0;
    });
    return NextResponse.json({
      items,
      metrics: {
        pct_streak_7: pctStreak7,
        pct_streak_30: pctStreak30,
        pontos_medio_30d: Number(avgPoints30d.toFixed(1)),
        pct_dieta_semana: pctDieta7d,
        pct_checkin_hoje: pctCheckinHoje,
        planos: byPlan
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 });
  }
}
