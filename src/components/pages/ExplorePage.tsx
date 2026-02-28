'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Recipe } from '@/app/data/types';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import React from 'react';
import Image from 'next/image';
import { Search, Filter, SortAsc } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SortOption = 'newest' | 'oldest' | 'alphabetical';

interface ExplorePageProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onGenerateRecipe?: () => void;
  isGenerating: boolean;
  initialSearchTerm?: string;
  setInitialSearchTerm: (term: string) => void;
}

const toSafeSrc = (src: string) => `/images/${encodeURIComponent(src.replace(/^\/images\//, ''))}`

export default function ExplorePage({ recipes, onSelectRecipe, isGenerating, initialSearchTerm, setInitialSearchTerm }: ExplorePageProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
  const [selectedTag, setSelectedTag] = useState('Todos');
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
      // Clear the initial search term so it doesn't persist on subsequent visits
      setInitialSearchTerm('');
    }
  }, [initialSearchTerm, setInitialSearchTerm]);

  const allTags = ['Todos', ...Array.from(new Set(recipes.flatMap(recipe => recipe.tags)))];

  const filteredAndSortedRecipes = useMemo(() => {
    const filtered = recipes.filter((recipe) => {
      // Tag filter
      const tagMatch = selectedTag === 'Todos' || recipe.tags.includes(selectedTag);
      if (!tagMatch) return false;

      // Search term filter
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const nameMatch = recipe.name.toLowerCase().includes(term);
      const ingredientMatch = recipe.ingredients.some((ing) =>
        ing.name.toLowerCase().includes(term)
      );
      const tagKeywordMatch = recipe.tags.some(tag => tag.toLowerCase().includes(term));
      const numberMatch = recipe.recipeNumber.toString().includes(term);
      return nameMatch || ingredientMatch || tagKeywordMatch || numberMatch;
    });

    // Sorting logic
    switch (sortOrder) {
      case 'oldest':
        return filtered.sort((a, b) => a.recipeNumber - b.recipeNumber);
      case 'alphabetical':
        return filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      case 'newest':
      default:
        return filtered.sort((a, b) => b.recipeNumber - a.recipeNumber);
    }
  }, [recipes, selectedTag, searchTerm, sortOrder]);


  return (
    <div className="container mx-auto max-w-7xl py-8 sm:py-12 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome, ingrediente ou número..."
            className="w-full pl-10 text-base py-6 rounded-lg shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-[140px] sm:w-[180px] rounded-full">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        {allTags.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                 <div className="flex items-center gap-2">
                    <SortAsc className="w-5 h-5 text-muted-foreground" />
                    <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOption)}>
                    <SelectTrigger className="w-[140px] sm:w-[180px] rounded-full">
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Mais Recentes</SelectItem>
                        <SelectItem value="oldest">Mais Antigas</SelectItem>
                        <SelectItem value="alphabetical">Ordem Alfabética (A-Z)</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {filteredAndSortedRecipes.map((recipe) => (
          <Card
            key={recipe.recipeNumber}
            className="group relative w-full h-56 rounded-lg overflow-hidden cursor-pointer shadow-lg transition-transform duration-300 ease-in-out hover:scale-105"
            onClick={() => onSelectRecipe(recipe)}
          >
            <Image
                src={toSafeSrc(recipe.imageUrl)}
                alt={recipe.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                data-ai-hint={recipe.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-3">
              <h3 className="font-headline text-base font-medium text-white leading-tight" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>
                {recipe.name}
              </h3>
            </div>
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                 style={{ maskImage: 'radial-gradient(ellipse 100% 50% at 50% 50%, black 10%, transparent 60%)' }} />
          </Card>
        ))}
      </div>
      {filteredAndSortedRecipes.length === 0 && !isGenerating && (
         <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">Nenhuma receita encontrada para os filtros selecionados.</p>
         </div>
      )}
    </div>
  );
}
