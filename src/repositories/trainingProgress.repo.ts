import { query } from '@/lib/db';

export async function getDayProgress(dayId: number) {
  const r = await query('SELECT * FROM training_day_progress WHERE day_id=$1 LIMIT 1', [dayId]);
  return r.rows[0] || null;
}

export async function upsertDayProgress(payload: {
  day_id: number;
  date?: string | null;
  title?: string | null;
  series?: number | null;
  repeticoes?: string | null;
  estimulos?: number | null;
  completado?: boolean | null;
}) {
  await query(
    `INSERT INTO training_day_progress (day_id, date, title, series, repeticoes, estimulos, completado, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,false), now(), now())
     ON CONFLICT (day_id) DO UPDATE SET
       date=COALESCE(EXCLUDED.date, training_day_progress.date),
       title=COALESCE(EXCLUDED.title, training_day_progress.title),
       series=COALESCE(EXCLUDED.series, training_day_progress.series),
       repeticoes=COALESCE(EXCLUDED.repeticoes, training_day_progress.repeticoes),
       estimulos=COALESCE(EXCLUDED.estimulos, training_day_progress.estimulos),
       completado=COALESCE(EXCLUDED.completado, training_day_progress.completado),
       updated_at=now()`,
    [
      payload.day_id,
      payload.date ?? null,
      payload.title ?? null,
      payload.series ?? null,
      payload.repeticoes ?? null,
      payload.estimulos ?? null,
      payload.completado ?? null
    ]
  );
}

export async function listExerciseProgress(dayId: number) {
  const r = await query('SELECT exercise_slug, completado FROM training_exercise_progress WHERE day_id=$1', [dayId]);
  const m: Record<string, boolean> = {};
  for (const row of r.rows) m[row.exercise_slug] = !!row.completado;
  return m;
}

export async function setExerciseCompleted(dayId: number, slug: string, completed: boolean) {
  await query(
    `INSERT INTO training_exercise_progress (day_id, exercise_slug, completado, created_at, updated_at)
     VALUES ($1,$2,$3, now(), now())
     ON CONFLICT (day_id, exercise_slug) DO UPDATE SET completado=EXCLUDED.completado, updated_at=now()`,
    [dayId, slug, completed]
  );
}

export async function setDayCompleted(dayId: number, completed: boolean) {
  await query('UPDATE training_day_progress SET completado=$2, updated_at=now() WHERE day_id=$1', [dayId, completed]);
}
