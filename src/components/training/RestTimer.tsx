import { useEffect, useState } from 'react';

type Props = {
  seconds: number;
  onFinish: () => void;
};

export default function RestTimer({ seconds, onFinish }: Props) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    let t: any = null;
    if (left > 0) {
      t = setTimeout(() => setLeft((v) => v - 1), 1000);
    } else {
      try {
        const beep = new Audio('/images/beep.mp3');
        beep.play().catch(() => {});
      } catch {}
      onFinish();
    }
    return () => { if (t) clearTimeout(t); };
  }, [left, onFinish]);

  const pct = Math.max(0, Math.min(100, Math.round(((seconds - left) / seconds) * 100)));

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-neutral-800 p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="font-headline font-semibold">Descanso</div>
        <div className="text-xl">{left}s</div>
      </div>
      <div className="h-2 rounded bg-neutral-700 overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
