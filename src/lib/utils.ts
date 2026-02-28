import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateIMC(weight: number, height: number): number {
  if (height <= 0 || weight <= 0) {
    return 0;
  }
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function calculateIdealWeightRange(height: number): { min: number; max: number } {
  if (height <= 0) {
    return { min: 0, max: 0 };
  }
  const heightInMeters = height / 100;
  const minWeight = 18.5 * (heightInMeters * heightInMeters);
  const maxWeight = 24.9 * (heightInMeters * heightInMeters);
  return { min: Math.round(minWeight), max: Math.round(maxWeight) };
}
