import { NextRequest, NextResponse } from 'next/server';
import * as tdRepo from '@/repositories/trainingDays.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const role = req.cookies.get('role')?.value || '';
  const email = req.cookies.get('email')?.value || '';
  const isAdmin = role === 'admin' || email.toLowerCase() === 'admin@seusistema.com';
  if (!isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json();
  await tdRepo.upsertGroup({
    training_day_id: String(body.training_day_id || ''),
    order: body.order ?? null,
    exercise_a_slug: body.exercise_a_slug ?? null,
    exercise_b_slug: body.exercise_b_slug ?? null,
    prescription: body.prescription ?? null
  });
  return NextResponse.json({ ok: true });
}
