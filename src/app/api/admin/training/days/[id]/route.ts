import { NextRequest, NextResponse } from 'next/server';
import * as tdRepo from '@/repositories/trainingDays.repo';
import { getActor } from '@/lib/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function isAdmin(req: NextRequest) {
  const actor = await getActor(req);
  return actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin';
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await tdRepo.getDayWithGroups(id);
  if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  await tdRepo.updateDay({
    id,
    title: body.title ?? null,
    overview: body.overview ?? null,
    cardio_title: body.cardio_title ?? null,
    cardio_prescription: body.cardio_prescription ?? null
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  await tdRepo.deleteDay(id);
  return NextResponse.json({ ok: true });
}
