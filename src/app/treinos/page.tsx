'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Dia = {
  semana: number;
  dia: number;
  data: string;
  titulo: string;
  series: number;
  repeticoes: string;
  estimulos: number;
  completadoDia: boolean;
  isHoje: boolean;
  totalReps: number;
};

export default function TreinosPage() {
  const [weeks, setWeeks] = useState<Array<{ semana: number; dias: Dia[] }>>([]);
  const router = useRouter();
  useEffect(() => {
    (async () => {
      try {
        const guard = await fetch('/api/auth/guard?feature=treinos', { cache: 'no-store' });
        if (!guard.ok) {
          router.push('/login');
          return;
        }
        const res = await fetch('/api/treinos/por-semana', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setWeeks(data);
        }
      } catch {}
    })();
  }, [router]);

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4">
      {weeks.map(w => (
        <div key={w.semana} className="mb-6">
          <div className="text-white/90 font-headline text-lg mb-3">Semana {w.semana}</div>
          <Card className="bg-[#1a1a1a] border-neutral-800 mb-2">
            <CardContent className="p-4">
              <div className="text-sm text-white/70 mb-1">Série x Rep.</div>
              <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600" style={{ width: `${Math.min(100, w.dias[0]?.estimulos || 0)}%` }} />
              </div>
              <div className="text-sm text-white/70 mt-2">
                {w.dias[0]?.repeticoes || '4x10'} = {(w.dias[0]?.totalReps || 40)} Repetições
              </div>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {w.dias.map(d => {
              const baseClass = d.completadoDia ? 'bg-green-600 text-white' : (d.isHoje ? 'bg-orange-600 text-white' : 'bg-[#121212] text-white');
              return (
                <Link key={d.dia} href={`/treinos/${d.dia}`}>
                  <Card className={`${baseClass} border-none shadow-none`}>
                    <CardContent className="p-4">
                      <div className="text-sm">Aula {d.dia}</div>
                      <div className="font-headline text-xl">{d.titulo}</div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
