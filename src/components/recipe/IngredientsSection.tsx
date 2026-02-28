"use client";

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Ingredient = {
  name: string;
  quantity: string;
};

interface IngredientsSectionProps {
  ingredients: Ingredient[];
  checkedIngredients: Record<string, boolean>;
  setCheckedIngredients: (value: React.SetStateAction<Record<string, boolean>>) => void;
}

export default function IngredientsSection({ ingredients, checkedIngredients, setCheckedIngredients }: IngredientsSectionProps) {

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setCheckedIngredients(prev => ({ ...prev, [name]: checked }));
  };



  return (
    <>
      <ul className="space-y-4">
        {ingredients.map((ingredient, index) => (
          <li key={index} className="flex items-center space-x-3 p-2 rounded-md -m-2">
            <Checkbox
              id={`ingredient-${index}`}
              onCheckedChange={(checked) => handleCheckboxChange(ingredient.name, !!checked)}
              checked={checkedIngredients[ingredient.name] || false}
              aria-label={ingredient.name}
              className="border-primary text-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <Label htmlFor={`ingredient-${index}`} className="flex justify-between w-full cursor-pointer font-ingredients items-center">
              <span className={(checkedIngredients[ingredient.name] ? 'line-through decoration-primary ' : '') + 'text-[13px] md:text-base text-foreground'}>
                {ingredient.name}
              </span>
              <span className="text-accent font-semibold text-sm md:text-base">{ingredient.quantity}</span>
            </Label>
          </li>
        ))}
      </ul>
    </>
  );
}
