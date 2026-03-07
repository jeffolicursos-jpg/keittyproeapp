'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function PerfilPage() {
  const router = useRouter();
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [idade, setIdade] = useState('');
  const [atividade, setAtividade] = useState('sedentario');
  const [objetivo, setObjetivo] = useState('perder');
  const [preview, setPreview] = useState<{ tdee: number; meta: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const guard = await fetch('/api/auth/soft-guard', { cache: 'no-store' });
        if (!guard.ok) {
          const ref = await fetch('/api/auth/refresh', { method: 'POST' });
          if (!ref.ok) {
            router.push('/login');
            return;
          }
        }
      } catch {
        // tenta renovar silenciosamente
        try {
          const ref = await fetch('/api/auth/refresh', { method: 'POST' });
          if (!ref.ok) { router.push('/login'); return; }
        } catch { router.push('/login'); return; }
      }
    })();
  }, [router]);

  useEffect(() => {
    const calc = () => {
      const p = Number(peso || '0');
      const a = Number(altura || '0');
      const i = Number(idade || '0');
      if (!p || !a || !i) { setPreview(null); return; }
      const bmr = 10 * p + 6.25 * a - 5 * i + 5;
      const mult = atividade === 'sedentario' ? 1.2 :
                   atividade === 'leve' ? 1.375 :
                   atividade === 'moderado' ? 1.55 :
                   atividade === 'ativo' ? 1.725 : 1.9;
      const tdee = bmr * mult;
      const meta = objetivo === 'perder' ? tdee - 500 : objetivo === 'ganhar' ? tdee + 300 : tdee;
      setPreview({ tdee, meta });
    };
    calc();
  }, [peso, altura, idade, atividade, objetivo]);

  const submit = async () => {
    try {
      setSaving(true);
      setStatusMsg('');
      let res = await fetch('/api/perfil/calorias/setup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          peso_kg: Number(peso),
          altura_cm: Number(altura),
          idade: Number(idade),
          atividade,
          objetivo
        })
      });
      if (!res.ok) {
        await fetch('/api/auth/refresh', { method: 'POST' });
        res = await fetch('/api/perfil/calorias/setup', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            peso_kg: Number(peso),
            altura_cm: Number(altura),
            idade: Number(idade),
            atividade,
            objetivo
          })
        });
      }
      if (res.ok) {
        setStatusMsg('Plano calórico salvo com sucesso');
        router.push('/');
      } else {
        const j = await res.json().catch(() => ({}));
        setStatusMsg(j?.error || 'Falha ao salvar. Tente novamente.');
      }
      setSaving(false);
    } catch {}
  };

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { window.location.href = '/'; }}>
          <Home className="w-4 h-4 mr-1" />
          Home
        </Button>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h1 className="font-headline text-2xl">Meu Plano Calórico</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Peso atual (kg)</label>
              <input className="w-full border rounded px-2 py-1" value={peso} onChange={e => setPeso(e.target.value)} placeholder="ex.: 80" />
            </div>
            <div>
              <label className="text-sm">Altura (cm)</label>
              <input className="w-full border rounded px-2 py-1" value={altura} onChange={e => setAltura(e.target.value)} placeholder="ex.: 175" />
            </div>
            <div>
              <label className="text-sm">Idade (anos)</label>
              <input className="w-full border rounded px-2 py-1" value={idade} onChange={e => setIdade(e.target.value)} placeholder="ex.: 30" />
            </div>
            <div>
              <label className="text-sm">Nível de atividade</label>
              <select className="w-full border rounded px-2 py-1" value={atividade} onChange={e => setAtividade(e.target.value)}>
                <option value="sedentario">Sedentário</option>
                <option value="leve">Leve</option>
                <option value="moderado">Moderado</option>
                <option value="ativo">Ativo</option>
                <option value="muito_ativo">Muito ativo</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Objetivo</label>
              <select className="w-full border rounded px-2 py-1" value={objetivo} onChange={e => setObjetivo(e.target.value)}>
                <option value="manter">Manter</option>
                <option value="perder">Perder</option>
                <option value="ganhar">Ganhar</option>
              </select>
            </div>
          </div>
          {preview && (
            <div className="text-sm text-muted-foreground">
              TDEE {Math.round(preview.tdee)} kcal | Meta diária {Math.round(preview.meta)} kcal
            </div>
          )}
          <Button onClick={submit} disabled={saving}>{saving ? 'Salvando...' : 'Calcular meu plano calórico'}</Button>
          {statusMsg && <div className="text-sm text-muted-foreground">{statusMsg}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
