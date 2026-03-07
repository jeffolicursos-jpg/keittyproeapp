import { NextRequest, NextResponse } from 'next/server';
import * as tdRepo from '@/repositories/trainingDays.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; groupId: string }> }) {
  const role = req.cookies.get('role')?.value || '';
  if (role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id, groupId } = await params;
  const body = await req.json().catch(() => ({}));
  await tdRepo.updateGroup({
    id: parseInt(groupId, 10),
    order: body.order ?? null,
    exercise_a_slug: body.exercise_a_slug ?? null,
    exercise_b_slug: body.exercise_b_slug ?? null,
    prescription: body.prescription ?? null
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; groupId: string }> }) {
  const role = req.cookies.get('role')?.value || '';
  if (role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { groupId } = await params;
  await tdRepo.deleteGroup(parseInt(groupId, 10));
  return NextResponse.json({ ok: true });
}
