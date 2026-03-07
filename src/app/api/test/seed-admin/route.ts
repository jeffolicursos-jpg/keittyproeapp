import { NextRequest, NextResponse } from 'next/server';
import { ENV } from '@/lib/env';
import { rateLimit } from '@/lib/rateLimit';
import * as usersRepo from '@/repositories/users.repo';
import * as subsRepo from '@/repositories/subscriptions.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  const rl = rateLimit(`seed:${ip}`, 10, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const secret = req.headers.get('x-seed-secret') || '';
  if (!ENV.APP_URL.includes('localhost') && (!ENV.CORS_ORIGIN.includes('localhost'))) {
    if (!secret || secret !== process.env.SEED_SECRET) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const email = String(body.email || '').toLowerCase().trim();
    const nome = String(body.nome || 'Admin').trim();
    const password = String(body.password || '').trim();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 12);
    const user = await usersRepo.ensureAdmin(email, nome, hash);
    await subsRepo.activate(user.id, 'kiwify');
    const res = NextResponse.json({ ok: true, user });
    res.headers.set('Access-Control-Allow-Origin', ENV.CORS_ORIGIN);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    return res;
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }
}

export async function OPTIONS() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Access-Control-Allow-Origin', ENV.CORS_ORIGIN);
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Headers', 'content-type,x-seed-secret');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  return res;
}
