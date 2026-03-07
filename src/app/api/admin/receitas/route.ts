import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(r: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        }
      }
    }
  );
  const formData = await r.formData();
  const file = formData.get('csv') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  const text = await file.text();
  const { data: results } = Papa.parse(text, { header: true });

  const { error } = await supabase.from('receitas').upsert(
    (results as any[]).map((row: any) => ({
      titulo: row.titulo,
      ingredientes: row.ingredientes,
      prepara: row.prepara,
      cozimento: row.cozimento,
      porcoes: parseInt(row.porcoes) || 4,
      cronometro: parseInt(row.cronometro) || 0,
      dica: row.dica,
      macros: row.macros ? JSON.parse(row.macros) : null,
      plano: row.plano || 'basico'
    }))
  );
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true, count: (results as any[]).length });
}
