import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccess } from '@/lib/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const access = req.cookies.get('access')?.value || '';
  const data = access ? verifyAccess(access) : null;
  if (!data) {
    const metaFromCookie = Number(req.cookies.get('cal_meta')?.value || 0);
    const consumedCookie = Number(req.cookies.get('cal_consumed_today')?.value || 0);
    const waterCookie = Number(req.cookies.get('agua_today')?.value || 0);
    return NextResponse.json({
      profile: metaFromCookie ? { meta_diaria: metaFromCookie } : null,
      today: {
        calorias_consumidas: consumedCookie,
        agua_ml: waterCookie,
        meta_diaria: metaFromCookie || null,
        percent: metaFromCookie ? Math.round((consumedCookie / metaFromCookie) * 100) : null
      }
    });
  }
  const userId = data.sub;
  let profile: any = null;
  let daily: any = { calorias_consumidas: 0, agua_ml: 0 };
  const today = new Date().toISOString().slice(0, 10);
  try {
    const profRes = await query('SELECT * FROM user_profile WHERE user_id=$1 LIMIT 1', [userId]);
    profile = profRes.rows[0] || null;
    const dailyRes = await query('SELECT * FROM daily_calories WHERE user_id=$1 AND data=$2 LIMIT 1', [userId, today]);
    daily = dailyRes.rows[0] || daily;
  } catch {
    const metaFromCookie = Number(req.cookies.get('cal_meta')?.value || 0);
    const consumedCookie = Number(req.cookies.get('cal_consumed_today')?.value || 0);
    const waterCookie = Number(req.cookies.get('agua_today')?.value || 0);
    profile = metaFromCookie ? { meta_diaria: metaFromCookie } : null;
    daily = { calorias_consumidas: consumedCookie, agua_ml: waterCookie };
  }
  const meta_diaria = profile?.meta_diaria || null;
  const percent = meta_diaria ? Math.round((daily.calorias_consumidas / meta_diaria) * 100) : null;
  return NextResponse.json({
    profile,
    today: {
      calorias_consumidas: daily.calorias_consumidas || 0,
      agua_ml: daily.agua_ml || 0,
      meta_diaria,
      percent
    }
  });
}
