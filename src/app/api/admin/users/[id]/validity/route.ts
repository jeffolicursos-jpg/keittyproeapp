import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const roleCookie = req.cookies.get('role')?.value || '';
  if (roleCookie !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const addMonths = Number(body.add_months || 0);
  const setDate = String(body.valid_until || '');
  const dir = path.join(process.cwd(), 'storage');
  const file = path.join(dir, 'users_extra.csv');
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, 'id,email,cpf,valid_until\n', 'utf8');
  }
  const text = await fs.readFile(file, 'utf8');
  const lines = text.trim().split('\n');
  const header = lines[0];
  const rest = lines.slice(1);
  const updated = rest.map((ln) => {
    const [uid, email, cpf, valid_until] = ln.split(',');
    if (uid === id) {
      let newDate = valid_until;
      if (setDate) {
        newDate = setDate;
      } else if (addMonths > 0) {
        const base = new Date(valid_until || new Date().toISOString().slice(0, 10));
        base.setMonth(base.getMonth() + addMonths);
        newDate = base.toISOString().slice(0, 10);
      }
      return [uid, email, cpf, newDate].join(',');
    }
    return ln;
  });
  await fs.writeFile(file, [header, ...updated].join('\n') + '\n', 'utf8');
  return NextResponse.json({ ok: true });
}
