import { NextRequest, NextResponse } from 'next/server';
import * as recipesRepo from '@/repositories/recipes.repo';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rec = await recipesRepo.getRecipeById(id);
    if (!rec) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(rec);
  } catch (e: any) {
    console.error('[api/recipes/:id] error', e?.message || e);
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ error: 'disabled_for_mvp' }, { status: 403 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ error: 'disabled_for_mvp' }, { status: 403 });
}
