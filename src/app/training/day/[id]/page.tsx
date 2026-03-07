'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTrainingDay, getExercise } from '@/app/training-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, ArrowLeft, Home, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function TrainingDayPage() {
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = parseInt(String(idParam || '1'), 10) || 1;
  const dayLocal = getTrainingDay(id);
  const [dayDb, setDayDb] = useState<any | null>(null);
  const [lessonNumber, setLessonNumber] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/training/days/${id}`, { cache: 'no-store' });
        if (r.ok) {
          const ct = r.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await r.json().catch(() => null);
            if (j) setDayDb(j);
          }
        }
      } catch {}
    })();
  }, [id]);
  const router = useRouter();
  const [doneGroups, setDoneGroups] = useState<Record<number, boolean>>({});
  const [groupStatuses, setGroupStatuses] = useState<Record<number, 'completed' | 'abandoned' | null>>({});
  const [cardioDone, setCardioDone] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  useEffect(() => {
    try {
      const role = (document.cookie.split('; ').find(c => c.startsWith('role=')) || '').split('=')[1] || '';
      setIsAdmin(role === 'admin');
    } catch { setIsAdmin(false); }
  }, []);
  const handleResetToday = () => {
    try {
      const dateKey = new Date().toISOString().slice(0, 10);
      const statusRaw = localStorage.getItem('exercise_status');
      const statusObj = statusRaw ? JSON.parse(statusRaw) as Record<string, Record<string, string>> : {};
      delete statusObj[dateKey];
      localStorage.setItem('exercise_status', JSON.stringify(statusObj));
      const doneRaw = localStorage.getItem('exercise_done_log');
      const doneObj = doneRaw ? JSON.parse(doneRaw) as Record<string, Record<string, boolean>> : {};
      delete doneObj[dateKey];
      localStorage.setItem('exercise_done_log', JSON.stringify(doneObj));
      const groups = (dayDb ? dayDb.groups : (dayLocal?.groups || [])) || [];
      for (let i = 0; i < groups.length; i++) {
        localStorage.removeItem(`training_day_${id}_group_${i}_done`);
      }
      localStorage.removeItem(`training_day_${id}_cardio_done`);
      setDoneGroups({});
      setGroupStatuses({});
      setCardioDone(false);
    } catch {}
  };
  useEffect(() => {
    try {
      const groups = (dayDb ? dayDb.groups : (dayLocal?.groups || [])) || [];
      const state: Record<number, boolean> = {};
      const statusState: Record<number, 'completed' | 'abandoned' | null> = {};
      const dateKey = new Date().toISOString().slice(0, 10);
      const statusRaw = localStorage.getItem('exercise_status');
      const statusObj = statusRaw ? JSON.parse(statusRaw) as Record<string, Record<string, string>> : {};
      const dayLog = statusObj[dateKey] || {};
      const doneLogRaw = localStorage.getItem('exercise_done_log');
      const doneObj = doneLogRaw ? JSON.parse(doneLogRaw) as Record<string, Record<string, boolean>> : {};
      const doneDayLog = doneObj[dateKey] || {};
      for (let i = 0; i < groups.length; i++) {
        const trainingDone = localStorage.getItem(`training_day_${id}_group_${i}_done`) === '1';
        const slugA = (dayDb ? (groups[i]?.a?.slug || '') : (groups[i]?.exerciseA || '')) as string;
        const sKeyA = `${id}-${i}-${slugA.toLowerCase()}`;
        const s = dayLog[sKeyA] as ('completed'|'abandoned') | undefined;
        const doneFlag = !!doneDayLog[sKeyA];
        statusState[i] = s || null;
        state[i] = trainingDone || doneFlag || (s === 'completed');
      }
      setDoneGroups(state);
      setGroupStatuses(statusState);
      const cardioFlag = localStorage.getItem(`training_day_${id}_cardio_done`) === '1';
      // Se todos completos e cardio existe, marcar automaticamente
      const allCompleted = groups.length > 0 && Object.values(state).every(Boolean);
      if ((dayDb?.cardio || dayLocal?.cardio) && allCompleted && !cardioFlag) {
        try { localStorage.setItem(`training_day_${id}_cardio_done`, '1'); } catch {}
        setCardioDone(true);
      } else {
        setCardioDone(cardioFlag);
      }
    } catch {}
  }, [id, dayDb, dayLocal]);
  useEffect(() => {
    try {
      const n = parseInt(localStorage.getItem('current_lesson_number') || '0', 10) || null;
      setLessonNumber(n);
    } catch { setLessonNumber(null); }
  }, []);

  if (!dayLocal && !dayDb) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <h1 className="font-headline text-2xl md:text-3xl">Dia de treino não encontrado</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Voltar">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </div>
        <Link href="/" aria-label="Home" className="inline-flex">
          <Button variant="ghost" size="sm">
            <Home className="w-4 h-4 mr-1" />
            Início
          </Button>
        </Link>
        {isAdmin && (
          <div className="ml-2">
            <Button size="sm" variant="outline" className="border-primary text-primary" onClick={handleResetToday}>
              Limpar progresso de hoje
            </Button>
          </div>
        )}
      </div>
      <div className="mb-4">
        <div className="text-xs uppercase text-muted-foreground mb-1">AULA {lessonNumber ?? id}</div>
        <div className="flex items-center gap-3">
          <Dumbbell className="w-6 h-6 text-primary" />
          <h1 className="font-headline text-2xl md:text-3xl">
            {(() => {
              const raw = String((dayDb?.title || dayLocal?.title) as string || '');
              if (raw.includes('•')) return raw.split('•').slice(1).join('•').trim();
              return raw.replace(/^Dia\s+\d+\s*/i, '').trim();
            })()}
          </h1>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="border-primary text-primary ml-2"
              onClick={async () => {
                const newTitle = prompt('Novo nome da Aula', (dayDb?.title || dayLocal?.title) as string) || '';
                if (!newTitle) return;
                await fetch(`/api/admin/training-days/${id}`, {
                  method: 'PATCH',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({ title: newTitle })
                });
                alert('Aula atualizada');
                location.reload();
              }}
            >
              Editar Aula
            </Button>
          )}
        </div>
        {(() => {
          const statuses = Object.values(groupStatuses);
          const allCompleted = statuses.length > 0 && statuses.every(s => s === 'completed');
          const anyAbandoned = statuses.some(s => s === 'abandoned');
          return (
            <div className="mt-2">
              {allCompleted ? (
                <div className="rounded-lg border border-green-600 bg-green-100 text-green-800 px-3 py-2 text-xs inline-block">
                  Aula concluída hoje
                </div>
              ) : anyAbandoned ? (
                <div className="rounded-lg border border-orange-600 bg-orange-100 text-orange-800 px-3 py-2 text-xs inline-block">
                  Aula em andamento • há exercícios abandonados
                </div>
              ) : (
                <div className="rounded-lg border border-neutral-700 bg-[#121212] text-neutral-300 px-3 py-2 text-xs inline-block">
                  Aula em andamento
                </div>
              )}
            </div>
          );
        })()}
      </div>
      {(dayDb?.overview || dayLocal?.overview) ? <p className="text-sm text-muted-foreground mb-6">{(dayDb?.overview || dayLocal?.overview) as string}</p> : null}
      <div className="space-y-4">
        {(dayDb ? dayDb.groups : (dayLocal?.groups || [])).map((g: any, idx: number) => {
          const a = dayDb ? { slug: g.a?.slug, title: g.a?.title } : getExercise(g.exerciseA);
          const status = groupStatuses[idx] || null;
          const isDone = (status === 'completed') || !!doneGroups[idx];
          const isAbandoned = status === 'abandoned';
          return (
            <Card key={idx} className={`overflow-hidden ${isDone ? 'bg-green-600 text-white border-none' : isAbandoned ? 'bg-orange-600 text-white border-none' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {a && a.slug && (
                      isDone ? (
                        <Button variant="ghost" className="justify-start w-full px-2 cursor-not-allowed" disabled>
                          {(a as any).title}
                        </Button>
                      ) : (
                        <Link href={`/training/exercise/${a.slug}?day=${id}&group=${idx}&lesson=${lessonNumber ?? id}&choice=a&autoNext=1`} className="block">
                          <Button variant="ghost" className="justify-start w-full px-2">
                            {(a as any).title}
                          </Button>
                        </Link>
                      )
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-mono bg-muted rounded px-2 py-1">{(g.prescription || (dayLocal ? g.prescription : ''))}</div>
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full border border-green-500 bg-green-200 flex items-center justify-center" title="Concluído">
                        <CheckCircle className="w-4 h-4 text-green-700" />
                      </div>
                    ) : isAbandoned ? (
                      <div className="w-5 h-5 rounded-full border border-orange-500 bg-orange-200 flex items-center justify-center" title="Abandonado">
                        <CheckCircle className="w-4 h-4 text-orange-700" />
                      </div>
                    ) : null}
                    {status && (
                      <span className={`text-xs px-2 py-1 rounded ${isDone ? 'bg-green-700 text-white' : isAbandoned ? 'bg-orange-700 text-white' : 'bg-neutral-700 text-white'}`}>
                        {isDone ? 'Concluído' : isAbandoned ? 'Abandonado' : ''}
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="mt-3 border-t border-neutral-700 pt-3">
                      <div className="text-xs mb-2">Admin: editar grupo</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input className="border rounded px-2 py-1 text-sm" defaultValue={dayDb ? (g.a?.slug || '') : (g.exerciseA || '')} id={`a-${idx}`} placeholder="slug A" />
                        <input className="border rounded px-2 py-1 text-sm" defaultValue={dayDb ? (g.b?.slug || '') : (g.exerciseB || '')} id={`b-${idx}`} placeholder="slug B (opcional)" />
                        <input type="number" min={1} className="border rounded px-2 py-1 text-sm" defaultValue={String(((g.prescription || (dayLocal ? g.prescription : '')) || '').match(/^\s*(\d+)\s*x/i)?.[1] || '')} id={`s-${idx}`} placeholder="Séries (ex.: 3)" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        <input type="number" min={1} className="border rounded px-2 py-1 text-sm" defaultValue={String(((g.prescription || (dayLocal ? g.prescription : '')) || '').match(/x\s*([\d]+)/i)?.[1] || '')} id={`rmin-${idx}`} placeholder="Reps mín (ex.: 10)" />
                        <input type="number" min={1} className="border rounded px-2 py-1 text-sm" defaultValue={String(((g.prescription || (dayLocal ? g.prescription : '')) || '').match(/[\-–]\s*([\d]+)/)?.[1] || '')} id={`rmax-${idx}`} placeholder="Reps máx (opcional, ex.: 15)" />
                      </div>
                      <div id={`err-${idx}`} className="text-xs text-red-500 mt-1"></div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary text-primary"
                          onClick={async () => {
                            const aSlug = (document.getElementById(`a-${idx}`) as HTMLInputElement)?.value || '';
                            const bSlug = (document.getElementById(`b-${idx}`) as HTMLInputElement)?.value || '';
                            const sVal = (document.getElementById(`s-${idx}`) as HTMLInputElement)?.value || '';
                            const rMinVal = (document.getElementById(`rmin-${idx}`) as HTMLInputElement)?.value || '';
                            const rMaxVal = (document.getElementById(`rmax-${idx}`) as HTMLInputElement)?.value || '';
                            const sNum = parseInt(sVal, 10);
                            const rMinNum = parseInt(rMinVal, 10);
                            const rMaxNum = parseInt(rMaxVal, 10);
                            const errors: string[] = [];
                            if (!aSlug.trim()) errors.push('Informe o slug A');
                            if (isNaN(sNum) || sNum < 1) errors.push('Séries inválidas');
                            if (isNaN(rMinNum) || rMinNum < 1) errors.push('Reps mín inválidas');
                            if (!isNaN(rMaxNum) && rMaxNum < rMinNum) errors.push('Reps máx deve ser maior ou igual às mín');
                            const errEl = document.getElementById(`err-${idx}`);
                            if (errors.length) { if (errEl) errEl.textContent = errors.join(' · '); return; }
                            if (errEl) errEl.textContent = '';
                            const repsText = isNaN(rMaxNum) ? `${isNaN(rMinNum) ? '' : rMinNum}` : `${isNaN(rMinNum) ? rMaxNum : `${rMinNum}–${rMaxNum}`}`;
                            const presc = `${isNaN(sNum) ? '' : sNum}x • ${repsText}`.trim();
                            await fetch(`/api/admin/training-days/${id}/groups/${g.id || idx}`, {
                              method: 'PATCH',
                              headers: { 'content-type': 'application/json' },
                              body: JSON.stringify({ exercise_a_slug: aSlug, exercise_b_slug: bSlug, prescription: presc })
                            });
                            try {
                              const payload = (slug: string) => ({
                                title: undefined,
                                execution_text: undefined,
                                default_series: isNaN(sNum) ? undefined : sNum,
                                default_reps: isNaN(rMinNum) ? undefined : rMinNum,
                                video_url: undefined
                              });
                              if (aSlug) {
                                await fetch(`/api/admin/exercises/${aSlug}`, {
                                  method: 'PUT',
                                  headers: { 'content-type': 'application/json' },
                                  body: JSON.stringify(payload(aSlug))
                                });
                              }
                              if (bSlug) {
                                await fetch(`/api/admin/exercises/${bSlug}`, {
                                  method: 'PUT',
                                  headers: { 'content-type': 'application/json' },
                                  body: JSON.stringify(payload(bSlug))
                                });
                              }
                            } catch {}
                            if (errEl) { errEl.className = 'text-xs text-green-500 mt-1'; errEl.textContent = 'Grupo atualizado'; }
                            location.reload();
                          }}
                        >
                          Salvar grupo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {(dayDb?.cardio || dayLocal?.cardio) && (
          <Card className={`${cardioDone ? 'bg-green-600 text-white border-none' : ''}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="font-semibold">{(dayDb?.cardio?.title || dayLocal?.cardio?.title) as string}</div>
              <div className="flex items-center gap-3">
                <div className={`text-xs font-mono rounded px-2 py-1 ${cardioDone ? 'bg-green-700 text-white' : 'bg-muted'}`}>{(dayDb?.cardio?.prescription || dayLocal?.cardio?.prescription) as string}</div>
                {cardioDone ? (
                  <div className="w-5 h-5 rounded-full border border-green-500 bg-green-200 flex items-center justify-center" title="Cardio concluído">
                    <CheckCircle className="w-4 h-4 text-green-700" />
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary"
                    onClick={() => { try { localStorage.setItem(`training_day_${id}_cardio_done`, '1'); setCardioDone(true); } catch {} }}
                  >
                    Concluir Cardio
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary"
                    onClick={async () => {
                      const title = prompt('Título do Cardio', (dayDb?.cardio?.title || dayLocal?.cardio?.title) as string) || '';
                      const prescription = prompt('Prescrição', (dayDb?.cardio?.prescription || dayLocal?.cardio?.prescription) as string) || '';
                      await fetch(`/api/admin/training-days/${id}`, {
                        method: 'PATCH',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ cardio_title: title, cardio_prescription: prescription })
                      });
                      alert('Cardio atualizado');
                      location.reload();
                    }}
                  >
                    Editar Cardio
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
