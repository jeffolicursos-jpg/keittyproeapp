export type MealType = 'cafe_da_manha' | 'almoco' | 'lanche_da_tarde' | 'jantar'

export type DailyMealItem = {
  id: string
  recipe_id: string
  meal_type: MealType
  calories: number
  date: string
  consumed: boolean
  recipe_name?: string | null
  recipe_image_url?: string | null
}
