'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

type Plano = 'basico' | 'premium' | 'vip' | '';
type Row = { id: string; nome: string; telefone: string; email: string; plano: Plano | null; last_login_at: string | null; streak_global?: number; pontos_ultimos_30d?: number; refeicoes_completas_semana?: number };
type Metrics = {
  pct_streak_7: number;
  pct_streak_30: number;
  pontos_medio_30d: number;
  pct_dieta_semana: number;
  pct_checkin_hoje: number;
  planos: Record<'basico' | 'premium' | 'vip', { streakMedio: number; pontosMedios: number }>;
};

const prices: Record<'basico' | 'premium' | 'vip', number> = { basico: 29, premium: 49, vip: 99 };
const planLabel: Record<'basico' | 'premium' | 'vip', string> = { basico: 'Básico', premium: 'Premium', vip: 'VIP' };

function statusColor(lastLoginIso: string | null): 'green' | 'yellow' | 'red' | 'gray' {
  if (!lastLoginIso) return 'gray';
  const d = new Date(lastLoginIso);
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 7) return 'green';
  if (days < 14) return 'yellow';
  return 'red';
}

export default function AdminAnalyticsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [planFilter, setPlanFilter] = useState<Plano>('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [modalUser, setModalUser] = useState<Row | null>(null);
  const [modalPlan, setModalPlan] = useState<'basico'|'premium'|'vip'>('basico');
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const load = async () => {
    setLoading(true);
    setMsg('');
    try {
      const url = new URL('/api/admin/analytics', window.location.origin);
      if (planFilter) url.searchParams.set('plan', planFilter);
      if (q.trim()) url.searchParams.set('q', q.trim());
      const r = await fetch(url.toString(), { cache: 'no-store' });
      const j = await r.json();
      if (r.ok) {
        setItems(j.items || []);
        setMetrics(j.metrics || null);
      }
      else setMsg(j?.error || 'Falha ao carregar');
    } catch { setMsg('Erro de conexão'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []); // load first time

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items
      .filter(i => !planFilter || i.plano === planFilter)
      .filter(i => !query || (i.nome || '').toLowerCase().includes(query) || (i.email || '').toLowerCase().includes(query));
  }, [items, planFilter, q]);

  const counts = useMemo(() => {
    const byPlan = { basico: 0, premium: 0, vip: 0 };
    filtered.forEach(i => {
      if (i.plano && byPlan[i.plano] !== undefined) byPlan[i.plano] += 1;
    });
    return byPlan;
  }, [filtered]);

  const statusCounts = useMemo(() => {
    let g = 0, y = 0, r = 0;
    filtered.forEach(i => {
      const c = statusColor(i.last_login_at);
      if (c === 'green') g++;
      else if (c === 'yellow') y++;
      else if (c === 'red') r++;
    });
    return { g, y, r, total: filtered.length };
  }, [filtered]);

  const revenueData = [
    { plano: 'Básico', total: counts.basico * prices.basico, fill: 'var(--color-basico)' },
    { plano: 'Premium', total: counts.premium * prices.premium, fill: 'var(--color-premium)' },
    { plano: 'VIP', total: counts.vip * prices.vip, fill: 'var(--color-vip)' },
  ];
  const chartConfig = {
    basico: { label: 'Básico', color: '#16a34a' },
    premium: { label: 'Premium', color: '#2563eb' },
    vip: { label: 'VIP', color: '#f59e0b' },
  } as const;

  const exportCsv = () => {
    const headers = ['nome','telefone','email','plano','last_login'];
    const lines = filtered.map(i => [
      i.nome || '',
      i.telefone || '',
      i.email || '',
      i.plano ? planLabel[i.plano] : '',
      i.last_login_at ? new Date(i.last_login_at).toLocaleString('pt-BR') : ''
    ]);
    const content = [headers, ...lines].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alunos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openChangePlan = (u: Row) => {
    setModalUser(u);
    setModalPlan((u.plano as any) || 'basico');
  };
  const saveChangePlan = async () => {
    if (!modalUser) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics/change-plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ user_id: modalUser.id, plano: modalPlan })
      });
      if (res.ok) {
        setModalUser(null);
        await load();
      } else {
        const j = await res.json().catch(() => ({}));
        setMsg(j?.error || 'Falha ao salvar plano');
      }
    } catch { setMsg('Erro de conexão'); }
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-6xl py-6 px-4">
      <div className="mb-4">
        <h1 className="font-headline text-2xl">Admin • Analytics</h1>
        {msg && <div className="text-sm text-muted-foreground mt-1">{msg}</div>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-green-600">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Alunos</div>
            <div className="text-3xl font-bold">{statusCounts.total}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-600">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Verde (&lt;7 dias)</div>
            <div className="text-3xl font-bold text-green-600">{statusCounts.g}</div>
          </CardContent>
        </Card>
        <Card className="border-orange-500">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Amarelo (7–14 dias)</div>
            <div className="text-3xl font-bold text-yellow-500">{statusCounts.y}</div>
          </CardContent>
        </Card>
        <Card className="border-red-600">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Vermelho (&gt;14 dias)</div>
            <div className="text-3xl font-bold text-red-600">{statusCounts.r}</div>
          </CardContent>
        </Card>
      </div>
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">% usuários com streak 7+ dias</div>
              <div className="text-3xl font-bold">{metrics.pct_streak_7}%</div>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">% usuários com streak 30+ dias</div>
              <div className="text-3xl font-bold">{metrics.pct_streak_30}%</div>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Pontos médios (30d)</div>
              <div className="text-3xl font-bold">{metrics.pontos_medio_30d}</div>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">% dieta completa (média 7d)</div>
              <div className="text-3xl font-bold">{metrics.pct_dieta_semana}%</div>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">% com check‑in hoje</div>
              <div className="text-3xl font-bold">{metrics.pct_checkin_hoje}%</div>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">Streak/Pontos médios por plano</div>
              <div className="text-sm mt-1">
                Básico: {metrics.planos.basico.streakMedio} / {metrics.planos.basico.pontosMedios} • Premium: {metrics.planos.premium.streakMedio} / {metrics.planos.premium.pontosMedios} • VIP: {metrics.planos.vip.streakMedio} / {metrics.planos.vip.pontosMedios}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-6">
        <ChartContainer config={chartConfig as any} className="h-[300px]">
          <BarChart data={revenueData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="plano" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="total" radius={6} />
          </BarChart>
        </ChartContainer>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Select value={planFilter} onValueChange={(v) => setPlanFilter(v as Plano)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Todos os planos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="basico">Básico</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Buscar por nome/email" className="w-64" value={q} onChange={e => setQ(e.target.value)} />
        <Button variant="outline" className="border-primary text-primary" onClick={load} disabled={loading}>Aplicar</Button>
        <Button onClick={exportCsv}>Export CSV</Button>
      </div>

      <div className="mt-4 rounded border">
        <div className="grid grid-cols-9 gap-2 px-3 py-2 bg-muted text-xs font-semibold">
          <div>Nome</div><div>Telefone</div><div>Email</div><div>Plano</div><div>Último Login</div><div>Streak</div><div>Pontos 30d</div><div>Refeições 7d</div><div>Ações</div>
        </div>
        {filtered.map((u) => {
          const c = statusColor(u.last_login_at);
          const badgeClass =
            c === 'green' ? 'bg-green-600 text-white' :
            c === 'yellow' ? 'bg-yellow-500 text-black' :
            c === 'red' ? 'bg-red-600 text-white' : 'bg-neutral-500 text-white';
          return (
            <div key={u.id} className="grid grid-cols-9 gap-2 px-3 py-2 border-t text-sm">
              <div className="truncate">{u.nome || '-'}</div>
              <div className="truncate">{u.telefone || '-'}</div>
              <div className="truncate">{u.email}</div>
              <div>{u.plano ? planLabel[u.plano] : '-'}</div>
              <div className="flex items-center gap-2">
                <span>{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('pt-BR') : '-'}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${badgeClass}`}>{c === 'green' ? 'Verde' : c === 'yellow' ? 'Amarelo' : c === 'red' ? 'Vermelho' : '—'}</span>
              </div>
              <div>{u.streak_global ?? 0}</div>
              <div>{u.pontos_ultimos_30d ?? 0}</div>
              <div>{u.refeicoes_completas_semana ?? 0}</div>
              <div>
                <Button size="sm" variant="outline" onClick={() => openChangePlan(u)}>Mudar Plano</Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted-foreground">Nenhum aluno encontrado.</div>
        )}
      </div>

      <Dialog open={!!modalUser} onOpenChange={(o) => { if (!o) setModalUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mudar Plano</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm">{modalUser?.nome || modalUser?.email}</div>
            <Select value={modalPlan} onValueChange={(v) => setModalPlan(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basico">Básico</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalUser(null)}>Cancelar</Button>
            <Button onClick={saveChangePlan} disabled={loading}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
