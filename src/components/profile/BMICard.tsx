'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/app/gamification-data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HeartPulse, Weight, Ruler, History } from "lucide-react";
import { calculateIMC, calculateIdealWeightRange } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


interface BMICardProps {
    profile: UserProfile;
    setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const getBMIStatus = (imc: number, gender: 'male' | 'female' | 'other') => {
    const genderPath = gender === 'male' ? 'male' : 'female';
    if (imc === 0) return { 
        text: "Insira seus dados", 
        image: `/images/imc-${genderPath}-2-normal.png`, 
        color: "text-muted-foreground",
        bgColor: "bg-muted"
    };
    if (imc < 18.5) return { 
        text: 'Abaixo do peso', 
        image: `/images/imc-${genderPath}-1-underweight.png`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
    };
    if (imc < 24.9) return { 
        text: 'Peso Normal', 
        image: `/images/imc-${genderPath}-2-normal.png`,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
    };
    if (imc < 29.9) return { 
        text: 'Acima do peso', 
        image: `/images/imc-${genderPath}-3-overweight.png`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
    };
    if (imc < 39.9) return {
        text: 'Obesidade',
        image: `/images/imc-${genderPath}-4-obese.png`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
    }
    return { 
        text: 'Obesidade Extrema', 
        image: `/images/imc-${genderPath}-5-extreme-obese.png`,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
    };
};


export default function BMICard({ profile, setProfile }: BMICardProps) {
    const { toast } = useToast();
    const [localWeight, setLocalWeight] = useState(profile.weight || '');
    const [localHeight, setLocalHeight] = useState(profile.height || '');

    const imc = calculateIMC(Number(localWeight), Number(localHeight));
    const bmiStatus = getBMIStatus(imc, profile.gender);
    const idealWeight = calculateIdealWeightRange(Number(localHeight));

    const handleSave = () => {
        const newWeight = Number(localWeight);
        const newHeight = Number(localHeight);
        
        if (!newWeight || !newHeight || newWeight <= 0 || newHeight <= 0) {
            toast({
                variant: 'destructive',
                title: "Dados Inválidos",
                description: "Por favor, insira valores de peso e altura válidos."
            });
            return;
        }

        setProfile(prev => {
            const newHistoryEntry = {
                date: new Date().toISOString(),
                weight: newWeight
            };

            const lastEntry = prev.weightHistory?.[prev.weightHistory.length - 1];
            const shouldAddHistory = !lastEntry || lastEntry.weight !== newWeight;

            const updatedHistory = shouldAddHistory
                ? [...(prev.weightHistory || []), newHistoryEntry]
                : prev.weightHistory;


            return {
                ...prev,
                weight: newWeight,
                height: newHeight,
                weightHistory: updatedHistory,
            };
        });
        toast({
            title: "Perfil Atualizado!",
            description: "Suas informações de peso e altura foram salvas."
        });
    }

    useEffect(() => {
        setLocalWeight(profile.weight || '');
        setLocalHeight(profile.height || '');
    }, [profile.weight, profile.height]);

    return (
        <Card id="bmi-card">
            <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <HeartPulse className="w-6 h-6 text-primary" />
                    Minha Saúde (IMC)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <Label htmlFor="weight" className="flex items-center gap-1.5 mb-1.5">
                            <Weight className="w-4 h-4 text-muted-foreground" />
                            Peso (kg)
                        </Label>
                        <Input
                            id="weight"
                            type="number"
                            placeholder="Ex: 70"
                            value={localWeight}
                            onChange={e => setLocalWeight(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="height" className="flex items-center gap-1.5 mb-1.5">
                            <Ruler className="w-4 h-4 text-muted-foreground" />
                            Altura (cm)
                        </Label>
                        <Input
                            id="height"
                            type="number"
                            placeholder="Ex: 175"
                            value={localHeight}
                            onChange={e => setLocalHeight(e.target.value)}
                        />
                    </div>
                     <div id="save-bmi-button" className="flex items-end col-span-2">
                        <Button onClick={handleSave} className="w-full">
                            Salvar e Calcular
                        </Button>
                    </div>
                </div>

                <div className="p-4 bg-muted/40 rounded-lg flex flex-col items-center justify-center text-center">
                    <div className="relative w-24 h-48 mb-2">
                        <Image 
                            src={bmiStatus.image}
                            alt={bmiStatus.text}
                            width={96}
                            height={192}
                            key={bmiStatus.image}
                            className="object-contain"
                        />
                    </div>
                    <p className="text-4xl font-bold font-mono my-1">{imc.toFixed(1)}</p>
                    <div className={cn("flex items-center gap-2 font-semibold px-3 py-1 rounded-full text-xs", bmiStatus.bgColor, bmiStatus.color)}>
                        <span>{bmiStatus.text}</span>
                    </div>
                    {idealWeight.min > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                           Sua faixa de peso ideal é entre <strong className="text-foreground">{idealWeight.min}kg</strong> e <strong className="text-foreground">{idealWeight.max}kg</strong>.
                        </p>
                    )}
                </div>

                {profile.weightHistory && profile.weightHistory.length > 0 && (
                    <div id="weight-history">
                        <Separator className="my-4" />
                        <h4 className="font-headline text-md flex items-center gap-2 mb-3">
                           <History className="w-5 h-5 text-primary" />
                            Histórico de Peso
                        </h4>
                        <ul className="space-y-2">
                            {profile.weightHistory.slice(-5).reverse().map((entry, index) => (
                                <li key={index} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded-md">
                                    <span className="text-muted-foreground">{format(new Date(entry.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                                    <span className="font-bold">{entry.weight} kg</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
