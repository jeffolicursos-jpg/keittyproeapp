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
import { PlayCircle, Dumbbell, BookOpen, Camera, Image as ImageIcon, CheckCircle, ArrowLeft, Home } from 'lucide-react';
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
  const handleTrainingClick = (td: TrainingDay) => {
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
                <p className="mt-3 text-xs text-muted-foreground">Verde: refeições completas + treino + água. Amarelo: parcial. Vermelho: nenhuma ação.</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  <h2 className="font-headline text-xl md:text-2xl font-bold">Hábitos Diários</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'training', label: 'Registrar Treino' },
                    { key: 'diet', label: 'Dia de Dieta' },
                    { key: 'water', label: 'Beber Água' },
                    { key: 'habit', label: 'Hábito Diário' },
                  ].map((h) => (
                    <div key={h.key} className="rounded border bg-background p-3">
                      <div className="font-semibold mb-2">{h.label}</div>
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
                                await onHabit(h.key as any, 'camera', dataUrl);
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
                                await onHabit(h.key as any, 'gallery', dataUrl);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                        <button
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted text-foreground"
                          onClick={() => onHabit(h.key as any, 'none')}
                        >
                          <CheckCircle className="w-3 h-3" />
                          Sem foto
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Cada ação só contabiliza pontos uma vez por dia.</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h2 className="font-headline text-xl md:text-2xl font-bold">Água</h2>
                  <div className="ml-auto flex items-center">
                    <label className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-primary/10 text-primary cursor-pointer">
                      <ImageIcon className="w-3 h-3" />
                      <span>Alterar imagem</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            const dataUrl = reader.result as string;
                            setWaterThumb(dataUrl);
                            try { localStorage.setItem('water_thumb', dataUrl); } catch {}
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                </div>
                <Carousel opts={{ align: 'start', loop: false }} className="w-full">
                  <CarouselContent className="-ml-4">
                    {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                      <CarouselItem key={`water-day-${day}`} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                        <Card className="overflow-hidden cursor-pointer group transition-all duration-300 h-full flex flex-col hover:shadow-md" onClick={() => openWaterDay(day)}>
                          <CardContent className="p-3 flex-grow">
                            <div className="relative h-28">
                              {waterThumb ? (
                                <img src={waterThumb} alt={`Água DIA ${day}`} className="w-full h-full object-cover" />
                              ) : (
                                <Image
                                  src="/images/copinho-agua-azul.svg"
                                  alt={`Água DIA ${day}`}
                                  width={120}
                                  height={96}
                                  className="object-cover rounded-md"
                                  sizes="120px"
                                  data-ai-hint="glass of water"
                                />
                              )}
                            </div>
                            <h3 className="font-headline text-sm leading-tight mt-2">DIA {day}</h3>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>

            

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  <h2 className="font-headline text-xl md:text-2xl font-bold">Treino</h2>
                  <div className="ml-auto">
                    <Button size="sm" onClick={() => setIsTrainingSheetOpen(true)}>Subir Treino</Button>
                  </div>
                </div>
                <Carousel opts={{ align: 'start', loop: false }} className="w-full">
                  <CarouselContent className="-ml-4">
                    {trainingDays.map(td => (
                      <CarouselItem key={td.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                        <Card className="overflow-hidden cursor-pointer group transition-all duration-300 h-full flex flex-col hover:shadow-md" onClick={() => handleTrainingClick(td)}>
                          <CardContent className="p-3 flex-grow">
                            <div className="flex items-center gap-2 mb-2">
                              <PlayCircle className="w-5 h-5 text-primary" />
                              <span className="font-headline text-sm">{td.title}</span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-3">{td.tips}</p>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <h2 className="font-headline text-xl md:text-2xl font-bold">Receitas</h2>
                  <div className="ml-auto">
                    <Button size="sm" onClick={() => setIsRecipeSheetOpen(true)}>Subir Receita</Button>
                  </div>
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
