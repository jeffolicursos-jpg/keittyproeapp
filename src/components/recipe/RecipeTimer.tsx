"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PauseCircle, PlayCircle, RotateCcw, Pencil, TimerIcon } from 'lucide-react';
import type { Recipe } from '@/app/data/types';
import type { ActiveTimer } from '@/app/page';

interface RecipeTimerProps {
  recipe: Recipe;
  activeTimer: ActiveTimer | null;
  setActiveTimer: (timer: ActiveTimer | null) => void;
}

export default function RecipeTimer({ recipe, activeTimer, setActiveTimer }: RecipeTimerProps) {
  const parseTime = (timeStr: string): number => {
    let totalMinutes = 0;
    
    const hourMatches = timeStr.match(/(\d+)\s*hora/);
    if (hourMatches) {
      totalMinutes += parseInt(hourMatches[1], 10) * 60;
    }
    
    const minMatches = timeStr.match(/(\d+)\s*min/);
    if (minMatches) {
      totalMinutes += parseInt(minMatches[1], 10);
    }

    // Fallback for strings that are just numbers
    if (!hourMatches && !minMatches) {
      const justDigits = parseInt(timeStr.replace(/\D/g, ''), 10);
      if (!isNaN(justDigits)) {
        totalMinutes = justDigits;
      }
    }

    return totalMinutes * 60;
  };

  const isCurrentRecipeTimer = activeTimer?.recipe.recipeNumber === recipe.recipeNumber;
  const initialTime = useMemo(() => parseTime(recipe.totalTime), [recipe.totalTime]);

  const [displayTime, setDisplayTime] = useState(isCurrentRecipeTimer ? activeTimer.timeLeft : initialTime);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMinutes, setEditedMinutes] = useState(Math.floor(initialTime / 60));

  useEffect(() => {
    if (isCurrentRecipeTimer) {
      setDisplayTime(activeTimer.timeLeft);
    } else {
      setDisplayTime(initialTime);
    }
  }, [activeTimer, isCurrentRecipeTimer, initialTime]);

  const handlePlayPause = () => {
    if (isCurrentRecipeTimer) {
      setActiveTimer({ ...activeTimer, isActive: !activeTimer.isActive });
    } else {
      setActiveTimer({
        recipe: recipe,
        initialTime: initialTime,
        timeLeft: initialTime,
        isActive: true,
      });
    }
  };

  const handleReset = () => {
    if (isCurrentRecipeTimer) {
      setActiveTimer({ ...activeTimer, isActive: false, timeLeft: activeTimer.initialTime });
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    if (isCurrentRecipeTimer) {
      setActiveTimer({ ...activeTimer, isActive: false });
    }
    setEditedMinutes(Math.floor((isCurrentRecipeTimer ? activeTimer.initialTime : initialTime) / 60));
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = parseInt(e.target.value, 10);
    if (!isNaN(newMinutes) && newMinutes >= 0) {
      setEditedMinutes(newMinutes);
    }
  };
  
  const handleSave = () => {
    const newInitialTime = editedMinutes * 60;
    setActiveTimer({
      recipe: recipe,
      initialTime: newInitialTime,
      timeLeft: newInitialTime,
      isActive: false,
    });
    setIsEditing(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg border-2 border-dashed">
      <div className="w-full flex flex-wrap items-center justify-center gap-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input 
              type="number"
              value={editedMinutes}
              onChange={handleTimeChange}
              className="w-20 text-center text-lg font-mono"
              aria-label="Editar minutos do cronômetro"
            />
            <span className="text-base font-mono text-muted-foreground">min</span>
            <Button onClick={handleSave} size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              Salvar
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-foreground">
              <TimerIcon className="w-5 h-5 text-primary" />
              <span className="font-mono text-xl font-semibold w-20">{formatTime(displayTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button onClick={handlePlayPause} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground/80" disabled={isEditing}>
                  {isCurrentRecipeTimer && activeTimer.isActive ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                  <span className="sr-only">{isCurrentRecipeTimer && activeTimer.isActive ? "Pausar" : "Iniciar"}</span>
              </Button>
              <Button onClick={handleReset} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" disabled={isEditing || !isCurrentRecipeTimer}>
                  <RotateCcw className="h-5 w-5" />
                  <span className="sr-only">Resetar</span>
              </Button>
              <Button onClick={handleEdit} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground/80" disabled={isCurrentRecipeTimer && activeTimer.isActive || isEditing}>
                  <Pencil className="h-5 w-5" />
                  <span className="sr-only">Editar</span>
              </Button>
            </div>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        O tempo inicial é baseado na receita. Clique no lápis para editar.
      </p>
    </div>
  );
}
