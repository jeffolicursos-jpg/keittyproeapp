'use client';

import { useState, useEffect } from 'react';
import { recipes } from '@/app/data';
import RecipePage from '@/components/pages/RecipePage';
import { useRouter, useParams } from 'next/navigation';
import type { Recipe } from '@/app/data/types';
import type { ActiveTimer } from '@/app/page';

export default function RecipeViewer() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'local'>('local');
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  useEffect(() => {
    if (id) {
      const idStr = String(id);
      const load = async () => {
        let foundRecipe: Recipe | null = null;
        try {
          const res = await fetch(`/api/recipes/${idStr}`, { cache: 'no-store' });
          if (res.ok) {
            const j: any = await res.json().catch(() => null);
            if (j) {
              const mapped: Recipe = {
                name: String(j.name || 'Receita'),
                imageUrl: '/images/sweetpotato.png',
                imageHint: 'dish photo',
                portions: 1,
                temperature: 'Quente',
                totalTime: '20 min',
                tip: String(j.description || ''),
                proteinGrams: typeof j.protein === 'number' ? j.protein : undefined,
                ingredients: [],
                preparationSteps: [],
                benefits: [],
                recipeNumber: 0,
                tags: ['Publicado'],
                status: 'published',
              };
              foundRecipe = mapped;
              setDataSource('api');
            }
          }
        } catch {}
        if (!foundRecipe) {
          const recipeId = parseInt(idStr, 10);
          if (!Number.isNaN(recipeId)) {
            foundRecipe = recipes.find(r => r.recipeNumber === recipeId) || null;
            try {
              const raw = localStorage.getItem('recipes');
              const arr = raw ? JSON.parse(raw) as Recipe[] : [];
              const override = arr.find(r => r.recipeNumber === recipeId);
              if (override) foundRecipe = override;
            } catch {}
            setDataSource('local');
          }
        }
        setRecipe(foundRecipe);
      };
      load();

      // Mock favorite status
      const favs = localStorage.getItem('userProfile');
      if (favs) {
        const profile = JSON.parse(favs);
        const recipeIdNum = parseInt(idStr, 10);
        if (!Number.isNaN(recipeIdNum)) {
          setIsFavorited(profile.favoritedRecipeIds?.includes(recipeIdNum));
        }
      }
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleToggleFavorite = (recipeId: number) => {
    // This is a mock implementation. In a real app, you'd update the user's profile.
    setIsFavorited(!isFavorited);
    console.log(`Toggled favorite for recipe ${recipeId}`);
  };

  const handleAddToShoppingList = (recipeName: string, ingredients: string[]) => {
    console.log(`Added to shopping list: ${recipeName}`, ingredients);
  };

  const handleCompleteRecipe = (callback: () => void) => {
    console.log('Recipe completed!');
    callback();
  };

  if (!recipe) {
    return <div>Carregando receita...</div>;
  }

  return (
    <RecipePage
      recipe={recipe}
      onBack={handleBack}
      activeTimer={activeTimer}
      setActiveTimer={setActiveTimer}
      onAddToShoppingList={handleAddToShoppingList}
      onCompleteRecipe={handleCompleteRecipe}
      onToggleFavorite={handleToggleFavorite}
      isFavorited={isFavorited}
      dataSource={dataSource}
    />
  );
}
