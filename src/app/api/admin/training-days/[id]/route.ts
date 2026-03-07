import { NextRequest, NextResponse } from 'next/server';
import * as tdRepo from '@/repositories/trainingDays.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const day = await tdRepo.getDayWithGroups(id);
  return NextResponse.json(day || null);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = req.cookies.get('role')?.value || '';
  if (role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const payload = {
    id,
    title: body.title ?? String(id),
    overview: body.overview ?? null,
    cardio_title: body.cardio_title ?? null,
    cardio_prescription: body.cardio_prescription ?? null
  };
  await tdRepo.upsertDay(payload);
  return NextResponse.json({ ok: true });
}
