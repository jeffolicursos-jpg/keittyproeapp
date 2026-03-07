import { NextRequest, NextResponse } from 'next/server';
import { verifyRefresh } from '@/lib/jwt';
import * as tokensRepo from '@/repositories/passwordTokens.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const refresh = req.cookies.get('refresh')?.value || '';
    if (refresh) {
      const data = verifyRefresh(refresh);
      if (data) {
        const jti = (data as any).jti || '';
        const tokenHash = require('crypto').createHash('sha256').update(jti).digest('hex');
        await tokensRepo.revokeRefreshToken(data.sub, tokenHash);
      }
    }
    const res = NextResponse.redirect(new URL('/login', req.nextUrl));
    res.cookies.set('access', '', { httpOnly: true, path: '/', maxAge: 0 });
    res.cookies.set('refresh', '', { httpOnly: true, path: '/', maxAge: 0 });
    res.cookies.set('role', '', { path: '/', maxAge: 0 });
    return res;
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.nextUrl));
    res.cookies.set('access', '', { httpOnly: true, path: '/', maxAge: 0 });
    res.cookies.set('refresh', '', { httpOnly: true, path: '/', maxAge: 0 });
    res.cookies.set('role', '', { path: '/', maxAge: 0 });
    return res;
  }
}
