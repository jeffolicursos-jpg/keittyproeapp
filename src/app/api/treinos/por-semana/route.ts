import { NextRequest, NextResponse } from 'next/server';
import { trainingDaysDef } from '@/app/training-data';
import * as progRepo from '@/repositories/trainingProgress.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const weeks: Record<number, any[]> = {};
  const todayStr = new Date().toISOString().slice(0, 10);
  for (const d of trainingDaysDef) {
    const semana = Math.ceil(d.id / 7);
    if (!weeks[semana]) weeks[semana] = [];
    const base = await progRepo.getDayProgress(d.id);
    const estimulos = base?.estimulos ?? 65;
    const completadoDia = !!base?.completado;
    const series = base?.series ?? 4;
    const repeticoes = base?.repeticoes || '4x10';
    const date = base?.date || '';
    const [sStr, rStr] = repeticoes.split('x');
    const repsPerSet = parseInt(rStr || '0', 10) || 0;
    const totalReps = series * repsPerSet;
    const isHoje = !!date && date === todayStr;
    weeks[semana].push({
      semana,
      dia: d.id,
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
}

