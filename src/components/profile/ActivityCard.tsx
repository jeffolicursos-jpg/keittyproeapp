'use client';

import type { UserProfile } from "@/app/gamification-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Heart, ListChecks } from "lucide-react";

interface ActivityCardProps {
    profile: UserProfile;
}

export default function ActivityCard({ profile }: ActivityCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <ListChecks className="w-6 h-6 text-primary" />
                    Minhas Estatísticas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-muted/40 rounded-lg flex flex-col items-center justify-center">
                        <ChefHat className="w-8 h-8 text-primary mb-2" />
                        <p className="text-3xl font-bold">{profile.recipesPrepared}</p>
                        <p className="text-sm text-muted-foreground">Receitas Preparadas</p>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-lg flex flex-col items-center justify-center">
                        <Heart className="w-8 h-8 text-destructive mb-2" />
                        <p className="text-3xl font-bold">{profile.recipesFavorited}</p>
                        <p className="text-sm text-muted-foreground">Receitas Favoritas</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
