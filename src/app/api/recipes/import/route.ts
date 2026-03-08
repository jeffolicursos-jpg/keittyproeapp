import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'disabled_for_mvp' }, { status: 403 });
}
