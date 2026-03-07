import { NextRequest, NextResponse } from 'next/server';
import * as subsRepo from '@/repositories/subscriptions.repo';
import { getActor } from '@/lib/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const actor = await getActor(req);
  if (!(actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const userId = String(body.user_id || '');
    const plano = String(body.plano || '');
    if (!userId || !['basico','premium','vip'].includes(plano)) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }
    await subsRepo.activateWithPlan(userId, 'banco_proprio', plano as any);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 });
  }
}
