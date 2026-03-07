import { NextRequest, NextResponse } from 'next/server';
import * as recipesRepo from '@/repositories/recipes.repo';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let rec: any = null;
    // If UUID (contains hyphen) or non-numeric → fetch by id (uuid)
    if (!/^\d+$/.test(id)) {
      rec = await recipesRepo.getRecipeById(id);
    } else {
      rec = await recipesRepo.getRecipeByNumber(Number(id));
    }
    return NextResponse.json(rec || null);
  } catch (e: any) {
    console.error('[api/recipes/:id] error', e?.message || e);
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = req.cookies.get('role')?.value || '';
  if (role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const payload = await req.json();
  await recipesRepo.upsertRecipe({ ...payload, recipeNumber: Number(id) });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const role = req.cookies.get('role')?.value || '';
  const email = req.cookies.get('email')?.value || '';
  const isAdmin = role === 'admin' || email.toLowerCase() === 'admin@seusistema.com';
  if (!isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await recipesRepo.deleteRecipeByNumber(Number(id));
  return NextResponse.json({ ok: true });
}
