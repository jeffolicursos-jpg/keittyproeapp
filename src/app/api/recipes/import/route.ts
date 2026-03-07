import { NextRequest, NextResponse } from 'next/server';
import { upsertRecipe } from '@/repositories/recipes.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseCSV(text: string): any[] {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const header = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1);
  return rows.map(line => {
    const cols = line.split(',').map(c => c.trim());
    const obj: any = {};
    header.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
    return obj;
  });
}

export async function POST(req: NextRequest) {
  const role = req.cookies.get('role')?.value || '';
  const email = req.cookies.get('email')?.value || '';
  const isAdmin = role === 'admin' || email.toLowerCase() === 'admin@seusistema.com';
  if (!isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.text();
  const items = parseCSV(body);
  for (const it of items) {
    await upsertRecipe({
      recipeNumber: Number(it.recipe_number || it.id || 0),
      name: it.name || it.titulo || '',
      imageUrl: it.image_url || '',
      imageHint: it.image_hint || '',
      portions: Number(it.portions || it.porcoes || 1),
      temperature: it.temperature || '',
      totalTime: it.total_time || '',
      tip: it.tip || it.dica || '',
      proteinGrams: it.protein_grams ? Number(it.protein_grams) : null,
      tags: it.tags ? String(it.tags).split('|') : [],
      status: it.status || 'published',
      user_id: null,
      plano_minimo: it.plano_minimo || it.plano || null,
      cronometro: it.cronometro ? `${Math.floor(Number(it.cronometro)/60).toString().padStart(2,'0')}:${(Number(it.cronometro)%60).toString().padStart(2,'0')}` : null,
      calorias_kcal: it.calorias_kcal ? Number(it.calorias_kcal) : null,
    });
  }
  return NextResponse.json({ ok: true, imported: items.length });
}
