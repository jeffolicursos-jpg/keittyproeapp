import { NextRequest, NextResponse } from 'next/server';
import * as progRepo from '@/repositories/trainingProgress.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = req.cookies.get('access')?.value || '';
  if (!access) return NextResponse.json({ error: 'no_access' }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  await progRepo.setDayCompleted(parseInt(id, 10), !!body.completado);
  return NextResponse.json({ ok: true });
}
