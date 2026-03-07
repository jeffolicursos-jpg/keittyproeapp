import { NextRequest, NextResponse } from 'next/server';
import { verifyAccess } from '@/lib/jwt';
import * as subsRepo from '@/repositories/subscriptions.repo';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('access')?.value || '';
  const data = access ? verifyAccess(access) : null;
  if (!data) return NextResponse.json({ error: 'no_access' }, { status: 401 });
  const status = await subsRepo.latestStatus(data.sub);
  if (status !== 'ativa') return NextResponse.json({ error: 'subscription_block' }, { status: 403 });
  const feature = req.nextUrl.searchParams.get('feature') || '';
  if (feature) {
    const plan = await subsRepo.getUserPlan(data.sub);
    if (!plan) return NextResponse.json({ error: 'plan_block' }, { status: 403 });
    const file = path.join(process.cwd(), 'storage', 'plans.access.json');
    let cfg: Record<string, string[]> = {
      basico: ['recipes'],
      premium: ['recipes', 'treinos'],
      vip: ['recipes', 'treinos', 'dashboard'],
    };
    try {
      const txt = await fs.readFile(file, 'utf8');
      const j = JSON.parse(txt || '{}');
      cfg = { ...cfg, ...j };
    } catch {}
    const allowed = new Set<string>(cfg[plan] || []);
    if (!allowed.has(feature)) {
      return NextResponse.json({ error: 'plan_block' }, { status: 403 });
    }
  }
  return NextResponse.json({ ok: true });
}
