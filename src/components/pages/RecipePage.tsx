import type { Recipe } from '@/app/data/types';
import IngredientsSection from '@/components/recipe/IngredientsSection';
import PreparationSteps from '@/components/recipe/PreparationSteps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, AlarmClock, ArrowLeft, Users, Clock, Heart, Home } from 'lucide-react';
import Link from 'next/link';
import RecipeTimer from '@/components/recipe/RecipeTimer';
import { Button } from '@/components/ui/button';
import type { ActiveTimer } from '@/app/page';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import Image from 'next/image';

interface RecipePageProps {
  recipe: Recipe;
  onBack: () => void;
  activeTimer: ActiveTimer | null;
  setActiveTimer: (timer: ActiveTimer | null) => void;
  onAddToShoppingList: (recipeName: string, ingredients: string[]) => void;
  onCompleteRecipe: (callback: () => void) => void;
  onToggleFavorite: (recipeId: number) => void;
  isFavorited: boolean;
}

export default function RecipePage({ recipe, onBack, activeTimer, setActiveTimer, onAddToShoppingList, onCompleteRecipe, onToggleFavorite, isFavorited }: RecipePageProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [favorited, setFavorited] = useState<boolean>(isFavorited);
  useEffect(() => setFavorited(isFavorited), [isFavorited]);
  const handleAddAllToShoppingList = () => {
    const items = recipe.ingredients.map(i => `${i.quantity} ${i.name}`.trim());
    onAddToShoppingList(recipe.name, items);
  };



  const handleFireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const parseTime = (timeStr: string): number => {
    let totalMinutes = 0;
    const hourMatches = timeStr.match(/(\d+)\s*hora/);
    if (hourMatches) totalMinutes += parseInt(hourMatches[1], 10) * 60;
    const minMatches = timeStr.match(/(\d+)\s*min/);
    if (minMatches) totalMinutes += parseInt(minMatches[1], 10);
    if (!hourMatches && !minMatches) {
      const justDigits = parseInt(timeStr.replace(/\D/g, ''), 10);
      if (!isNaN(justDigits)) totalMinutes = justDigits;
    }
    return totalMinutes;
  };
  const totalMinutes = parseTime(recipe.totalTime);
  const prepMinutes = Math.max(5, Math.round(totalMinutes * 0.66));
  const cookMinutes = Math.max(0, totalMinutes - prepMinutes);



  const PreparationCard = (
    <Card id="preparation-card">
      <CardHeader className="flex flex-row items-center gap-4">
        <ChefHat className="w-8 h-8 text-primary" />
        <CardTitle className="font-headline text-xl md:text-3xl">Modo de preparo</CardTitle>
      </CardHeader>
      <CardContent>
        <PreparationSteps 
          steps={recipe.preparationSteps} 
          ingredients={recipe.ingredients}
          setCheckedIngredients={setCheckedIngredients}
          onComplete={() => onCompleteRecipe(handleFireConfetti)}
        />
      </CardContent>
    </Card>
  );

  const TimerCard = (
    <Card id="recipe-timer-card">
      <CardHeader className="flex flex-row items-center gap-4">
        <AlarmClock className="w-8 h-8 text-primary" />
        <CardTitle className="font-headline text-xl md:text-3xl">Cronômetro</CardTitle>
      </CardHeader>
      <CardContent>
        <RecipeTimer 
          recipe={recipe} 
          activeTimer={activeTimer}
          setActiveTimer={setActiveTimer}
        />
      </CardContent>
    </Card>
  );

  const TipCard = (
    <div className="mt-16 md:mt-8 md:-translate-y-[35px] mx-auto w-full max-w-xl">
      <div className="bg-amber-100 text-[#1F2937] border border-amber-300 rounded-lg p-4 shadow-sm">
        <div className="text-center font-headline italic mb-2">Dica</div>
        <p className="text-sm md:text-base text-[#1F2937] text-center">
          Estas torradas podem receber outros toppings: ovo pochê, tomatinhos,
          homus ou uma camada de iogurte com ervas. Ótimas para um café reforçado
          ou um lanche sem glúten!
        </p>
      </div>
    </div>
  );




  return (
    <div className="container mx-auto max-w-6xl py-8 sm:py-12 px-4 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
          </Button>
          <Link href="/" className="inline-flex">
            <Button variant="ghost" className="gap-2">
              <Home className="h-4 w-4" />
              Início
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center">
          <button
            aria-label="Favorito"
            onClick={() => { onToggleFavorite(recipe.recipeNumber); setFavorited(prev => !prev); }}
            className={`mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full ring-1 ${favorited ? 'bg-primary text-primary-foreground ring-primary' : 'bg-primary/15 text-primary ring-primary/30 hover:bg-primary/25'}`}
          >
            <Heart className="w-5 h-5" />
          </button>
          <h1 className="font-headline text-3xl md:text-4xl font-bold mb-6 text-center">{recipe.name}</h1>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden space-y-8">
          {/* Imagem + painel */}
          <div className="relative">
            <div className="relative mx-auto" style={{ width: '88vw', maxWidth: 340 }}>
              <div className="absolute -inset-2 rounded-2xl bg-primary/15 backdrop-blur-md border border-primary/30 shadow-xl z-0" />
              <div className="relative rounded-xl overflow-hidden shadow-md z-10" style={{ aspectRatio: '2 / 3' }}>
                <Image
                  src={`/images/${encodeURIComponent(recipe.imageUrl.replace(/^\/images\//, ''))}`}
                  alt={recipe.name}
                  fill
                  className="relative z-10 object-cover"
                  sizes="88vw"
                  data-ai-hint={recipe.imageHint}
                  priority
                />
                <div className="absolute top-2 right-2 z-20 h-1/2 w-24 bg-amber-100 text-[#1F2937] border border-amber-300 rounded-lg p-3 shadow-sm flex flex-col justify-evenly items-center">
                  <div className="flex flex-col items-center gap-1">
                    <Clock className="w-6 h-6" />
                    <span className="text-sm font-medium">Preparo:</span>
                    <span className="text-sm">{prepMinutes} min</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <AlarmClock className="w-6 h-6" />
                    <span className="text-sm font-medium">Cozimento:</span>
                    <span className="text-sm">{cookMinutes} min</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Users className="w-6 h-6" />
                    <span className="text-sm font-medium">Porções:</span>
                    <span className="text-sm">{recipe.portions}</span>
                  </div>
                  {typeof recipe.proteinGrams === 'number' && (
                    <div className="flex flex-col items-center gap-1">
                      <Heart className="w-6 h-6" />
                      <span className="text-sm font-medium">Proteína:</span>
                      <span className="text-sm">{recipe.proteinGrams} g</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cronômetro */}
          {TimerCard}

          {/* Ingredientes */}
          <section>
            <h2 className="font-headline text-2xl mb-4">Ingredientes</h2>
            <IngredientsSection 
              ingredients={recipe.ingredients}
              checkedIngredients={checkedIngredients}
              setCheckedIngredients={setCheckedIngredients}
            />
            <div className="mt-4">
              <Button onClick={handleAddAllToShoppingList} className="w-full">Adicionar à lista de compras</Button>
            </div>
          </section>

          {/* Modo de Preparo */}
          {PreparationCard}
        </div>

        {/* Desktop layout with two rows to alinhar Cronômetro e Preparo */}
        <div className="hidden md:grid grid-cols-12 grid-rows-[auto,auto] gap-12 lg:gap-16">
          {/* Linha 1: Ingredientes (esq) + Imagem (dir) */}
          <section className="col-span-6 row-start-1">
            <h2 className="font-headline text-2xl md:text-3xl mb-4">Ingredientes</h2>
            <IngredientsSection 
              ingredients={recipe.ingredients} 
              checkedIngredients={checkedIngredients}
              setCheckedIngredients={setCheckedIngredients}
            />
            <div className="mt-4">
              <Button onClick={handleAddAllToShoppingList}>Adicionar à lista de compras</Button>
            </div>
          </section>

          <aside className="col-span-6 row-start-1">
            <div className="relative mx-auto" style={{ width: 380 }}>
              <div className="absolute -inset-3 rounded-2xl bg-primary/15 backdrop-blur-md border border-primary/30 shadow-xl z-0" />
              <div className="relative rounded-xl overflow-hidden shadow-md z-10" style={{ aspectRatio: '2 / 3' }}>
                <Image
                  src={`/images/${encodeURIComponent(recipe.imageUrl.replace(/^\/images\//, ''))}`}
                  alt={recipe.name}
                  fill
                  className="relative z-10 object-cover"
                  sizes="380px"
                  data-ai-hint={recipe.imageHint}
                  priority
                />
                <div className="absolute top-2 right-2 z-20 h-1/2 w-28 bg-amber-100 text-[#1F2937] border border-amber-300 rounded-lg p-3 shadow-sm flex flex-col justify-evenly items-center">
                  <div className="flex flex-col items-center gap-1">
                    <Clock className="w-6 h-6" />
                    <span className="text-sm font-medium">Preparo:</span>
                    <span className="text-sm">{prepMinutes} min</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <AlarmClock className="w-6 h-6" />
                    <span className="text-sm font-medium">Cozimento:</span>
                    <span className="text-sm">{cookMinutes} min</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Users className="w-6 h-6" />
                    <span className="text-sm font-medium">Porções:</span>
                    <span className="text-sm">{recipe.portions}</span>
                  </div>
                  {typeof recipe.proteinGrams === 'number' && (
                    <div className="flex flex-col items-center gap-1">
                      <Heart className="w-6 h-6" />
                      <span className="text-sm font-medium">Proteína:</span>
                      <span className="text-sm">{recipe.proteinGrams} g</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Linha 2: Modo de Preparo (esq) + Cronômetro (dir) */}
          <div className="col-span-6 row-start-2 -translate-y-[114px]">
            {PreparationCard}
          </div>
          <div className="col-span-6 row-start-2">
            <div className="mx-auto" style={{ width: 380 }}>
              {TimerCard}
            </div>
          </div>
        </div>
        {TipCard}
    </div>
  );
}
