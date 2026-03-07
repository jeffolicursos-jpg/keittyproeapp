import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ENV } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const r = await query('SELECT 1 as ok');
    const res = NextResponse.json({ ok: r.rows[0]?.ok === 1, db_url_set: !!ENV.DB_URL });
    res.headers.set('Access-Control-Allow-Origin', ENV.CORS_ORIGIN);
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: 'db_unavailable' }, { status: 500 });
  }
}
