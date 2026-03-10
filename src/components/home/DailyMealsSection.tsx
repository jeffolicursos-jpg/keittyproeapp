import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  const order: Array<DailyMealItem['meal_type']> = ['cafe_da_manha', 'almoco', 'lanche_da_tarde', 'jantar']
  const byType: Record<string, DailyMealItem | undefined> = {}
  for (const it of items) byType[it.meal_type] = it
  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-6 h-6" />
          <h2 className="font-headline text-xl md:text-2xl font-bold">Refeições de Hoje</h2>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {order.map((mt) => {
            const m = byType[mt]
            if (m) {
              return (
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
              )
            }
            const label = mt === 'cafe_da_manha' ? 'Cafe da manha' : mt === 'almoco' ? 'Almoco' : mt === 'lanche_da_tarde' ? 'Lanche' : 'Jantar'
            return (
              <div key={mt} className="flex items-center justify-between rounded border bg-background px-3 py-2 opacity-70">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden border bg-muted" />
                  <div>
                    <div className="text-sm font-medium">{label} • Sem receita</div>
                    <div className="text-xs text-muted-foreground">— kcal</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="btn-wide" disabled>Indisponível</Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
