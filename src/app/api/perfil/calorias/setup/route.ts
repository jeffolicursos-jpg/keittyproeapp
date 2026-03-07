import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAccess } from '@/lib/jwt';
import { findByEmail } from '@/repositories/users.repo';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function factor(atividade: string) {
  switch ((atividade || '').toLowerCase()) {
    case 'sedentario': return 1.2;
    case 'leve': return 1.375;
    case 'moderado': return 1.55;
    case 'ativo': return 1.725;
    case 'muito_ativo': return 1.9;
    default: return 1.2;
  }
}

function meta(tdee: number, objetivo: string) {
  if ((objetivo || '').toLowerCase() === 'perder') return tdee - 500;
  if ((objetivo || '').toLowerCase() === 'ganhar') return tdee + 300;
  return tdee;
}

export async function POST(req: NextRequest) {
  const access = req.cookies.get('access')?.value || '';
  const data = access ? verifyAccess(access) : null;
  let userId = data?.sub || '';
  if (!userId) {
    // Fallback por email quando token de acesso não está presente
    const email = (req.cookies.get('email')?.value || '').toLowerCase();
    if (email) {
      try {
        const u = await findByEmail(email);
        userId = u?.id || '';
      } catch {}
    }
    if (!userId) return NextResponse.json({ error: 'no_access' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { peso_kg, altura_cm, idade, atividade, objetivo } = body;
  const bmr = 10 * Number(peso_kg) + 6.25 * Number(altura_cm) - 5 * Number(idade) + 5;
  const tdee = bmr * factor(atividade);
  const meta_diaria = meta(tdee, objetivo);
  try {
    await query(
      `INSERT INTO user_profile (user_id, peso_kg, altura_cm, idade, atividade, objetivo, tdee, meta_diaria, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, now(), now())
       ON CONFLICT (user_id) DO UPDATE SET
         peso_kg=EXCLUDED.peso_kg,
         altura_cm=EXCLUDED.altura_cm,
         idade=EXCLUDED.idade,
         atividade=EXCLUDED.atividade,
         objetivo=EXCLUDED.objetivo,
         tdee=EXCLUDED.tdee,
         meta_diaria=EXCLUDED.meta_diaria,
         updated_at=now()`,
      [userId, Number(peso_kg), Number(altura_cm), Number(idade), atividade, objetivo, tdee, meta_diaria]
    );
  } catch {}
  const today = new Date().toISOString().slice(0, 10);
  try {
    await query(
      `INSERT INTO daily_calories (user_id, data, calorias_consumidas, agua_ml, updated_at)
       VALUES ($1,$2,0,0, now())
       ON CONFLICT (user_id, data) DO NOTHING`,
      [userId, today]
    );
  } catch {}
  try {
    const email = req.cookies.get('email')?.value || 'unknown';
    const dir = path.join(process.cwd(), 'storage');
    const file = path.join(dir, 'user_calories.csv');
    await fs.mkdir(dir, { recursive: true });
    const header = 'date,email,peso_kg,altura_cm,idade,atividade,objetivo,tdee,meta_diaria\n';
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, header, 'utf8');
    }
    const line = `${today},${email},${Number(peso_kg)},${Number(altura_cm)},${Number(idade)},${atividade},${objetivo},${Math.round(tdee)},${Math.round(meta_diaria)}\n`;
    await fs.appendFile(file, line, 'utf8');
  } catch {}
  const res = NextResponse.json({ ok: true, tdee, meta_diaria }, { status: 201 });
  try {
    res.cookies.set('cal_meta', String(Math.round(meta_diaria)), { path: '/', maxAge: 60 * 60 * 24 * 7 });
    res.cookies.set('cal_tdee', String(Math.round(tdee)), { path: '/', maxAge: 60 * 60 * 24 * 7 });
  } catch {}
  return res;
}
