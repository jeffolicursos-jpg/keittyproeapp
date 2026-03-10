import { Card, CardContent } from '@/components/ui/card'
import DailyMealCard from './DailyMealCard'
import type { DailyMealItem } from '@/app/daily-meals/types'

interface Props {
  items: DailyMealItem[]
  consumeBusyId: string | null
  swapBusyId: string | null
  swapErrorId: string | null
  swapError: string | null
  onConsume: (id: string) => Promise<void>
  onSwap: (item: DailyMealItem) => Promise<void>
}

export default function DailyMealsSection({ items, consumeBusyId, swapBusyId, swapErrorId, swapError, onConsume, onSwap }: Props) {
  if (!items.length) return null
  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6" />
          <h2 className="font-headline text-xl md:text-2xl font-bold">Refeições de Hoje</h2>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {items.map((m) => (
            <DailyMealCard
              key={m.id}
              item={m}
              consumeBusyId={consumeBusyId}
              swapBusyId={swapBusyId}
              swapErrorId={swapErrorId}
              swapError={swapError}
              onConsume={onConsume}
              onSwap={onSwap}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
