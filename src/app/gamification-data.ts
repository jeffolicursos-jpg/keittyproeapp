export interface UserProfile {
  name: string;
  avatarUrl: string;
  points: number;
  level: string;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female' | 'other';
  theme: string;
  darkMode: boolean;
  notifyTimer?: boolean;
  notifyNewRecipes?: boolean;
  recipesPrepared: number;
  recipesFavorited: number;
  favoritedRecipeIds?: number[];
  unlockedAchievements?: string[];
  preparedRecipeIds?: number[];
  objective?: string; // e.g., 'lose_weight', 'more_energy'
  pantryItems?: Record<string, boolean>;
  weightHistory?: { date: string; weight: number }[];
  // Propriedades de conquistas
  usedTimer?: boolean;
  addedToShoppingList?: boolean;
  generatedRecipes?: number;
  preparedColorfulMeals?: number;
  preparedLightMeals?: number;
  preparedSeasonal?: number;
  consecutiveDays?: number;
  uniqueIngredientsUsed?: number;
  cookedWithoutList?: boolean;
  sharedRecipes?: number;
  daysUsingApp?: number;
  waterGoalMl?: number;
  // Hábitos para categorias de conquistas
  trainingDays?: number;
  dietDays?: number;
  waterGoalReachedDates?: string[];
  // Paleta custom
  themeCustomPrimary?: string;
  themeCustomAccent?: string;
}

export const levels = [
  { name: 'Novato Saudável', minPoints: 0 },
  { name: 'Aprendiz Culinário', minPoints: 101 },
  { name: 'Entusiasta Anti-inflamatório', minPoints: 301 },
  { name: 'Chef do Bem-Estar', minPoints: 601 },
  { name: 'Mestre da Cozinha Saudável', minPoints: 1001 },
];

export const getLevelInfo = (points: number) => {
  const currentLevel = [...levels].reverse().find(l => points >= l.minPoints) || levels[0];
  const currentLevelIndex = levels.findIndex(l => l.name === currentLevel.name);
  const nextLevel = levels[currentLevelIndex + 1];

  if (!nextLevel) {
    return {
      currentLevelName: currentLevel.name,
      progress: 100,
      pointsForNextLevel: null,
      totalPointsForNext: null,
    };
  }

  const pointsForCurrentLevel = currentLevel.minPoints;
  const pointsForNextLevel = nextLevel.minPoints;
  const totalPointsForNext = pointsForNextLevel - pointsForCurrentLevel;
  const userProgressInLevel = points - pointsForCurrentLevel;
  const progress = Math.max(0, (userProgressInLevel / totalPointsForNext) * 100);

  return {
    currentLevelName: currentLevel.name,
    progress,
    pointsForNextLevel: nextLevel.name,
    totalPointsForNext,
    userProgressInLevel,
  };
};

export const scoring = {
  PREPARE_RECIPE: 10,
  FAVORITE_5_RECIPES: 25,
  PLAN_WEEK: 50,
  COMPLETE_CHALLENGE: 100,
  CHECKIN_CAMERA: 3,
  CHECKIN_GALLERY: 2,
  CHECKIN_NO_PHOTO: 1,
  TRAINING_SESSION: 8,
  DIET_DAY: 5,
  WATER_INTAKE: 2,
  DAILY_HABIT: 3,
};
