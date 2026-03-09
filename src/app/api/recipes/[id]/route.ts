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
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const allowed = {
      name: body.name ?? null,
      description: body.description ?? null,
      calories: typeof body.calories === 'number' ? body.calories : null,
      protein: typeof body.protein === 'number' ? body.protein : null,
      carbs: typeof body.carbs === 'number' ? body.carbs : null,
      fat: typeof body.fat === 'number' ? body.fat : null,
      prep_minutes: typeof body.prep_minutes === 'number' ? body.prep_minutes : null,
      cook_minutes: typeof body.cook_minutes === 'number' ? body.cook_minutes : null,
      image_url: typeof body.image_url === 'string' ? body.image_url : null,
      portions: typeof body.portions === 'string' ? body.portions : null,
      temperature: typeof body.temperature === 'string' ? body.temperature : null,
      total_time: typeof body.total_time === 'string' ? body.total_time : null,
      ingredients_text: typeof body.ingredients_text === 'string' ? body.ingredients_text : null,
      preparation_steps_text: typeof body.preparation_steps_text === 'string' ? body.preparation_steps_text : null,
      tip: typeof body.tip === 'string' ? body.tip : null,
      status: (body.status === 'draft' || body.status === 'published') ? body.status : null,
    };
    const updated = await recipesRepo.updateRecipeById(id, allowed);
    if (!updated) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'bad_request' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ error: 'disabled_for_mvp' }, { status: 403 });
}
