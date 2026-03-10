'use client';

import type { Recipe } from '@/app/data/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import React from 'react';
import SuggestionCard from '@/components/home/SuggestionCard';
import DailyActionsCard from '@/components/home/DailyActionsCard';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, History, Lightbulb, AlarmClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { UserProfile } from '@/app/gamification-data';
import type { ActiveTimer } from '@/app/page';
import { useToast } from '@/hooks/use-toast';
import { PlayCircle, Dumbbell, BookOpen, Camera, Image as ImageIcon, CheckCircle, ArrowLeft, Home, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InstallBanner from '@/components/InstallBanner';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

interface HomePageProps {
  userProfile: UserProfile;
  onSelectRecipe: (recipe: Recipe) => void;
  suggestion: Recipe;
  recentlyViewed: Recipe[];
  onNavigateToProfile: () => void;
  activeTimer: ActiveTimer | null;
  availableRecipes: Recipe[];
  onAddRecipe: (recipe: Recipe) => void;
  onCheckin: (day: number, meal: string, type: 'camera' | 'gallery' | 'none', imageDataUrl?: string) => Promise<void>;
  onHabit: (action: 'training' | 'diet' | 'water' | 'habit', type: 'camera' | 'gallery' | 'none', imageDataUrl?: string, ml?: number) => Promise<void>;
}

type TrainingDay = {
  id: number;
  title: string;
  videoUrl: string;
  tips: string;
  recipeNumber?: number;
}

export default function HomePage({ userProfile, onSelectRecipe, suggestion, recentlyViewed, onNavigateToProfile, activeTimer, availableRecipes, onAddRecipe, onCheckin, onHabit }: HomePageProps) {


  const getFirstName = (name: string) => {
    if (!name || name === 'Usuário') return '';
    return name.split(' ')[0];
  }

  const firstName = getFirstName(userProfile.name);
  const toSafeSrc = (src: string) => `/images/${encodeURIComponent(src.replace(/^\/images\//, ''))}`
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const { toast } = useToast();
  const [isTrainingSheetOpen, setIsTrainingSheetOpen] = useState(false);
  const [isTrainingPhotoSheetOpen, setIsTrainingPhotoSheetOpen] = useState(false);
  const [trainingPhotoDay, setTrainingPhotoDay] = useState<number | null>(null);
  const [isRecipeSheetOpen, setIsRecipeSheetOpen] = useState(false);
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string; points: number }[]>([]);
  const [monthDots, setMonthDots] = useState<{ dateKey: string; color: 'green' | 'yellow' | 'red' }[]>([]);
  const [isWaterSheetOpen, setIsWaterSheetOpen] = useState(false);
  const [selectedWaterDay, setSelectedWaterDay] = useState<number | null>(null);
  const [waterEntries, setWaterEntries] = useState<Array<{ ml: number; type: 'camera' | 'gallery' | 'none'; imageDataUrl?: string }>>([]);
  const [waterThumb, setWaterThumb] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [kcalToday, setKcalToday] = useState<{ consumed: number; goal: number; percent: number; water: number } | null>(null);
  const [heatmap, setHeatmap] = useState<Array<{ date: string; treino: boolean; agua: boolean; calorias: boolean }>>([]);
  const [badges, setBadges] = useState<Array<{ nome: string; emoji: string; req_streak?: number; req_pontos?: number; desbloqueado_em?: string }>>([]);
  const [targets, setTargets] = useState<{ treino: number; agua: number; calorias: number }>({ treino: 7, agua: 30, calorias: 22 });
  const [currentStreak, setCurrentStreak] = useState<{ treino: number; agua: number; calorias: number }>({ treino: 0, agua: 0, calorias: 0 });
  const [badgeModal, setBadgeModal] = useState<{ open: boolean; nome: string; emoji: string }>({ open: false, nome: '', emoji: '' });
  const [trainToday, setTrainToday] = useState<{ has: boolean; status: 'concluido' | 'parcial' | 'abandonado' | 'nenhum' }>({ has: false, status: 'nenhum' });
  const [globalStreak, setGlobalStreak] = useState<number>(0);
  const [nextGoal, setNextGoal] = useState<number | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [showFirstSteps, setShowFirstSteps] = useState(false);
  const [weeklyChallenge, setWeeklyChallenge] = useState<{
    baseline: number;
    startedAt?: string | null;
    doneUntil?: string | null;
  } | null>(null);
  const [pointsToday, setPointsToday] = useState<number>(0);
  const [pointsMonth, setPointsMonth] = useState<number>(0);
  const [pointsYear, setPointsYear] = useState<number>(0);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [initialWeightKg, setInitialWeightKg] = useState<number | null>(null);
  const [withinGoalPct, setWithinGoalPct] = useState<number | null>(null);
  const [trainDaysWeek, setTrainDaysWeek] = useState<number | null>(null);
  const [tipOfDay, setTipOfDay] = useState<string | null>(null);
  const [devSwWarning, setDevSwWarning] = useState<boolean>(false);
  const [weeklyOpen, setWeeklyOpen] = useState<boolean>(false);
  const [weeklyDays, setWeeklyDays] = useState<Array<{
    date: string; // YYYY-MM-DD
    label: string; // Seg, Ter...
    treino: boolean;
    agua: boolean;
    caloriasOk: boolean;
    points: number;
  }>>([]);
  const [shareOpen, setShareOpen] = useState<{ open: boolean; title?: string; text?: string }>({ open: false });
  type DailyMealItem = {
    id: string;
    recipe_id: string;
    meal_type: 'cafe_da_manha' | 'almoco' | 'lanche_da_tarde' | 'jantar';
    calories: number;
    date: string;
    consumed: boolean;
    recipe_name?: string | null;
    recipe_image_url?: string | null;
  };
  const [dailyMeals, setDailyMeals] = useState<DailyMealItem[]>([]);
  const [consumeBusyId, setConsumeBusyId] = useState<string | null>(null);
  const [generateBusy, setGenerateBusy] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [swapBusyId, setSwapBusyId] = useState<string | null>(null);
  const [swapErrorId, setSwapErrorId] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);

  const computePoints = () => {
    try {
      let day = 0, month = 0, year = 0;
      const todayStr = new Date().toISOString().slice(0, 10);
      const ym = todayStr.slice(0, 7);
      const yr = todayStr.slice(0, 4);
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        if (key.startsWith('points_daily_')) {
          const v = Number(localStorage.getItem(key) || '0') || 0;
          if (key === `points_daily_${todayStr}`) day += v;
          if (key.startsWith(`points_daily_${ym}`)) month += v;
          if (key.startsWith(`points_daily_${yr}`)) year += v;
        }
      }
      setPointsToday(day); setPointsMonth(month); setPointsYear(year);
    } catch {}
  };

  const addPoints = (n: number) => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const key = `points_daily_${todayStr}`;
      const cur = Number(localStorage.getItem(key) || '0') || 0;
      localStorage.setItem(key, String(cur + n));
      computePoints();
    } catch {}
  };

  type NotificationEntry = { id: number; type: 'timer' | 'favorite' | 'achievement'; title: string; description: string; timestamp: string };
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  useEffect(() => {
    const load = () => {
      try { setNotifications(JSON.parse(localStorage.getItem('notifications') || '[]')); } catch { setNotifications([]); }
    };
    load();
    const handler = () => load();
    window.addEventListener('notifications-updated', handler);
    return () => window.removeEventListener('notifications-updated', handler);
  }, []);
  const clearNotifications = () => {
    try {
      localStorage.setItem('notifications', JSON.stringify([]));
      setNotifications([]);
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {}
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('trainingDays');
      const arr = raw ? JSON.parse(raw) as TrainingDay[] : [];
      if (arr.length === 0) {
        setTrainingDays([
          { id: 1, title: 'Dia 1 • Full Body', videoUrl: '', tips: 'Escolha uma opção por bloco e alterne conforme necessário.' },
          { id: 2, title: 'Dia 3 • Upper/Lower Alternado', videoUrl: '', tips: 'Opções por bloco com foco alternado.' },
        ]);
      } else {
        setTrainingDays(arr);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('trainingDays', JSON.stringify(trainingDays));
    } catch {}
  }, [trainingDays]);
  useEffect(() => {
    try {
      const t = localStorage.getItem('water_thumb');
      setWaterThumb(t || null);
    } catch { setWaterThumb(null); }
  }, []);
  useEffect(() => {
    try {
      const role = (document.cookie.split('; ').find(c => c.startsWith('role=')) || '').split('=')[1] || '';
      setIsAdmin(role === 'admin');
    } catch { setIsAdmin(false); }
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/perfil/calorias/me', { cache: 'no-store' });
        if (res.ok) {
          const j = await res.json();
          const consumed = Number(j?.today?.calorias_consumidas || 0);
          const goal = Number(j?.today?.meta_diaria || 0);
          const percent = goal ? Math.round((consumed / goal) * 100) : 0;
          const water = Number(j?.today?.agua_ml || 0);
          setKcalToday({ consumed, goal, percent, water });
          const w = Number(j?.profile?.peso_kg || 0) || null;
          setWeightKg(w);
          try {
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('initial_weight_kg');
              if (!stored && w) {
                localStorage.setItem('initial_weight_kg', String(w));
                setInitialWeightKg(w);
              } else if (stored) {
                const v = Number(stored);
                setInitialWeightKg(isNaN(v) ? null : v);
              }
            }
          } catch {}
        }
      } catch { setKcalToday(null); }
      try {
        const g = await fetch('/api/gamificacao/streaks', { cache: 'no-store' });
        if (g.ok) {
          const j = await g.json();
          const hm = Array.isArray(j?.heatmap_30dias) ? j.heatmap_30dias : [];
          setHeatmap(hm);
          setBadges(Array.isArray(j?.badges_desbloqueados) ? j.badges_desbloqueados : []);
          setTargets(j?.targets || { treino: 7, agua: 30, calorias: 22 });
          setCurrentStreak({
            treino: Number(j?.current?.treino || 0),
            agua: Number(j?.current?.agua || 0),
            calorias: Number(j?.current?.calorias || 0),
          });
          setGlobalStreak(Number(j?.current_global_streak || 0));
          setNextGoal(j?.next_goal_days ?? null);
          try {
            const lastDone = [...hm].reverse().find((d: any) => d.treino || d.agua || d.calorias);
            let daysSince = Infinity;
            if (lastDone?.date) {
              const t0 = new Date(lastDone.date + 'T00:00:00Z').getTime();
              const t1 = new Date(new Date().toISOString().slice(0,10) + 'T00:00:00Z').getTime();
              daysSince = Math.max(0, Math.round((t1 - t0) / (1000*60*60*24)));
            }
            const doneFlag = (typeof window !== 'undefined') ? localStorage.getItem('onboarding_done') === '1' : false;
            if (daysSince >= 7) {
              setShowFirstSteps(true);
            } else {
              setShowFirstSteps(!doneFlag);
            }
            // Weekly challenge memory
            if (typeof window !== 'undefined') {
              const wcRaw = localStorage.getItem('weekly_challenge');
              let wc: any = wcRaw ? JSON.parse(wcRaw) : null;
              const doneUntil = wc?.doneUntil ? new Date(wc.doneUntil) : null;
              const now = new Date();
              const completed = wc && typeof wc.baseline === 'number'
                ? Math.max(0, Number(j?.current_global_streak || 0) - wc.baseline + 1) >= 7
                : false;
              // If completed now and no doneUntil, set doneUntil = now + 7d
              if (completed && !wc?.doneUntil) {
                const until = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                wc = { ...(wc || {}), doneUntil: until.toISOString() };
                localStorage.setItem('weekly_challenge', JSON.stringify(wc));
              }
              // if finished window expired, allow showing again by clearing doneUntil on next onboarding re-start
              setWeeklyChallenge(wc);
            }
            try {
              const total = hm.length || 0;
              const good = hm.filter((d: any) => !!d.calorias).length;
              setWithinGoalPct(total > 0 ? Math.round((good / total) * 100) : null);
              const today2 = new Date();
              const dow = today2.getDay();
              const start = new Date(today2);
              start.setDate(today2.getDate() - dow);
              const end = new Date(start);
              end.setDate(start.getDate() + 6);
              const sKey = start.toISOString().slice(0,10);
              const eKey = end.toISOString().slice(0,10);
              const countWeek = hm.filter((d: any) => d.date >= sKey && d.date <= eKey && d.treino).length;
              setTrainDaysWeek(countWeek);
            } catch {}
          } catch {}
        }
      } catch {}
      try {
        const s = await fetch('/api/treinos/hoje/status', { cache: 'no-store' });
        if (s.ok) {
          const j = await s.json();
          setTrainToday({ has: !!j?.tem_treino_hoje, status: (j?.status || 'nenhum') });
        }
      } catch {}
      try {
        const doneFlag = (typeof window !== 'undefined') ? localStorage.getItem('onboarding_done') === '1' : false;
        const dismissed = (typeof window !== 'undefined') ? localStorage.getItem('onboarding_meta_dismissed') === '1' : false;
        if (!dismissed) setOnboardingOpen(!kcalToday?.goal);
        setShowFirstSteps(!doneFlag);
      } catch {}
    })();
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/daily-meals/today', { cache: 'no-store' });
        if (r.ok) {
          const j = await r.json();
          const items = Array.isArray(j?.items) ? j.items : [];
          const normalized: DailyMealItem[] = items.map((it: any) => ({
            id: String(it.id),
            recipe_id: String(it.recipe_id),
            meal_type: String(it.meal_type) as DailyMealItem['meal_type'],
            calories: Number(it.calories || 0),
            date: String(it.date || ''),
            consumed: !!it.consumed,
            recipe_name: it.recipe_name || null,
            recipe_image_url: it.recipe_image_url || null,
          }));
          setDailyMeals(normalized);
        }
      } catch {}
    })();
  }, []);
  useEffect(() => {
    try {
      if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        const isLocalhost3000 = window.location.hostname === 'localhost' && window.location.port === '3000';
        if (isLocalhost3000 && 'serviceWorker' in navigator) {
          // Fast check
          if (navigator.serviceWorker.controller) setDevSwWarning(true);
          navigator.serviceWorker.getRegistrations?.().then((regs) => {
            if (regs && regs.length > 0) setDevSwWarning(true);
          }).catch(() => {});
        }
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      const dateKey = new Date().toISOString().slice(0, 10);
      const stored = (typeof window !== 'undefined') ? localStorage.getItem(`tip_of_day_${dateKey}`) : null;
      if (stored) { setTipOfDay(stored); return; }
      // Build contextual tip
      const hiStreak = (globalStreak || 0) >= 7 && (withinGoalPct || 0) >= 60 && (trainDaysWeek || 0) >= 2;
      const starting = (globalStreak || 0) <= 1 && (pointsMonth || 0) < 10;
      const paused = !hiStreak && !starting;
      const seed = dateKey;
      const pick = (arr: string[]) => arr[Math.abs(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % arr.length];
      let msg = 'Seu dia começa hoje. Cada escolha conta.';
      if (hiStreak) {
        const list = [
          `Você está há ${globalStreak} dias seguidos dentro da meta. Se continuar assim, verá resultados em 4 semanas.`,
          'Treino e dieta alinhados. Continue assim que seu corpo vai agradecer.',
        ];
        msg = pick(list);
      } else if (starting) {
        const list = [
          'Você está no 1º dia de hábito. A continuidade é o que muda o corpo.',
          'Primeiros dias são os mais difíceis. Mantenha firme que daqui 2 semanas já vai parecer mais fácil.',
        ];
        msg = pick(list);
      } else if (paused) {
        const list = [
          'Você está no meio de um ciclo de pausa. Mas cada novo dia é uma nova chance de recomeçar.',
          'Seu streak foi quebrado, mas isso não define seu potencial. Amanhã é um novo dia.',
        ];
        msg = pick(list);
      }
      setTipOfDay(msg);
      if (typeof window !== 'undefined') localStorage.setItem(`tip_of_day_${dateKey}`, msg);
    } catch {}
  }, [globalStreak, withinGoalPct, trainDaysWeek, pointsMonth]);
  useEffect(() => {
    const getWeekday = (dateStr: string, tzOffsetMin?: number) => {
      try {
        const [y, m, d] = dateStr.split('-').map(Number);
        const utc = Date.UTC(y, (m - 1), d, 0, 0, 0);
        const off = (typeof tzOffsetMin === 'number') ? tzOffsetMin : -new Date().getTimezoneOffset();
        const ts = utc + off * 60 * 1000;
        const dow = (new Date(ts)).getUTCDay(); // 0=Dom
        return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dow] || '';
      } catch { return ''; }
    };
    try {
      const today = new Date();
      const dow = today.getDay(); // 0=Dom
      const start = new Date(today);
      start.setDate(today.getDate() - dow);
      const daysArr: Array<{ date: string; label: string; treino: boolean; agua: boolean; caloriasOk: boolean; points: number }> = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateKey = d.toISOString().slice(0, 10);
        const hmEntry = heatmap.find(h => h.date === dateKey);
        const treino = !!hmEntry?.treino;
        const agua = !!hmEntry?.agua;
        const caloriasOk = !!hmEntry?.calorias;
        let points = 0;
        try {
          const p = localStorage.getItem(`points_daily_${dateKey}`);
          points = Number(p || '0') || 0;
        } catch {}
        daysArr.push({
          date: dateKey,
          label: getWeekday(dateKey),
          treino,
          agua,
          caloriasOk,
          points,
        });
      }
      setWeeklyDays(daysArr);
    } catch { setWeeklyDays([]); }
  }, [heatmap, pointsMonth]);
  
  useEffect(() => {
    try {
      const monthKey = new Date().toISOString().slice(0, 7);
      const lbRaw = localStorage.getItem(`leaderboard_${monthKey}`);
      const lbObj = lbRaw ? JSON.parse(lbRaw) as Record<string, number> : {};
      const arr = Object.entries(lbObj).map(([name, points]) => ({ name, points }));
      arr.sort((a, b) => b.points - a.points);
      setLeaderboard(arr.slice(0, 5));
    } catch { setLeaderboard([]); }
  }, [isDaySheetOpen]);

  useEffect(() => {
    const computeMonthDots = () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-based
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const checkinsRaw = localStorage.getItem('checkins');
        const checkins = checkinsRaw ? JSON.parse(checkinsRaw) as Array<{ timestamp: string; meal: string }> : [];
        const habitsRaw = localStorage.getItem('habits_log');
        const habits = habitsRaw ? JSON.parse(habitsRaw) as Record<string, Record<string, boolean>> : {};
        const targetMeals = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'];
        const dots = Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayCheckins = checkins.filter(c => (c.timestamp || '').slice(0, 10) === dateKey);
          const mealsDoneSet = new Set(dayCheckins.map(c => c.meal));
          const mealsComplete = targetMeals.every(m => mealsDoneSet.has(m));
          const dayHabits = habits[dateKey] || {};
          const trainingDone = !!dayHabits['training'];
          const waterDone = !!dayHabits['water'];
          const completedCount = (mealsComplete ? 1 : 0) + (trainingDone ? 1 : 0) + (waterDone ? 1 : 0);
          const color: 'green' | 'yellow' | 'red' = completedCount === 3 ? 'green' : completedCount > 0 ? 'yellow' : 'red';
          return { dateKey, color };
        });
        setMonthDots(dots);
      } catch { setMonthDots([]); }
    };
    computeMonthDots();
    const handler = () => computeMonthDots();
    window.addEventListener('progress-updated', handler);
    return () => window.removeEventListener('progress-updated', handler);
  }, []);
  const router = useRouter();
  const handleTrainingClick = (td: { id: number }) => {
    try {
      router.push(`/training/day/${td.id}`);
    } catch {
      toast({ title: 'Falha ao abrir treino', description: 'Tente novamente.' });
    }
  };

  const [recipeForm, setRecipeForm] = useState({
    name: '',
    imageUrl: '',
    portions: 1,
    temperature: 'Quente',
    prepMinutes: 10,
    cookMinutes: 10,
    proteinGrams: 0,
    ingredientsText: '',
    stepsText: '',
  });

  const [trainingForm, setTrainingForm] = useState({
    title: '',
    videoUrl: '',
    tips: '',
    recipeNumber: '',
  });

  const parseIngredients = (text: string) => {
    return text.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      const [quantity, ...rest] = line.split(' ');
      return { name: rest.join(' ') || line, quantity: quantity || '' };
    });
  };

  const parseSteps = (text: string) => {
    return text.split('\n').map((l, idx) => ({ step: idx + 1, instruction: l.trim() })).filter(s => s.instruction.length > 0);
  };

  const submitRecipeForm = () => {
    const totalMinutes = Math.max(0, recipeForm.prepMinutes + recipeForm.cookMinutes);
    const recipe: Recipe = {
      name: recipeForm.name || 'Receita sem nome',
      imageUrl: recipeForm.imageUrl || '/images/sweetpotato.png',
      imageHint: 'dish photo',
      portions: recipeForm.portions,
      temperature: recipeForm.temperature,
      totalTime: `${totalMinutes} min`,
      proteinGrams: recipeForm.proteinGrams || undefined,
      ingredients: parseIngredients(recipeForm.ingredientsText),
      preparationSteps: parseSteps(recipeForm.stepsText),
      benefits: [],
      recipeNumber: 0,
      tags: ['Publicado'],
      status: 'published',
    };
    onAddRecipe(recipe);
    setIsRecipeSheetOpen(false);
    toast({ title: 'Receita enviada', description: 'Sua receita foi adicionada à lista.' });
    setRecipeForm({
      name: '',
      imageUrl: '',
      portions: 1,
      temperature: 'Quente',
      prepMinutes: 10,
      cookMinutes: 10,
      proteinGrams: 0,
      ingredientsText: '',
      stepsText: '',
    });
  };

  const submitTrainingForm = () => {
    const nextId = (trainingDays[trainingDays.length - 1]?.id || 0) + 1;
    setTrainingDays(prev => [...prev, {
      id: nextId,
      title: trainingForm.title || 'Treino',
      videoUrl: trainingForm.videoUrl,
      tips: trainingForm.tips,
      recipeNumber: trainingForm.recipeNumber ? parseInt(trainingForm.recipeNumber, 10) : undefined,
    }]);
    setIsTrainingSheetOpen(false);
    toast({ title: 'Treino enviado', description: 'Seu treino foi adicionado.' });
    setTrainingForm({ title: '', videoUrl: '', tips: '', recipeNumber: '' });
  };

  const dayMealNames: Record<string, string[]> = {
    'Café da Manhã': [
      'Shake proteico de banana',
      'Biscoito de arroz com geleia, fruta e café',
      'Cuscuz com ovos e fruta com leite em pó',
    ],
    'Almoço': [
      'Strogonoff de frango',
      'Escondidinho de carne moída',
      'Arroz com caldo de feijão e carne moída',
    ],
    'Lanche': [
      'Cuscuz com ovos',
      'Pão com ovo mexido e requeijão',
      'Iogurte uva',
    ],
    'Jantar': [
      'Hambúrguer',
      'Peixe e arroz',
      'Escondidinho de carne',
    ],
  };

  const mealTagMap: Record<string, string> = {
    'Café da Manhã': 'Café da Manhã',
    'Almoço': 'Prato Principal',
    'Lanche': 'Lanche',
    'Jantar': 'Prato Principal',
  };

  const openDay = (day: number) => {
    setSelectedDay(day);
    setIsDaySheetOpen(true);
  };
  const openWaterDay = (day: number) => {
    setSelectedWaterDay(day);
    setIsWaterSheetOpen(true);
    try {
      const yearMonth = new Date().toISOString().slice(0, 7);
      const dateKey = `${yearMonth}-${String(day).padStart(2, '0')}`;
      const wlRaw = localStorage.getItem('water_log');
      const wlog = wlRaw ? JSON.parse(wlRaw) as Record<string, Array<{ ml: number; type: 'camera' | 'gallery' | 'none'; imageDataUrl?: string }>> : {};
      setWaterEntries(wlog[dateKey] || []);
    } catch { setWaterEntries([]); }
  };
  const saveWaterEntries = (day: number, entries: Array<{ ml: number; type: 'camera' | 'gallery' | 'none'; imageDataUrl?: string }>) => {
    try {
      const yearMonth = new Date().toISOString().slice(0, 7);
      const dateKey = `${yearMonth}-${String(day).padStart(2, '0')}`;
      const wlRaw = localStorage.getItem('water_log');
      const wlog = wlRaw ? JSON.parse(wlRaw) as Record<string, Array<{ ml: number; type: 'camera' | 'gallery' | 'none'; imageDataUrl?: string }>> : {};
      wlog[dateKey] = entries;
      localStorage.setItem('water_log', JSON.stringify(wlog));
      setWaterEntries(entries);
      window.dispatchEvent(new Event('progress-updated'));
    } catch {}
  };

  const findRecipeByName = (name: string): Recipe | undefined => {
    return availableRecipes.find(r => r.name.toLowerCase() === name.toLowerCase());
  };

  const handleChooseDayRecipe = async (day: number, mealLabel: string, recipeName: string) => {
    const existing = findRecipeByName(recipeName);
    if (existing) {
      onSelectRecipe(existing);
      return;
    }
    const tag = mealTagMap[mealLabel] || 'Prato Principal';
    const recipe: Recipe = {
      name: recipeName,
      imageUrl: '/images/sweetpotato.png',
      imageHint: 'simple dish photo',
      portions: 1,
      temperature: 'Quente',
      totalTime: '20 min',
      ingredients: [],
      preparationSteps: [],
      benefits: [],
      recipeNumber: 0,
      tags: [tag],
      status: 'published',
    };
    onAddRecipe(recipe);
    toast({ title: 'Receita criada', description: `“${recipeName}” adicionada. Clique novamente para abrir.` });
  };

  return (
    <div className="bg-background min-h-screen">
      <header id="home-header" className="relative h-64 sm:h-64 bg-gradient-to-r from-primary to-accent px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="container mx-auto max-w-6xl flex justify-between items-start">
            <div>
                 <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary-foreground">Olá{firstName ? `, ${firstName}` : ''}!</h1>
                <p className="text-primary-foreground/90 text-lg">O que vamos cozinhar hoje?</p>
            </div>
            <div className="flex items-center gap-3">
                <Button onClick={() => setIsNotificationsOpen(true)} variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-white/20">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                </Button>
                <button id="profile-avatar-button" onClick={onNavigateToProfile} className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="h-10 w-10 border-2 border-white/50">
                        <AvatarImage src={userProfile.avatarUrl || '/images/avatar.jpg'} alt={userProfile.name} />
                        <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </button>
            </div>
        </div>
        
      </header>

      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Notificações</SheetTitle>
            <SheetDescription>Histórico local de eventos</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem notificações</p>
            ) : (
              notifications.map((n) => (
                <Card key={n.id} className="border">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <div className="font-medium">{n.title}</div>
                        <div className="text-sm text-muted-foreground">{n.description}</div>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(n.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={clearNotifications}>Limpar</Button>
          </div>
        </SheetContent>
      </Sheet>
      
      <main className="relative -mt-24 sm:-mt-28 rounded-t-3xl bg-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" />

        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-4 pt-6 pb-6 space-y-12">
            <InstallBanner />
            {devSwWarning && (
              <div className="rounded border p-2 bg-amber-500/20 text-amber-300 text-xs text-center">
                Problema de cache detectado em dev. Abra em{' '}
                <a href="http://127.0.0.1:3002/" target="_blank" rel="noreferrer" className="underline">http://127.0.0.1:3002/</a>{' '}
                para recarregar sem cache.
              </div>
            )}
            {(() => {
              const now = new Date();
              const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
              const name = userProfile.name || 'Usuário';
              const p = kcalToday?.percent || 0;
              const barColor = p < 100 ? 'bg-green-600' : p <= 120 ? 'bg-yellow-500' : 'bg-red-600 animate-pulse';
              return (
                <section className="space-y-2">
                  <div className="flex items-center justify-between flex-col sm:flex-row gap-2">
                    <div className="font-headline text-lg h2">{name}</div>
                    <div className="text-sm text-muted-foreground">{dateStr}</div>
                  </div>
                  <div className="rounded-xl border border-neutral-700 p-3 home-card">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>
                        {kcalToday
                          ? `${kcalToday.consumed}/${kcalToday.goal} kcal`
                          : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-primary text-primary btn-wide"
                                onClick={() => { window.location.href = '/perfil'; }}
                              >
                                Configurar calorias
                              </Button>
                            )}
                      </span>
                      <span>{kcalToday ? `${kcalToday.percent}%` : ''}</span>
                    </div>
                    <div className="h-3 rounded bg-neutral-800 overflow-hidden">
                      <div className={`h-3 ${barColor}`} style={{ width: `${Math.min(100, p)}%` }} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-700 p-3 home-card flex items-center justify-between flex-col sm:flex-row gap-3">
                    <div className="text-sm w-full">{kcalToday ? `${kcalToday.water}/${userProfile.waterGoalMl || 3000} ml` : 'Água'}</div>
                    <div className="flex items-center gap-2 w-full">
                      <input
                        id="water-amount-input"
                        type="number"
                        min={50}
                        step={50}
                        defaultValue={200}
                        className="w-full sm:w-24 border rounded px-4 py-3 text-sm"
                      />
                      <Button size="sm" variant="outline" className="border-primary text-primary btn-wide"
                        onClick={async () => {
                          try {
                            const inputEl = document.getElementById('water-amount-input') as HTMLInputElement | null;
                            const ml = inputEl ? (parseInt(inputEl.value, 10) || 0) : 200;
                            await fetch('/api/perfil/calorias/agua', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ml }) });
                            const res = await fetch('/api/perfil/calorias/me', { cache: 'no-store' });
                            if (res.ok) {
                              const j = await res.json();
                              const consumed = Number(j?.today?.calorias_consumidas || 0);
                              const goal = Number(j?.today?.meta_diaria || 0);
                              const percent = goal ? Math.round((consumed / goal) * 100) : 0;
                              const water = Number(j?.today?.agua_ml || 0);
                              setKcalToday({ consumed, goal, percent, water });
                              try {
                                const dateKey = new Date().toISOString().slice(0, 10);
                                const flag = localStorage.getItem(`chk_agua_${dateKey}`) || '';
                                if (water >= 3000 && !flag) {
                                  const r = await fetch('/api/gamificacao/checkin/agua', { method: 'POST' });
                                  try {
                                    const jr = await r.json();
                                    if (jr?.unlockedBadge?.nome) {
                                      setBadgeModal({ open: true, nome: jr.unlockedBadge.nome, emoji: jr.unlockedBadge.emoji || '🎉' });
                                      try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } }); } catch {}
                                    }
                                  } catch {}
                                  localStorage.setItem(`chk_agua_${dateKey}`, '1');
                                  const g = await fetch('/api/gamificacao/streaks', { cache: 'no-store' });
                                  if (g.ok) {
                                    const gj = await g.json();
                                    setHeatmap(Array.isArray(gj?.heatmap_30dias) ? gj.heatmap_30dias : []);
                                    setBadges(Array.isArray(gj?.badges_desbloqueados) ? gj.badges_desbloqueados : []);
                                    setTargets(gj?.targets || targets);
                                    setCurrentStreak({
                                      treino: Number(gj?.current?.treino || 0),
                                      agua: Number(gj?.current?.agua || 0),
                                      calorias: Number(gj?.current?.calorias || 0),
                                    });
                                  }
                                }
                              } catch {}
                            }
                          } catch {}
                        }}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </section>
              );
            })()}
            <section id="suggestion-card" className="mt-0">
              <div className="flex items-center gap-3 mb-4 mt-6 md:mt-8">
                <Lightbulb className="w-6 h-6 text-amber-400" />
                <h2 className="font-headline text-xl md:text-2xl font-bold">Ações do dia</h2>
              </div>
              {(() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const day = now.getDate();
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                let nextMeal: string | undefined = undefined;
                try {
                  const targetMeals = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'];
                  const checkinsRaw = localStorage.getItem('checkins');
                  const checkins = checkinsRaw ? JSON.parse(checkinsRaw) as Array<{ timestamp: string; meal: string }> : [];
                  const dayCheckins = checkins.filter(c => (c.timestamp || '').slice(0, 10) === dateKey);
                  const mealsDoneSet = new Set(dayCheckins.map(c => c.meal));
                  nextMeal = targetMeals.find(m => !mealsDoneSet.has(m));
                } catch {}
                let waterReached = false;
                try {
                  const wlRaw = localStorage.getItem('water_log');
                  const wlog = wlRaw ? JSON.parse(wlRaw) as Record<string, Array<{ ml: number }>> : {};
                  const arr = wlog[dateKey] || [];
                  const total = arr.reduce((s, e) => s + (e.ml || 0), 0);
                  const goal = userProfile.waterGoalMl || 2000;
                  waterReached = total >= goal;
                } catch {}
                const trainingTitle = (() => {
                  try {
                    const raw = localStorage.getItem('trainingDays');
                    const arr = raw ? JSON.parse(raw) as Array<{ id: number; title: string }> : [];
                    if (arr.length === 0) return 'Treino';
                    const idx = (now.getDay() % arr.length);
                    return arr[idx]?.title || 'Treino';
                  } catch { return 'Treino'; }
                })();
                return (
                  <DailyActionsCard
                    nextMealLabel={nextMeal}
                    onOpenMeals={() => openDay(day)}
                    trainingTitle={trainingTitle}
                    onOpenTraining={() => {
                      try {
                        const raw = localStorage.getItem('trainingDays');
                        const arr = raw ? JSON.parse(raw) as Array<{ id: number; title: string }> : [];
                        const idx = (now.getDay() % (arr.length || 1));
                        const targetId = arr.length ? arr[idx].id : 1;
                        window.location.href = `/training/day/${targetId}`;
                      } catch {
                        window.location.href = `/training/day/1`;
                      }
                    }}
                    onOpenTrainingPhoto={() => { setTrainingPhotoDay(day); setIsTrainingPhotoSheetOpen(true); }}
                    waterGoalReached={waterReached}
                    onOpenWater={() => openWaterDay(day)}
                  />
                );
              })()}
            </section>
            
            {activeTimer && (
              <Card className="shadow-lg">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlarmClock className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-headline text-base font-bold">Cronômetro</div>
                      <div className="text-sm text-muted-foreground">{activeTimer.recipe.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg">{formatTime(activeTimer.timeLeft)}</span>
                    <Button size="sm" onClick={() => onSelectRecipe(activeTimer.recipe)}>Abrir receita</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {leaderboard.length > 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlarmClock className="w-6 h-6 text-primary" />
                    <h2 className="font-headline text-xl md:text-2xl font-bold">Ranking Mensal</h2>
                  </div>
                  <ul className="space-y-2">
                    {leaderboard.map((entry, idx) => (
                      <li key={`${entry.name}-${idx}`} className="flex justify-between items-center bg-muted/40 rounded px-3 py-2">
                        <span className="text-sm">{idx + 1}. {entry.name}</span>
                        <span className="text-sm font-mono">{entry.points} pts</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Sheet open={isTrainingPhotoSheetOpen} onOpenChange={setIsTrainingPhotoSheetOpen}>
              <SheetContent side="bottom" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Foto do Treino do Dia</SheetTitle>
                  <SheetDescription>Escolha como registrar a foto do treino do dia.</SheetDescription>
                </SheetHeader>
                <div className="mt-4 flex items-center gap-2">
                  <label className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded bg-primary/10 text-primary cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <span>Foto agora</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const dataUrl = reader.result as string;
                          await onHabit('training', 'camera', dataUrl);
                          setIsTrainingPhotoSheetOpen(false);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <label className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded bg-primary/10 text-primary cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    <span>Galeria</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const dataUrl = reader.result as string;
                          await onHabit('training', 'gallery', dataUrl);
                          setIsTrainingPhotoSheetOpen(false);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <button
                    className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded bg-[#1a1a1a] text-white border border-neutral-700"
                    onClick={() => { onHabit('training', 'none'); setIsTrainingPhotoSheetOpen(false); }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Sem foto
                  </button>
                </div>
              </SheetContent>
            </Sheet>
            
            {dailyMeals.length > 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlarmClock className="w-6 h-6 text-primary" />
                    <h2 className="font-headline text-xl md:text-2xl font-bold">Refeições de Hoje</h2>
                  </div>
                  <div className="space-y-2">
                    {dailyMeals
                      .slice()
                      .sort((a, b) => a.meal_type.localeCompare(b.meal_type))
                      .map((m) => {
                        const label = m.meal_type === 'cafe_da_manha'
                          ? 'Cafe da manha'
                          : m.meal_type === 'almoco'
                            ? 'Almoco'
                            : m.meal_type === 'lanche_da_tarde'
                              ? 'Lanche'
                              : 'Jantar';
                        const consumed = !!m.consumed;
                        const busy = consumeBusyId === m.id;
                        return (
                          <div key={m.id} className="flex items-center justify-between rounded border bg-background px-3 py-2">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden border">
                                {m.recipe_image_url ? (
                                  <Image
                                    src={m.recipe_image_url}
                                    alt={m.recipe_name || label}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                ) : <div className="w-12 h-12 bg-muted" />}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{label} • {m.recipe_name || 'Receita'}</div>
                                <div className="text-xs text-muted-foreground">{m.calories} kcal</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {consumed ? (
                                <Button size="sm" variant="outline" className="text-muted-foreground btn-wide" disabled>✅ Consumido</Button>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    className="btn-wide"
                                    disabled={busy}
                                    onClick={async () => {
                                      if (busy) return;
                                      setConsumeBusyId(m.id);
                                      try {
                                        const r = await fetch(`/api/daily-meals/${encodeURIComponent(m.id)}/consume`, { method: 'PATCH' });
                                        if (r.ok) {
                                          try {
                                            const r2 = await fetch('/api/daily-meals/today', { cache: 'no-store' });
                                            if (r2.ok) {
                                              const j2 = await r2.json();
                                              const items2 = Array.isArray(j2?.items) ? j2.items : [];
                                              const normalized2: DailyMealItem[] = items2.map((it: any) => ({
                                                id: String(it.id),
                                                recipe_id: String(it.recipe_id),
                                                meal_type: String(it.meal_type) as DailyMealItem['meal_type'],
                                                calories: Number(it.calories || 0),
                                                date: String(it.date || ''),
                                                consumed: !!it.consumed,
                                                recipe_name: it.recipe_name || null,
                                                recipe_image_url: it.recipe_image_url || null,
                                              }));
                                              setDailyMeals(normalized2);
                                            }
                                          } catch {}
                                          try {
                                            const res = await fetch('/api/perfil/calorias/me', { cache: 'no-store' });
                                            if (res.ok) {
                                              const j = await res.json();
                                              const consumedK = Number(j?.today?.calorias_consumidas || 0);
                                              const goal = Number(j?.today?.meta_diaria || 0);
                                              const percent = goal ? Math.round((consumedK / goal) * 100) : 0;
                                              const water = Number(j?.today?.agua_ml || 0);
                                              setKcalToday({ consumed: consumedK, goal, percent, water });
                                            }
                                          } catch {}
                                        }
                                      } catch {}
                                      setConsumeBusyId(null);
                                    }}
                                  >
                                    {busy ? 'Consumindo...' : 'Comer agora'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="btn-wide border-primary text-primary"
                                    disabled={!!swapBusyId || busy}
                                    onClick={async () => {
                                      if (swapBusyId) return;
                                      const beforeRecipeId = m.recipe_id;
                                      setSwapBusyId(m.id);
                                      setSwapErrorId(null);
                                      setSwapError(null);
                                      try {
                                        const r = await fetch(`/api/daily-meals/${encodeURIComponent(m.id)}/swap`, { method: 'PATCH' });
                                        if (!r.ok) {
                                          try {
                                            const j = await r.json();
                                            setSwapErrorId(m.id);
                                            setSwapError(j?.error ? String(j.error) : 'Falha ao trocar refeição');
                                          } catch {
                                            setSwapErrorId(m.id);
                                            setSwapError('Falha ao trocar refeição');
                                          }
                                        } else {
                                          try {
                                            const r2 = await fetch('/api/daily-meals/today', { cache: 'no-store' });
                                            if (r2.ok) {
                                              const j2 = await r2.json();
                                              const items2 = Array.isArray(j2?.items) ? j2.items : [];
                                              const normalized2: DailyMealItem[] = items2.map((it: any) => ({
                                                id: String(it.id),
                                                recipe_id: String(it.recipe_id),
                                                meal_type: String(it.meal_type) as DailyMealItem['meal_type'],
                                                calories: Number(it.calories || 0),
                                                date: String(it.date || ''),
                                                consumed: !!it.consumed,
                                                recipe_name: it.recipe_name || null,
                                                recipe_image_url: it.recipe_image_url || null,
                                              }));
                                              const updatedItem = normalized2.find((x) => x.id === m.id);
                                              if (updatedItem && updatedItem.recipe_id === beforeRecipeId) {
                                                setSwapErrorId(m.id);
                                                setSwapError('Nenhuma alternativa disponível para esta refeição');
                                              }
                                              setDailyMeals(normalized2);
                                            }
                                          } catch {}
                                        }
                                      } catch {
                                        setSwapErrorId(m.id);
                                        setSwapError('Falha ao trocar refeição');
                                      }
                                      setSwapBusyId(null);
                                    }}
                                  >
                                    {swapBusyId === m.id ? 'Trocando...' : 'Trocar'}
                                  </Button>
                                </>
                              )}
                            </div>
                            {swapErrorId === m.id && swapError ? (
                              <div className="text-[11px] text-red-500 mt-1">{swapError}</div>
                            ) : null}
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
            {dailyMeals.length === 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <AlarmClock className="w-6 h-6 text-primary" />
                    <h2 className="font-headline text-xl md:text-2xl font-bold">Refeições de Hoje</h2>
                  </div>
                  <div className="rounded border bg-background p-4">
                    <div className="font-headline text-base mb-1">Você ainda não tem refeições geradas para hoje</div>
                    <div className="text-xs text-muted-foreground mb-3">
                      Gere um plano baseado na sua meta diária de calorias e veja as quatro refeições do dia.
                    </div>
                    {generateError && (
                      <div className="text-xs text-red-500 mb-2">{generateError}</div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary btn-wide"
                      disabled={generateBusy}
                      onClick={async () => {
                        if (generateBusy) return;
                        setGenerateBusy(true);
                        setGenerateError(null);
                        try {
                          const r = await fetch('/api/daily-meals/generate', { method: 'POST' });
                          if (!r.ok) {
                            try {
                              const j = await r.json();
                              setGenerateError(j?.error ? String(j.error) : 'Falha ao gerar refeições');
                            } catch {
                              setGenerateError('Falha ao gerar refeições');
                            }
                          } else {
                            try {
                              const r2 = await fetch('/api/daily-meals/today', { cache: 'no-store' });
                              if (r2.ok) {
                                const j2 = await r2.json();
                                const items2 = Array.isArray(j2?.items) ? j2.items : [];
                                const normalized2: DailyMealItem[] = items2.map((it: any) => ({
                                  id: String(it.id),
                                  recipe_id: String(it.recipe_id),
                                  meal_type: String(it.meal_type) as DailyMealItem['meal_type'],
                                  calories: Number(it.calories || 0),
                                  date: String(it.date || ''),
                                  consumed: !!it.consumed,
                                  recipe_name: it.recipe_name || null,
                                  recipe_image_url: it.recipe_image_url || null,
                                }));
                                setDailyMeals(normalized2);
                              }
                            } catch {}
                            try {
                              const res = await fetch('/api/perfil/calorias/me', { cache: 'no-store' });
                              if (res.ok) {
                                const j = await res.json();
                                const consumedK = Number(j?.today?.calorias_consumidas || 0);
                                const goal = Number(j?.today?.meta_diaria || 0);
                                const percent = goal ? Math.round((consumedK / goal) * 100) : 0;
                                const water = Number(j?.today?.agua_ml || 0);
                                setKcalToday({ consumed: consumedK, goal, percent, water });
                              }
                            } catch {}
                          }
                        } catch {
                          setGenerateError('Falha ao gerar refeições');
                        }
                        setGenerateBusy(false);
                      }}
                    >
                      {generateBusy ? 'Gerando...' : 'Gerar refeições de hoje'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}


            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlarmClock className="w-6 h-6 text-primary" />
                  <h2 className="font-headline text-xl md:text-2xl font-bold">Calendário Mensal</h2>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {monthDots.map((d, idx) => (
                    <div key={`${d.dateKey}-${idx}`} className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${d.color === 'green' ? 'bg-green-500' : d.color === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                      <span className="text-[10px] text-muted-foreground mt-1">{d.dateKey.slice(-2)}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Verde: refeições completas + treino. Amarelo: parcial. Vermelho: nenhuma ação.</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  <h2 className="font-headline text-xl md:text-2xl font-bold">Registro de Treino</h2>
                </div>
                <div className="rounded border bg-background p-3">
                  <div className="font-semibold mb-2">Foto do Treino do Dia</div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary cursor-pointer">
                      <Camera className="w-3 h-3" />
                      <span>Foto agora</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const dataUrl = reader.result as string;
                            await onHabit('training', 'camera', dataUrl);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <label className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary cursor-pointer">
                      <ImageIcon className="w-3 h-3" />
                      <span>Galeria</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const dataUrl = reader.result as string;
                            await onHabit('training', 'gallery', dataUrl);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <button
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted text-foreground"
                      onClick={() => onHabit('training', 'none')}
                    >
                      <CheckCircle className="w-3 h-3" />
                      Sem foto
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">A pontuação só contabiliza uma vez por dia.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  <h2 className="font-headline text-xl md:text-2xl font-bold">Treino</h2>
                  {isAdmin && (
                    <div className="ml-auto flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary"
                        onClick={() => router.push('/treinos/mes')}
                      >
                        Treinos do mês
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary"
                        onClick={() => router.push('/admin/import')}
                      >
                        Subir Dia de Treino
                      </Button>
                    </div>
                  )}
                </div>
                {(() => {
                  const now = new Date();
                  let current: { id: number; title: string } = { id: 1, title: 'Treino' };
                  try {
                    const cln = parseInt(localStorage.getItem('current_lesson_number') || '0', 10) || 0;
                    const lcdRaw = localStorage.getItem('lesson_completed') || '{}';
                    const lcd = JSON.parse(lcdRaw) as Record<number, boolean>;
                    const active = cln && !lcd[cln];
                    const cldId = parseInt(localStorage.getItem('current_lesson_day_id') || '0', 10) || 0;
                    const arr = JSON.parse(localStorage.getItem('trainingDays') || '[]') as Array<{ id: number; title: string }>;
                    if (active && cldId && arr.length) {
                      const found = arr.find(a => a.id === cldId) || arr[0];
                      current = found || current;
                    } else if (arr.length) {
                      const idx = now.getDay() % arr.length;
                      current = arr[idx] || arr[0];
                    }
                  } catch {}
                  const title = String(current.title || 'Treino').includes('•') ? String(current.title).split('•').slice(1).join('•').trim() : String(current.title || 'Treino');
                  return (
                    <div className="rounded-xl border border-neutral-700 bg-[#121212] p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-headline text-lg">{title}</div>
                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded bg-primary/10 text-primary"
                            onClick={() => handleTrainingClick(current)}
                          >
                            Abrir treino
                          </button>
                          <label className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded bg-primary/10 text-primary cursor-pointer">
                            <Camera className="w-4 h-4" />
                            <span>Foto agora</span>
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = async () => {
                                  const dataUrl = reader.result as string;
                                  await onHabit('training', 'camera', dataUrl);
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          <label className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded bg-primary/10 text-primary cursor-pointer">
                            <ImageIcon className="w-4 h-4" />
                            <span>Galeria</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = async () => {
                                  const dataUrl = reader.result as string;
                                  await onHabit('training', 'gallery', dataUrl);
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                          <button
                            className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded bg-[#1a1a1a] text-white border border-neutral-700"
                            onClick={() => onHabit('training', 'none')}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Sem foto
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-300 mt-2">Complete os exercícios do grupo de hoje.</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h2 className="font-headline text-xl md:text-2xl font-bold">Receitas</h2>
                  {isAdmin && (
                    <div className="ml-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary"
                        onClick={() => router.push('/admin/import')}
                      >
                        Subir Dia de Receita
                      </Button>
                    </div>
                  )}
                </div>
                <Carousel opts={{ align: 'start', loop: false }} className="w-full">
                  <CarouselContent className="-ml-4">
                    {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
                      const rows = [
                        { label: 'Café da Manhã', tag: 'Café da Manhã', kcal: '200-250kcal' },
                        { label: 'Almoço', tag: 'Prato Principal', kcal: '350-400kcal' },
                        { label: 'Lanche', tag: 'Lanche', kcal: '250-300kcal' },
                        { label: 'Jantar', tag: 'Prato Principal', kcal: '200-350kcal' },
                      ];
                      const pickOptions = (tag: string) => {
                        const all = availableRecipes.filter(r => r.tags.includes(tag));
                        if (all.length === 0) return [];
                        const start = day % all.length;
                        const list = [];
                        for (let k = 0; k < Math.min(3, all.length); k++) {
                          list.push(all[(start + k) % all.length]);
                        }
                        return list;
                      };
                      const heroRecipe = [...rows].map(r => pickOptions(r.tag)[0]).find(Boolean);
                      const kcal = Number((heroRecipe as any)?.calorias_kcal ?? 250);
                      const pctSingle = kcalToday && kcalToday.goal ? Math.round((kcal / (kcalToday.goal || 1)) * 100) : 0;
                      return (
                        <CarouselItem key={`day-${day}`} className="pl-4 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/2">
                        <Card className="overflow-hidden h-full flex flex-col cursor-pointer" onClick={() => openDay(day)}>
                            <CardContent className="p-0">
                              <div className="relative h-28">
                                {heroRecipe ? (
                                  <Image
                                    src={toSafeSrc(heroRecipe.imageUrl)}
                                    alt={heroRecipe.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                    data-ai-hint={heroRecipe.imageHint}
                                  />
                                ) : (
                                  <div className="h-full w-full bg-muted" />
                                )}
                              </div>
                              <div className="p-3 bg-card">
                                <h3 className="font-headline text-sm leading-tight">DIA {day}</h3>
                                <div className="mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-primary text-primary btn-wide"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        await fetch('/api/perfil/calorias/consumir', {
                                          method: 'PATCH',
                                          headers: { 'content-type': 'application/json' },
                                          body: JSON.stringify({ calorias: kcal })
                                        });
                                        const res = await fetch('/api/perfil/calorias/me', { cache: 'no-store' });
                                        if (res.ok) {
                                          const j = await res.json();
                                          const consumed = Number(j?.today?.calorias_consumidas || 0);
                                          const goal = Number(j?.today?.meta_diaria || 0);
                                          const percent = goal ? Math.round((consumed / goal) * 100) : 0;
                                          const water = Number(j?.today?.agua_ml || 0);
                                          setKcalToday({ consumed, goal, percent, water });
                                          try { toast({ title: 'Adicionado!', description: `Hoje ${consumed}/${goal}kcal` }); } catch {}
                                          try {
                                            const dateKey = new Date().toISOString().slice(0, 10);
                                            const flag = localStorage.getItem(`chk_calorias_${dateKey}`) || '';
                                            if (goal > 0 && consumed / goal <= 1.1 && !flag) {
                                              const r2 = await fetch('/api/gamificacao/checkin/calorias', { method: 'POST' });
                                              try {
                                                const jr2 = await r2.json();
                                                if (jr2?.unlockedBadge?.nome) {
                                                  setBadgeModal({ open: true, nome: jr2.unlockedBadge.nome, emoji: jr2.unlockedBadge.emoji || '🎉' });
                                                  try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } }); } catch {}
                                                }
                                              } catch {}
                                              localStorage.setItem(`chk_calorias_${dateKey}`, '1');
                                              const g = await fetch('/api/gamificacao/streaks', { cache: 'no-store' });
                                              if (g.ok) {
                                                const gj = await g.json();
                                                setHeatmap(Array.isArray(gj?.heatmap_30dias) ? gj.heatmap_30dias : []);
                                                setBadges(Array.isArray(gj?.badges_desbloqueados) ? gj.badges_desbloqueados : []);
                                                setTargets(gj?.targets || targets);
                                                setCurrentStreak({
                                                  treino: Number(gj?.current?.treino || 0),
                                                  agua: Number(gj?.current?.agua || 0),
                                                  calorias: Number(gj?.current?.calorias || 0),
                                                });
                                              }
                                            }
                                          } catch {}
                                        }
                                      } catch {}
                                    }}
                                  >
                                    Comer agora (+{kcal} kcal{pctSingle ? ` • ${pctSingle}%` : ''})
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                {showFirstSteps && (
                  <div className="rounded border p-4 mb-4 bg-primary/5">
                    <div className="font-headline text-lg mb-1">Primeiros Passos</div>
                    <div className="text-sm text-muted-foreground">1) Configure sua meta de calorias em /perfil</div>
                    <div className="text-sm text-muted-foreground mb-2">2) Registre água ou treino hoje e ganhe seu primeiro badge</div>
                    <div className="text-[11px] text-muted-foreground mb-3">Se você voltar após 7 dias sem check‑ins, este lembrete poderá aparecer novamente para te ajudar a retomar sua jornada.</div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="border-primary text-primary" onClick={() => { window.location.href = '/perfil'; }}>
                        Ir para /perfil
                      </Button>
                      <Button size="sm" variant="outline" className="border-primary text-primary"
                        onClick={async () => {
                          try {
                            await fetch('/api/perfil/calorias/agua', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ml: 1000 }) });
                            try { await fetch('/api/gamificacao/checkin/agua', { method: 'POST' }); } catch {}
                            const res = await fetch('/api/perfil/calorias/me', { cache: 'no-store' });
                            if (res.ok) {
                              const j = await res.json();
                              const consumed = Number(j?.today?.calorias_consumidas || 0);
                              const goal = Number(j?.today?.meta_diaria || 0);
                              const percent = goal ? Math.round((consumed / goal) * 100) : 0;
                              const water = Number(j?.today?.agua_ml || 0);
                              setKcalToday({ consumed, goal, percent, water });
                              try { toast({ title: 'Adicionado!', description: `Hoje ${consumed}/${goal}kcal • ${water}ml` }); } catch {}
                              const nowIso = new Date().toISOString();
                              localStorage.setItem('onboarding_done', '1');
                              localStorage.setItem('onboarding_done_at', nowIso);
                              try {
                                // start weekly challenge if not started
                                const wcRaw = localStorage.getItem('weekly_challenge');
                                if (!wcRaw) {
                                  const g = await fetch('/api/gamificacao/streaks', { cache: 'no-store' });
                                  const gj = g.ok ? await g.json() : null;
                                  const base = Number(gj?.current_global_streak || 1);
                                  const obj = { baseline: base, startedAt: nowIso, doneUntil: null };
                                  localStorage.setItem('weekly_challenge', JSON.stringify(obj));
                                  setWeeklyChallenge(obj as any);
                                }
                              } catch {}
                              setShowFirstSteps(false);
                            }
                            try {
                              const g2 = await fetch('/api/gamificacao/streaks', { cache: 'no-store' });
                              if (g2.ok) {
                                const gj = await g2.json();
                                setHeatmap(Array.isArray(gj?.heatmap_30dias) ? gj.heatmap_30dias : []);
                                setBadges(Array.isArray(gj?.badges_desbloqueados) ? gj.badges_desbloqueados : []);
                                setTargets(gj?.targets || targets);
                                setCurrentStreak({
                                  treino: Number(gj?.current?.treino || 0),
                                  agua: Number(gj?.current?.agua || 0),
                                  calorias: Number(gj?.current?.calorias || 0),
                                });
                                setGlobalStreak(Number(gj?.current_global_streak || 0));
                                setNextGoal(gj?.next_goal_days ?? null);
                              }
                            } catch {}
                          } catch {}
                        }}
                      >
                        Registrar 1L de água
                      </Button>
                      {trainToday.status === 'concluido' || trainToday.status === 'parcial' ? (
                        <Button size="sm" variant="outline" className="border-primary text-primary"
                          onClick={async () => {
                            try {
                              const r = await fetch('/api/gamificacao/checkin/treino', { method: 'POST' });
                              let unlocked = null as any;
                              try {
                                const jr = await r.json();
                                unlocked = jr?.unlockedBadge;
                              } catch {}
                              const g = await fetch('/api/gamificacao/streaks', { cache: 'no-store' });
                              if (g.ok) {
                                const gj = await g.json();
                                setHeatmap(Array.isArray(gj?.heatmap_30dias) ? gj.heatmap_30dias : []);
                                setBadges(Array.isArray(gj?.badges_desbloqueados) ? gj.badges_desbloqueados : []);
                                setTargets(gj?.targets || targets);
                                setCurrentStreak({
                                  treino: Number(gj?.current?.treino || 0),
                                  agua: Number(gj?.current?.agua || 0),
                                  calorias: Number(gj?.current?.calorias || 0),
                                });
                                setGlobalStreak(Number(gj?.current_global_streak || 0));
                                setNextGoal(gj?.next_goal_days ?? null);
                              }
                              if (unlocked?.nome) {
                                setBadgeModal({ open: true, nome: unlocked.nome, emoji: unlocked.emoji || '🎉' });
                                try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } }); } catch {}
                              }
                              const nowIso = new Date().toISOString();
                              localStorage.setItem('onboarding_done', '1');
                              localStorage.setItem('onboarding_done_at', nowIso);
                              try {
                                const wcRaw = localStorage.getItem('weekly_challenge');
                                if (!wcRaw) {
                                  const g = await fetch('/api/gamificacao/streaks', { cache: 'no-store' });
                                  const gj = g.ok ? await g.json() : null;
                                  const base = Number(gj?.current_global_streak || 1);
                                  const obj = { baseline: base, startedAt: nowIso, doneUntil: null };
                                  localStorage.setItem('weekly_challenge', JSON.stringify(obj));
                                  setWeeklyChallenge(obj as any);
                                }
                              } catch {}
                              setShowFirstSteps(false);
                            } catch {}
                          }}
                        >
                          Registrar treino de hoje
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-headline text-2xl md:text-3xl font-bold">🔥 {globalStreak} dias seguidos</h2>
                  {nextGoal ? (
                    <div className="text-sm text-muted-foreground">Próxima meta: {nextGoal} dias</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Continue assim!</div>
                  )}
                </div>
                <div className="h-px bg-border my-3" />
                {(() => {
                  // Weekly challenge card (fase 1 – simples)
                  try {
                    const wc = weeklyChallenge;
                    let show = false;
                    let progress = 0;
                    let completed = false;
                    if (wc && typeof wc.baseline === 'number') {
                      progress = Math.max(0, globalStreak - wc.baseline + 1);
                      completed = progress >= 7;
                      const now = new Date();
                      const doneUntil = wc?.doneUntil ? new Date(wc.doneUntil) : null;
                      // Show if not completed yet OR completed but window expired
                      show = !doneUntil || now > doneUntil;
                    }
                    if (!show || !wc) return null;
                    const pct = Math.min(100, Math.round((Math.min(progress, 7) / 7) * 100));
                    return (
                      <div className="rounded border p-4 mb-4 bg-primary/5 relative">
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] bg-orange-500 text-white">BETA</span>
                        <div className="font-headline text-lg mb-1">Desafios Semanais</div>
                        <div className="text-sm font-semibold">Desafio da Semana: 7 Dias Seguidos</div>
                        <div className="text-xs text-muted-foreground mb-2">Complete 7 dias seguidos de check‑in (treino, água ou calorias) e ganhe o badge ‘7 Dias Seguidos’ (🔥).</div>
                        <div className="text-xs mb-1">{Math.min(progress,7)}/7</div>
                        <div className="h-2 rounded bg-neutral-800 overflow-hidden mb-2">
                          <div className="h-2 bg-green-600" style={{ width: `${pct}%` }} />
                        </div>
                        {completed ? (
                          <div className="text-xs text-green-500">Concluído! Volta na próxima semana.</div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Mantenha check‑ins diários até completar 7/7.</div>
                        )}
                      </div>
                    );
                  } catch { return null; }
                })()}
                <div className="rounded border p-4 home-card mb-4 bg-primary/5 relative">
                  <div className="font-headline text-lg mb-1">Jogador Nutricional</div>
                  <button
                    aria-label="Compartilhar"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      try {
                        const appUrl = (process?.env?.NEXT_PUBLIC_APP_URL as string) || 'https://seuapp.vercel.app';
                        const txt = [
                          'Meu progresso na Dieta Verde! 🔥',
                          '',
                          `${globalStreak} dias seguidos`,
                          `${badges.length} badges desbloqueados`,
                          `${pointsMonth} pontos este mês`,
                          '',
                          `Junte‑se a mim: ${appUrl}`
                        ].join('\n');
                        setShareOpen({ open: true, title: 'Compartilhar Progresso', text: txt });
                      } catch {}
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <div className="text-sm font-semibold">🔥 {globalStreak} dias seguidos</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Próxima meta: {nextGoal ? `${nextGoal} dias` : 'continue acumulando streaks'}
                  </div>
                  <div className="text-xs">
                    Badges desbloqueados: <span className="font-semibold">{badges.length}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {pointsToday} pontos hoje • {pointsMonth} no mês • {pointsYear} no ano
                  </div>
                  {nextGoal ? (() => {
                    const pct = Math.min(100, Math.round((globalStreak / nextGoal) * 100));
                    return (
                      <div className="mt-3">
                        <div className="h-2 rounded bg-neutral-800 overflow-hidden">
                          <div className="h-2 bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Progresso até {nextGoal} dias: {Math.min(globalStreak, nextGoal)}/{nextGoal}
                        </div>
                      </div>
                    );
                  })() : null}
                </div>
                <div className="rounded border p-4 home-card mb-4 bg-primary/5">
                  <div className="font-headline text-lg mb-1">Seu Progresso</div>
                  <div className="text-sm">
                    {initialWeightKg != null && weightKg != null
                      ? (() => {
                          const delta = Number((weightKg - initialWeightKg).toFixed(1));
                          const sign = delta > 0 ? '+' : '';
                          return <>Desde o início: {sign}{delta} kg</>;
                        })()
                      : 'Sem peso inicial registrado'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {withinGoalPct != null ? `${withinGoalPct}% dos dias você manteve calorias dentro da meta.` : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {trainDaysWeek != null ? `Você fez treino em ${trainDaysWeek} de 7 dias esta semana.` : '—'}
                  </div>
                </div>
                {tipOfDay && (
                  <div className="rounded border p-4 mb-4 bg-primary/5 text-center">
                    <div className="text-sm">{tipOfDay}</div>
                  </div>
                )}
                <div className="rounded border p-4 mb-4 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="font-headline text-lg">Diário Semanal</div>
                    <Button size="sm" variant="outline" className="border-primary text-primary" onClick={() => setWeeklyOpen(o => !o)}>
                      {weeklyOpen ? 'Ocultar' : 'Ver semana'}
                    </Button>
                  </div>
                  {weeklyOpen && (
                    weeklyDays.length > 0 ? (
                      <div className="mt-3 space-y-1">
                        {weeklyDays.map((d, idx) => {
                          const dt = new Date(d.date);
                          const dd = String(dt.getDate()).padStart(2, '0');
                          const mm = String(dt.getMonth() + 1).padStart(2, '0');
                          return (
                            <div key={`${d.date}-${idx}`} className="flex items-center justify-between rounded border bg-background px-3 py-2 text-xs">
                              <div className="w-28">{d.label} {dd}/{mm}</div>
                              <div className="flex-1 grid grid-cols-4 gap-2">
                                <div title={d.treino ? 'Treino realizado' : 'Sem treino'}>{d.treino ? '🔥 1 treino' : '⭕ 0 treino'}</div>
                                <div title={d.agua ? 'Água ok (meta)' : 'Água baixa'}>{d.agua ? '💧 ok' : '🥛 baixo'}</div>
                                <div title={d.caloriasOk ? 'Dentro da meta' : 'Acima da meta'}>{d.caloriasOk ? '✅ meta' : '❌ meta'}</div>
                                <div title="Pontos por refeições">{`💎 ${d.points}`}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-muted-foreground">Sem dados da semana ainda. Continue usando o app.</div>
                    )
                  )}
                </div>
                <div className="rounded border p-4 home-card mb-4 bg-primary/5">
                  <div className="font-headline text-lg mb-1">Pontos</div>
                  <div className="text-xs text-muted-foreground">Diário: <span className="text-foreground font-semibold">{pointsToday}</span> • Mês: <span className="text-foreground font-semibold">{pointsMonth}</span> • Ano: <span className="text-foreground font-semibold">{pointsYear}</span></div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  <h2 className="font-headline text-xl md:text-2xl font-bold">Streaks & Badges</h2>
                </div>
                {(() => {
                  const days = [...heatmap].sort((a, b) => a.date.localeCompare(b.date));
                  const cells = days.map((d, idx) => {
                    const anyDone = d.treino || d.agua || d.calorias;
                    return (
                      <div key={`${d.date}-${idx}`} className={`h-10 rounded flex items-center justify-center text-xs ${anyDone ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                        <span>{d.treino ? '🔥' : ''}{d.agua ? '💧' : ''}{d.calorias ? '🥗' : ''}</span>
                      </div>
                    );
                  });
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-7 gap-2">
                        {cells}
                      </div>
                      <div className="mt-2 overflow-x-auto">
                        <div className="flex gap-3">
                          <div className="min-w-[180px] rounded border p-3">
                            <div className="text-xl">🔥</div>
                            <div className="text-sm font-semibold">7 Dias Treino</div>
                            <div className="text-xs text-muted-foreground">{currentStreak.treino}/{targets.treino} streak</div>
                            {(() => {
                              const dateKey = new Date().toISOString().slice(0, 10);
                              const checked = (typeof window !== 'undefined') ? !!localStorage.getItem(`chk_treino_${dateKey}`) : false;
                              return (
                                <div className="mt-2">
                                  {!checked && (
                                    <>
                                      {trainToday.status === 'concluido' && (
                                        <Button
                                          size="sm"
                                          className="bg-green-600 text-white"
                                          onClick={async () => {
                                            try {
                                              const r = await fetch('/api/gamificacao/checkin/treino', { method: 'POST' });
                                              let unlocked = null as any;
                                              try {
                                                const jr = await r.json();
                                                unlocked = jr?.unlockedBadge;
                                              } catch {}
                                              localStorage.setItem(`chk_treino_${dateKey}`, '1');
                                              const g = await fetch('/api/gamificacao/streaks', { cache: 'no-store' });
                                              if (g.ok) {
                                                const gj = await g.json();
                                                setHeatmap(Array.isArray(gj?.heatmap_30dias) ? gj.heatmap_30dias : []);
                                                setBadges(Array.isArray(gj?.badges_desbloqueados) ? gj.badges_desbloqueados : []);
                                                setTargets(gj?.targets || targets);
                                                setCurrentStreak({
                                                  treino: Number(gj?.current?.treino || 0),
                                                  agua: Number(gj?.current?.agua || 0),
                                                  calorias: Number(gj?.current?.calorias || 0),
                                                });
                                              }
                                              if (unlocked?.nome) {
                                                setBadgeModal({ open: true, nome: unlocked.nome, emoji: unlocked.emoji || '🎉' });
                                                try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } }); } catch {}
                                              }
                                            } catch {}
                                          }}
                                        >
                                          Check-in ✓
                                        </Button>
                                      )}
                                      {trainToday.status === 'parcial' && (
                                        <Button
                                          size="sm"
                                          className="bg-yellow-500 text-black"
                                          onClick={() => {
                                            try {
                                              const now = new Date();
                                              const raw = localStorage.getItem('trainingDays');
                                              const arr = raw ? JSON.parse(raw) as Array<{ id: number; title: string }> : [];
                                              const idx = (now.getDay() % (arr.length || 1));
                                              const targetId = arr.length ? arr[idx].id : 1;
                                              window.location.href = `/training/day/${targetId}`;
                                            } catch {
                                              window.location.href = `/training/day/1`;
                                            }
                                          }}
                                        >
                                          Conclua primeiro →
                                        </Button>
                                      )}
                                      {trainToday.status === 'nenhum' && (
                                        <Button size="sm" variant="outline" className="text-muted-foreground" disabled>Sem treino hoje</Button>
                                      )}
                                      <div className="text-[11px] text-muted-foreground mt-1">
                                        <span title="Baseado training_day_progress">Detectado treino hoje via progresso</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                          <div className="min-w-[180px] rounded border p-3">
                            <div className="text-xl">💧</div>
                            <div className="text-sm font-semibold">Água 30 Dias</div>
                            <div className="text-xs text-muted-foreground">{currentStreak.agua}/{targets.agua} streak</div>
                          </div>
                          <div className="min-w-[180px] rounded border p-3">
                            <div className="text-xl">🥗</div>
                            <div className="text-sm font-semibold">Calorias 22 Dias</div>
                            <div className="text-xs text-muted-foreground">{currentStreak.calorias}/{targets.calorias} streak</div>
                          </div>
                          {badges.map((b, i) => (
                            <div key={`${b.nome}-${i}`} className="min-w-[180px] rounded border p-3 bg-primary/5">
                              <div className="text-xl">{b.emoji}</div>
                              <div className="text-sm font-semibold">{b.nome}</div>
                              <div className="text-xs text-muted-foreground">Desbloqueado</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <Dialog open={badgeModal.open} onOpenChange={(o) => setBadgeModal(prev => ({ ...prev, open: o }))}>
              <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                  <DialogTitle>🎉 PARABÉNS!</DialogTitle>
                </DialogHeader>
                <div className="text-3xl my-2">{badgeModal.emoji}</div>
                <div className="text-lg font-semibold">{badgeModal.nome}</div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Parabéns! ${badgeModal.emoji} ${badgeModal.nome} no app!`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded border border-primary text-primary text-sm"
                  >
                    Compartilhar WhatsApp
                  </a>
                  <Button onClick={() => setBadgeModal(prev => ({ ...prev, open: false }))}>Fechar</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={shareOpen.open} onOpenChange={(o) => setShareOpen(prev => ({ ...prev, open: o }))}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{shareOpen.title || 'Compartilhar'}</DialogTitle>
                </DialogHeader>
                <div className="text-xs text-muted-foreground whitespace-pre-wrap mb-3">{shareOpen.text}</div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      try {
                        const encoded = encodeURIComponent(shareOpen.text || '');
                        const url = `https://wa.me/?text=${encoded}`;
                        window.open(url, '_blank');
                      } catch {}
                    }}
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      try {
                        const encoded = encodeURIComponent(shareOpen.text || '');
                        const url = `https://www.instagram.com/?url=${encoded}`;
                        if (navigator.share) {
                          navigator.share({ text: shareOpen.text || '' }).catch(() => window.open(url, '_blank'));
                        } else {
                          window.open(url, '_blank');
                        }
                      } catch {}
                    }}
                  >
                    Instagram
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareOpen.text || '');
                        try { toast({ title: 'Copiado!', description: 'Texto copiado para compartilhar.' }); } catch {}
                      } catch {}
                    }}
                  >
                    Copiar texto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={onboardingOpen} onOpenChange={(o) => { setOnboardingOpen(o); if (!o) try { localStorage.setItem('onboarding_meta_dismissed', '1'); } catch {} }}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Bem-vindo!</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">Vamos configurar sua meta diária para acompanhar calorias e água.</p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => { setOnboardingOpen(false); try { localStorage.setItem('onboarding_meta_dismissed', '1'); } catch {} }}>Agora não</Button>
                  <Button onClick={() => { window.location.href = '/perfil'; }}>Configurar meta</Button>
                </div>
              </DialogContent>
            </Dialog>

            {(() => {
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                try {
                  if (process.env.NODE_ENV === 'production') {
                    navigator.serviceWorker.register('/sw.js');
                  } else {
                    navigator.serviceWorker.getRegistrations?.().then((regs) => {
                      regs.forEach(r => r.unregister());
                    }).catch(() => {});
                  }
                } catch {}
              }
              return null;
            })()}

            <Sheet open={isWaterSheetOpen} onOpenChange={setIsWaterSheetOpen}>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Água • DIA {selectedWaterDay ?? ''}</SheetTitle>
                  <SheetDescription>Registre a ingestão de água com foto e quantidade em ml.</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                  <div className="rounded border bg-background p-3">
                    <div className="font-semibold">Meta diária</div>
                    <div className="text-sm text-muted-foreground">{(userProfile.waterGoalMl || 2000)} ml</div>
                  </div>
                  <div className="space-y-2">
                    {waterEntries.map((entry, idx) => (
                      <div key={idx} className="rounded border bg-background p-3 flex items-center gap-2">
                        <label className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary cursor-pointer">
                          <Camera className="w-3 h-3" />
                          <span>Foto agora</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const dataUrl = reader.result as string;
                                const next = [...waterEntries];
                                next[idx] = { ...next[idx], type: 'camera', imageDataUrl: dataUrl };
                                saveWaterEntries(selectedWaterDay ?? 1, next);
                                await onHabit('water', 'camera', dataUrl, next[idx].ml);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                        <label className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary cursor-pointer">
                          <ImageIcon className="w-3 h-3" />
                          <span>Galeria</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const dataUrl = reader.result as string;
                                const next = [...waterEntries];
                                next[idx] = { ...next[idx], type: 'gallery', imageDataUrl: dataUrl };
                                saveWaterEntries(selectedWaterDay ?? 1, next);
                                await onHabit('water', 'gallery', dataUrl, next[idx].ml);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                        <button
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted text-foreground"
                          onClick={async () => {
                            const next = [...waterEntries];
                            next[idx] = { ...next[idx], type: 'none' };
                            saveWaterEntries(selectedWaterDay ?? 1, next);
                            await onHabit('water', 'none', undefined, next[idx].ml);
                          }}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Sem foto
                        </button>
                        <input
                          type="number"
                          min={0}
                          placeholder="ml"
                          className="w-24 border rounded p-1 text-sm"
                          value={entry.ml}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10) || 0;
                            const next = [...waterEntries];
                            next[idx] = { ...next[idx], ml: v };
                            saveWaterEntries(selectedWaterDay ?? 1, next);
                          }}
                        />
                      </div>
                    ))}
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const next = [...waterEntries, { ml: 250, type: 'none' as const }];
                          saveWaterEntries(selectedWaterDay ?? 1, next);
                        }}
                      >
                        + Adicionar linha
                      </Button>
                    </div>
                  </div>
                  <div className="rounded border bg-background p-3">
                    <div className="font-semibold">Total consumido</div>
                    <div className="text-sm">
                      {waterEntries.reduce((sum, e) => sum + (e.ml || 0), 0)} ml
                      {' '}de {(userProfile.waterGoalMl || 2000)} ml (até {Math.floor((userProfile.waterGoalMl || 2000) * 1.5)} ml contabilizados)
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Sheet open={isTrainingSheetOpen} onOpenChange={setIsTrainingSheetOpen}>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Subir Treino</SheetTitle>
                  <SheetDescription>Adicione um dia de treino com vídeo e dicas.</SheetDescription>
                </SheetHeader>
                <div className="space-y-3 mt-4">
                  <input className="w-full border rounded p-2" placeholder="Título" value={trainingForm.title} onChange={e => setTrainingForm({ ...trainingForm, title: e.target.value })} />
                  <input className="w-full border rounded p-2" placeholder="URL do Vídeo" value={trainingForm.videoUrl} onChange={e => setTrainingForm({ ...trainingForm, videoUrl: e.target.value })} />
                  <textarea className="w-full border rounded p-2" rows={4} placeholder="Dicas (uma por linha)" value={trainingForm.tips} onChange={e => setTrainingForm({ ...trainingForm, tips: e.target.value })} />
                  <input className="w-full border rounded p-2" placeholder="Vincular receita (número, opcional)" value={trainingForm.recipeNumber} onChange={e => setTrainingForm({ ...trainingForm, recipeNumber: e.target.value })} />
                  <div className="flex justify-end">
                    <Button onClick={submitTrainingForm}>Salvar Treino</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet open={isDaySheetOpen} onOpenChange={setIsDaySheetOpen}>
              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>DIA {selectedDay ?? ''} • Alimentação - 1300kcal</SheetTitle>
                  <SheetDescription>Escolha a opção de cada refeição e faça seu check-in.</SheetDescription>
                </SheetHeader>
                <div className="flex items-center justify-between mb-3">
                  <Button variant="ghost" size="sm" onClick={() => setIsDaySheetOpen(false)} aria-label="Voltar">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setIsDaySheetOpen(false); try { window.location.href = '/'; } catch {} }} aria-label="Início">
                    <Home className="w-4 h-4 mr-1" />
                    Início
                  </Button>
                </div>
                <div className="mt-4 rounded-lg border bg-card overflow-hidden">
                  <div className="grid grid-cols-1 gap-px bg-border">
                    {Object.entries(dayMealNames).map(([mealLabel, names]) => {
                      const cellBase = "bg-background p-3";
                      return (
                        <React.Fragment key={mealLabel}>
                          <div className={cellBase}>
                            <div className="font-semibold">{mealLabel}</div>
                            <div className="mt-2 flex items-center gap-2">
                              <label className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary cursor-pointer">
                                <Camera className="w-3 h-3" />
                                <span>Foto agora</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = async () => {
                                      const dataUrl = reader.result as string;
                                      await onCheckin(selectedDay ?? 1, mealLabel, 'camera', dataUrl);
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                              <label className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary cursor-pointer">
                                <ImageIcon className="w-3 h-3" />
                                <span>Galeria</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = async () => {
                                      const dataUrl = reader.result as string;
                                      await onCheckin(selectedDay ?? 1, mealLabel, 'gallery', dataUrl);
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                              <button
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted text-foreground"
                                onClick={() => onCheckin(selectedDay ?? 1, mealLabel, 'none')}
                              >
                                <CheckCircle className="w-3 h-3" />
                                Sem foto
                              </button>
                            </div>
                          </div>
                          <div className={cellBase}>
                            <ul className="space-y-2">
                              {names.map((nm) => (
                                <li key={nm}>
                                  <button
                                    className="flex items-center gap-2 w-full text-left hover:text-primary"
                                    onClick={() => handleChooseDayRecipe(selectedDay ?? 1, mealLabel, nm)}
                                  >
                                    <div className="relative w-7 h-7 flex-shrink-0 rounded overflow-hidden border">
                                      <Image
                                        src="/images/sweetpotato.png"
                                        alt={nm}
                                        fill
                                        className="object-cover"
                                        sizes="28px"
                                      />
                                    </div>
                                    <span className="text-sm">{nm}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className={cellBase}>
                            <div className="text-sm text-muted-foreground text-center">
                              {mealLabel === 'Café da Manhã' ? '200-250kcal' :
                               mealLabel === 'Almoço' ? '350-400kcal' :
                               mealLabel === 'Lanche' ? '250-300kcal' :
                               '200-350kcal'}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Sheet open={isRecipeSheetOpen} onOpenChange={setIsRecipeSheetOpen}>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Subir Receita</SheetTitle>
                  <SheetDescription>Preencha os campos para publicar uma receita.</SheetDescription>
                </SheetHeader>
                <div className="space-y-3 mt-4">
                  <input className="w-full border rounded p-2" placeholder="Nome" value={recipeForm.name} onChange={e => setRecipeForm({ ...recipeForm, name: e.target.value })} />
                  <input className="w-full border rounded p-2" placeholder="URL da Imagem" value={recipeForm.imageUrl} onChange={e => setRecipeForm({ ...recipeForm, imageUrl: e.target.value })} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className="w-full border rounded p-2" type="number" min={1} placeholder="Porções" value={recipeForm.portions} onChange={e => setRecipeForm({ ...recipeForm, portions: parseInt(e.target.value, 10) || 1 })} />
                    <input className="w-full border rounded p-2" placeholder="Temperatura" value={recipeForm.temperature} onChange={e => setRecipeForm({ ...recipeForm, temperature: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="w-full border rounded p-2" type="number" min={0} placeholder="Tempo de preparo (min)" value={recipeForm.prepMinutes} onChange={e => setRecipeForm({ ...recipeForm, prepMinutes: parseInt(e.target.value, 10) || 0 })} />
                    <input className="w-full border rounded p-2" type="number" min={0} placeholder="Cozimento (min)" value={recipeForm.cookMinutes} onChange={e => setRecipeForm({ ...recipeForm, cookMinutes: parseInt(e.target.value, 10) || 0 })} />
                  </div>
                  <input className="w-full border rounded p-2" type="number" min={0} placeholder="Proteína (g)" value={recipeForm.proteinGrams} onChange={e => setRecipeForm({ ...recipeForm, proteinGrams: parseInt(e.target.value, 10) || 0 })} />
                  <textarea className="w-full border rounded p-2" rows={4} placeholder="Ingredientes (uma linha por ingrediente, começando com quantidade)" value={recipeForm.ingredientsText} onChange={e => setRecipeForm({ ...recipeForm, ingredientsText: e.target.value })} />
                  <textarea className="w-full border rounded p-2" rows={4} placeholder="Modo de preparo (uma etapa por linha)" value={recipeForm.stepsText} onChange={e => setRecipeForm({ ...recipeForm, stepsText: e.target.value })} />
                  <div className="flex justify-end">
                    <Button onClick={submitRecipeForm}>Publicar Receita</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
        </div>
      </main>
    </div>
  );
}
