import { NextRequest, NextResponse } from 'next/server';
import * as tdRepo from '@/repositories/trainingDays.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  try {
    const rows = await tdRepo.listDays(limit, offset);
    return NextResponse.json({ items: rows, paging: { limit, offset, count: rows.length } });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: 'db_error' }, { status: 200 });
  }
}
