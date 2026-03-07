import { NextRequest, NextResponse } from 'next/server';
import * as exRepo from '@/repositories/exercises.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const role = req.cookies.get('role')?.value || '';
  const email = req.cookies.get('email')?.value || '';
  const isAdmin = role === 'admin' || email.toLowerCase() === 'admin@seusistema.com';
  if (!isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const { slug } = await params;
  const body = await req.json();
  await exRepo.upsertExercise({
    slug,
    title: body.title || body.Nome_do_exercicio || slug,
    execution_text: body.execution_text || body.Como_executar || null,
    default_series: body.default_series ?? null,
    default_reps: body.default_reps ?? null,
    video_url: body.video_url ?? null
  });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ex = await exRepo.getBySlug(slug);
  return NextResponse.json(ex || null);
}
