import { NextRequest, NextResponse } from 'next/server';
import * as tdRepo from '@/repositories/trainingDays.repo';
import { getActor } from '@/lib/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function isAdmin(req: NextRequest) {
  const actor = await getActor(req);
  return actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin';
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  await tdRepo.updateGroup({
    id: Number(id),
    order: body.order ?? null,
    exercise_a_slug: body.exercise_a_slug ?? null,
    exercise_b_slug: body.exercise_b_slug ?? null,
    prescription: body.prescription ?? null
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  await tdRepo.deleteGroup(Number(id));
  return NextResponse.json({ ok: true });
}
