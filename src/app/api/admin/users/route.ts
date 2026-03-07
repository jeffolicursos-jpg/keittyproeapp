import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getActor } from '@/lib/adminGuard';
import { promises as fs } from 'fs';
import path from 'path';
import * as subsRepo from '@/repositories/subscriptions.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const roleCookie = req.cookies.get('role')?.value || '';
  if (roleCookie !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  try {
    const r = await query('SELECT id, nome, email, role, status FROM users ORDER BY created_at DESC', []);
    const users = r.rows || [];
    // Merge extras from CSV
    const dir = path.join(process.cwd(), 'storage');
    const file = path.join(dir, 'users_extra.csv');
    let extras: Record<string, { cpf?: string; valid_until?: string }> = {};
    try {
      const text = await fs.readFile(file, 'utf8');
      const lines = text.trim().split('\n').slice(1);
      for (const ln of lines) {
        const [id, email, cpf, valid_until] = ln.split(',');
        extras[id] = { cpf, valid_until };
      }
    } catch {}
    const merged = users.map((u: any) => ({ ...u, ...(extras[u.id] || {}) }));
    return NextResponse.json({ items: merged });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const actor = await getActor(req);
  if (!(actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const {
    nome, email, senha, cpf,
    sexo, data_nascimento, telefone,
    objetivo, atividade, peso_kg, altura_cm,
    plano
  } = body;
  if (!email || !senha || !nome) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  try {
    const bcrypt = await import('bcryptjs');
    const senha_hash = await bcrypt.hash(String(senha), 10);
    // Create or update user
    const insertRes = await query(
      `INSERT INTO users (nome, email, senha_hash, role, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5, now(), now())
       ON CONFLICT (email) DO UPDATE SET
         nome=EXCLUDED.nome,
         senha_hash=EXCLUDED.senha_hash,
         role='usuario',
         status='ativo',
         updated_at=now()
       RETURNING id, email`,
      [nome, String(email).toLowerCase(), senha_hash, 'usuario', 'ativo']
    );
    const userId = insertRes.rows[0]?.id;
    // Ensure active subscription with selected plan (if provided)
    if (userId) {
      try {
        const p: 'basico' | 'premium' | 'vip' | undefined =
          (['basico', 'premium', 'vip'] as const).includes(String(plano) as any) ? String(plano) as any : undefined;
        await subsRepo.activateWithPlanDetails(userId, 'banco_proprio', p, nome, String(telefone || ''), true);
      } catch {
        try { await subsRepo.activate(userId, 'banco_proprio'); } catch {}
      }
    }
    // Persist extras (cpf) to CSV
    try {
      const dir = path.join(process.cwd(), 'storage');
      const file = path.join(dir, 'users_extra.csv');
      await fs.mkdir(dir, { recursive: true });
      const header = 'id,email,cpf,valid_until\n';
      try { await fs.access(file); } catch { await fs.writeFile(file, header, 'utf8'); }
      const id = userId || (await query('SELECT id FROM users WHERE email=$1 LIMIT 1', [String(email).toLowerCase()])).rows[0]?.id || '';
      const line = `${id},${String(email).toLowerCase()},${cpf || ''},\n`;
      await fs.appendFile(file, line, 'utf8');
    } catch {}
    // opcional: profile calórico preliminar
    if (peso_kg && altura_cm) {
      const bmr = 10 * Number(peso_kg) + 6.25 * Number(altura_cm) - 5 * 30 + 5;
      const tdee = bmr * 1.2;
      const meta = tdee;
      // não vinculado a user_id pois depende do id; este bloco pode ser expandido futuramente
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 });
  }
}
