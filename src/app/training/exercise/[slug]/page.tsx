'use client';

import { useParams } from 'next/navigation';
import { getExercise } from '@/app/training-data';
import TrainingHeader from '@/components/training/TrainingHeader';
import ExecutionInfoCard from '@/components/training/ExecutionInfoCard';
import LoadInput, { normalizeBrToNumber } from '@/components/training/LoadInput';
import SeriesSelector from '@/components/training/SeriesSelector';
import RestTimer from '@/components/training/RestTimer';
import ActionButtons from '@/components/training/ActionButtons';
import ProgressChart from '@/components/training/ProgressChart';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function ExercisePage() {
  const params = useParams();
  const slugParam = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const slug = String(slugParam || '');
  const ex = getExercise(slug);
  const router = useRouter();

  if (!ex) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <h1 className="font-headline text-2xl md:text-3xl">Exercício não encontrado</h1>
      </div>
    );
  }

  const [loadBr, setLoadBr] = useState('80,0');
  const [activeSet, setActiveSet] = useState(1);
  const totalSets = ex.series ? parseInt(ex.series, 10) || 3 : 3;
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [restSeconds, setRestSeconds] = useState(60);
  const [showRest, setShowRest] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`load_history_${slug}`);
      const arr = raw ? JSON.parse(raw) as Array<{ date: string; kg: number }> : [];
      if (!arr.length) {
        localStorage.setItem(`load_history_${slug}`, JSON.stringify([]));
      }
    } catch {}
  }, [slug]);

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

  const handleTapSet = (idx: number) => {
    setActiveSet(idx);
  };

  const handleFinishSet = () => {
    if (!completedSets.includes(activeSet)) {
      setCompletedSets([...completedSets, activeSet]);
      saveLoadHistory();
      setShowRest(true);
    }
  };

  const goBack = () => {
    try {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.push('/training/day/1');
      }
    } catch {
      router.push('/');
    }
  };

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white pb-24">
      <TrainingHeader title={ex.title} imageUrl={undefined} videoUrl={ex.videoUrl} onBack={goBack} />
      <ExecutionInfoCard text={ex.tips.join('\n')} audioUrl={undefined} />
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
        onFinishAll={() => { setCompletedSets(Array.from({ length: totalSets }, (_, i) => i + 1)); saveLoadHistory(); }}
        onSubstitute={() => { window.location.href = '/training/day/1'; }}
        onAbandon={() => { window.location.href = '/'; }}
      />
      <ProgressChart data={chartData} />
      {showRest && (
        <RestTimer
          seconds={restSeconds}
          onFinish={() => { setShowRest(false); setActiveSet(Math.min(totalSets, activeSet + 1)); }}
        />
      )}
    </div>
  );
}
