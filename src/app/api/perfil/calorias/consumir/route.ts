import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccess } from '@/lib/jwt';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  const access = req.cookies.get('access')?.value || '';
  const data = access ? verifyAccess(access) : null;
  if (!data) {
    const body = await req.json().catch(() => ({}));
    const calorias = Number(body.calorias) || 0;
    const consumed = Number(req.cookies.get('cal_consumed_today')?.value || 0) + calorias;
    const res = NextResponse.json({ ok: true });
    res.cookies.set('cal_consumed_today', String(consumed), { path: '/', maxAge: 60 * 60 * 12 });
    return res;
  }
  const body = await req.json().catch(() => ({}));
  const calorias = Number(body.calorias) || 0;
  const today = new Date().toISOString().slice(0, 10);
  await query(
    `INSERT INTO daily_calories (user_id, data, calorias_consumidas, updated_at)
     VALUES ($1,$2,$3, now())
     ON CONFLICT (user_id, data) DO UPDATE SET
       calorias_consumidas = daily_calories.calorias_consumidas + EXCLUDED.calorias_consumidas,
       updated_at = now()`,
    [data.sub, today, calorias]
  );
  const res = NextResponse.json({ ok: true });
  try {
    const consumed = Number(req.cookies.get('cal_consumed_today')?.value || 0) + calorias;
    res.cookies.set('cal_consumed_today', String(consumed), { path: '/', maxAge: 60 * 60 * 12 });
  } catch {}
  return res;
}
