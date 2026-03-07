'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '@/app/data/types';
import { recipes as initialRecipes } from '@/app/data';
import { useToast } from '@/hooks/use-toast';
 
import type { UserProfile } from '@/app/gamification-data';
import { scoring } from '@/app/gamification-data';
import type { WeeklyPlan } from '@/app/planning-data';
import { initialWeeklyPlan } from '@/app/planning-data';
import MainContent from '@/components/layout/MainContent';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
 
// TourGuide removido

const defaultUserProfile: UserProfile = {
  name: 'Usuário',
  avatarUrl: '/images/avatar.jpg',
  points: 0,
  level: 'Novato Saudável',
  weight: 0,
  height: 0,
  gender: 'other',
  theme: 'theme-green',
  darkMode: false,
  notifyTimer: true,
  notifyNewRecipes: true,
  recipesPrepared: 0,
  recipesFavorited: 0,
  favoritedRecipeIds: [],
  unlockedAchievements: [],
  preparedRecipeIds: [],
  objective: 'eat_healthier',
  pantryItems: {},
  weightHistory: [],
  waterGoalMl: 2000,
};

export type ShoppingListItem = {
  recipeName: string;
  ingredients: string[];
};

export type UserPreferences = {
  objective: string;
};

export type ActiveTimer = {
  recipe: Recipe;
  initialTime: number; // in seconds
  timeLeft: number;
  isActive: boolean;
};

export type CheckinEntry = {
  day: number;
  meal: string;
  type: 'camera' | 'gallery' | 'none';
  imageDataUrl?: string;
  timestamp: string;
  pointsAwarded: number;
};
export type HabitAction = 'training' | 'diet' | 'water' | 'habit';
export type PhotoType = 'camera' | 'gallery' | 'none';

export default function Home() {

  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Estado de tour removido
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(initialWeeklyPlan);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const { toast } = useToast();
  const addNotification = (title: string, description: string, type: 'timer' | 'favorite' | 'achievement') => {
    try {
      const raw = localStorage.getItem('notifications');
      const arr = raw ? JSON.parse(raw) : [];
      const entry = { id: Date.now(), type, title, description, timestamp: new Date().toISOString() };
      localStorage.setItem('notifications', JSON.stringify([entry, ...arr].slice(0, 50)));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {}
  };

  const handleAddRecipe = (recipe: Recipe) => {
    setRecipes(prev => {
      const nextId = prev.reduce((max, r) => Math.max(max, r.recipeNumber), 0) + 1;
      const normalizedImage = normalizeImageUrl(recipe.imageUrl);
      const newRecipe: Recipe = {
        ...recipe,
        recipeNumber: nextId,
        imageUrl: normalizedImage,
        status: recipe.status || 'published',
      };
      return [...prev, newRecipe];
    });
    toast({
      title: 'Receita adicionada',
      description: `A receita "${recipe.name}" foi publicada.`,
    });
    addNotification('Receita publicada', `"${recipe.name}" foi adicionada.`, 'achievement');
  };
  useEffect(() => {
    try {
      const raw = localStorage.getItem('generatedRecipes');
      const arr = raw ? JSON.parse(raw) as Recipe[] : [];
      if (arr.length) {
        setRecipes(prev => {
          // evita duplicar por número
          const ids = new Set(prev.map(r => r.recipeNumber));
          const merged = [...prev, ...arr.filter(r => !ids.has(r.recipeNumber))];
          return merged;
        });
      }
    } catch {}
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/soft-guard', { cache: 'no-store' });
        setIsLoggedIn(r.ok);
      } catch { setIsLoggedIn(false); }
    })();
  }, []);
  
  const normalizeImageUrl = (url: string) => {
    if (!url) return url;
    const base = url.replace(/^\/images\//, '');
    const ascii = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/ç/gi, 'c');
    const cleaned = ascii.replace(/[^a-zA-Z0-9.\-\s]/g, '').replace(/\s+/g, '-').toLowerCase();
    return `/images/${cleaned}`;
  };

  useEffect(() => {
    // Load profile from localStorage
    try {
      const savedProfile = localStorage.getItem('userProfile');
      
      const savedRecipes = localStorage.getItem('recipes');
      const savedShopping = localStorage.getItem('shoppingList');
      const savedWeekly = localStorage.getItem('weeklyPlan');
      
      let profileToApply = defaultUserProfile;

      if (savedProfile) {
        profileToApply = { ...defaultUserProfile, ...JSON.parse(savedProfile) };
      }

      if (savedRecipes) {
        try {
          const parsed: Recipe[] = JSON.parse(savedRecipes);
          const fixed = parsed.map(r => ({ ...r, imageUrl: normalizeImageUrl(r.imageUrl) }));
          setRecipes(fixed);
          try { localStorage.setItem('recipes', JSON.stringify(fixed)); } catch {}
        } catch {}
      }
      if (savedShopping) { try { setShoppingList(JSON.parse(savedShopping)); } catch {} }
      if (savedWeekly) { try { setWeeklyPlan(JSON.parse(savedWeekly)); } catch {} }

      setUserProfile(profileToApply);
      
      // Apply theme using saved palette
      const isDark = profileToApply.darkMode ?? false;
      const theme = profileToApply.theme || 'theme-green';
      const bodyClass = document.body.className.split(' ').filter(c => !c.startsWith('theme-') && c !== 'dark').join(' ');
      document.body.className = `${bodyClass} ${theme} ${isDark ? 'dark' : ''}`.trim();
      
    } catch (error) {
      console.error("Failed to parse user profile from localStorage", error);
      
    } finally {
        setIsLoadingProfile(false);
    }
    
    
  }, []);

  useEffect(() => {
    // Ensure placeholder recipes from day plan exist
    const placeholders: { name: string; tag: string }[] = [
      { name: 'Shake proteico de banana', tag: 'Café da Manhã' },
      { name: 'Biscoito de arroz com geleia, fruta e café', tag: 'Café da Manhã' },
      { name: 'Cuscuz com ovos e fruta com leite em pó', tag: 'Café da Manhã' },
      { name: 'Strogonoff de frango', tag: 'Prato Principal' },
      { name: 'Escondidinho de carne moída', tag: 'Prato Principal' },
      { name: 'Arroz com caldo de feijão e carne moída', tag: 'Prato Principal' },
      { name: 'Cuscuz com ovos', tag: 'Lanche' },
      { name: 'Pão com ovo mexido e requeijão', tag: 'Lanche' },
      { name: 'Iogurte uva', tag: 'Lanche' },
      { name: 'Hambúrguer', tag: 'Prato Principal' },
      { name: 'Peixe e arroz', tag: 'Prato Principal' },
      { name: 'Escondidinho de carne', tag: 'Prato Principal' },
    ];
    setRecipes(prev => {
      const existingNames = new Set(prev.map(r => r.name.toLowerCase()));
      const nextIdStart = prev.reduce((max, r) => Math.max(max, r.recipeNumber), 0) + 1;
      let idCounter = nextIdStart;
      const toAdd: Recipe[] = placeholders
        .filter(p => !existingNames.has(p.name.toLowerCase()))
        .map(p => ({
          name: p.name,
          imageUrl: '/images/sweetpotato.png',
          imageHint: 'simple dish photo',
          portions: 1,
          temperature: 'Quente',
          totalTime: '20 min',
          ingredients: [],
          preparationSteps: [],
          benefits: [],
          recipeNumber: idCounter++,
          tags: [p.tag],
          status: 'published',
        }));
      return toAdd.length ? [...prev, ...toAdd] : prev;
    });
  }, []);

  useEffect(() => {
    // Save profile to localStorage whenever it changes
    if (!isLoadingProfile) {
        try {
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
        } catch (error) {
            console.error("Failed to save user profile to localStorage", error);
        }
    }
  }, [userProfile, isLoadingProfile]);

  useEffect(() => {
    try { localStorage.setItem('recipes', JSON.stringify(recipes)); } catch {}
  }, [recipes]);
  useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem('recipes');
        const arr = raw ? JSON.parse(raw) as Recipe[] : [];
        setRecipes(arr.length ? arr : initialRecipes);
      } catch {}
    };
    window.addEventListener('recipes-updated', handler);
    return () => window.removeEventListener('recipes-updated', handler);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('shoppingList', JSON.stringify(shoppingList)); } catch {}
  }, [shoppingList]);

  useEffect(() => {
    try { localStorage.setItem('weeklyPlan', JSON.stringify(weeklyPlan)); } catch {}
  }, [weeklyPlan]);


  const handleSetTheme = useCallback((theme: string, isDarkMode: boolean) => {
    const bodyClass = document.body.className.split(' ').filter(c => !c.startsWith('theme-') && c !== 'dark').join(' ');
    document.body.className = `${bodyClass} ${theme} ${isDarkMode ? 'dark' : ''}`.trim();
    if (theme === 'theme-custom') {
      try {
        const raw = localStorage.getItem('customThemeVars');
        const vars = raw ? JSON.parse(raw) as { primary?: string; accent?: string } : {};
        const root = document.documentElement;
        const hexToHsl = (hex: string) => {
          let r = 0, g = 0, b = 0;
          const m = hex.replace('#','');
          if (m.length === 3) {
            r = parseInt(m[0]+m[0], 16);
            g = parseInt(m[1]+m[1], 16);
            b = parseInt(m[2]+m[2], 16);
          } else if (m.length === 6) {
            r = parseInt(m.substring(0,2), 16);
            g = parseInt(m.substring(2,4), 16);
            b = parseInt(m.substring(4,6), 16);
          }
          r /= 255; g /= 255; b /= 255;
          const max = Math.max(r,g,b), min = Math.min(r,g,b);
          let h = 0, s = 0; const l = (max + min) / 2;
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = (g - b) / d + (g < b ? 6 : 0); break;
              case g: h = (b - r) / d + 2; break;
              case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
          }
          return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
        };
        if (vars.primary) {
          root.style.setProperty('--primary', hexToHsl(vars.primary));
          root.style.setProperty('--ring', hexToHsl(vars.primary));
        }
        if (vars.accent) {
          root.style.setProperty('--accent', hexToHsl(vars.accent));
        }
      } catch {}
    }
    setUserProfile(prev => ({
      ...prev,
      theme,
      darkMode: isDarkMode,
    }));
  }, []);

  

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    try {
      const name = `Rascunho ${recipes.length + 1}`;
      const newRecipe: Recipe = {
        name,
        imageUrl: '/images/salada-de-quinoa-com-abacate-e-limao.webp',
        imageHint: 'simple dish photo',
        portions: 2,
        temperature: 'Quente',
        totalTime: '20 min',
        ingredients: [
          { name: 'Ingrediente A', quantity: '1 unidade' },
          { name: 'Ingrediente B', quantity: '2 colheres de sopa' },
        ],
        preparationSteps: [
          { step: 1, instruction: 'Misture os ingredientes.' },
          { step: 2, instruction: 'Cozinhe por 20 minutos.', time: 20 },
        ],
        benefits: ['Receita de exemplo para teste.'],
        recipeNumber: recipes.length + 1,
        tags: ['Rascunho'],
        status: 'draft',
      };

      setRecipes(prev => [...prev, newRecipe]);
      try {
        const raw = localStorage.getItem('generatedRecipes');
        const arr = raw ? (JSON.parse(raw) as Recipe[]) : [];
        localStorage.setItem('generatedRecipes', JSON.stringify([...arr, newRecipe]));
      } catch {}
      if (userProfile.notifyNewRecipes !== false) {
        toast({
          title: 'Rascunho de Receita Criado',
          description: `Um rascunho simples foi adicionado à lista: "${newRecipe.name}".`,
        });
        addNotification('Nova receita', `"${newRecipe.name}" foi criada.`, 'achievement');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckin = async (day: number, meal: string, type: 'camera' | 'gallery' | 'none', imageDataUrl?: string) => {
    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    try {
      const raw = localStorage.getItem('checkins');
      const arr = raw ? (JSON.parse(raw) as CheckinEntry[]) : [];
      const already = arr.find(e => e.day === day && e.meal === meal && (e.timestamp || '').slice(0, 7) === monthKey);
      if (already) {
        toast({ title: 'Check-in já registrado', description: 'Esta refeição já contabilizou pontos hoje.' });
        return;
      }
    } catch {}
    const points =
      type === 'camera' ? scoring.CHECKIN_CAMERA :
      type === 'gallery' ? scoring.CHECKIN_GALLERY :
      scoring.CHECKIN_NO_PHOTO;
    setUserProfile(prev => ({ ...prev, points: prev.points + points }));
    try {
      const raw = localStorage.getItem('checkins');
      const arr = raw ? (JSON.parse(raw) as CheckinEntry[]) : [];
      const entry: CheckinEntry = {
        day,
        meal,
        type,
        imageDataUrl,
        timestamp: new Date().toISOString(),
        pointsAwarded: points,
      };
      localStorage.setItem('checkins', JSON.stringify([entry, ...arr].slice(0, 200)));
      const lbRaw = localStorage.getItem(`leaderboard_${monthKey}`);
      const lb = lbRaw ? JSON.parse(lbRaw) as Record<string, number> : {};
      const name = userProfile.name || 'Usuário';
      lb[name] = (lb[name] || 0) + points;
      localStorage.setItem(`leaderboard_${monthKey}`, JSON.stringify(lb));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('progress-updated'));
      }
    } catch {}
    toast({
      title: 'Check-in registrado',
      description: `Você ganhou ${points} ponto(s).`,
    });
    addNotification('Check-in', `Check-in do ${meal} no dia ${day}: +${points} ponto(s).`, 'achievement');
    try {
      await fetch('/api/perfil/calorias/consumir', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ calorias: 450 })
      });
      const res = await fetch('/api/perfil/calorias/me', { cache: 'no-store' });
      if (res.ok) {
        const j = await res.json();
        const percent = Number(j?.today?.percent || 0);
        const todayKey = new Date().toISOString().slice(0, 10);
        const awardKey = `calorie_award_${todayKey}`;
        if (percent >= 80 && percent <= 120 && !localStorage.getItem(awardKey)) {
          const monthKey2 = new Date().toISOString().slice(0, 7);
          const yearKey = new Date().getFullYear().toString();
          const name = userProfile.name || 'Usuário';
          const lbRaw = localStorage.getItem(`leaderboard_${monthKey2}`);
          const lb = lbRaw ? JSON.parse(lbRaw) as Record<string, number> : {};
          lb[name] = (lb[name] || 0) + 1;
          localStorage.setItem(`leaderboard_${monthKey2}`, JSON.stringify(lb));
          const lbyRaw = localStorage.getItem(`leaderboard_year_${yearKey}`);
          const lby = lbyRaw ? JSON.parse(lbyRaw) as Record<string, number> : {};
          lby[name] = (lby[name] || 0) + 1;
          localStorage.setItem(`leaderboard_year_${yearKey}`, JSON.stringify(lby));
          localStorage.setItem(awardKey, '1');
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('progress-updated'));
        }
      }
    } catch {}
  };

  const handleHabit = async (action: HabitAction, type: PhotoType, imageDataUrl?: string, ml?: number) => {
    const actionName = action === 'training' ? 'Treino'
                      : action === 'diet' ? 'Dieta'
                      : action === 'water' ? 'Água'
                      : 'Hábito';
    const points = type === 'camera' ? scoring.CHECKIN_CAMERA
                  : type === 'gallery' ? scoring.CHECKIN_GALLERY
                  : scoring.CHECKIN_NO_PHOTO;
    const dateKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Log detalhado para debug (opcional, pode remover depois)
    console.log(`Registrando hábito: ${action}, tipo: ${type}, ml: ${ml}`);

    try {
      const raw = localStorage.getItem('habits_log');
      const obj = raw ? JSON.parse(raw) as Record<string, Record<string, boolean>> : {};
      const dayLog = obj[dateKey] || {};
      
      // Para ações que não são água, verificamos se já foi feito hoje para evitar duplicidade de pontos
      if (action !== 'water') {
        if (dayLog[action]) {
          toast({ title: `${actionName} já registrado`, description: 'Pontos deste hábito já foram contabilizados hoje.' });
          return;
        }
        dayLog[action] = true;
      }
      
      obj[dateKey] = dayLog;
      localStorage.setItem('habits_log', JSON.stringify(obj));
    } catch (e) {
      console.error("Erro ao salvar habits_log:", e);
    }

    if (action === 'water') {
      try {
        const wlRaw = localStorage.getItem('water_log');
        const wlog = wlRaw ? JSON.parse(wlRaw) as Record<string, Array<{ ml: number; timestamp: string }>> : {};
        const arr = wlog[dateKey] || [];
        
        const currentTotal = arr.reduce((sum, e) => sum + (e.ml || 0), 0);
        const goal = userProfile.waterGoalMl || 2000;
        const cap = Math.floor(goal * 1.5);
        
        // Se já atingiu o limite de 150%, não ganha mais pontos
        if (currentTotal >= cap) {
          toast({ title: 'Meta de pontos atingida', description: 'Você já atingiu 150% da meta de água hoje. Pontos extras não serão contabilizados.' });
          return;
        }

        // Adiciona a nova entrada de água
        const newEntry = { ml: ml || 0, timestamp: new Date().toISOString() };
        wlog[dateKey] = [...arr, newEntry];
        localStorage.setItem('water_log', JSON.stringify(wlog));
        
        const afterTotal = currentTotal + (newEntry.ml || 0);
        const alreadyReached = (userProfile.waterGoalReachedDates || []).includes(dateKey);
        if (!alreadyReached && afterTotal >= goal) {
          setUserProfile(prev => ({
            ...prev,
            waterGoalReachedDates: [...(prev.waterGoalReachedDates || []), dateKey],
          }));
          addNotification('Selo de Hidratação', `Meta de água atingida hoje.`, 'achievement');
        }
        
        // Pontos só valem quando atingir a meta mínima diária
        if (afterTotal < goal) {
          toast({ title: 'Sem pontuação ainda', description: 'Beba sua meta diária para receber pontos pelas fotos de água.' });
          return;
        }
        
      } catch (e) {
        console.error("Erro ao salvar water_log:", e);
      }
    }

    // Se chegou aqui, os pontos podem ser atribuídos
    setUserProfile(prev => {
      const next = { ...prev, points: prev.points + points };
      if (action === 'training') {
        next.trainingDays = (next.trainingDays || 0) + 1;
      } else if (action === 'diet') {
        next.dietDays = (next.dietDays || 0) + 1;
      }
      return next;
    });
    
    try {
      const lbRaw = localStorage.getItem(`leaderboard_${monthKey}`);
      const lb = lbRaw ? JSON.parse(lbRaw) as Record<string, number> : {};
      const name = userProfile.name || 'Usuário';
      lb[name] = (lb[name] || 0) + points;
      localStorage.setItem(`leaderboard_${monthKey}`, JSON.stringify(lb));
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('progress-updated'));
      }
    } catch (e) {
      console.error("Erro ao atualizar leaderboard:", e);
    }

    toast({ title: `${actionName} registrado`, description: `+${points} ponto(s).` });
    addNotification('Hábito diário', `${actionName}: +${points} ponto(s).`, 'achievement');
  };
  const handleCompleteRecipe = (recipeId: number, callback: () => void) => {
    const alreadyPrepared = (userProfile.preparedRecipeIds || []).includes(recipeId);
    if (alreadyPrepared) {
      toast({
        title: 'Receita já finalizada!',
        description: 'Você já ganhou pontos por esta receita.',
      });
      return;
    }
    const pointsToAward = scoring.PREPARE_RECIPE;
    const nextProfile: UserProfile = {
      ...userProfile,
      points: userProfile.points + pointsToAward,
      recipesPrepared: userProfile.recipesPrepared + 1,
      preparedRecipeIds: [...(userProfile.preparedRecipeIds || []), recipeId],
    };
    setUserProfile(nextProfile);
    toast({
      title: '✨ Parabéns! ✨',
      description: `Você ganhou ${pointsToAward} pontos por preparar uma receita!`,
    });
    addNotification('Receita concluída', `Você ganhou ${pointsToAward} pontos por preparar uma receita!`, 'achievement');
    callback();
  };

  const handleToggleFavorite = (recipeId: number) => {
    const favoritedIds = userProfile.favoritedRecipeIds || [];
    const isFavorited = favoritedIds.includes(recipeId);
    const newFavoritedIds = isFavorited
      ? favoritedIds.filter(id => id !== recipeId)
      : [...favoritedIds, recipeId];

    setUserProfile({
      ...userProfile,
      favoritedRecipeIds: newFavoritedIds,
      recipesFavorited: newFavoritedIds.length,
    });

    if (isFavorited) {
      toast({
        title: 'Removido dos Favoritos',
        description: 'Esta receita não está mais na sua lista de favoritos.',
      });
      addNotification('Favorito removido', 'A receita foi removida da sua lista de favoritos.', 'favorite');
    } else {
      toast({
        title: 'Adicionado aos Favoritos!',
        description: 'Você pode encontrar suas receitas favoritas no seu perfil.',
      });
      addNotification('Favorito adicionado', 'A receita foi adicionada aos seus favoritos.', 'favorite');
    }
  };


  const handleAddToShoppingList = (recipeName: string, ingredients: string[]) => {
    const existingRecipeIndex = shoppingList.findIndex(item => item.recipeName === recipeName);

    if (existingRecipeIndex > -1) {
      const existingIngredients = shoppingList[existingRecipeIndex].ingredients;
      const newIngredients = ingredients.filter(ing => !existingIngredients.includes(ing));

      if (newIngredients.length === 0) {
        toast({
          title: 'Ingredientes já na lista',
          description: 'Todos os itens selecionados já estavam na sua lista de compras.',
        });
        return;
      }

      const updatedList = [...shoppingList];
      updatedList[existingRecipeIndex] = {
        ...updatedList[existingRecipeIndex],
        ingredients: [...existingIngredients, ...newIngredients]
      };

      setShoppingList(updatedList);
      setUserProfile(prev => ({ ...prev, addedToShoppingList: true }));
      toast({
        title: 'Adicionado ao Planejador!',
        description: `${newIngredients.length} novo(s) ingrediente(s) na sua lista de compras.`,
      });
    } else {
      const nextList = [...shoppingList, { recipeName, ingredients }];
      setShoppingList(nextList);
      setUserProfile(prev => ({ ...prev, addedToShoppingList: true }));
      toast({
        title: 'Adicionado ao Planejador!',
        description: `${ingredients.length} ingrediente(s) adicionado(s) à sua lista de compras.`,
      });
    }
  };

  

  const handleResetOnboarding = () => {
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('userProfile');
    sessionStorage.removeItem('tourCompleted');
    setUserProfile(defaultUserProfile);
    window.location.reload();
  };
  useEffect(() => {
    const onResetPoints = () => {
      try {
        // Reset pontos do perfil local
        setUserProfile(prev => ({
          ...prev,
          points: 0,
          recipesPrepared: 0,
          preparedRecipeIds: [],
          favoritedRecipeIds: [],
        }));
        // Reset ranking mensal/anual para o usuário atual
        const name = userProfile.name || 'Usuário';
        const monthKey = new Date().toISOString().slice(0, 7);
        const yearKey = new Date().getFullYear().toString();
        const lbRaw = localStorage.getItem(`leaderboard_${monthKey}`);
        const lb = lbRaw ? JSON.parse(lbRaw) as Record<string, number> : {};
        if (lb[name]) { lb[name] = 0; localStorage.setItem(`leaderboard_${monthKey}`, JSON.stringify(lb)); }
        const lbyRaw = localStorage.getItem(`leaderboard_year_${yearKey}`);
        const lby = lbyRaw ? JSON.parse(lbyRaw) as Record<string, number> : {};
        if (lby[name]) { lby[name] = 0; localStorage.setItem(`leaderboard_year_${yearKey}`, JSON.stringify(lby)); }
        // Remove flag de premiação do dia para re-testes
        const todayKey = new Date().toISOString().slice(0, 10);
        localStorage.removeItem(`calorie_award_${todayKey}`);
        // Limpa consumos do dia (cookies)
        try {
          document.cookie = 'cal_consumed_today=; path=/; max-age=0';
          document.cookie = 'agua_today=; path=/; max-age=0';
        } catch {}
        // Limpa logs locais: checkins, hábitos, água
        try {
          localStorage.removeItem('checkins');
          localStorage.removeItem('habits_log');
          localStorage.removeItem('water_log');
        } catch {}
        // Limpa progresso de exercícios
        try {
          localStorage.removeItem('exercise_status');
          localStorage.removeItem('exercise_done_log');
          for (let d = 1; d <= 31; d++) {
            for (let g = 0; g <= 20; g++) {
              localStorage.removeItem(`training_day_${d}_group_${g}_done`);
            }
          }
        } catch {}
        // Limpa notificações recentes
        try { localStorage.removeItem('notifications'); } catch {}
        // Notificar UI
        window.dispatchEvent(new Event('progress-updated'));
        addNotification('Reset de pontos', 'Pontos do usuário resetados para teste.', 'achievement');
      } catch {}
    };
    window.addEventListener('reset-points', onResetPoints as EventListener);
    return () => window.removeEventListener('reset-points', onResetPoints as EventListener);
  }, [userProfile.name, addNotification]);
  
  if (isLoadingProfile) {
    return <div className="bg-background min-h-screen" />;
  }

  

  return (
    <>
      {!isLoggedIn && (
        <>
          <PublicHeader />
          <div className="bg-background">
            <section className="max-w-6xl mx-auto px-4 pt-20 pb-10">
              <h1 className="text-2xl font-bold mb-2">Clube de Emagrecimento</h1>
              <p className="text-sm text-muted-foreground mb-4">Receitas, treinos e acompanhamento para resultados reais.</p>
              <a href="/planos" className="inline-block px-4 py-2 rounded bg-primary text-primary-foreground">Ver Planos</a>
            </section>
            <section className="max-w-6xl mx-auto px-4 pb-10">
              <h2 className="text-xl font-semibold mb-4">Resultados reais de alunos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border bg-card p-4">
                  <div className="font-semibold mb-1">Carla</div>
                  <div className="text-sm text-muted-foreground">Perdi 7kg em 2 meses com receitas fáceis.</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="font-semibold mb-1">Rafael</div>
                  <div className="text-sm text-muted-foreground">Treinos curtos e eficientes, ganhei energia.</div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="font-semibold mb-1">Ana</div>
                  <div className="text-sm text-muted-foreground">O plano VIP me deu direção e constância.</div>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
      <MainContent
        recipes={recipes}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        isGenerating={isGenerating}
        handleGenerateRecipe={handleGenerateRecipe}
        handleAddRecipe={handleAddRecipe}
        handleCheckin={handleCheckin}
        handleHabit={handleHabit}
        handleToggleFavorite={handleToggleFavorite}
        handleCompleteRecipe={handleCompleteRecipe}
        handleAddToShoppingList={handleAddToShoppingList}
        setTheme={handleSetTheme}
        handleResetOnboarding={handleResetOnboarding}
      />
      <Footer />
    </>
  );
}
