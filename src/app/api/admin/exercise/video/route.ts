import { NextRequest, NextResponse } from 'next/server';
import * as exRepo from '@/repositories/exercises.repo';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const role = req.cookies.get('role')?.value || '';
  const email = req.cookies.get('email')?.value || '';
  const isAdmin = role === 'admin' || email.toLowerCase() === 'admin@seusistema.com';
  if (!isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const slug = String(form.get('slug') || '').toLowerCase();
  if (!file || !slug) return NextResponse.json({ error: 'missing_file_or_slug' }, { status: 400 });
  const buf = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'exercises');
  fs.mkdirSync(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, `${slug}.mp4`);
  fs.writeFileSync(filePath, buf);
  const publicUrl = `/uploads/exercises/${slug}.mp4`;
  await exRepo.setVideoUrl(slug, publicUrl);
  return NextResponse.json({ ok: true, url: publicUrl });
}
