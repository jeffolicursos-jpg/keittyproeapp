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
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  useEffect(() => {
    if (id) {
      const recipeId = parseInt(id as string, 10);
      const foundRecipe = recipes.find(r => r.recipeNumber === recipeId);
      setRecipe(foundRecipe || null);

      // Mock favorite status
      const favs = localStorage.getItem('userProfile');
      if (favs) {
        const profile = JSON.parse(favs);
        setIsFavorited(profile.favoritedRecipeIds?.includes(recipeId));
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
    />
  );
}
