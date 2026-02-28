'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLevelInfo } from "@/app/gamification-data";
import { Star } from "lucide-react";

interface LevelProgressCardProps {
    points: number;
}

export default function LevelProgressCard({ points }: LevelProgressCardProps) {
    const levelInfo = getLevelInfo(points);
    
    return (
        <Card id="level-progress-card">
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Star className="w-6 h-6 text-amber-400" />
                    Meu Progresso
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Seu nível atual</p>
                    <p className="font-bold text-2xl text-primary font-headline">{levelInfo.currentLevelName}</p>
                </div>
                
                <Progress value={levelInfo.progress} className="h-3" />

                <div className="flex justify-between text-sm">
                    <span className="font-semibold">{points} pts</span>
                    {levelInfo.pointsForNextLevel ? (
                        <span className="text-muted-foreground">
                           Faltam {Math.max(0, (levelInfo.totalPointsForNext || 0) - (levelInfo.userProgressInLevel || 0))} pts para
                           {" "}
                           <span className="font-semibold text-foreground">{levelInfo.pointsForNextLevel}</span>
                        </span>
                    ) : (
                        <span className="font-semibold text-primary">Nível Máximo!</span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
