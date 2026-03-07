'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type RecipeItem = {
  recipe_number: number;
  name: string;
  image_url: string;
  portions: number;
  status: string;
};

export default function ReceitasPage() {
  const [items, setItems] = useState<RecipeItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [portions, setPortions] = useState(1);
  const [temperature, setTemperature] = useState('Quente');
  const [totalTime, setTotalTime] = useState('20 min');
  const [proteinGrams, setProteinGrams] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    try {
      const role = (document.cookie.split('; ').find(c => c.startsWith('role=')) || '').split('=')[1] || '';
      setIsAdmin(role === 'admin');
    } catch { setIsAdmin(false); }
    (async () => {
      try {
        const r = await fetch('/api/receitas', { cache: 'no-store' });
        const j = await r.json();
        if (Array.isArray(j)) {
          setItems(j as any);
        }
      } catch {}
    })();
  }, []);

  const addRecipe = async () => {
    setStatusMsg('');
    try {
      const nextId = (items.reduce((m, it) => Math.max(m, Number(it.recipe_number || 0)), 0) || 0) + 1;
      const payload = {
        name,
        imageUrl,
        imageHint: 'dish photo',
        portions,
        temperature,
        totalTime,
        proteinGrams,
        tags: ['Publicado'],
        status: 'published'
      };
      const res = await fetch(`/api/recipes/${nextId}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setStatusMsg(j?.error || 'Erro ao salvar');
        return;
      }
      setStatusMsg('Receita adicionada');
      setFormOpen(false);
      try {
        const r = await fetch('/api/receitas', { cache: 'no-store' });
        const j = await r.json();
        if (Array.isArray(j)) setItems(j as any);
      } catch {}
    } catch { setStatusMsg('Erro de conexão'); }
  };

  return (
    <div className="container mx-auto max-w-6xl py-6 px-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-headline text-2xl">Receitas</h1>
      </div>
      {isAdmin && (
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            className="border-primary text-primary"
            onClick={async () => {
              try {
                setStatusMsg('');
                const nextId = (items.reduce((m, it) => Math.max(m, Number(it.recipe_number || 0)), 0) || 0) + 1;
                const payload = {
                  name: 'Nova Receita',
                  imageUrl: '/images/sweetpotato.png',
                  imageHint: 'dish photo',
                  portions: 1,
                  temperature: 'Quente',
                  totalTime: '20 min',
                  proteinGrams: 0,
                  tags: ['Publicado'],
                  status: 'draft'
                };
                const res = await fetch(`/api/recipes/${nextId}`, {
                  method: 'PUT',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                if (!res.ok) {
                  const j = await res.json().catch(() => ({}));
                  setStatusMsg(j?.error || 'Erro ao criar rascunho');
                  return;
                }
                router.push(`/recipe/${nextId}`);
              } catch {
                setStatusMsg('Erro ao criar rascunho');
              }
            }}
          >
            Adicionar receita
          </Button>
        </div>
      )}
      {statusMsg && <div className="mb-4 text-sm text-muted-foreground">{statusMsg}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((it) => (
          <Card key={it.recipe_number}>
            <CardContent className="p-3 space-y-2">
              <div className="relative h-28 rounded overflow-hidden bg-muted">
                {it.image_url ? (
                  <Image src={`/images/${encodeURIComponent(it.image_url.replace(/^\/images\//, ''))}`} alt={it.name} fill className="object-cover" />
                ) : null}
              </div>
              <div className="font-medium">{it.name}</div>
              <div className="text-xs text-muted-foreground">Porções: {it.portions} • Status: {it.status}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
