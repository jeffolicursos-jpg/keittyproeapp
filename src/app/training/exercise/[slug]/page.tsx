'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { getExercise, getTrainingDay } from '@/app/training-data';
import TrainingHeader from '@/components/training/TrainingHeader';
import ExecutionInfoCard from '@/components/training/ExecutionInfoCard';
import LoadInput, { normalizeBrToNumber } from '@/components/training/LoadInput';
import SeriesSelector from '@/components/training/SeriesSelector';
import RestTimer from '@/components/training/RestTimer';
import ActionButtons from '@/components/training/ActionButtons';
import ProgressChart from '@/components/training/ProgressChart';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function ExercisePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const slug = String(slugParam || '');
  const slugNorm = slug.toLowerCase();
  const ex = getExercise(slug);
  const router = useRouter();
  const notFound = !ex;

  const normalizeEmbed = (url: string | undefined | null) => {
    const u = (url || '').trim();
    if (!u) return '';
    const vimeoMatch = u.match(/vimeo\.com\/(\d+)/i);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    const ytWatch = u.match(/youtube\.com\/watch\?v=([^&]+)/i);
    if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}`;
    const youtuBe = u.match(/youtu\.be\/([A-Za-z0-9_-]+)/i);
    if (youtuBe) return `https://www.youtube.com/embed/${youtuBe[1]}`;
    return u;
  };

  const [loadBr, setLoadBr] = useState('80,0');
  const [activeSet, setActiveSet] = useState(1);
  const totalSets = ex?.series ? (parseInt(ex.series, 10) || 3) : 3;
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [restSeconds, setRestSeconds] = useState(60);
  const [showRest, setShowRest] = useState(false);
  const [videoUrlOverride, setVideoUrlOverride] = useState<string>(normalizeEmbed(ex?.videoUrl));
  const [didNavigate, setDidNavigate] = useState(false);
  const dayId = (() => {
    const v = searchParams.get('day');
    const n = v !== null ? parseInt(String(v), 10) : 1;
    return Number.isNaN(n) ? 1 : n;
  })();
  const groupIndex = (() => {
    const v = searchParams.get('group');
    if (v === null) return -1;
    const n = parseInt(String(v), 10);
    return Number.isNaN(n) ? -1 : n;
  })();
  const autoNext = (searchParams.get('autoNext') || '').toLowerCase() === '1' || (searchParams.get('autoNext') || '').toLowerCase() === 'true';
  const dateKey = new Date().toISOString().slice(0, 10);
  const exKey = `${dayId}-${groupIndex}-${slugNorm}`;
  const [doneToday, setDoneToday] = useState<boolean>(false);
  const [statusToday, setStatusToday] = useState<'completed' | 'abandoned' | null>(null);
  const [dayDb, setDayDb] = useState<any | null>(null);
  const setExerciseStatus = (status: 'completed' | 'abandoned') => {
    try {
      const raw = localStorage.getItem('exercise_status');
      const obj = raw ? JSON.parse(raw) as Record<string, Record<string, string>> : {};
      const dayLog = obj[dateKey] || {};
      dayLog[exKey] = status;
      obj[dateKey] = dayLog;
      localStorage.setItem('exercise_status', JSON.stringify(obj));
    } catch {}
  };
  const checkAllDoneAndAdvanceLesson = () => {
    try {
      const rawDays = localStorage.getItem('trainingDays');
      const arr = rawDays ? JSON.parse(rawDays) as Array<{ id: number; title: string }> : [];
      const day = getTrainingDay(dayId);
      const groups = day?.groups || [];
      const statusRaw = localStorage.getItem('exercise_status');
      const statusObj = statusRaw ? JSON.parse(statusRaw) as Record<string, Record<string, string>> : {};
      const dayLog = statusObj[dateKey] || {};
      const allCompleted = groups.every((g, idx) => {
        const sKeyA = `${dayId}-${idx}-${g.exerciseA}`;
        return dayLog[sKeyA] === 'completed';
      });
      if (allCompleted) {
        const curLessonRaw = localStorage.getItem('current_lesson_number');
        const curLesson = curLessonRaw ? parseInt(curLessonRaw, 10) : null;
        if (curLesson) {
          const completedMap = JSON.parse(localStorage.getItem('lesson_completed') || '{}');
          completedMap[curLesson] = true;
          localStorage.setItem('lesson_completed', JSON.stringify(completedMap));
          const nextLesson = curLesson + 1;
          localStorage.setItem('current_lesson_number', String(nextLesson));
          const idx = (nextLesson - 1) % (arr.length || 1);
          const nextDayId = arr.length ? arr[idx].id : 1;
          localStorage.setItem('current_lesson_day_id', String(nextDayId));
        }
      }
    } catch {}
  };
  const markGroupDone = () => {
    try {
      if (groupIndex >= 0) localStorage.setItem(`training_day_${dayId}_group_${groupIndex}_done`, '1');
      setExerciseStatus('completed');
      setDoneToday(true);
      // Também registra em exercise_done_log para referência na tela do dia
      try {
        const raw = localStorage.getItem('exercise_done_log');
        const obj = raw ? JSON.parse(raw) as Record<string, Record<string, boolean>> : {};
        const dayLog = obj[dateKey] || {};
        dayLog[exKey] = true;
        obj[dateKey] = dayLog;
        localStorage.setItem('exercise_done_log', JSON.stringify(obj));
      } catch {}
      checkAllDoneAndAdvanceLesson();
    } catch {}
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`load_history_${slug}`);
      const arr = raw ? JSON.parse(raw) as Array<{ date: string; kg: number }> : [];
      if (!arr.length) {
        localStorage.setItem(`load_history_${slug}`, JSON.stringify([]));
      }
    } catch {}
  }, [slug]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/admin/exercises/${slug}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.video_url) setVideoUrlOverride(normalizeEmbed(data.video_url));
        }
      } catch {}
    })();
  }, [slug]);
  useEffect(() => {
    try {
      const logRaw = localStorage.getItem('exercise_done_log');
      const log = logRaw ? JSON.parse(logRaw) as Record<string, Record<string, boolean>> : {};
      const dayLog = log[dateKey] || {};
      setDoneToday(!!dayLog[exKey]);
      const statusRaw = localStorage.getItem('exercise_status');
      const statusObj = statusRaw ? JSON.parse(statusRaw) as Record<string, Record<string, string>> : {};
      const sDayLog = statusObj[dateKey] || {};
      const s = sDayLog[exKey] as ('completed'|'abandoned') | undefined;
      setStatusToday(s || null);
    } catch { setDoneToday(false); }
  }, [dateKey, exKey]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/training/days/${dayId}`, { cache: 'no-store' });
        if (r.ok) {
          const ct = r.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await r.json().catch(() => null);
            if (j) setDayDb(j);
          }
        }
      } catch {}
    })();
  }, [dayId]);

  const nextSlug = (() => {
    const nIdx = groupIndex + 1;
    if (nIdx < 0) return '';
    // Prefer DB if available
    const groupsDb = dayDb?.groups || [];
    if (groupsDb.length) {
      const g = groupsDb[nIdx];
      if (!g) return '';
      const s = (g.a?.slug || g.b?.slug || '');
      return s || '';
    }
    const dayLocal = getTrainingDay(dayId);
    const groupsLocal = dayLocal?.groups || [];
    const gLocal = groupsLocal[nIdx];
    if (!gLocal) return '';
    const sLocal = gLocal.exerciseA || gLocal.exerciseB || '';
    return sLocal || '';
  })();

  const chartData = useMemo(() => {
    try {
      const raw = localStorage.getItem(`load_history_${slug}`);
      const arr = raw ? JSON.parse(raw) as Array<{ date: string; kg: number }> : [];
      return arr.slice(-12);
    } catch { return []; }
  }, [slug, completedSets]);

  const saveLoadHistory = () => {
    try {
      const n = normalizeBrToNumber(loadBr);
      const raw = localStorage.getItem(`load_history_${slug}`);
      const arr = raw ? JSON.parse(raw) as Array<{ date: string; kg: number }> : [];
      const entry = { date: new Date().toISOString().slice(0, 10), kg: n };
      localStorage.setItem(`load_history_${slug}`, JSON.stringify([...arr, entry].slice(-100)));
    } catch {}
  };
  const awardTrainingPoints = (n: number) => {
    try {
      const monthKey = new Date().toISOString().slice(0, 7);
      const yearKey = new Date().getFullYear().toString();
      const profileRaw = localStorage.getItem('userProfile');
      const profile = profileRaw ? JSON.parse(profileRaw) as { name?: string } : {};
      const name = profile?.name || 'Usuário';
      const lbRaw = localStorage.getItem(`leaderboard_${monthKey}`);
      const lb = lbRaw ? JSON.parse(lbRaw) as Record<string, number> : {};
      lb[name] = (lb[name] || 0) + n;
      localStorage.setItem(`leaderboard_${monthKey}`, JSON.stringify(lb));
      const lbyRaw = localStorage.getItem(`leaderboard_year_${yearKey}`);
      const lby = lbyRaw ? JSON.parse(lbyRaw) as Record<string, number> : {};
      lby[name] = (lby[name] || 0) + n;
      localStorage.setItem(`leaderboard_year_${yearKey}`, JSON.stringify(lby));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('progress-updated'));
      }
    } catch {}
  };

  const handleTapSet = (idx: number) => {
    setActiveSet(idx);
  };

  const handleFinishSet = () => {
    if (doneToday) return;
    if (!completedSets.includes(activeSet)) {
      setCompletedSets([...completedSets, activeSet]);
      saveLoadHistory();
      awardTrainingPoints(1);
      setShowRest(true);
    }
  };

  useEffect(() => {
    if (!didNavigate && completedSets.length >= totalSets) {
      markGroupDone();
      if (autoNext && nextSlug) {
        setDidNavigate(true);
        router.push(`/training/exercise/${nextSlug}?day=${dayId}&group=${groupIndex + 1}&choice=a&autoNext=1`);
      } else {
        setDidNavigate(true);
        router.push(`/training/day/${dayId}`);
      }
    }
  }, [completedSets, totalSets, autoNext, nextSlug, didNavigate, router, dayId, groupIndex]);

  const goBack = () => {
    router.push(`/training/day/${dayId}`);
  };

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white pb-24">
      <TrainingHeader title={ex?.title || 'Exercício'} imageUrl={undefined} videoUrl={videoUrlOverride || ex?.videoUrl} onBack={goBack} />
      {notFound && (
        <div className="container mx-auto max-w-3xl py-8 px-4">
          <h1 className="font-headline text-2xl md:text-3xl">Exercício não encontrado</h1>
        </div>
      )}
      {statusToday === 'completed' && (
        <div className="mx-4 mt-3 rounded-lg border border-green-600 bg-green-100 text-green-800 px-4 py-2 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Exercício concluído hoje
        </div>
      )}
      {statusToday === 'abandoned' && (
        <div className="mx-4 mt-3 rounded-lg border border-orange-600 bg-orange-100 text-orange-800 px-4 py-2 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Exercício abandonado hoje
        </div>
      )}
      <ExecutionInfoCard text={(ex?.tips || []).join('\n')} audioUrl={undefined} />
      <div className="mx-4 mt-6 text-neutral-300">Carga</div>
      <LoadInput value={loadBr} onChange={setLoadBr} editable />
      <div className="mx-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-neutral-700 bg-[#121212] text-white px-5 py-4">
            10 repetições
          </div>
          <div className="rounded-xl border border-neutral-700 bg-[#121212] text-white px-5 py-4">
            {totalSets} séries
          </div>
        </div>
      </div>
      <SeriesSelector total={totalSets} activeIndex={activeSet} completed={completedSets} onTap={handleTapSet} />
      <ActionButtons
        onFinishSet={handleFinishSet}
        onFinishAll={() => {
          if (doneToday) return;
          setCompletedSets(Array.from({ length: totalSets }, (_, i) => i + 1));
          saveLoadHistory();
          markGroupDone();
          const remaining = Math.max(0, totalSets - completedSets.length);
          if (remaining > 0) awardTrainingPoints(remaining);
          if (!didNavigate) {
            if (autoNext && nextSlug) {
              setDidNavigate(true);
              router.push(`/training/exercise/${nextSlug}?day=${dayId}&group=${groupIndex + 1}&choice=a&autoNext=1`);
            } else {
              setDidNavigate(true);
              router.push(`/training/day/${dayId}`);
            }
          }
        }}
        onSubstitute={() => { window.location.href = '/training/day/1'; }}
        onAbandon={() => {
          setExerciseStatus('abandoned');
          if (nextSlug) {
            router.push(`/training/exercise/${nextSlug}?day=${dayId}&group=${groupIndex + 1}&choice=a&autoNext=1`);
          } else {
            router.push(`/training/day/${dayId}`);
          }
        }}
      />
      {(() => {
        try {
          const role = (document.cookie.split('; ').find(c => c.startsWith('role=')) || '').split('=')[1] || '';
          if (role !== 'admin') return null;
        } catch { return null; }
        return (
          <div className="mx-4 mt-8 bg-[#121212] border border-neutral-700 rounded-xl p-4">
            <div className="text-sm mb-2">Admin: vídeo do exercício</div>
            <div className="flex items-center gap-2">
              <Input placeholder="https://..." defaultValue={ex?.videoUrl || ''} id="videoUrlInput" />
              <Button
                onClick={async () => {
                  const url = (document.getElementById('videoUrlInput') as HTMLInputElement)?.value || '';
                  await fetch(`/api/admin/exercises/${slug}`, {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ video_url: url, title: ex?.title || '' })
                  });
                  setVideoUrlOverride(normalizeEmbed(url));
                  alert('Link atualizado');
                }}
              >
                Salvar Link
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input type="file" accept="video/*" id="videoFileInput" />
              <Button
                variant="outline"
                onClick={async () => {
                  const input = document.getElementById('videoFileInput') as HTMLInputElement;
                  const file = input?.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append('file', file);
                  fd.append('slug', slug);
                  const res = await fetch('/api/admin/exercise/video', { method: 'POST', body: fd });
                  if (res.ok) alert('Vídeo enviado');
                }}
              >
                Enviar Vídeo
              </Button>
              <div className="text-xs text-neutral-400">Sugestão: usar link (YouTube/Vimeo) para melhor desempenho.</div>
            </div>
          </div>
        );
      })()}
      <ProgressChart data={chartData} />
      {showRest && (
        <RestTimer
          seconds={restSeconds}
          onFinish={() => {
            setShowRest(false);
            const nextSet = Math.min(totalSets, activeSet + 1);
            setActiveSet(nextSet);
          }}
        />
      )}
    </div>
  );
}
