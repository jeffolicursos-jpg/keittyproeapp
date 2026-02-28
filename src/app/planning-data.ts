export type MealSlot = 'almoço' | 'jantar';
export type DayOfWeek = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';

export interface PlannedMeal {
    recipeId: number;
}

export interface PlannedDay {
    day: DayOfWeek;
    meals: {
        [key in MealSlot]?: PlannedMeal | null;
    }
}

export type WeeklyPlan = PlannedDay[];

export const initialWeeklyPlan: WeeklyPlan = [
    { day: 'Segunda', meals: { almoço: null, jantar: null } },
    { day: 'Terça', meals: { almoço: null, jantar: null } },
    { day: 'Quarta', meals: { almoço: null, jantar: null } },
    { day: 'Quinta', meals: { almoço: null, jantar: null } },
    { day: 'Sexta', meals: { almoço: null, jantar: null } },
    { day: 'Sábado', meals: { almoço: null, jantar: null } },
    { day: 'Domingo', meals: { almoço: null, jantar: null } },
];
