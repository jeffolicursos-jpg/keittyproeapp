import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlarmClock } from 'lucide-react'

interface Props {
  generateBusy: boolean
  generateError: string | null
  onGenerate: () => Promise<void>
}

export default function DailyMealsEmptyState({ generateBusy, generateError, onGenerate }: Props) {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlarmClock className="w-6 h-6 text-primary" />
          <h2 className="font-headline text-xl md:text-2xl font-bold">Refeições de Hoje</h2>
        </div>
        <div className="rounded border bg-background p-4">
          <div className="font-headline text-base mb-1">Você ainda não tem refeições geradas para hoje</div>
          <div className="text-xs text-muted-foreground mb-3">
            Gere um plano baseado na sua meta diária de calorias e veja as quatro refeições do dia.
          </div>
          {generateError && (
            <div className="text-xs text-red-500 mb-2">{generateError}</div>
          )}
          <Button
            size="sm"
            variant="outline"
            className="border-primary text-primary btn-wide"
            disabled={generateBusy}
            onClick={() => onGenerate()}
          >
            {generateBusy ? 'Gerando...' : 'Gerar refeições de hoje'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
