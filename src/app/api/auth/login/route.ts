import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { issueAccess, issueRefreshWithJti } from '@/lib/jwt';
import { findByEmail } from '@/repositories/users.repo';
import * as tokensRepo from '@/repositories/passwordTokens.repo';
import * as subsRepo from '@/repositories/subscriptions.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String((body.email || '')).toLowerCase().trim();
    const senha = String(body.senha || body.password || '').trim();

    if (!email || !senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    let user: any = null;
    let dbOk = true;
    try {
      user = await findByEmail(email);
    } catch (e) {
      dbOk = false;
    }

    // Fallback hardcoded admin when DB unavailable or user not found
    const fallbackAdminEmail = process.env.ADMIN_EMAIL || 'admin@seusistema.com';
    const fallbackAdminPass = process.env.ADMIN_PASSWORD || 'admin123';
    if (!user && email === fallbackAdminEmail && senha === fallbackAdminPass) {
      user = { id: 'admin-fallback', email: fallbackAdminEmail, role: 'admin', status: 'ativo', senha_hash: '' };
      dbOk = false;
    }
    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    if (user.status !== 'ativo') {
      return NextResponse.json(
        { error: 'Usuário não está ativo' },
        { status: 403 }
      );
    }

    let senhaValida = true;
    if (user.senha_hash) {
      try {
        const bcrypt = await import('bcryptjs');
        senhaValida = await bcrypt.compare(senha, user.senha_hash);
      } catch {
        const fallbackAdminEmail = (process.env.ADMIN_EMAIL || 'admin@seusistema.com').toLowerCase();
        const fallbackAdminPass = process.env.ADMIN_PASSWORD || 'admin123';
        senhaValida = (email === fallbackAdminEmail && senha === fallbackAdminPass);
      }
    }

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Force admin role for configured admin email
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@seusistema.com').toLowerCase();
    if (email === adminEmail) {
      user = { ...user, role: 'admin', status: 'ativo' };
    }
    const access = issueAccess(user.id);
    const { token: refresh, jti } = issueRefreshWithJti(user.id);
    const tokenHash = crypto.createHash('sha256').update(jti).digest('hex');
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // Save refresh only if DB is available
    try { if (dbOk) await tokensRepo.saveRefreshToken(user.id, tokenHash, expires); } catch {}

    const secure = process.env.NODE_ENV !== 'development';
    const { senha_hash, ...safeUser } = user;
    const res = NextResponse.json({
      message: 'Login realizado com sucesso',
      user: safeUser,
    });
    res.cookies.set('access', access, {
      httpOnly: true,
      secure,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 15
    });
    res.cookies.set('refresh', refresh, {
      httpOnly: true,
      secure,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });
    // convenience cookies for existing flows
    res.cookies.set('role', user.role, { path: '/', maxAge: 60 * 60 * 24 * 7 });
    res.cookies.set('email', user.email, { path: '/', maxAge: 60 * 60 * 24 * 7 });
    try { await subsRepo.setLastLogin(user.id); } catch {}
    return res;

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
