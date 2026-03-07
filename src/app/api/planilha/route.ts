import { NextRequest, NextResponse } from 'next/server';
import { verifyAccess } from '@/lib/jwt';
import { getUserPlan } from '@/repositories/subscriptions.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('access')?.value || '';
  const data = access ? verifyAccess(access) : null;
  if (!data) return NextResponse.json({ error: 'no_access' }, { status: 401 });
  const plan = await getUserPlan(data.sub);
  if (plan !== 'vip') {
    return NextResponse.json({ error: 'forbidden_plan' }, { status: 403 });
  }
  // Placeholder planilha VIP
  return NextResponse.json({ planilha: { semanas: 4, foco: 'Emagrecimento', coach: true } });
}
