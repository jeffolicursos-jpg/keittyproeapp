import { NextRequest, NextResponse } from 'next/server';
import * as progRepo from '@/repositories/trainingProgress.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; slug: string }> }) {
  const role = req.cookies.get('role')?.value || '';
  const access = req.cookies.get('access')?.value || '';
  if (!access) return NextResponse.json({ error: 'no_access' }, { status: 401 });
  const { id, slug } = await params;
  const body = await req.json().catch(() => ({}));
  const completed = !!body.completado;
  await progRepo.setExerciseCompleted(parseInt(id, 10), slug, completed);
  return NextResponse.json({ ok: true });
}
