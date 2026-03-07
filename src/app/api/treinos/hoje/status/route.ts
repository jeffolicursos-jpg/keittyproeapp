import { NextRequest, NextResponse } from 'next/server';
import { verifyAccess } from '@/lib/jwt';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('access')?.value || '';
  const data = access ? verifyAccess(access) : null;
  if (!data) return NextResponse.json({ tem_treino_hoje: false, status: 'nenhum' as const });
  try {
    const r = await query(
      `SELECT completado
       FROM training_day_progress
       WHERE DATE(updated_at) = CURRENT_DATE
       ORDER BY updated_at DESC
       LIMIT 1`,
      []
    );
    if (!r.rows.length) {
      return NextResponse.json({ tem_treino_hoje: false, status: 'nenhum' as const });
    }
    const completed = !!r.rows[0].completado;
    return NextResponse.json({
      tem_treino_hoje: true,
      status: completed ? ('concluido' as const) : ('parcial' as const),
    });
  } catch (e: any) {
    return NextResponse.json({ tem_treino_hoje: false, status: 'nenhum' as const });
  }
}
