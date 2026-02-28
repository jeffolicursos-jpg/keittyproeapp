'use client';

import { Card, CardContent } from "../ui/card";
import { BookOpen, ChevronRight } from "lucide-react";

interface LearnMoreCardProps {
  onNavigate: () => void;
}

export default function LearnMoreCard({ onNavigate }: LearnMoreCardProps) {
  return (
    <Card 
        className="shadow-lg hover:shadow-primary/20 transition-shadow cursor-pointer"
        onClick={onNavigate}
    >
        <CardContent className="p-6 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <BookOpen className="w-8 h-8 text-primary" />
                <div>
                    <h2 className="font-headline text-xl md:text-2xl font-bold">
                        O Poder da Comida
                    </h2>
                    <p className="text-muted-foreground mt-1">Aprenda os fundamentos da alimentação anti-inflamatória.</p>
                </div>
            </div>
            <ChevronRight className="w-6 h-6 text-muted-foreground" />
        </CardContent>
    </Card>
  )
}
