'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Recipe } from "@/app/data/types";
import React from 'react';
import { HeartCrack } from "lucide-react";
import Image from 'next/image';

interface RecipeSelectorSheetProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    recipes: Recipe[];
    onSelectRecipe: (recipe: Recipe) => void;
}

export default function RecipeSelectorSheet({ isOpen, setIsOpen, recipes, onSelectRecipe }: RecipeSelectorSheetProps) {
    const toSafeSrc = (src: string) => `/images/${encodeURIComponent(src.replace(/^\/images\//, ''))}`
    
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="font-headline text-2xl">Adicionar Refeição</SheetTitle>
                    <SheetDescription>
                        Selecione uma das suas receitas favoritas para adicionar ao seu cardápio.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100%-80px)] pr-4 mt-4">
                    {recipes.length > 0 ? (
                         <div className="space-y-3">
                            {recipes.map(recipe => (
                                <div 
                                    key={recipe.recipeNumber}
                                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                    onClick={() => onSelectRecipe(recipe)}
                                >
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                                        <Image 
                                            src={toSafeSrc(recipe.imageUrl)}
                                            alt={recipe.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                            data-ai-hint={recipe.imageHint}
                                        />
                                    </div>
                                    <h4 className="font-semibold text-sm">{recipe.name}</h4>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <HeartCrack className="w-16 h-16 mx-auto mb-4 text-primary/30" />
                            <h3 className="font-headline text-xl">Nenhuma receita favorita</h3>
                            <p className="mt-2 text-sm">Vá para a tela &apos;Explorar&apos; e clique no coração nas receitas que você ama para adicioná-las aqui.</p>
                        </div>
                    )}
                   
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
