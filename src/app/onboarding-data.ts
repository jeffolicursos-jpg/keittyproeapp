
import { HeartPulse, Zap, ShieldAlert, Leaf } from 'lucide-react';

export const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Olá! Para personalizar sua jornada, responda algumas perguntas.',
  },
  {
    id: 'gender',
    title: 'Como você se identifica?',
    options: [
      {
        value: 'female',
        label: 'Mulher',
        imageUrl: '/images/onboarding-female.png',
      },
      {
        value: 'male',
        label: 'Homem',
        imageUrl: '/images/onboarding-male.png',
      },
    ],
  },
  {
    id: 'objective',
    title: 'Qual seu principal objetivo?',
    options: [
      {
        value: 'lose_weight',
        label: 'Perder Peso',
        icon: HeartPulse,
        color: 'text-red-500',
      },
      {
        value: 'more_energy',
        label: 'Ter mais Energia e Disposição',
        icon: Zap,
        color: 'text-yellow-500',
      },
      {
        value: 'reduce_inflammation',
        label: 'Reduzir Dores e Inflamação',
        icon: ShieldAlert,
        color: 'text-orange-500',
      },
      {
        value: 'eat_healthier',
        label: 'Apenas Comer de Forma Saudável',
        icon: Leaf,
        color: 'text-green-500',
      },
    ],
  },
];
