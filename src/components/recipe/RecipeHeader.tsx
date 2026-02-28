import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Thermometer, Clock, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface RecipeHeaderProps {
  name: string;
  imageUrl: string;
  imageHint: string;
  portions: number;
  temperature: string;
  totalTime: string;
  recipeNumber: number;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export default function RecipeHeader({ name, imageUrl, imageHint, portions, temperature, totalTime, recipeNumber, isFavorited, onToggleFavorite }: RecipeHeaderProps) {
  return (
    <header className="w-full flex flex-col items-center">
        <div id="recipe-header-card" className="relative w-full rounded-xl overflow-hidden shadow-lg shadow-primary/20">
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={`/images/${encodeURIComponent(imageUrl.replace(/^\/images\//, ''))}`}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 100vw"
              data-ai-hint={imageHint}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          <div className="absolute inset-x-0 bottom-14 md:bottom-20 z-20 px-4">
             <div className="bg-black/30 backdrop-blur-sm rounded-xl py-2 px-4">
                <h1 className="font-headline text-lg md:text-[1.75rem] font-bold text-white text-center break-words" style={{textShadow: '1px 2px 4px hsl(var(--foreground) / 0.5)'}}>
                {name}
                </h1>
            </div>
          </div>

          <Button 
                variant="ghost"
                size="icon"
                className="absolute z-20 top-4 left-4 bg-black/30 backdrop-blur-sm rounded-full w-10 h-10 hover:bg-black/50 text-white"
                onClick={onToggleFavorite}
                aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
                <Heart className={cn(
                "w-6 h-6 text-white transition-all duration-300",
                isFavorited && "fill-destructive text-destructive"
                )} />
          </Button>

          <Badge className="absolute top-4 right-4 z-20 h-16 w-16 md:h-24 md:w-24 flex flex-col items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground">
            <span className="text-[0.6rem] md:text-xs font-normal -mb-1">RECEITA</span>
            <span className="text-2xl md:text-4xl font-bold">{String(recipeNumber).padStart(2, '0')}</span>
          </Badge>
        </div>
        
        <Card className="w-[calc(100%-2rem)] -mt-12 z-10 shadow-xl relative">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="p-4 flex flex-col items-center justify-center text-center">
              <Users className="w-7 h-7 mb-2 text-muted-foreground" />
              <p className="text-[0.6rem] sm:text-xs text-muted-foreground uppercase tracking-wider">PORÇÕES</p>
              <p className="font-bold text-lg text-foreground">{portions}</p>
            </div>
            <div className="p-4 flex flex-col items-center justify-center text-center">
              <Thermometer className="w-7 h-7 mb-2 text-muted-foreground" />
              <p className="text-[0.6rem] sm:text-xs text-muted-foreground uppercase tracking-wider">TEMPERATURA</p>
              <p className="font-bold text-lg text-foreground">{temperature}</p>
            </div>
            <div className="p-4 flex flex-col items-center justify-center text-center">
              <Clock className="w-7 h-7 mb-2 text-muted-foreground" />
              <p className="text-[0.6rem] sm:text-xs text-muted-foreground uppercase tracking-wider">TEMPO TOTAL</p>
              <p className="font-bold text-lg text-foreground">{totalTime}</p>
            </div>
          </div>
        </Card>
    </header>
  );
}
