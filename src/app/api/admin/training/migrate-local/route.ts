import { NextRequest, NextResponse } from 'next/server';
import * as tdRepo from '@/repositories/trainingDays.repo';
import { getActor } from '@/lib/adminGuard';
import * as exRepo from '@/repositories/exercises.repo';
import { trainingDaysDef, exercises } from '@/app/training-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function isAdmin(req: NextRequest) {
  const actor = await getActor(req);
  return actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin';
}

function parseSeries(s?: string): number | null {
  if (!s) return null;
  const m = String(s).match(/(\d+)/);
  return m ? parseInt(m[1], 10) || null : null;
}

function parseReps(s?: string): number | null {
  if (!s) return null;
  const m = String(s).match(/(\d+)/);
  return m ? parseInt(m[1], 10) || null : null;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  let exCount = 0;
  let dayCount = 0;
  let grpCount = 0;
  // Upsert exercises from local dataset
  for (const ex of exercises) {
    await exRepo.upsertExercise({
      slug: ex.slug,
      title: ex.title,
      execution_text: (ex.tips || []).join('\n'),
      default_series: parseSeries(ex.series),
      default_reps: parseReps(ex.reps),
      video_url: ex.videoUrl || null
    });
    exCount++;
  }
  // Upsert days and groups
  for (const d of trainingDaysDef) {
    const id = String(d.id);
    await tdRepo.upsertDay({
      id,
      title: d.title,
      overview: d.overview || null,
      cardio_title: d.cardio?.title || null,
      cardio_prescription: d.cardio?.prescription || null
    });
    dayCount++;
    let order = 1;
    for (const g of d.groups) {
      await tdRepo.upsertGroup({
        training_day_id: id,
        order,
        exercise_a_slug: g.exerciseA || null,
        exercise_b_slug: g.exerciseB || null,
        prescription: g.prescription || null
      });
      order++;
      grpCount++;
    }
  }
  return NextResponse.json({ ok: true, exercises: exCount, days: dayCount, groups: grpCount });
}
