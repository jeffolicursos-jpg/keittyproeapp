import { NextRequest, NextResponse } from 'next/server';
import { verifyAccess } from '@/lib/jwt';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function iso(d: Date) { return d.toISOString().slice(0, 10); }
const GOALS = [7,14,21,30,60,90,180,360];
const BADGE_FIRST = '1º Dia Concluído';

export async function POST(req: NextRequest) {
  const access = req.cookies.get('access')?.value || '';
  const data = access ? verifyAccess(access) : null;
  if (!data) return NextResponse.json({ error: 'no_access' }, { status: 401 });
  const userId = data.sub;
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  try {
    const prev = await query(
      `SELECT streak_atual FROM streaks WHERE user_id=$1 AND data=$2 AND tipo='treino' LIMIT 1`,
      [userId, iso(yesterday)]
    );
    const prevStreak = Number(prev.rows[0]?.streak_atual || 0);
    const newStreak = prevStreak > 0 ? prevStreak + 1 : 1;
    await query(
      `INSERT INTO streaks (user_id, data, tipo, streak_atual, created_at, updated_at)
       VALUES ($1,$2,'treino',$3, now(), now())
       ON CONFLICT (user_id, data, tipo) DO UPDATE SET streak_atual = GREATEST(streaks.streak_atual, EXCLUDED.streak_atual), updated_at=now()`,
      [userId, iso(today), newStreak]
    );
    let unlockedBadge: { nome: string; emoji: string } | null = null;
    if (newStreak >= 7) {
      await query(
        `INSERT INTO badges (user_id, nome, emoji, req_streak, desbloqueado_em, created_at, updated_at)
         VALUES ($1,$2,$3,$4, now(), now(), now())
         ON CONFLICT (user_id, nome) DO UPDATE SET desbloqueado_em=COALESCE(badges.desbloqueado_em, EXCLUDED.desbloqueado_em), updated_at=now()`,
        [userId, '7 Dias Treino', '🔥', 7]
      );
      unlockedBadge = { nome: '7 Dias Treino', emoji: '🔥' };
    }
    // Global streak (considera pelo menos um check-in no dia)
    const prevG = await query(
      `SELECT streak_atual FROM streaks WHERE user_id=$1 AND data=$2 AND tipo='global_streak' LIMIT 1`,
      [userId, iso(yesterday)]
    );
    const prevGVal = Number(prevG.rows[0]?.streak_atual || 0);
    const newG = prevGVal > 0 ? prevGVal + 1 : 1;
    await query(
      `INSERT INTO streaks (user_id, data, tipo, streak_atual, created_at, updated_at)
       VALUES ($1,$2,'global_streak',$3, now(), now())
       ON CONFLICT (user_id, data, tipo) DO UPDATE SET streak_atual = GREATEST(streaks.streak_atual, EXCLUDED.streak_atual), updated_at=now()`,
      [userId, iso(today), newG]
    );
    // Badge de primeiro dia (apenas se ainda não existir)
    if (newG === 1) {
      const exists = await query(
        `SELECT 1 FROM badges WHERE user_id=$1 AND nome=$2 LIMIT 1`,
        [userId, BADGE_FIRST]
      );
      if (exists.rows.length === 0) {
        await query(
          `INSERT INTO badges (user_id, nome, emoji, req_streak, desbloqueado_em, created_at, updated_at)
           VALUES ($1,$2,$3,$4, now(), now(), now())
           ON CONFLICT (user_id, nome) DO NOTHING`,
          [userId, BADGE_FIRST, '✨', 1]
        );
        unlockedBadge = unlockedBadge || { nome: BADGE_FIRST, emoji: '✨' };
      }
    }
    if (GOALS.includes(newG)) {
      const badgeName = `${newG} Dias Seguidos`;
      await query(
        `INSERT INTO badges (user_id, nome, emoji, req_streak, desbloqueado_em, created_at, updated_at)
         VALUES ($1,$2,$3,$4, now(), now(), now())
         ON CONFLICT (user_id, nome) DO UPDATE SET desbloqueado_em=COALESCE(badges.desbloqueado_em, EXCLUDED.desbloqueado_em), updated_at=now()`,
        [userId, badgeName, '🔥', newG]
      );
      unlockedBadge = { nome: badgeName, emoji: '🔥' };
    }
    return NextResponse.json({ ok: true, streak: newStreak, unlockedBadge });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 });
  }
}
