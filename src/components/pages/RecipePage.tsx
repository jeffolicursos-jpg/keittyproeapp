import type { Recipe } from '@/app/data/types';
import IngredientsSection from '@/components/recipe/IngredientsSection';
import PreparationSteps from '@/components/recipe/PreparationSteps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, AlarmClock, ArrowLeft, Users, Clock, Heart, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import RecipeTimer from '@/components/recipe/RecipeTimer';
import type { ActiveTimer } from '@/app/page';
import confetti from 'canvas-confetti';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

interface RecipePageProps {
  recipe: Recipe;
  onBack: () => void;
  activeTimer: ActiveTimer | null;
  setActiveTimer: (timer: ActiveTimer | null) => void;
  onAddToShoppingList: (recipeName: string, ingredients: string[]) => void;
  onCompleteRecipe: (callback: () => void) => void;
  onToggleFavorite: (recipeId: number) => void;
  isFavorited: boolean;
  dataSource?: 'api' | 'local';
}

export default function RecipePage({ recipe, onBack, activeTimer, setActiveTimer, onAddToShoppingList, onCompleteRecipe, onToggleFavorite, isFavorited, dataSource }: RecipePageProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [favorited, setFavorited] = useState<boolean>(isFavorited);
  useEffect(() => setFavorited(isFavorited), [isFavorited]);
  const router = useRouter();
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
  const prepOverride = typeof (recipe as any).prepMinutes === 'number' ? (recipe as any).prepMinutes : undefined;
  const cookOverride = typeof (recipe as any).cookMinutes === 'number' ? (recipe as any).cookMinutes : undefined;
  const prepMinutes = typeof prepOverride === 'number' ? prepOverride : Math.max(5, Math.round(totalMinutes * 0.66));
  const cookMinutes = typeof cookOverride === 'number' ? cookOverride : Math.max(0, totalMinutes - prepMinutes);



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
          {recipe.tip || 'Estas torradas podem receber outros toppings: ovo pochê, tomatinhos, homus ou uma camada de iogurte com ervas. Ótimas para um café reforçado ou um lanche sem glúten!'}
        </p>
      </div>
    </div>
  );

  const isAdmin = (() => {
    try {
      const role = (document.cookie.split('; ').find(c => c.startsWith('role=')) || '').split('=')[1] || '';
      return role === 'admin';
    } catch { return false; }
  })();

  function AdminRecipeEditor({ recipe }: { recipe: Recipe }) {
    const [name, setName] = useState(recipe.name);
    const [imageUrl, setImageUrl] = useState(recipe.imageUrl);
    const [portions, setPortions] = useState(String(recipe.portions || 1));
    const [temperature, setTemperature] = useState(recipe.temperature || 'Quente');
    const [totalTime, setTotalTime] = useState(recipe.totalTime || '20 min');
    const [ingredientsText, setIngredientsText] = useState((recipe.ingredients || []).map(i => `${i.quantity || ''} ${i.name || ''}`.trim()).join('\n'));
    const [stepsText, setStepsText] = useState((recipe.preparationSteps || []).map((s: any) => s.instruction ?? s).join('\n'));
    const [status, setStatus] = useState<string>(recipe.status || 'published');
    const { toast } = useToast();
    const [tip, setTip] = useState<string>(recipe.tip || '');
    useEffect(() => {
      setTip(recipe.tip || '');
    }, [recipe.tip]);
    const [prep, setPrep] = useState<number>(() => {
      const ov = (recipe as any).prepMinutes;
      return typeof ov === 'number' ? ov : Math.max(5, Math.round(parseTime(recipe.totalTime) * 0.66));
    });
    const [cook, setCook] = useState<number>(() => {
      const ov = (recipe as any).cookMinutes;
      if (typeof ov === 'number') return ov;
      const tm = parseTime(recipe.totalTime);
      const p = Math.max(5, Math.round(tm * 0.66));
      return Math.max(0, tm - p);
    });

    const save = async () => {
      const updated = {
        ...recipe,
        name,
        image_url: imageUrl,
        portions: String(portions || '').trim(),
        temperature,
        total_time: totalTime || `${Math.max(0, Number(prep) + Number(cook))} min`,
        prep_minutes: Number(prep),
        cook_minutes: Number(cook),
        tip,
        ingredients_text: (ingredientsText || '').split('\n').map(l => l.trim()).filter(Boolean).join('\n'),
        preparation_steps_text: (stepsText || '').split('\n').map(l => l.trim()).filter(Boolean).join('\n'),
        status,
      };
      try {
        const res = await fetch(`/api/recipes/${(recipe as any).id}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(updated),
          cache: 'no-store',
        });
        if (!res.ok) {
          toast({ title: 'Falha ao salvar', description: 'Não foi possível salvar a receita.' });
          return;
        }
      } catch {}
      setStatus(updated.status || status);
      toast({ title: 'Alterações salvas', description: 'Rascunho atualizado com sucesso.' });
    };

    const publish = async () => {
      await save();
      try {
        const res = await fetch(`/api/recipes/${(recipe as any).id}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ status: 'published' }),
          cache: 'no-store',
        });
        if (!res.ok) {
          toast({ title: 'Falha ao publicar', description: 'Não foi possível publicar a receita.' });
          return;
        }
      } catch {}
      setStatus('published');
      toast({ title: 'Receita publicada', description: 'As alterações foram publicadas e refletidas no app.' });
    };

    return (
      <div className="mx-auto w-full max-w-xl mt-8">
        <div className="border rounded-lg p-4 bg-card">
          <div className="font-headline text-lg mb-3">Editar Receita (admin)</div>
          <div className="mb-2 text-sm text-muted-foreground">Status: {status}</div>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input placeholder="Nome da receita" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>Preparo (min)</Label>
                <Input placeholder="ex.: 13" value={String(prep)} onChange={e => setPrep(parseInt(e.target.value || '0', 10) || 0)} />
              </div>
              <div className="space-y-1">
                <Label>Cozimento (min)</Label>
                <Input placeholder="ex.: 7" value={String(cook)} onChange={e => setCook(parseInt(e.target.value || '0', 10) || 0)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>URL da imagem</Label>
              <Input placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label>Porções</Label>
                <Input placeholder="1" value={portions} onChange={e => setPortions(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Temperatura</Label>
                <Input placeholder="Quente/Frio" value={temperature} onChange={e => setTemperature(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Tempo total</Label>
                <Input placeholder="ex.: 20 min ou 1 hora" value={totalTime} onChange={e => setTotalTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Ingredientes</Label>
              <Textarea rows={5} placeholder="Uma linha por item: quantidade nome" value={ingredientsText} onChange={e => setIngredientsText(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Modo de preparo</Label>
              <Textarea rows={5} placeholder="Uma etapa por linha" value={stepsText} onChange={e => setStepsText(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Dica</Label>
              <Textarea rows={3} placeholder="Texto de dica para exibir na receita" value={tip} onChange={e => setTip(e.target.value)} />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const base = {
                      ...recipe,
                      name,
                      imageUrl,
                      portions: parseInt(portions || '1', 10) || 1,
                      temperature,
                      totalTime: totalTime || `${Math.max(0, Number(prep) + Number(cook))} min`,
                      prepMinutes: Number(prep),
                      cookMinutes: Number(cook),
                      tip,
                      ingredients: (ingredientsText || '').split('\n').map(l => l.trim()).filter(Boolean).map(line => {
                        const [quantity, ...rest] = line.split(' ');
                        return { name: rest.join(' ') || line, quantity: quantity || '' };
                      }),
                      preparationSteps: (stepsText || '')
                        .split('\n')
                        .map(l => l.trim())
                        .filter(Boolean)
                        .map((instruction, idx) => ({ step: idx + 1, instruction })),
                      status: 'draft',
                    };
                    // Descobrir próximo ID pela lista pública
                    let nextId = (Number(recipe.recipeNumber) || 0) + 1;
                    try {
                      const r = await fetch('/api/receitas', { cache: 'no-store' });
                      const arr = await r.json();
                      if (Array.isArray(arr)) {
                        const max = arr.reduce((m: number, it: any) => Math.max(m, Number(it.recipe_number || 0)), 0);
                        nextId = (max || 0) + 1;
                      }
                    } catch {}
                    await fetch(`/api/recipes/${nextId}`, {
                      method: 'PUT',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({
                        ...base,
                        recipeNumber: nextId,
                      }),
                    });
                    try {
                      const raw = localStorage.getItem('recipes');
                      const arr = raw ? JSON.parse(raw) : [];
                      const next = Array.isArray(arr) ? [...arr, { ...base, recipeNumber: nextId }] : [{ ...base, recipeNumber: nextId }];
                      localStorage.setItem('recipes', JSON.stringify(next));
                      window.dispatchEvent(new CustomEvent('recipes-updated', { detail: { recipeNumber: nextId } }));
                    } catch {}
                    router.push(`/recipe/${nextId}`);
                  } catch {}
                }}
              >
                Duplicar
              </Button>
              <Button variant="outline" onClick={save}>Salvar</Button>
              <Button onClick={publish}>Publicar alterações</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto max-w-6xl py-8 sm:py-12 px-4 sm:px-6 lg:px-8 min-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
          </Button>
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => {
              try {
                const hasAccess = document.cookie.includes('access=');
                router.push(hasAccess ? '/dashboard' : '/');
              } catch {
                router.push('/');
              }
            }}
          >
            <Home className="h-4 w-4" />
            Início
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <button
            aria-label="Favorito"
            onClick={() => { onToggleFavorite(recipe.recipeNumber); setFavorited(prev => !prev); }}
            className={`mb-2 inline-flex items-center justify-center w-10 h-10 rounded-full ring-1 ${favorited ? 'bg-primary text-primary-foreground ring-primary' : 'bg-primary/15 text-primary ring-primary/30 hover:bg-primary/25'}`}
          >
            <Heart className="w-5 h-5" />
          </button>
          <h1 className="font-headline text-3xl md:text-4xl font-bold text-center">{recipe.name}</h1>
          <div className="mt-2 mb-6 flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ring-1 ${recipe.status === 'published' ? 'bg-primary/15 text-primary ring-primary/30' : 'bg-neutral-800 text-neutral-200 ring-neutral-600'}`}>
              {recipe.status === 'published' ? 'Publicado' : 'Rascunho'}
            </span>
            {dataSource === 'local' && (
              <span className="inline-flex items-center px-2 py-1 text-xs rounded-full ring-1 bg-amber-100 text-[#1F2937] ring-amber-300">
                Dados locais
              </span>
            )}
          </div>
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
          <div className="mt-3">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const kcal = typeof recipe.proteinGrams === 'number' && recipe.proteinGrams > 0 ? Math.round(recipe.proteinGrams * 25) : 450;
                  await fetch('/api/perfil/calorias/consumir', {
                    method: 'PATCH',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ calorias: kcal })
                  });
                  alert('Adicionado!');
                } catch {}
              }}
            >
              Comi esta receita ✓
            </Button>
          </div>

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
              <div className="mt-3">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const kcal = typeof recipe.proteinGrams === 'number' && recipe.proteinGrams > 0 ? Math.round(recipe.proteinGrams * 25) : 450;
                      await fetch('/api/perfil/calorias/consumir', {
                        method: 'PATCH',
                        headers: { 'content-type': 'application/json' },
                        body: JSON.stringify({ calorias: kcal })
                      });
                      alert('Adicionado!');
                    } catch {}
                  }}
                >
                  Comi esta receita ✓
                </Button>
              </div>
            </div>
          </div>
        </div>
        {TipCard}
        {isAdmin && <AdminRecipeEditor recipe={recipe} />}
    </div>
  );
}
