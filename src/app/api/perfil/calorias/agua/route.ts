import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccess } from '@/lib/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  const access = req.cookies.get('access')?.value || '';
  const data = access ? verifyAccess(access) : null;
  if (!data) {
    const body = await req.json().catch(() => ({}));
    const ml = Number(body.ml) || 0;
    const cur = Number(req.cookies.get('agua_today')?.value || 0);
    const res = NextResponse.json({ ok: true });
    res.cookies.set('agua_today', String(cur + ml), { path: '/', maxAge: 60 * 60 * 12 });
    return res;
  }
  const body = await req.json().catch(() => ({}));
  const ml = Number(body.ml) || 0;
  const today = new Date().toISOString().slice(0, 10);
  await query(
    `INSERT INTO daily_calories (user_id, data, agua_ml, updated_at)
     VALUES ($1,$2,$3, now())
     ON CONFLICT (user_id, data) DO UPDATE SET
       agua_ml = daily_calories.agua_ml + EXCLUDED.agua_ml,
       updated_at = now()`,
    [data.sub, today, ml]
  );
  const res = NextResponse.json({ ok: true });
  try {
    const cur = Number(req.cookies.get('agua_today')?.value || 0);
    res.cookies.set('agua_today', String(cur + ml), { path: '/', maxAge: 60 * 60 * 12 });
  } catch {}
  return res;
}
