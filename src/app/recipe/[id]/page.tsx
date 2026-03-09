'use client';

import { useState, useEffect } from 'react';
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
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  useEffect(() => {
    if (id) {
      const idStr = String(id);
      const load = async () => {
        let found: Recipe | null = null;
        try {
          const res = await fetch(`/api/recipes/${idStr}`, { cache: 'no-store' });
          if (res.ok) {
            const j: any = await res.json().catch(() => null);
            if (j) {
              const ingText = String(j.ingredients_text || '').trim();
              const stepsText = String(j.preparation_steps_text || '').trim();
              const portionsNum = (() => {
                const t = String(j.portions || '').trim();
                const n = parseInt(t, 10);
                return Number.isFinite(n) && n > 0 ? n : 1;
              })();
              found = Object.assign({
                name: String(j.name || 'Receita'),
                imageUrl: String(j.image_url || '/images/sweetpotato.png'),
                imageHint: 'dish photo',
                portions: portionsNum,
                temperature: String(j.temperature || 'Quente'),
                totalTime: String(j.total_time || '20 min'),
                tip: String(j.tip || j.description || ''),
                proteinGrams: typeof j.protein === 'number' ? j.protein : undefined,
                ingredients: ingText ? ingText.split('\n').map((l: string) => {
                  const line = l.trim();
                  const [quantity, ...rest] = line.split(' ');
                  return { name: rest.join(' ') || line, quantity: quantity || '' };
                }) : [],
                preparationSteps: stepsText ? stepsText.split('\n').map((l: string, idx: number) => ({ step: idx + 1, instruction: l.trim() })) : [],
                benefits: [],
                recipeNumber: 0,
                tags: [],
                status: (j.status === 'draft' || j.status === 'published') ? j.status : 'published',
              }, { id: j.id, prepMinutes: j.prep_minutes, cookMinutes: j.cook_minutes });
            }
          }
        } catch {}
        setRecipe(found);
      };
      load();
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleToggleFavorite = (recipeId: number) => {
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
      dataSource="api"
    />
  );
}
