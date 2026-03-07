'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ExplorePage from '@/components/pages/ExplorePage';
import type { Recipe } from '@/app/data/types';

export default function RecipeExplore() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Tenta a rota nova paginada
        let rows: any[] | null = null;
        try {
          const r1 = await fetch('/api/recipes?limit=500&offset=0', { cache: 'no-store' });
          const j1 = await r1.json();
          if (Array.isArray(j1?.items)) rows = j1.items;
        } catch {}
        // Fallback para rota compatível antiga (array simples)
        if (!rows) {
          const r2 = await fetch('/api/receitas', { cache: 'no-store' });
          const j2 = await r2.json();
          if (Array.isArray(j2)) rows = j2;
        }
        if (!rows) rows = [];
        const mapped: Recipe[] = rows.map((it: any) => ({
          recipeNumber: Number(it.recipe_number ?? it.recipeNumber ?? 0),
          name: String(it.name || ''),
          imageUrl: String(it.image_url ?? it.imageUrl ?? '/images/sweetpotato.png'),
          imageHint: String(it.image_hint ?? it.imageHint ?? 'dish photo'),
          portions: Number(it.portions ?? 1),
          temperature: String(it.temperature ?? 'Quente'),
          totalTime: String(it.total_time ?? it.totalTime ?? '20 min'),
          tip: it.tip ?? '',
          proteinGrams: typeof it.protein_grams === 'number' ? it.protein_grams : it.proteinGrams ?? undefined,
          ingredients: Array.isArray(it.ingredients) ? it.ingredients : [],
          preparationSteps: Array.isArray(it.preparationSteps) ? it.preparationSteps : [],
          benefits: Array.isArray(it.benefits) ? it.benefits : [],
          tags: Array.isArray(it.tags) ? it.tags : [],
          status: (it.status === 'draft' || it.status === 'published') ? it.status : 'published',
        }));
        setRecipes(mapped);
      } catch {
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSelect = (r: Recipe) => {
    if (r?.recipeNumber) router.push(`/recipe/${r.recipeNumber}`);
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4">
      <ExplorePage
        recipes={recipes}
        onSelectRecipe={handleSelect}
        onGenerateRecipe={undefined}
        isGenerating={false}
        initialSearchTerm={initialSearchTerm}
        setInitialSearchTerm={setInitialSearchTerm}
      />
    </div>
  );
}

