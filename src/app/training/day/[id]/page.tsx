'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getTrainingDay, getExercise } from '@/app/training-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TrainingDayPage() {
  const params = useParams();
  const idParam = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const id = parseInt(String(idParam || '1'), 10) || 1;
  const day = getTrainingDay(id);
  const router = useRouter();

  if (!day) {
    return (
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <h1 className="font-headline text-2xl md:text-3xl">Dia de treino não encontrado</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Voltar">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        </div>
        <Link href="/" aria-label="Home" className="inline-flex">
          <Button variant="ghost" size="sm">
            <Home className="w-4 h-4 mr-1" />
            Início
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <Dumbbell className="w-6 h-6 text-primary" />
        <h1 className="font-headline text-2xl md:text-3xl">{day.title}</h1>
      </div>
      {day.overview ? <p className="text-sm text-muted-foreground mb-6">{day.overview}</p> : null}
      <div className="space-y-4">
        {day.groups.map((g, idx) => {
          const a = getExercise(g.exerciseA);
          const b = g.exerciseB ? getExercise(g.exerciseB) : null;
          return (
            <Card key={idx} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {a && (
                      <Link href={`/training/exercise/${a.slug}`} className="block">
                        <Button variant="ghost" className="justify-start w-full px-2">
                          {a.title}
                        </Button>
                      </Link>
                    )}
                    {b && (
                      <Link href={`/training/exercise/${b.slug}`} className="block">
                        <Button variant="ghost" className="justify-start w-full px-2">
                          {b.title}
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="text-xs font-mono bg-muted rounded px-2 py-1">{g.prescription}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {day.cardio && (
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="font-semibold">{day.cardio.title}</div>
              <div className="text-xs font-mono bg-muted rounded px-2 py-1">{day.cardio.prescription}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
