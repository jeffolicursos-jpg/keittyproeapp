import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { findByEmail } from '@/repositories/users.repo';

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
  const role = req.cookies.get('role')?.value || '';
  if (role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const { email, peso_kg, altura_cm, idade, atividade, objetivo } = body;
  const user = await findByEmail(String(email || '').toLowerCase());
  if (!user) return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  const bmr = 10 * Number(peso_kg) + 6.25 * Number(altura_cm) - 5 * Number(idade) + 5;
  const tdee = bmr * factor(atividade);
  const meta_diaria = meta(tdee, objetivo);
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
    [user.id, Number(peso_kg), Number(altura_cm), Number(idade), atividade, objetivo, tdee, meta_diaria]
  );
  const today = new Date().toISOString().slice(0, 10);
  await query(
    `INSERT INTO daily_calories (user_id, data, calorias_consumidas, agua_ml, updated_at)
     VALUES ($1,$2,0,0, now())
     ON CONFLICT (user_id, data) DO NOTHING`,
    [user.id, today]
  );
  return NextResponse.json({ ok: true, tdee, meta_diaria }, { status: 201 });
}
