'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Sessao = { aulaNum: number; title: string; done: boolean; dayId: number };

export default function TreinosMesPage() {
  const [weeks, setWeeks] = useState<Array<{ semana: number; sessoes: Sessao[] }>>([]);

  useEffect(() => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const raw = localStorage.getItem('trainingDays');
      const arr: Array<{ id: number; title: string }> = raw ? JSON.parse(raw) : [
        { id: 1, title: 'Dia 1 • Full Body' },
        { id: 2, title: 'Dia 3 • Upper/Lower Alternado' },
      ];
      const lessonOffset = parseInt(localStorage.getItem('lesson_offset') || '0', 10) || 0;
      const lessonCompleted = JSON.parse(localStorage.getItem('lesson_completed') || '{}') as Record<number, boolean>;
      const out: Array<{ semana: number; sessoes: Sessao[] }> = [];
      let weekCount = 0;
      let lessonCounter = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const weekday = new Date(year, month, d).getDay();
        const isTrainingDay = weekday >= 1 && weekday <= 5;
        if (!isTrainingDay) continue;
        const idx = (weekday - 1) % arr.length;
        const t = arr[idx]?.title || 'Treino';
        const title = t.includes('•') ? t.split('•').slice(1).join('•').trim() : t;
        const aulaNum = lessonOffset + (++lessonCounter);
        const done = !!lessonCompleted[aulaNum];
        const dayId = arr[idx]?.id || 1;
        const weekIndex = Math.floor((d - 1) / 7);
        if (!out[weekIndex]) {
          weekCount++;
          out[weekIndex] = { semana: weekCount, sessoes: [] };
        }
        out[weekIndex].sessoes.push({ aulaNum, title, done, dayId });
      }
      setWeeks(out);
    } catch {
      setWeeks([]);
    }
  }, []);

  return (
    <div className="container mx-auto max-w-3xl py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="font-headline text-2xl text-white">Treinos do mês</div>
        <Link href="/treinos"><Button variant="outline" className="border-primary text-primary">Voltar</Button></Link>
      </div>
      {weeks.map((w) => (
        <div key={w.semana} className="mb-6">
          <div className="text-white/90 font-headline text-lg mb-3">Semana {w.semana}</div>
          <div className="grid grid-cols-1 gap-3">
            {w.sessoes.slice(0, 5).map((s, i) => (
              <Card key={`${w.semana}-${i}`} className={`${s.done ? 'bg-green-600 text-white' : 'bg-[#121212] text-white'} border-none`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm">Aula {s.aulaNum}</div>
                    <div className="font-headline text-lg">{s.title}</div>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary"
                      onClick={() => {
                        try {
                          localStorage.setItem('current_lesson_number', String(s.aulaNum));
                          localStorage.setItem('current_lesson_day_id', String(s.dayId));
                        } catch {}
                        window.location.href = `/training/day/${s.dayId}`;
                      }}
                    >
                      Abrir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
