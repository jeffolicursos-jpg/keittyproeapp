import { NextRequest, NextResponse } from 'next/server';
import { verifyAccess } from '@/lib/jwt';
import * as subsRepo from '@/repositories/subscriptions.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('access')?.value || '';
  const data = access ? verifyAccess(access) : null;
  if (!data) return NextResponse.json({ error: 'no_access' }, { status: 401 });
  const details = await subsRepo.latestDetails(data.sub);
  return NextResponse.json({ subscription: details || { status: 'none' } });
}
