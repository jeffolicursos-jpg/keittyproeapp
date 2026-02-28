"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, PartyPopper, RotateCcw } from 'lucide-react';

type Step = {
  step: number;
  instruction: string;
  time?: number;
};

type Ingredient = {
  name: string;
  quantity: string;
};

interface PreparationStepsProps {
  steps: Step[];
  ingredients: Ingredient[];
  setCheckedIngredients: (value: React.SetStateAction<Record<string, boolean>>) => void;
  onComplete: () => void;
}

export default function PreparationSteps({ steps, ingredients, setCheckedIngredients, onComplete }: PreparationStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const updateCheckedIngredientsForCompletedStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;
    
    const completedStep = steps[stepIndex];
    const instruction = completedStep.instruction.toLowerCase();
    
    const ingredientsInStep = ingredients.filter(ing => {
      // Create a simplified version of the ingredient name to match against the instruction
      const baseIngredientName = ing.name.toLowerCase().split(' ')[0].replace(/(s|a|o)$/, '');
      return instruction.includes(baseIngredientName);
    });

    if (ingredientsInStep.length > 0) {
      setCheckedIngredients(prev => {
        const newChecked = {...prev};
        ingredientsInStep.forEach(ing => {
          // Only mark if it's not already manually checked
          if (!prev[ing.name]) {
            newChecked[ing.name] = true;
          }
        });
        return newChecked;
      });
    }
  };

  const markAllIngredientsAsChecked = () => {
    const allChecked: Record<string, boolean> = {};
    ingredients.forEach(ing => {
      allChecked[ing.name] = true;
    });
    setCheckedIngredients(allChecked);
  }
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Mark ingredients of the step that was just completed
      updateCheckedIngredientsForCompletedStep(currentStep);
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1) {
        // This is the last step, mark ALL ingredients when finishing
        markAllIngredientsAsChecked();
        setCurrentStep(currentStep + 1); // Go to "completed" state
        onComplete(); // Award points
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // We don't un-check ingredients when going back, as requested.
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setCheckedIngredients({});
  }

  const allStepsCompleted = currentStep >= steps.length;
  // Progress based on the index of the current step
  const progressPercentage = allStepsCompleted ? 100 : (currentStep / (steps.length -1)) * 100;
  
  if (allStepsCompleted) {
    return (
        <div className="space-y-6 text-center">
             <Progress value={100} className="w-full" />
             <div className="relative min-h-[150px] p-6 rounded-lg border bg-card flex flex-col justify-center items-center">
                <PartyPopper className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-2xl font-headline font-bold">Receita Finalizada!</h3>
                <p className="text-muted-foreground">Bom apetite!</p>
            </div>
            <Button onClick={reset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Recomeçar Preparo
            </Button>
        </div>
    )
  }

  const step = steps[currentStep];

  return (
    <div className="space-y-6">
      <Progress value={progressPercentage} className="w-full" />
      
      <div className="relative min-h-[150px] p-6 rounded-lg border bg-card text-card-foreground">
        <span className="absolute -top-4 left-4 inline-block bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold shadow-md">
          Passo {step.step}
        </span>
        <p className="mt-4 text-base leading-relaxed">{step.instruction}</p>
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </Button>

        <Button onClick={handleNext} className="gap-2">
            {currentStep < steps.length - 1 ? 'Próximo' : 'Finalizar'}
            {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
