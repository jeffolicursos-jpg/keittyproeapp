'use client';

import type { Recipe } from '@/app/data/types';
import React from 'react';
import type { LucideProps } from 'lucide-react';
import Image from 'next/image';

interface TodaysMenuCardProps {
    recipe: Recipe;
    onSelectRecipe: (recipe: Recipe) => void;
    mealType: 'Almoço' | 'Jantar';
    icon: React.ComponentType<LucideProps>;
}

export default function TodaysMenuCard({ recipe, onSelectRecipe, mealType, icon: Icon }: TodaysMenuCardProps) {
  const toSafeSrc = (src: string) => `/images/${encodeURIComponent(src.replace(/^\/images\//, ''))}`
  return (
    <div
      className="relative flex items-center h-28 rounded-2xl overflow-hidden cursor-pointer group bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl transition-shadow duration-300"
      onClick={() => onSelectRecipe(recipe)}
    >
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold">
            <Icon className="w-3.5 h-3.5" />
            <span>{mealType}</span>
        </div>

      <div className="flex-1 p-4 pr-28">
        <h3 className="font-headline text-lg md:text-xl text-white break-words pt-4" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.2)'}}>
          {recipe.name}
        </h3>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-32 h-full transform translate-x-4">
         <div className="relative w-full h-full">
            <div
                className="absolute inset-0 w-32 h-32 rounded-full overflow-hidden border-4 border-white/50 shadow-md my-auto"
                style={{
                    clipPath: 'circle(50% at 50% 50%)',
                    transform: 'translateY(calc(50% - 64px))'
                }}
            >
                <Image
                    src={toSafeSrc(recipe.imageUrl)}
                    alt={recipe.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="128px"
                    data-ai-hint={recipe.imageHint}
                />
            </div>
         </div>
      </div>
    </div>
  );
}
