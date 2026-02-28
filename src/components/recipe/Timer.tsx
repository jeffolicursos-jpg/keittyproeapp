"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Timer as TimerIcon, PauseCircle, PlayCircle, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TimerProps {
  durationInMinutes: number;
}

export default function Timer({ durationInMinutes }: TimerProps) {
  const initialTime = durationInMinutes * 60;
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTime(initialTime);
  }, [initialTime]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isActive) {
      toast({
          title: "⏰ Tempo esgotado!",
          description: `O timer de ${durationInMinutes} minutos terminou.`,
      });
      resetTimer();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, durationInMinutes, toast, resetTimer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2 text-foreground">
        <TimerIcon className="w-5 h-5 text-primary" />
        <span className="font-mono text-xl font-semibold w-20">{formatTime(time)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Button onClick={() => setIsActive(!isActive)} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
            {isActive ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
            <span className="sr-only">{isActive ? "Pausar" : "Iniciar"}</span>
        </Button>
        <Button onClick={resetTimer} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive">
            <RotateCcw className="h-5 w-5" />
            <span className="sr-only">Resetar</span>
        </Button>
      </div>
      <span className="text-sm text-muted-foreground">{`Timer de ${durationInMinutes} minutos`}</span>
    </div>
  );
}
