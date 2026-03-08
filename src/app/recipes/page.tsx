'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

type Item = { id: string; name: string };

export default function RecipesLinksPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r1 = await fetch('/api/recipes?limit=500&offset=0', { cache: 'no-store' });
        const j1 = await r1.json().catch(() => null);
        const rows: any[] = j1 && Array.isArray(j1.items) ? j1.items : [];
        const mapped: Item[] = rows
          .map((r: any) => ({ id: String(r.id || '').trim(), name: String(r.name || '').trim() }))
          .filter((r: Item) => !!r.id && !!r.name);
        setItems(mapped);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-headline text-2xl">Recipes</h1>
      </div>
      {loading && <div className="text-sm text-muted-foreground mb-2">Carregando...</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((it) => (
          <Link key={it.id} href={`/recipe/${it.id}`} className="w-full">
            <Button variant="outline" className="w-full justify-between">
              <span className="text-sm">{it.name}</span>
              <span className="text-xs text-muted-foreground">/recipe/{it.id}</span>
            </Button>
          </Link>
        ))}
        {!loading && items.length === 0 && (
          <div className="text-sm text-muted-foreground">
            Nenhuma receita encontrada. Publique receitas através do editor admin ou verifique o backend.
          </div>
        )}
      </div>
    </div>
  );
}
