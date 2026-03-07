type SeriesSelectorProps = {
  total: number;
  activeIndex: number;
  completed: number[];
  onTap: (index: number) => void;
};

export default function SeriesSelector({ total, activeIndex, completed, onTap }: SeriesSelectorProps) {
  return (
    <div className="mx-4 mt-4">
      <div className="text-neutral-300 mb-2">Série</div>
      <div className="flex items-center gap-3">
        {Array.from({ length: total }, (_, i) => i + 1).map((idx) => {
          const isActive = idx === activeIndex;
          const isDone = completed.includes(idx);
          const base = "w-14 h-14 rounded-lg flex items-center justify-center text-white font-semibold";
          const style = isDone
            ? "bg-primary"
            : isActive
              ? "border-2 border-primary"
              : "border border-neutral-700";
          return (
            <button
              key={idx}
              onClick={() => onTap(idx)}
              className={`${base} ${style}`}
              aria-label={`Série ${idx}`}
            >
              {idx}°
            </button>
          );
        })}
      </div>
    </div>
  );
}
