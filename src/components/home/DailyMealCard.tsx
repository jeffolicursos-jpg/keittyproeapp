import { Button } from '@/components/ui/button'
import Image from 'next/image'
import type { DailyMealItem } from '@/app/daily-meals/types'
import Link from 'next/link'

interface Props {
  item: DailyMealItem
  consumeBusyId: string | null
  swapBusyId: string | null
  swapErrorId: string | null
  swapError: string | null
  onConsume: (id: string) => Promise<void>
  onSwap: (item: DailyMealItem) => Promise<void>
}

export default function DailyMealCard({ item, consumeBusyId, swapBusyId, swapErrorId, swapError, onConsume, onSwap }: Props) {
  const label = item.meal_type === 'cafe_da_manha'
    ? 'Cafe da manha'
    : item.meal_type === 'almoco'
      ? 'Almoco'
      : item.meal_type === 'lanche_da_tarde'
        ? 'Lanche'
        : 'Jantar'
  const consumed = !!item.consumed
  const busy = consumeBusyId === item.id

  return (
    <div className="flex items-center justify-between rounded border bg-background px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden border">
          {item.recipe_image_url ? (
            <Link href={item.recipe_id ? `/recipe/${encodeURIComponent(item.recipe_id)}` : '#'} aria-label={item.recipe_name || label}>
              <Image
                src={item.recipe_image_url}
                alt={item.recipe_name || label}
                fill
                className="object-cover"
                sizes="48px"
              />
            </Link>
          ) : <div className="w-12 h-12 bg-muted" />}
        </div>
        <div>
          <div className="text-sm font-medium">
            {label} • {item.recipe_id
              ? <Link href={`/recipe/${encodeURIComponent(item.recipe_id)}`} className="underline">{item.recipe_name || 'Receita'}</Link>
              : (item.recipe_name || 'Receita')}
          </div>
          <div className="text-xs text-muted-foreground">{item.calories} kcal</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {consumed ? (
          <Button size="sm" variant="outline" className="text-muted-foreground btn-wide" disabled>✅ Consumido</Button>
        ) : (
          <>
            <Button
              size="sm"
              className="btn-wide"
              disabled={busy}
              onClick={() => onConsume(item.id)}
            >
              {busy ? 'Consumindo...' : 'Comer agora'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="btn-wide border-primary text-primary"
              disabled={!!swapBusyId || busy}
              onClick={() => onSwap(item)}
            >
              {swapBusyId === item.id ? 'Trocando...' : 'Trocar'}
            </Button>
          </>
        )}
      </div>
      {swapErrorId === item.id && swapError ? (
        <div className="text-[11px] text-red-500 mt-1">{swapError}</div>
      ) : null}
    </div>
  )
}
