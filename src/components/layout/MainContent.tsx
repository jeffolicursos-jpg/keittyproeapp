'use client';

import { useState, useEffect, useMemo } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import TopBar from '@/components/layout/TopBar';
import RecipePage from '@/components/pages/RecipePage';
import ExplorePage from '@/components/pages/ExplorePage';
import HomePage from '@/components/pages/HomePage';
import type { Recipe } from '@/app/data/types';
import { recipes as initialRecipes } from '@/app/data';
import { useToast } from '@/hooks/use-toast';
import ProfilePage from '@/components/pages/ProfilePage';
import type { UserProfile } from '@/app/gamification-data';
import type { ActiveTimer } from '@/app/page';

interface MainContentProps {
  recipes: Recipe[];
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  isGenerating: boolean;
  handleGenerateRecipe: () => void;
  handleAddRecipe: (recipe: Recipe) => void;
  handleCheckin: (day: number, meal: string, type: 'camera' | 'gallery' | 'none', imageDataUrl?: string) => Promise<void>;
  handleHabit: (action: 'training' | 'diet' | 'water' | 'habit', type: 'camera' | 'gallery' | 'none', imageDataUrl?: string, ml?: number) => Promise<void>;
  handleToggleFavorite: (recipeId: number) => void;
  handleCompleteRecipe: (recipeId: number, callback: () => void) => void;
  handleAddToShoppingList: (recipeName: string, ingredients: string[]) => void;
  setTheme: (theme: string, isDarkMode: boolean) => void;
  handleResetOnboarding: () => void;
}

export default function MainContent({
  recipes,
  userProfile,
  setUserProfile,
  isGenerating,
  handleGenerateRecipe,
  handleAddRecipe,
  handleCheckin,
  handleHabit,
  handleToggleFavorite,
  handleCompleteRecipe,
  handleAddToShoppingList,
  setTheme,
  handleResetOnboarding,
}: MainContentProps) {
  const [activePage, setActivePage] = useState('inicio');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(recipes.filter(r => r.status === 'published')[0]);
  const [recentlyViewed, setRecentlyViewed] = useState<Recipe[]>([]);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [exploreSearchTerm, setExploreSearchTerm] = useState('');

  const { toast } = useToast();
  const addNotification = (title: string, description: string, type: 'timer' | 'favorite' | 'achievement' = 'timer') => {
    try {
      const raw = localStorage.getItem('notifications');
      const arr = raw ? JSON.parse(raw) : [];
      const entry = { id: Date.now(), type, title, description, timestamp: new Date().toISOString() };
      localStorage.setItem('notifications', JSON.stringify([entry, ...arr].slice(0, 50)));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {}
  };
  
  const publishedRecipes = useMemo(() => {
    const list = recipes.filter(r => r.status === 'published')
    return list
  }, [recipes]);

  const dailySuggestion = useMemo(() => {
    if (publishedRecipes.length === 0) return initialRecipes[0]; // Fallback
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return publishedRecipes[dayOfYear % publishedRecipes.length];
  }, [publishedRecipes]);


  //


  useEffect(() => {
    if (publishedRecipes.length === 0) {
      setRecentlyViewed([])
      return
    }
    const first = publishedRecipes[0]
    const count = 5
    const dup = Array.from({ length: count }, () => first)
    setRecentlyViewed(dup)
  }, [publishedRecipes]);
  
  // This is a temporary effect to make the tour guide work.
  // It listens for a custom event dispatched by the tour guide.
  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const page = customEvent.detail.page;
      const recipeId = customEvent.detail.recipeId;

      if (page) {
        setActivePage(page);
      }
      if (recipeId) {
        const recipe = recipes.find(r => r.recipeNumber === recipeId);
        if (recipe) {
          handleSelectRecipe(recipe);
        }
      }
    };

    window.addEventListener('tour-navigate', handleNavigate);

    return () => {
      window.removeEventListener('tour-navigate', handleNavigate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipes]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTimer && activeTimer.isActive && activeTimer.timeLeft > 0) {
      interval = setInterval(() => {
        setActiveTimer(prev => {
          if (!prev) return null;
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else if (activeTimer && activeTimer.isActive && activeTimer.timeLeft === 0) {
      if (userProfile.notifyTimer !== false) {
        toast({
          title: "⏰ Tempo esgotado!",
          description: `O timer para "${activeTimer.recipe.name}" terminou.`,
        });
        addNotification("⏰ Tempo esgotado!", `O timer para "${activeTimer.recipe.name}" terminou.`, 'timer');
        try {
          const beep = new Audio('/images/beep.mp3');
          beep.play().catch(() => {});
        } catch {}
      }
      setActiveTimer(prev => prev ? { ...prev, isActive: false, timeLeft: prev.initialTime } : null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer, toast]);

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setActivePage('detalhe-receita');
    setRecentlyViewed(prev => {
      const newRecentlyViewed = [recipe, ...prev.filter(r => r.recipeNumber !== recipe.recipeNumber)];
      return newRecentlyViewed.slice(0, 10);
    });
  };

  

  const handleGoHome = () => {
    setActivePage('inicio');
  }

  const renderContent = () => {
    switch (activePage) {
      case 'inicio':
        return (
          <HomePage
            userProfile={userProfile}
            onSelectRecipe={handleSelectRecipe}
            suggestion={dailySuggestion}
            recentlyViewed={recentlyViewed}
            onNavigateToProfile={() => setActivePage('perfil')}
            activeTimer={activeTimer}
            availableRecipes={publishedRecipes}
            onAddRecipe={handleAddRecipe}
            onCheckin={handleCheckin}
            onHabit={handleHabit}
          />
        );
      case 'explorar':
        return <ExplorePage 
                  recipes={publishedRecipes} 
                  onSelectRecipe={handleSelectRecipe}
                  onGenerateRecipe={handleGenerateRecipe}
                  isGenerating={isGenerating}
                  initialSearchTerm={exploreSearchTerm}
                  setInitialSearchTerm={setExploreSearchTerm}
                />;
      //
      case 'perfil':
        return (
          <ProfilePage 
            profile={userProfile} 
            setProfile={setUserProfile} 
            setTheme={setTheme} 
            recipes={publishedRecipes}
            onSelectRecipe={handleSelectRecipe}
            onResetOnboarding={handleResetOnboarding}
          />
        );
      
      case 'detalhe-receita':
          return (
            <RecipePage 
              recipe={selectedRecipe} 
              onBack={handleGoHome} 
              activeTimer={activeTimer} 
              setActiveTimer={setActiveTimer} 
              onAddToShoppingList={handleAddToShoppingList}
              onCompleteRecipe={(callback) => handleCompleteRecipe(selectedRecipe.recipeNumber, callback)}
              onToggleFavorite={() => handleToggleFavorite(selectedRecipe.recipeNumber)}
              isFavorited={(userProfile.favoritedRecipeIds || []).includes(selectedRecipe.recipeNumber)}
            />
          );
      //
      default:
        return (
          <HomePage
            userProfile={userProfile}
            onSelectRecipe={handleSelectRecipe}
            suggestion={dailySuggestion}
            recentlyViewed={recentlyViewed}
            onNavigateToProfile={() => setActivePage('perfil')}
            activeTimer={activeTimer}
            availableRecipes={publishedRecipes}
            onAddRecipe={handleAddRecipe}
            onCheckin={handleCheckin}
            onHabit={handleHabit}
          />
        );
    }
  };

  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      <TopBar />
      <main id="main-content" className="pb-10">{renderContent()}</main>
      
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}
