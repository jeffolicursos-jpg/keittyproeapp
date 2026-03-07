import { NextRequest, NextResponse } from 'next/server';
import { listRecipes } from '@/repositories/recipes.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const rows = await listRecipes(limit, offset);
    return NextResponse.json({ items: rows, paging: { limit, offset, count: rows.length } });
  } catch (e: any) {
    console.error('[api/recipes] error', e?.message || e);
    return NextResponse.json({ error: e?.message || 'db_error' }, { status: 500 });
  }
}
