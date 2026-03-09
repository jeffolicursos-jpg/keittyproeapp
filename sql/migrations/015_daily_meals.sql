DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='recipes' AND column_name='meal_type'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN meal_type TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='recipes' AND column_name='goal_fit'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN goal_fit TEXT;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON public.recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_goal_fit ON public.recipes(goal_fit);

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS public.daily_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recipe_id uuid NOT NULL,
  meal_type TEXT NOT NULL,
  calories INTEGER NOT NULL,
  date DATE NOT NULL,
  consumed BOOLEAN NOT NULL DEFAULT FALSE,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_meals_user_date ON public.daily_meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_meals_user_date_meal_type ON public.daily_meals(user_id, date, meal_type);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uniq_daily_meals_user_date_meal_type'
  ) THEN
    CREATE UNIQUE INDEX uniq_daily_meals_user_date_meal_type ON public.daily_meals(user_id, date, meal_type);
  END IF;
END;
$$;
