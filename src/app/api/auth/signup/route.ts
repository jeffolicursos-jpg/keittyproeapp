import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ENV } from '@/lib/env';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body?.email || '').toString().trim().toLowerCase();
    const now = new Date().toISOString();
    let canConnect = false;
    try {
      const r = await query('SELECT 1 as ok');
      canConnect = r?.rows?.[0]?.ok === 1;
    } catch (e: any) {
      return NextResponse.json({
        ok: false,
        error: 'db_connect_error',
        message: e?.message || 'failed to connect to db',
        db_url_set: !!ENV.DB_URL,
      }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      can_connect: canConnect,
      db_url_set: !!ENV.DB_URL,
      email_echo: email || null,
      ts: now,
      note: 'signup placeholder: conexão DB validada',
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'bad_request' }, { status: 400 });
  }
}

