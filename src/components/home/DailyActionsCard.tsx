import { Button } from '@/components/ui/button';
import { AlarmClock, UtensilsCrossed, Droplet } from 'lucide-react';

type Props = {
  nextMealLabel?: string;
  onOpenMeals: () => void;
  trainingTitle?: string;
  onOpenTraining: () => void;
  onOpenTrainingPhoto: () => void;
  waterGoalReached: boolean;
  onOpenWater: () => void;
};

export default function DailyActionsCard({
  nextMealLabel,
  onOpenMeals,
  trainingTitle,
  onOpenTraining,
  onOpenTrainingPhoto,
  waterGoalReached,
  onOpenWater,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="rounded-2xl bg-[#121212] text-white border border-neutral-800 p-4">
        <div className="flex items-center gap-2 mb-2">
          <UtensilsCrossed className="w-5 h-5 text-primary" />
          <div className="font-headline font-semibold">Próxima refeição</div>
        </div>
        <div className="text-sm text-neutral-300 mb-3">{nextMealLabel || 'Tudo concluído'}</div>
        <Button variant="outline" className="border-primary text-primary w-full" onClick={onOpenMeals}>
          Abrir refeições
        </Button>
      </div>
      <div className="rounded-2xl bg-[#121212] text-white border border-neutral-800 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlarmClock className="w-5 h-5 text-primary" />
          <div className="font-headline font-semibold">Treino do dia</div>
        </div>
        <div className="text-sm text-neutral-300 mb-3">{trainingTitle || 'Treino'}</div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="border-primary text-primary w-full" onClick={onOpenTraining}>
            Abrir treino
          </Button>
          <Button variant="outline" className="border-primary text-primary w-full" onClick={onOpenTrainingPhoto}>
            Registrar foto
          </Button>
        </div>
      </div>
      <div className="rounded-2xl bg-[#121212] text-white border border-neutral-800 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Droplet className="w-5 h-5 text-primary" />
          <div className="font-headline font-semibold">Água</div>
        </div>
        <div className="text-sm text-neutral-300 mb-3">
          {waterGoalReached ? 'Meta concluída' : 'Meta diária pendente'}
        </div>
        <Button variant="outline" className="border-primary text-primary w-full" onClick={onOpenWater}>
          Registrar água
        </Button>
      </div>
    </div>
  );
}
