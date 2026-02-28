'use client';

import { useState } from 'react';
import type { DayOfWeek, MealSlot, WeeklyPlan } from "@/app/planning-data";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { PlusCircle, Trash2, Utensils, Info } from "lucide-react";
import type { Recipe } from "@/app/data/types";
import RecipeSelectorSheet from "./RecipeSelectorSheet";
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface WeeklyMenuProps {
    weeklyPlan: WeeklyPlan;
    setWeeklyPlan: React.Dispatch<React.SetStateAction<WeeklyPlan>>;
    favoritedRecipes: Recipe[];
}

export default function WeeklyMenu({ weeklyPlan, setWeeklyPlan, favoritedRecipes }: WeeklyMenuProps) {
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek, meal: MealSlot } | null>(null);

    const handleAddClick = (day: DayOfWeek, meal: MealSlot) => {
        setSelectedSlot({ day, meal });
        setIsSelectorOpen(true);
    }
    
    const handleRecipeSelect = (recipe: Recipe) => {
        if (!selectedSlot) return;

        setWeeklyPlan(prevPlan => {
            return prevPlan.map(dayPlan => {
                if (dayPlan.day === selectedSlot.day) {
                    return {
                        ...dayPlan,
                        meals: {
                            ...dayPlan.meals,
                            [selectedSlot.meal]: { recipeId: recipe.recipeNumber }
                        }
                    }
                }
                return dayPlan;
            });
        });
        setIsSelectorOpen(false);
        setSelectedSlot(null);
    }

    const handleRemoveMeal = (day: DayOfWeek, meal: MealSlot) => {
         setWeeklyPlan(prevPlan => {
            return prevPlan.map(dayPlan => {
                if (dayPlan.day === day) {
                    return {
                        ...dayPlan,
                        meals: {
                            ...dayPlan.meals,
                            [meal]: null
                        }
                    }
                }
                return dayPlan;
            });
        });
    }

    const findRecipeById = (id: number): Recipe | undefined => {
        // Search in all recipes, not just favorited, in case a favorite was removed after planning
        const allRecipes = favoritedRecipes; // In a real app, this would be a complete recipe list
        return allRecipes.find(r => r.recipeNumber === id);
    }

    return (
        <div id="weekly-menu-container">
            <Alert className="mb-6 border-primary/30 bg-primary/5">
                <Info className="h-4 w-4" />
                <AlertTitle className="font-semibold">Dica!</AlertTitle>
                <AlertDescription>
                    Ao criar seu cardápio, a tela inicial substituirá a &quot;Sugestão do Dia&quot; pelas suas refeições planejadas para hoje.
                </AlertDescription>
            </Alert>
            <div className="space-y-6">
                {weeklyPlan.map(plannedDay => (
                    <Card key={plannedDay.day}>
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">{plannedDay.day}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(plannedDay.meals).map(mealSlot => {
                                const meal = plannedDay.meals[mealSlot as MealSlot];
                                const recipe = meal ? findRecipeById(meal.recipeId) : null;
                                
                                return (
                                    <div key={mealSlot} className="bg-muted/40 rounded-lg p-3">
                                        <h4 className="font-semibold text-muted-foreground capitalize mb-2">{mealSlot}</h4>
                                        {recipe ? (
                                            <div className="relative group bg-card rounded-md p-2 flex items-center gap-3">
                                                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                                    <Image 
                                                        src={recipe.imageUrl}
                                                        alt={recipe.name}
                                                        fill
                                                        className="object-cover"
                                                        data-ai-hint={recipe.imageHint}
                                                    />
                                                </div>
                                                <p className="text-sm font-semibold flex-1">{recipe.name}</p>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleRemoveMeal(plannedDay.day, mealSlot as MealSlot)}
                                                >
                                                    <Trash2 className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button 
                                                variant="outline" 
                                                className="w-full border-dashed"
                                                onClick={() => handleAddClick(plannedDay.day, mealSlot as MealSlot)}
                                            >
                                                <PlusCircle className="w-4 h-4 mr-2" />
                                                Adicionar Refeição
                                            </Button>
                                        )}
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <RecipeSelectorSheet 
                isOpen={isSelectorOpen}
                setIsOpen={setIsSelectorOpen}
                recipes={favoritedRecipes}
                onSelectRecipe={handleRecipeSelect}
            />

             <div className="mt-8 text-center">
                <Button disabled>
                    <Utensils className="w-4 h-4 mr-2"/>
                    Gerar Lista de Compras da Semana (Em breve)
                </Button>
            </div>
        </div>
    )
}
