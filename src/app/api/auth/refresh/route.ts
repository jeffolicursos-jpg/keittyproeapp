import { NextRequest, NextResponse } from 'next/server';
import { verifyRefresh, issueAccess, issueRefreshWithJti } from '@/lib/jwt';
import { ENV } from '@/lib/env';
import * as tokensRepo from '@/repositories/passwordTokens.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const cookies = req.cookies;
  const refresh = cookies.get('refresh')?.value || '';
  if (!refresh) return NextResponse.json({ error: 'no_refresh' }, { status: 401 });
  const data = verifyRefresh(refresh);
  if (!data) return NextResponse.json({ error: 'invalid_refresh' }, { status: 401 });
  const jti = (data as any).jti || '';
  const tokenHash = require('crypto').createHash('sha256').update(jti).digest('hex');
  const valid = await tokensRepo.isRefreshTokenValid(data.sub, tokenHash);
  if (!valid) return NextResponse.json({ error: 'revoked_or_expired' }, { status: 401 });
  await tokensRepo.revokeRefreshToken(data.sub, tokenHash);
  const access = issueAccess(data.sub);
  const { token: newRefresh, jti: newJti } = issueRefreshWithJti(data.sub);
  const newHash = require('crypto').createHash('sha256').update(newJti).digest('hex');
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await tokensRepo.saveRefreshToken(data.sub, newHash, expires);
  const res = NextResponse.json({ access, refresh: newRefresh });
  res.cookies.set('access', access, { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 15 });
  res.cookies.set('refresh', newRefresh, { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
  res.headers.set('Access-Control-Allow-Origin', ENV.CORS_ORIGIN);
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  return res;
}

export async function OPTIONS() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Access-Control-Allow-Origin', ENV.CORS_ORIGIN);
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Headers', 'content-type');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  return res;
}
