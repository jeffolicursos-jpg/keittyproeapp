import { NextRequest, NextResponse } from 'next/server';
import * as exRepo from '@/repositories/exercises.repo';
import * as tdRepo from '@/repositories/trainingDays.repo';
import { getActor } from '@/lib/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseCSV(text: string): any[] {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const header = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1);
  return rows.map(line => {
    const cols: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; continue; }
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { cols.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    const obj: any = {};
    header.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
    return obj;
  });
}

export async function POST(req: NextRequest) {
  const actor = await getActor(req);
  if (!(actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.text();
  const rows = parseCSV(body);
  let count = 0;

  for (const r of rows) {
    const tipo = (r.tipo || r.type || '').toLowerCase();
    if (tipo === 'exercise' || tipo === 'exercicio') {
      const slug = (r.slug || r.Slug || '').toLowerCase().trim();
      const title = r.title || r.Nome_do_exercicio || '';
      const exec = (r.execution_text || r.Como_executar || '').replace(/\s*\\n\s*/g, '\n');
      const series = parseInt(r.default_series || r.Series, 10) || null;
      const reps = parseInt((r.default_reps || r.Repeticoes || '').replace(/\D/g, ''), 10) || null;
      const video = r.video_url || r.Video_URL || '';
      await exRepo.upsertExercise({ slug, title, execution_text: exec, default_series: series, default_reps: reps, video_url: video || null });
      count++;
    } else if (tipo === 'day' || tipo === 'dia') {
      const id = String(r.id || r.ID || '').trim();
      const title = r.title || r.Titulo || '';
      const overview = r.overview || r.Overview || '';
      const cardio_title = r.cardio_title || r.Cardio_Titulo || '';
      const cardio_prescription = r.cardio_prescription || r.Cardio_Prescricao || '';
      await tdRepo.upsertDay({ id, title, overview, cardio_title, cardio_prescription });
      count++;
    } else if (tipo === 'group' || tipo === 'grupo') {
      const training_day_id = String(r.training_day_id || r.Dia_ID || '').trim();
      const order = parseInt(r.order || r.Ordem, 10) || null;
      const exercise_a_slug = (r.exercise_a_slug || r.Exercicio_A || '').toLowerCase().trim();
      const exercise_b_slug = (r.exercise_b_slug || r.Exercicio_B || '').toLowerCase().trim();
      const prescription = r.prescription || r.Prescricao || '';
      await tdRepo.upsertGroup({ training_day_id, order, exercise_a_slug, exercise_b_slug, prescription });
      count++;
    }
  }
  return NextResponse.json({ ok: true, imported: count });
}
