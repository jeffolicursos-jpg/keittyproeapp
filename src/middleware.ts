import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ENV } from '@/lib/env';

function isPublicPath(pathname: string) {
  if (pathname === '/login') return true;
  if (pathname === '/app') return true;
  if (pathname.startsWith('/api/')) return true;
  if (pathname.startsWith('/_next/')) return true;
  if (pathname === '/favicon.ico') return true;
  if (pathname.startsWith('/images/')) return true;
  if (pathname.startsWith('/static/')) return true;
  if (pathname.startsWith('/assets/')) return true;
  if (pathname === '/manifest.json') return true;
  if (pathname === '/sw.js') return true;
  if (pathname === '/robots.txt') return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const access = req.cookies.get('access')?.value || '';
  if (!access) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(ENV.JWT_SECRET);
    const { payload } = await jwtVerify(access, secret, { algorithms: ['HS256'] });
    if (payload?.typ !== 'access' || typeof payload?.sub !== 'string') {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin')) {
    const roleCookie = req.cookies.get('role')?.value || '';
    if (roleCookie !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*']
};
