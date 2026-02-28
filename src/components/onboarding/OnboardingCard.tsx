'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideProps } from 'lucide-react';
import React from 'react';

interface OnboardingCardProps {
  icon?: React.ComponentType<LucideProps>;
  iconColor?: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function OnboardingCard({ icon: Icon, iconColor, label, isSelected, onClick }: OnboardingCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105',
        isSelected
          ? 'bg-primary text-primary-foreground border-primary/50 shadow-primary/20'
          : 'bg-card hover:bg-muted/50'
      )}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center">
        {Icon && <Icon className={cn("w-10 h-10 mb-2", !isSelected && iconColor)} />}
        <p className="font-headline text-lg font-semibold">{label}</p>
      </CardContent>
    </Card>
  );
}
