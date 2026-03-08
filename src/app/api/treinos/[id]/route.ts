import { NextRequest, NextResponse } from 'next/server';
import * as tdRepo from '@/repositories/trainingDays.repo';
import * as progRepo from '@/repositories/trainingProgress.repo';
import * as exRepo from '@/repositories/exercises.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dayId = parseInt(id, 10);
  if (!Number.isFinite(dayId)) return NextResponse.json({ error: 'bad_id' }, { status: 400 });
  const data = await tdRepo.getDayWithGroups(String(dayId));
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const base = await progRepo.getDayProgress(dayId);
  const series = base?.series ?? 4;
  const repeticoes = base?.repeticoes ?? '4x10';
  const estimulos = base?.estimulos ?? 65;
  const completadoDia = !!base?.completado;
  const exStates = await progRepo.listExerciseProgress(dayId);
  const exercicios: Array<{ id: string; nome: string; completado: boolean }> = [];
  for (let i = 0; i < (data.groups || []).length; i++) {
    const g = data.groups[i];
    if (g?.a?.slug) {
      const aMeta = await exRepo.getBySlug(g.a.slug);
      exercicios.push({ id: g.a.slug, nome: aMeta?.title || g.a.slug, completado: !!exStates[g.a.slug] });
    }
    if (g?.b?.slug) {
      const bMeta = await exRepo.getBySlug(g.b.slug);
      exercicios.push({ id: g.b.slug, nome: bMeta?.title || g.b.slug, completado: !!exStates[g.b.slug] });
    }
  }
  return NextResponse.json({
    semana: Math.ceil(dayId / 7),
    dia: dayId,
    data: base?.date || new Date().toISOString().slice(0, 10),
    titulo: data.title,
    series,
    repeticoes,
    estimulos,
    completadoDia,
    exercicios
  });
}
