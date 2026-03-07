import { NextRequest, NextResponse } from 'next/server';
import { getTrainingDay } from '@/app/training-data';
import * as progRepo from '@/repositories/trainingProgress.repo';
import * as exRepo from '@/repositories/exercises.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dayId = parseInt(id, 10);
  const day = getTrainingDay(dayId);
  if (!day) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const base = await progRepo.getDayProgress(dayId);
  const series = base?.series ?? 4;
  const repeticoes = base?.repeticoes ?? '4x10';
  const estimulos = base?.estimulos ?? 65;
  const completadoDia = !!base?.completado;
  const exStates = await progRepo.listExerciseProgress(dayId);
  const exercicios = [];
  for (let i = 0; i < day.groups.length; i++) {
    const g = day.groups[i];
    const slugA = g.exerciseA;
    const a = await exRepo.getBySlug(slugA);
    exercicios.push({ id: slugA, nome: a?.title || slugA, completado: !!exStates[slugA] });
    if (g.exerciseB) {
      const slugB = g.exerciseB;
      const b = await exRepo.getBySlug(slugB);
      exercicios.push({ id: slugB, nome: b?.title || slugB, completado: !!exStates[slugB] });
    }
  }
  return NextResponse.json({
    semana: Math.ceil(dayId / 7),
    dia: dayId,
    data: base?.date || new Date().toISOString().slice(0, 10),
    titulo: day.title,
    series,
    repeticoes,
    estimulos,
    completadoDia,
    exercicios
  });
}
