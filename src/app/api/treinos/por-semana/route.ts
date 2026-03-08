import { NextRequest, NextResponse } from 'next/server';
import * as tdRepo from '@/repositories/trainingDays.repo';
import * as progRepo from '@/repositories/trainingProgress.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const weeks: Record<number, any[]> = {};
    const todayStr = new Date().toISOString().slice(0, 10);
    const days = await tdRepo.listDays(500, 0);
    for (const d of days) {
      const dayId = parseInt(String(d.id), 10);
      if (!Number.isFinite(dayId)) continue;
      const semana = Math.ceil(dayId / 7);
      if (!weeks[semana]) weeks[semana] = [];
      const base = await progRepo.getDayProgress(dayId);
      const estimulos = base?.estimulos ?? 65;
      const completadoDia = !!base?.completado;
      const series = base?.series ?? 4;
      const repeticoes = base?.repeticoes || '4x10';
      const date = base?.date || '';
      const [_, rStr] = String(repeticoes).split('x');
      const repsPerSet = parseInt(rStr || '0', 10) || 0;
      const totalReps = series * repsPerSet;
      const isHoje = !!date && date === todayStr;
      weeks[semana].push({
        semana,
        dia: dayId,
        data: date,
        titulo: d.title,
        series,
        repeticoes,
        estimulos,
        completadoDia,
        isHoje,
        totalReps
      });
    }
    const result = Object.entries(weeks)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([semana, dias]) => ({ semana: Number(semana), dias }));
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 });
  }
}
