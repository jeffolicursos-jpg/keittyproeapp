'use client';

import { useState } from 'react';
import { achievements as allAchievements, type Achievement } from '@/app/achievements-data';
import type { UserProfile } from '@/app/gamification-data';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Lock, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import type { Recipe } from '@/app/data/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AchievementsTabProps {
  profile: UserProfile;
  recipes: Recipe[];
}

const ACHIEVEMENTS_PER_PAGE = 10;

export default function AchievementsTab({ profile, recipes }: AchievementsTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState<'Alimentação' | 'Treino' | 'Hidratação'>('Alimentação');

  const filteredAchievements = allAchievements.filter(a => (a.category ?? 'Alimentação') === category);
  const totalLevels = Math.max(1, Math.ceil(filteredAchievements.length / ACHIEVEMENTS_PER_PAGE));
  const startIndex = (currentPage - 1) * ACHIEVEMENTS_PER_PAGE;
  const endIndex = startIndex + ACHIEVEMENTS_PER_PAGE;
  const currentAchievements = filteredAchievements.slice(startIndex, endIndex);

  return (
    <div id="achievements-card">
      <div className="mb-4 flex flex-wrap gap-2">
        {(['Alimentação', 'Treino', 'Hidratação'] as const).map(cat => (
          <Button
            key={cat}
            variant={category === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setCategory(cat); setCurrentPage(1); }}
          >
            {cat}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {currentAchievements.map((achievement) => {
          const unlocked = achievement.isUnlocked(profile, recipes);
          return (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              isUnlocked={unlocked}
            />
          );
        })}
      </div>

      {/* Pagination Controls */}
      <div className="mt-8 flex justify-center items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalLevels }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                currentPage === index + 1 ? 'bg-primary w-5' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Ir para a página de conquistas ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(p => Math.min(totalLevels, p + 1))}
          disabled={currentPage === totalLevels}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
       <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">Página {currentPage} de {totalLevels}</p>
      </div>
    </div>
  );
}

interface AchievementCardProps {
  achievement: Omit<Achievement, 'isUnlocked'>;
  isUnlocked: boolean;
}

function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
  const Icon = achievement.icon;
  const { toast } = useToast();

  const handleShare = async () => {
    const category = achievement.category ?? 'Alimentação';
    const text = `Ganhei o selo "${achievement.title}" (${category}).`;
    const url = typeof window !== 'undefined' ? window.location.origin : undefined;
    try {
      if (navigator.share) {
        await navigator.share({
          title: achievement.title,
          text,
          url,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}${url ? ` ${url}` : ''}`);
        toast({ title: 'Selo copiado', description: 'Texto copiado para compartilhar.' });
      }
    } catch {
      toast({ title: 'Falha ao compartilhar', description: 'Tente novamente mais tarde.' });
    }
  };

  return (
    <Card className={cn(
      "p-4 flex items-center gap-4 transition-all duration-300",
      isUnlocked ? 'bg-amber-50 border-amber-300 shadow-sm' : 'bg-muted/40'
    )}>
      <div className={cn(
        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
        isUnlocked ? 'bg-amber-400 text-white' : 'bg-muted-foreground/20 text-muted-foreground/60'
      )}>
        {isUnlocked ? <Icon className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
      </div>
      <div className="flex-1">
        <h3 className={cn(
          "font-headline font-semibold",
          isUnlocked ? 'text-amber-800' : 'text-foreground'
        )}>
          {achievement.title}
        </h3>
        <p className={cn(
            "text-xs",
            isUnlocked ? 'text-amber-700' : 'text-muted-foreground'
        )}>
            {achievement.description}
        </p>
      </div>
      {isUnlocked && (
        <Button variant="outline" size="sm" onClick={handleShare} aria-label="Compartilhar selo">
          <Share2 className="w-4 h-4 mr-1" />
          Compartilhar
        </Button>
      )}
    </Card>
  );
}
