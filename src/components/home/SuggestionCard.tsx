'use client';

import type { Recipe } from '@/app/data/types';
import React from 'react';
import Image from 'next/image';

interface SuggestionCardProps {
    recipe: Recipe;
    onSelectRecipe: (recipe: Recipe) => void;
}

export default function SuggestionCard({ recipe, onSelectRecipe }: SuggestionCardProps) {
  const safeSrc = `/images/${encodeURIComponent(recipe.imageUrl.replace(/^\/images\//, ''))}`
  return (
    <div
      className="relative flex items-center h-28 rounded-2xl overflow-hidden cursor-pointer group bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl transition-shadow duration-300"
      onClick={() => onSelectRecipe(recipe)}
    >
      <div className="flex-1 p-4 pr-28">
        <h3 className="font-headline text-lg md:text-xl text-white break-words" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.2)'}}>
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
                    src={safeSrc}
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
