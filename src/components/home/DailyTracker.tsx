'use client';

import { useState, useEffect } from 'react';
import { format, addDays, isSameDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, ChevronDown, Utensils } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '../ui/button';
import type { Recipe } from '@/app/data/types';

interface DailyTrackerProps {
  recentlyViewed: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}


export default function DailyTracker({ recentlyViewed, onSelectRecipe }: DailyTrackerProps) {
  const [days, setDays] = useState<{ date: Date; dayName: string; dayNumber: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const today = new Date();
    // Start week from Sunday
    const startOfWeek = addDays(today, -today.getDay());
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(startOfWeek, i);
      return {
        date: date,
        dayName: format(date, 'EEE', { locale: ptBR }),
        dayNumber: format(date, 'd'),
      };
    });
    setDays(weekDays);
    setSelectedDate(today);
  }, []);

  return (
    <Collapsible>
      <Card className="shadow-lg overflow-visible">
        <CardContent className="px-4 py-6 sm:px-4 sm:py-6 relative">
          <div className="flex items-center mb-3">
            <CalendarDays className="w-6 h-6 mr-3 text-primary" />
            <h3 className="font-headline text-lg font-semibold">Acompanhe seu dia</h3>
          </div>
          <div className="flex justify-between items-center text-center">
            {days.map(({ date, dayName, dayNumber }, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center space-y-2 cursor-default"
              >
                <span className="text-xs uppercase font-medium text-muted-foreground capitalize">{dayName.substring(0,3)}</span>
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
                    isSameDay(date, selectedDate)
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-border'
                  )}
                >
                  <span className="text-lg font-bold">{dayNumber}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-auto">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="rounded-full bg-card shadow-md">
                <span className="text-xs">Ver histórico da semana</span>
                <ChevronDown className="w-4 h-4 ml-1 transition-transform data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardContent>
      </Card>

      <CollapsibleContent>
        <div className="p-4 mt-4 bg-muted/40 rounded-lg">
           <h4 className="text-sm font-semibold mb-2 text-center">Últimas 5 refeições preparadas (simulado)</h4>
           {recentlyViewed.length > 0 ? (
             <ul className="space-y-2">
                {recentlyViewed.map((recipe, index) => {
                  const day = subDays(new Date(), index + 1);
                  return (
                    <li 
                      key={`${recipe.recipeNumber}-${index}`}
                      onClick={() => onSelectRecipe(recipe)}
                      className="text-sm text-muted-foreground flex justify-between items-center p-2 rounded-md hover:bg-card/80 cursor-pointer"
                    >
                      <div className='flex items-center gap-2'>
                        <Utensils className="w-4 h-4 text-primary/70" />
                        <span>{recipe.name}</span>
                      </div>
                      <span className='text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded'>{format(day, 'dd/MM')}</span>
                    </li>
                  )
                })}
             </ul>
           ) : (
             <p className="text-xs text-muted-foreground text-center">Nenhum histórico recente encontrado.</p>
           )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
