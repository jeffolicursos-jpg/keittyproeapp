'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

type Ex = { id: string | number; nome: string; completado: boolean };
type DiaModel = {
  semana: number;
  dia: number;
  data: string;
  titulo: string;
  series: number;
  repeticoes: string;
  estimulos: number;
  completadoDia: boolean;
  exercicios: Ex[];
};

export default function TreinoDiaPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = parseInt(String(idParam || '1'), 10) || 1;
  const [dia, setDia] = useState<DiaModel | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const guard = await fetch('/api/auth/guard?feature=treinos', { cache: 'no-store' });
      if (!guard.ok) {
        router.push('/login');
        return;
      }
      const res = await fetch(`/api/treinos/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setDia(data);
      }
    } catch {}
  };

  useEffect(() => { load(); }, [id]);

  const toggleEx = async (ex: Ex) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/treinos/${id}/exercicio/${ex.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ completado: !ex.completado })
      });
      if (res.ok) await load();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dia) return;
    const allDone = dia.exercicios.every(e => e.completado);
    if (allDone && !dia.completadoDia) {
      (async () => {
        try {
          await fetch(`/api/treinos/${id}/status`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ completado: true }) });
          await load();
        } catch {}
      })();
    }
  }, [dia, id]);

  if (!dia) {
    return (
      <div className="container mx-auto max-w-3xl py-6 px-4 text-white">Carregando…</div>
    );
  }

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white">
      <div className="container mx-auto max-w-3xl py-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/treinos')}>Voltar</Button>
        </div>
        <div className="text-center">
          <div className="text-sm">AULA {dia.dia}</div>
          <div className="text-2xl font-headline text-orange-500">{dia.titulo}</div>
        </div>
        <Card className="mt-4 border border-orange-600 bg-[#121212]">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-orange-600 py-3">
                <div className="text-2xl font-bold">{dia.series}</div>
                <div className="text-xs text-white/70">Séries</div>
              </div>
              <div className="rounded-xl border border-orange-600 py-3">
                <div className="text-2xl font-bold">{dia.repeticoes}</div>
                <div className="text-xs text-white/70">Repetições</div>
              </div>
              <div className="rounded-xl border border-orange-600 py-3">
                <div className="text-2xl font-bold">{dia.estimulos}%</div>
                <div className="text-xs text-white/70">Estímulos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6">
          <div className="font-headline text-lg mb-3">Exercícios</div>
          <div className="space-y-3">
            {dia.exercicios.map((e) => (
              <button
                key={String(e.id)}
                disabled={loading}
                onClick={() => toggleEx(e)}
                className={`w-full text-left rounded-xl px-4 py-4 border ${e.completado ? 'bg-green-200 text-black border-green-300' : 'bg-[#121212] text-white border-neutral-700'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {e.completado ? <CheckCircle className="w-5 h-5 text-green-600" /> : null}
                    <div>{e.nome}</div>
                  </div>
                  <div className="text-white/50">{'>'}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
