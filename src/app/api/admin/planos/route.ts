import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getActor } from '@/lib/adminGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PlanKey = 'basico' | 'premium' | 'vip';
type PlanConfig = Record<PlanKey, string[]>;

function defaultConfig(): PlanConfig {
  return {
    basico: ['recipes'],
    premium: ['recipes', 'treinos'],
    vip: ['recipes', 'treinos', 'dashboard'],
  };
}

async function getFilePath() {
  const dir = path.join(process.cwd(), 'storage');
  const file = path.join(dir, 'plans.access.json');
  await fs.mkdir(dir, { recursive: true });
  return file;
}

export async function GET(req: NextRequest) {
  const actor = await getActor(req);
  if (!(actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  try {
    const file = await getFilePath();
    try {
      const txt = await fs.readFile(file, 'utf8');
      const cfg = JSON.parse(txt || '{}');
      return NextResponse.json({ config: { ...defaultConfig(), ...cfg } });
    } catch {
      return NextResponse.json({ config: defaultConfig() });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'read_error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const actor = await getActor(req);
  if (!(actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const config = (body?.config || {}) as Partial<PlanConfig>;
    const merged: PlanConfig = { ...defaultConfig(), ...config } as PlanConfig;
    const file = await getFilePath();
    await fs.writeFile(file, JSON.stringify(merged, null, 2), 'utf8');
    return NextResponse.json({ ok: true, config: merged });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'write_error' }, { status: 500 });
  }
}
