'use client';

import type { UserProfile } from '@/app/gamification-data';
import type { Recipe } from '@/app/data/types';
import { Card, CardContent } from '@/components/ui/card';
import React from 'react';
import { Heart, HeartCrack } from 'lucide-react';
import Image from 'next/image';

interface FavoritesTabProps {
  profile: UserProfile;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

export default function FavoritesTab({ profile, recipes, onSelectRecipe }: FavoritesTabProps) {
  const favoritedRecipes = recipes.filter(recipe => 
    profile.favoritedRecipeIds?.includes(recipe.recipeNumber)
  );

  if (favoritedRecipes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <HeartCrack className="w-16 h-16 mx-auto mb-4 text-primary/30" />
        <h3 className="font-headline text-2xl">Nenhuma receita favorita</h3>
        <p className="mt-2 text-sm">Clique no ícone de coração nas receitas que você mais gosta para adicioná-las aqui.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {favoritedRecipes.map((recipe) => (
         <Card
            key={recipe.recipeNumber}
            className="relative group w-full h-40 rounded-lg overflow-hidden cursor-pointer shadow-lg transition-transform duration-300 ease-in-out hover:scale-105"
            onClick={() => onSelectRecipe(recipe)}
        >
            <Image
                src={`/images/${encodeURIComponent(recipe.imageUrl.replace(/^\/images\//, ''))}`}
                alt={recipe.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                data-ai-hint={recipe.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <CardContent className="absolute bottom-0 left-0 p-3 w-full">
                 <div className="bg-black/30 backdrop-blur-sm rounded-md p-2">
                    <h3 className="font-headline text-sm font-semibold text-white leading-tight" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
                        {recipe.name}
                    </h3>
                </div>
            </CardContent>
            <Heart className="absolute top-2 right-2 w-5 h-5 text-white fill-white/50 drop-shadow-lg" />
        </Card>
      ))}
    </div>
  );
}
