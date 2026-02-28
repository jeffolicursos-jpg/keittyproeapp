import { 
  Medal, ChefHat, Eye, Star, Award, Flame, Sandwich, Utensils, Heart, 
  BookOpen, Sparkles, Target, Shield, Calendar, Clock, Trophy, Scale, Leaf,
  Brain, Bot, Zap, Sun, Moon, Wind, Soup, Salad, Fish, Dumbbell, Droplet
} from "lucide-react";
import type { UserProfile } from "./gamification-data";
import type { Recipe } from "./data/types";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isUnlocked: (profile: UserProfile, recipes: Recipe[]) => boolean;
  category?: 'Treino' | 'Alimentação' | 'Hidratação';
}

const hasFavoritedTag = (profile: UserProfile, recipes: Recipe[], tag: string) => {
    return recipes.some(r => 
        (profile.favoritedRecipeIds?.includes(r.recipeNumber) ?? false) && 
        r.tags.includes(tag)
    );
};

export const achievements: Achievement[] = [
  // Nível 1: Novato Saudável (Primeiros Passos)
  {
    id: "first-recipe",
    title: "Início da Jornada",
    description: "Prepare sua primeira receita anti-inflamatória.",
    icon: Medal,
    isUnlocked: (p) => p.recipesPrepared >= 1,
    category: 'Alimentação',
  },
  {
    id: "explore-10",
    title: "Olhar Curioso",
    description: "Visualize 10 receitas diferentes para conhecer novas opções.",
    icon: Eye,
    isUnlocked: (p) => (p.viewedRecipeIds?.length ?? 0) >= 10,
    category: 'Alimentação',
  },
  {
    id: 'wise-nutritionist',
    title: "Sábio(a) da Nutrição",
    description: "Leia o guia sobre alimentação anti-inflamatória.",
    icon: Brain,
    isUnlocked: (p) => p.unlockedAchievements?.includes('wise-nutritionist') ?? false,
    category: 'Alimentação',
  },
  {
    id: "favorite-one",
    title: "Primeiro Favorito",
    description: "Favorite uma receita que você amou.",
    icon: Heart,
    isUnlocked: (p) => (p.favoritedRecipeIds?.length ?? 0) >= 1,
    category: 'Alimentação',
  },
  {
    id: "prepare-salad",
    title: "Amante de Saladas",
    description: "Prepare uma receita da categoria 'Salada'.",
    icon: Salad,
    isUnlocked: (p, r) => p.preparedRecipeIds?.some(id => r.find(recipe => recipe.recipeNumber === id)?.tags.includes('Salada')) ?? false,
    category: 'Alimentação',
  },
  {
    id: "use-timer",
    title: "Mestre do Tempo",
    description: "Utilize o cronômetro para cozinhar uma receita.",
    icon: Clock,
    isUnlocked: (p) => !!p.usedTimer,
    category: 'Alimentação',
  },
  {
    id: "add-to-list",
    title: "Planejador Iniciante",
    description: "Adicione ingredientes à sua lista de compras pela primeira vez.",
    icon: Calendar,
    isUnlocked: (p) => !!p.addedToShoppingList,
    category: 'Alimentação',
  },
  {
    id: "prepare-three",
    title: "Chef em Ascensão",
    description: "Prepare 3 receitas diferentes.",
    icon: Flame,
    isUnlocked: (p) => p.recipesPrepared >= 3,
    category: 'Alimentação',
  },
  {
    id: 'snack-lover',
    title: "Amante de Lanches",
    description: "Favorite uma receita da categoria 'Lanche'.",
    icon: Sandwich,
    isUnlocked: (p, r) => hasFavoritedTag(p, r, 'Lanche'),
    category: 'Alimentação',
  },
  {
    id: "update-bmi",
    title: "Autoconhecimento",
    description: "Calcule seu IMC na tela de perfil.",
    icon: Scale,
    isUnlocked: (p) => p.weight > 0 && p.height > 0,
    category: 'Alimentação',
  },

  // Nível 2: Aprendiz Culinário (Ganhando Confiança)
  {
    id: "prepare-five",
    title: "Cozinheiro Consistente",
    description: "Prepare 5 receitas diferentes.",
    icon: ChefHat,
    isUnlocked: (p) => p.recipesPrepared >= 5,
    category: 'Alimentação',
  },
  {
    id: 'favorite-five',
    title: "Colecionador de Sabores",
    description: "Favorite 5 receitas diferentes.",
    icon: Star,
    isUnlocked: (p) => (p.favoritedRecipeIds?.length ?? 0) >= 5,
    category: 'Alimentação',
  },
  {
    id: 'prepare-main-dish',
    title: "Prato Principal",
    description: "Prepare uma receita da categoria 'Prato Principal'.",
    icon: Utensils,
    isUnlocked: (p, r) => p.preparedRecipeIds?.some(id => r.find(recipe => recipe.recipeNumber === id)?.tags.includes('Prato Principal')) ?? false,
    category: 'Alimentação',
  },
  {
    id: "explore-25",
    title: "Explorador Dedicado",
    description: "Visualize 25 receitas para ampliar seu repertório.",
    icon: Sparkles,
    isUnlocked: (p) => (p.viewedRecipeIds?.length ?? 0) >= 25,
    category: 'Alimentação',
  },
  {
    id: "objective-oriented",
    title: "Foco no Objetivo",
    description: "Complete uma receita alinhada com seu objetivo principal.",
    icon: Target,
    isUnlocked: (p) => p.recipesPrepared >= 1,
    category: 'Alimentação',
  },
  {
    id: "prepare-fish",
    title: "Ômega 3 em Dia",
    description: "Prepare uma receita que contenha peixe.",
    icon: Fish,
    isUnlocked: (p, r) => p.preparedRecipeIds?.some(id => r.find(recipe => recipe.recipeNumber === id)?.ingredients.some(i => i.name.toLowerCase().includes('peixe') || i.name.toLowerCase().includes('salmão'))) ?? false,
    category: 'Alimentação',
  },
  {
    id: "anti-inflammatory-shield",
    title: "Escudo Anti-inflamatório",
    description: "Cozinhe uma receita com ingredientes como cúrcuma ou gengibre.",
    icon: Shield,
    isUnlocked: (p, r) => p.preparedRecipeIds?.some(id => r.find(recipe => recipe.recipeNumber === id)?.ingredients.some(i => i.name.toLowerCase().includes('cúrcuma') || i.name.toLowerCase().includes('gengibre'))) ?? false,
    category: 'Alimentação',
  },
  {
    id: "generate-recipe-ai",
    title: "Chef Inovador",
    description: "Use a IA para gerar sua primeira receita exclusiva.",
    icon: Bot,
    isUnlocked: (p) => (p.generatedRecipes ?? 0) > 0,
    category: 'Alimentação',
  },
  {
    id: "healthy-trio",
    title: "Trio Saudável",
    description: "Prepare uma salada, um prato principal e um lanche.",
    icon: Zap,
    isUnlocked: (p, r) => {
      const preparedTags = new Set(p.preparedRecipeIds?.map(id => r.find(recipe => recipe.recipeNumber === id)?.tags).flat());
      return preparedTags.has('Salada') && preparedTags.has('Prato Principal') && preparedTags.has('Lanche');
    },
    category: 'Alimentação',
  },
  {
    id: "reach-level-apprentice",
    title: "Aprendiz Culinário",
    description: "Alcance o nível 'Aprendiz Culinário' no seu perfil.",
    icon: Award,
    isUnlocked: (p) => p.level === 'Aprendiz Culinário' || p.level === 'Entusiasta Anti-inflamatório' || p.level === 'Chef do Bem-Estar' || p.level === 'Mestre da Cozinha Saudável',
    category: 'Alimentação',
  },
  
  // Nível 3: Entusiasta Anti-inflamatório (Criando Hábitos)
  {
    id: "prepare-ten",
    title: "Dez Refeições de Ouro",
    description: "Prepare 10 receitas diferentes e sinta a diferença.",
    icon: Flame,
    isUnlocked: (p) => p.recipesPrepared >= 10,
    category: 'Alimentação',
  },
  {
    id: "favorite-fifteen",
    title: "Coração de Chef",
    description: "Favorite 15 receitas para mostrar seu bom gosto.",
    icon: Heart,
    isUnlocked: (p) => (p.favoritedRecipeIds?.length ?? 0) >= 15,
    category: 'Alimentação',
  },
  {
    id: "prepare-soup",
    title: "Conforto na Tigela",
    description: "Prepare uma receita da categoria 'Sopa'.",
    icon: Soup,
    isUnlocked: (p, r) => p.preparedRecipeIds?.some(id => r.find(recipe => recipe.recipeNumber === id)?.tags.includes('Sopa')) ?? false,
    category: 'Alimentação',
  },
  {
    id: "explore-50",
    title: "Mestre Explorador",
    description: "Visualize 50 receitas e torne-se um expert no cardápio.",
    icon: BookOpen,
    isUnlocked: (p) => (p.viewedRecipeIds?.length ?? 0) >= 50,
    category: 'Alimentação',
  },
  {
    id: "vegetarian-day",
    title: "Dia Sem Carne",
    description: "Prepare uma receita vegetariana.",
    icon: Leaf,
    isUnlocked: (p, r) => (p.preparedRecipeIds?.some(id => {
      const recipe = r.find(rec => rec.recipeNumber === id);
      return recipe ? !recipe.ingredients.some(i => i.name.toLowerCase().includes('carne') || i.name.toLowerCase().includes('frango') || i.name.toLowerCase().includes('peixe')) : false;
    }) ?? false),
    category: 'Alimentação',
  },
  {
    id: "five-generated-recipes",
    title: "Colaborador da IA",
    description: "Gere 5 receitas com a ajuda da inteligência artificial.",
    icon: Bot,
    isUnlocked: (p) => (p.generatedRecipes ?? 0) >= 5,
    category: 'Alimentação',
  },
  {
    id: "breakfast-lover",
    title: "Amante do Café da Manhã",
    description: "Prepare uma receita da categoria 'Café da Manhã'.",
    icon: Sun,
    isUnlocked: (p, r) => p.preparedRecipeIds?.some(id => r.find(recipe => recipe.recipeNumber === id)?.tags.includes('Café da Manhã')) ?? false,
    category: 'Alimentação',
  },
  {
    id: "prepare-colorful-meal",
    title: "Prato Colorido",
    description: "Cozinhe uma receita com 3 ou mais vegetais de cores diferentes.",
    icon: Sparkles,
    isUnlocked: (p) => (p.preparedColorfulMeals ?? 0) >= 1,
    category: 'Alimentação',
  },
  {
    id: "light-dinner",
    title: "Jantar Leve",
    description: "Prepare uma receita com menos de 400 calorias (simulado).",
    icon: Moon,
    isUnlocked: (p) => (p.preparedLightMeals ?? 0) >= 1,
    category: 'Alimentação',
  },
  {
    id: "reach-level-enthusiast",
    title: "Entusiasta Anti-inflamatório",
    description: "Alcance o nível 'Entusiasta Anti-inflamatório'.",
    icon: Trophy,
    isUnlocked: (p) => p.level === 'Entusiasta Anti-inflamatório' || p.level === 'Chef do Bem-Estar' || p.level === 'Mestre da Cozinha Saudável',
    category: 'Alimentação',
  },

  // Nível 4: Chef do Bem-Estar (Dominando a Arte)
  {
    id: "prepare-twenty",
    title: "Vinte Degraus para a Saúde",
    description: "Prepare 20 receitas diferentes.",
    icon: ChefHat,
    isUnlocked: (p) => p.recipesPrepared >= 20,
    category: 'Alimentação',
  },
  {
    id: "favorite-thirty",
    title: "Curador de Elite",
    description: "Favorite 30 receitas, mostrando seu repertório.",
    icon: Star,
    isUnlocked: (p) => (p.favoritedRecipeIds?.length ?? 0) >= 30,
    category: 'Alimentação',
  },
  {
    id: "seasonal-cook",
    title: "Cozinheiro Sazonal",
    description: "Prepare uma receita com ingredientes da estação (simulado).",
    icon: Wind,
    isUnlocked: (p) => (p.preparedSeasonal ?? 0) >= 1,
    category: 'Alimentação',
  },
  {
    id: "explore-all",
    title: "Conhecedor Pleno",
    description: "Visualize todas as receitas disponíveis no app.",
    icon: Eye,
    isUnlocked: (p, r) => (p.viewedRecipeIds?.length ?? 0) >= r.length,
    category: 'Alimentação',
  },
  {
    id: "meal-prep-master",
    title: "Mestre do Meal Prep",
    description: "Adicione 3 ou mais receitas à lista de compras de uma vez.",
    icon: Calendar,
    isUnlocked: (p) => !!p.addedToShoppingList,
    category: 'Alimentação',
  },
  {
    id: "master-all-categories",
    title: "Chef Versátil",
    description: "Prepare ao menos uma receita de 4 categorias diferentes.",
    icon: Utensils,
    isUnlocked: (p, r) => {
      const preparedTags = new Set(p.preparedRecipeIds?.map(id => r.find(recipe => recipe.recipeNumber === id)?.tags).flat());
      return preparedTags.size >= 4;
    },
    category: 'Alimentação',
  },
  {
    id: "generate-ten-recipes",
    title: "Arquiteto de Sabores",
    description: "Use a IA para gerar 10 receitas únicas.",
    icon: Bot,
    isUnlocked: (p) => (p.generatedRecipes ?? 0) >= 10,
    category: 'Alimentação',
  },
  {
    id: "perfect-bmi",
    title: "Equilíbrio Perfeito",
    description: "Alcance a faixa de 'Peso Normal' no seu IMC.",
    icon: Scale,
    isUnlocked: (p) => {
        const imc = p.height > 0 ? (p.weight / ((p.height/100) * (p.height/100))) : 0;
        return imc >= 18.5 && imc < 24.9;
    },
    category: 'Alimentação',
  },
  {
    id: "prepare-3-days-in-a-row",
    title: "Trinca da Consistência",
    description: "Prepare receitas por 3 dias seguidos (simulado).",
    icon: Flame,
    isUnlocked: (p) => (p.consecutiveDays ?? 0) >= 3,
    category: 'Alimentação',
  },
  {
    id: "reach-level-wellness-chef",
    title: "Chef do Bem-Estar",
    description: "Alcance o nível de 'Chef do Bem-Estar'.",
    icon: Award,
    isUnlocked: (p) => p.level === 'Chef do Bem-Estar' || p.level === 'Mestre da Cozinha Saudável',
    category: 'Alimentação',
  },

  // Nível 5: Mestre da Cozinha Saudável (Lenda Viva)
  {
    id: "prepare-fifty",
    title: "50 Tons de Saúde",
    description: "Prepare 50 receitas diferentes. Você é uma inspiração!",
    icon: ChefHat,
    isUnlocked: (p) => p.recipesPrepared >= 50,
    category: 'Alimentação',
  },
  {
    id: "favorite-fifty",
    title: "Guru dos Sabores",
    description: "Favorite 50 receitas. Seu paladar é lendário.",
    icon: Star,
    isUnlocked: (p) => (p.favoritedRecipeIds?.length ?? 0) >= 50,
    category: 'Alimentação',
  },
  {
    id: "consistency-week",
    title: "Semana Impecável",
    description: "Prepare receitas por 7 dias seguidos (simulado).",
    icon: Calendar,
    isUnlocked: (p) => (p.consecutiveDays ?? 0) >= 7,
    category: 'Alimentação',
  },
  {
    id: "master-of-ingredients",
    title: "Mestre dos Ingredientes",
    description: "Cozinhe com 20 ingredientes anti-inflamatórios chave (simulado).",
    icon: Brain,
    isUnlocked: (p) => (p.uniqueIngredientsUsed ?? 0) >= 20,
    category: 'Alimentação',
  },
  {
    id: "all-categories-favorited",
    title: "Amor Incondicional",
    description: "Favorite ao menos uma receita de cada categoria existente.",
    icon: Heart,
    isUnlocked: (p, r) => {
        const allTags = new Set(r.flatMap(rec => rec.tags));
        const favoritedTags = new Set(r.filter(rec => p.favoritedRecipeIds?.includes(rec.recipeNumber)).flatMap(rec => rec.tags));
        return allTags.size > 0 && Array.from(allTags).every(tag => favoritedTags.has(tag));
    },
    category: 'Alimentação',
  },
  {
    id: "generate-twenty-recipes",
    title: "Parceiro Criativo da IA",
    description: "Gere 20 receitas com a IA e expanda os limites da culinária.",
    icon: Bot,
    isUnlocked: (p) => (p.generatedRecipes ?? 0) >= 20,
    category: 'Alimentação',
  },
  {
    id: "no-shopping-list-needed",
    title: "Despensa Cheia",
    description: "Cozinhe uma receita complexa (5+ ingredientes) sem usar a lista de compras.",
    icon: Shield,
    isUnlocked: (p) => !!p.cookedWithoutList,
    category: 'Alimentação',
  },
  {
    id: "help-a-friend",
    title: "Embaixador da Saúde",
    description: "Compartilhe 3 receitas com amigos (simulado).",
    icon: Sparkles,
    isUnlocked: (p) => (p.sharedRecipes ?? 0) >= 3,
    category: 'Alimentação',
  },
  {
    id: "one-month-journey",
    title: "Jornada de um Mês",
    description: "Use o aplicativo e cozinhe por 30 dias (simulado).",
    icon: Clock,
    isUnlocked: (p) => (p.daysUsingApp ?? 0) >= 30,
    category: 'Alimentação',
  },
  {
    id: "reach-level-master",
    title: "Mestre da Cozinha Saudável",
    description: "Parabéns! Você alcançou o nível máximo!",
    icon: Trophy,
    isUnlocked: (p) => p.level === 'Mestre da Cozinha Saudável',
    category: 'Alimentação',
  },

  // Conquistas de Treino
  {
    id: "training-first",
    title: "Treino Iniciado",
    description: "Registre seu primeiro treino.",
    icon: Dumbbell,
    isUnlocked: (p) => (p.trainingDays ?? 0) >= 1,
    category: 'Treino',
  },
  {
    id: "training-consistency-7",
    title: "Consistência no Treino",
    description: "Registre treinos em 7 dias.",
    icon: Dumbbell,
    isUnlocked: (p) => (p.trainingDays ?? 0) >= 7,
    category: 'Treino',
  },

  // Conquistas de Hidratação
  {
    id: "water-goal-1",
    title: "Meta de Água 1x",
    description: "Atinga sua meta diária de água em um dia.",
    icon: Droplet,
    isUnlocked: (p) => (p.waterGoalReachedDates?.length ?? 0) >= 1,
    category: 'Hidratação',
  },
  {
    id: "water-goal-7",
    title: "Hidratação Perfeita",
    description: "Atinga a meta de água em 7 dias.",
    icon: Droplet,
    isUnlocked: (p) => (p.waterGoalReachedDates?.length ?? 0) >= 7,
    category: 'Hidratação',
  },
];


// Extend UserProfile to include more details for achievements
declare module './gamification-data' {
  interface UserProfile {
    viewedRecipeIds?: number[];
    favoritedRecipeIds?: number[];
    preparedRecipeIds?: number[];
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
    unlockedAchievements?: string[];
    trainingDays?: number;
    dietDays?: number;
    waterGoalReachedDates?: string[];
  }
}
