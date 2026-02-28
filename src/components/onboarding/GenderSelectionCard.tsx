'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface GenderSelectionCardProps {
  imageUrl: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function GenderSelectionCard({ imageUrl, label, isSelected, onClick }: GenderSelectionCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105',
        isSelected
          ? 'ring-4 ring-primary ring-offset-2 bg-primary/10'
          : 'bg-card hover:bg-muted/50'
      )}
    >
      <CardContent className="p-4 flex flex-col items-center justify-center gap-4 text-center">
        <div className="relative w-32 h-32 md:w-40 md:h-40">
            <Image
                src={imageUrl}
                alt={label}
                fill
                className="object-contain"
            />
        </div>
        <p className="font-headline text-xl font-semibold">{label}</p>
      </CardContent>
    </Card>
  );
}
