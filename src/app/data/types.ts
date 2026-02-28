
export interface Recipe {
  name: string;
  imageUrl: string;
  imageHint: string;
  portions: number;
  temperature: string;
  totalTime: string; // in minutes
  proteinGrams?: number;
  ingredients: { name: string; quantity: string; note?: string }[];
  preparationSteps: {
    step: number;
    instruction: string;
    time?: number; // in minutes
  }[];
  benefits: string[];
  recipeNumber: number;
  tags: string[];
  status: 'published' | 'draft';
  glycemicIndex?: number;
  glycemicLoad?: number;
  glycemicCategory?: 'low' | 'medium' | 'high';
  glycemicNote?: string;
}
