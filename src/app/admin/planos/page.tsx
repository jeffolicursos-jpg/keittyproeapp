'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Home } from 'lucide-react';

type PlanKey = 'basico' | 'premium' | 'vip';
type PlanConfig = Record<PlanKey, string[]>;

const ALL_PAGES: Array<{ key: string; label: string }> = [
  { key: 'recipes', label: 'Receitas' },
  { key: 'treinos', label: 'Treinos' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'perfil', label: 'Perfil' },
  { key: 'plano', label: 'Meu Plano' },
];

export default function AdminPlanosPage() {
  const [cfg, setCfg] = useState<PlanConfig>({
    basico: [],
    premium: [],
    vip: [],
  });
  const [msg, setMsg] = useState('');

  const load = async () => {
    setMsg('');
    try {
      const r = await fetch('/api/admin/planos', { cache: 'no-store' });
      const j = await r.json();
      if (r.ok) setCfg(j.config || {});
      else setMsg(j?.error || 'Falha ao carregar');
    } catch { setMsg('Erro de conexão'); }
  };
  useEffect(() => { load(); }, []);

  const toggle = (plan: PlanKey, pageKey: string) => {
    setCfg(prev => {
      const cur = new Set(prev[plan] || []);
      if (cur.has(pageKey)) cur.delete(pageKey); else cur.add(pageKey);
      return { ...prev, [plan]: Array.from(cur) } as PlanConfig;
    });
  };

  const salvar = async () => {
    setMsg('');
    try {
      const r = await fetch('/api/admin/planos', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ config: cfg }),
      });
      const j = await r.json();
      if (r.ok) setMsg('Planos atualizados');
      else setMsg(j?.error || 'Falha ao salvar');
    } catch { setMsg('Erro de conexão'); }
  };

  const PlanoCard = ({ plan, title }: { plan: PlanKey; title: string }) => (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="font-semibold">{title}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ALL_PAGES.map(p => {
            const checked = (cfg[plan] || []).includes(p.key);
            return (
              <label key={p.key} className="flex items-center gap-2 text-sm">
                <Checkbox checked={checked} onCheckedChange={() => toggle(plan, p.key)} />
                <span>{p.label}</span>
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => history.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { window.location.href = '/'; }}>
          <Home className="w-4 h-4 mr-1" /> Home
        </Button>
      </div>
      <div className="mb-4">
        <h1 className="font-headline text-2xl">Admin • Planos e Acessos</h1>
        <p className="text-sm text-muted-foreground">Defina quais páginas cada plano pode acessar.</p>
      </div>
      <div className="space-y-3">
        <PlanoCard plan="basico" title="Básico" />
        <PlanoCard plan="premium" title="Premium" />
        <PlanoCard plan="vip" title="VIP" />
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Button onClick={salvar}>Salvar Configuração</Button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>
    </div>
  );
}
