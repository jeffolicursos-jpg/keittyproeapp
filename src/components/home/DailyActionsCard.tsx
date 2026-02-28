import { Button } from '@/components/ui/button';
import { AlarmClock, Droplet, UtensilsCrossed } from 'lucide-react';

type Props = {
  nextMealLabel?: string;
  onOpenMeals: () => void;
  trainingTitle?: string;
  onOpenTraining: () => void;
  waterGoalReached: boolean;
  onOpenWater: () => void;
};

export default function DailyActionsCard({
  nextMealLabel,
  onOpenMeals,
  trainingTitle,
  onOpenTraining,
  waterGoalReached,
  onOpenWater,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="rounded-2xl bg-[#121212] text-white border border-neutral-800 p-4">
        <div className="flex items-center gap-2 mb-2">
          <UtensilsCrossed className="w-5 h-5 text-[#FF4D2D]" />
          <div className="font-headline font-semibold">Próxima refeição</div>
        </div>
        <div className="text-sm text-neutral-300 mb-3">{nextMealLabel || 'Tudo concluído'}</div>
        <Button variant="outline" className="border-[#FF4D2D] text-[#FF4D2D] w-full" onClick={onOpenMeals}>
          Abrir refeições
        </Button>
      </div>
      <div className="rounded-2xl bg-[#121212] text-white border border-neutral-800 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlarmClock className="w-5 h-5 text-[#FF4D2D]" />
          <div className="font-headline font-semibold">Treino do dia</div>
        </div>
        <div className="text-sm text-neutral-300 mb-3">{trainingTitle || 'Treino'}</div>
        <Button variant="outline" className="border-[#FF4D2D] text-[#FF4D2D] w-full" onClick={onOpenTraining}>
          Abrir treino
        </Button>
      </div>
      <div className="rounded-2xl bg-[#121212] text-white border border-neutral-800 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Droplet className="w-5 h-5 text-[#FF4D2D]" />
          <div className="font-headline font-semibold">Água</div>
        </div>
        <div className="text-sm text-neutral-300 mb-3">
          {waterGoalReached ? 'Meta concluída' : 'Meta diária pendente'}
        </div>
        <Button variant="outline" className="border-[#FF4D2D] text-[#FF4D2D] w-full" onClick={onOpenWater}>
          Registrar água
        </Button>
      </div>
    </div>
  );
}
