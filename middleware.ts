import { NextRequest, NextResponse } from 'next/server';

function isPublicPath(pathname: string) {
  if (pathname === '/login') return true;
  if (pathname === '/') return true;
  if (pathname === '/planos') return true;
  if (pathname === '/sobre') return true;
  if (pathname === '/app') return true;
  if (pathname === '/recipes' || pathname.startsWith('/recipe/')) return true;
  if (pathname === '/receitas') return true;
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
    // Try automatic refresh via our JWT flow
    const refreshRes = await fetch(new URL('/api/auth/refresh', req.nextUrl.origin), {
      method: 'POST',
      headers: { cookie: req.headers.get('cookie') || '' }
    });
    if (refreshRes.ok) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin')) {
    const roleCookie = req.cookies.get('role')?.value || '';
    const emailCookie = req.cookies.get('email')?.value || '';
    const isAdmin = roleCookie === 'admin' || emailCookie.toLowerCase() === 'admin@seusistema.com';
    if (!isAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*']
};
