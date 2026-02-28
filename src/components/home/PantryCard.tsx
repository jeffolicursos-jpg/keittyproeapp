'use client';

import { Card, CardContent } from "../ui/card";
import { ChevronRight, Wheat } from "lucide-react";

interface PantryCardProps {
  onNavigate: () => void;
}

export default function PantryCard({ onNavigate }: PantryCardProps) {
  return (
    <Card 
        className="shadow-lg hover:shadow-primary/20 transition-shadow cursor-pointer"
        onClick={onNavigate}
    >
        <CardContent className="p-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <Wheat className="w-8 h-8 text-primary" />
                <div>
                    <h2 className="font-headline text-xl md:text-2xl font-bold">
                        Minha Despensa
                    </h2>
                    <p className="text-muted-foreground mt-1">Organize seus ingredientes essenciais.</p>
                </div>
            </div>
            <ChevronRight className="w-6 h-6 text-muted-foreground" />
        </CardContent>
    </Card>
  )
}
