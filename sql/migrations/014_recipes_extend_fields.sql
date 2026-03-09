DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'prep_minutes'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN prep_minutes INT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'cook_minutes'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN cook_minutes INT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN image_url TEXT;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'portions'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'portions' AND data_type <> 'text'
    ) THEN
      ALTER TABLE public.recipes ALTER COLUMN portions TYPE TEXT USING portions::text;
    END IF;
  ELSE
    ALTER TABLE public.recipes ADD COLUMN portions TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'temperature'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN temperature TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'total_time'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN total_time TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'ingredients_text'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN ingredients_text TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'preparation_steps_text'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN preparation_steps_text TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'tip'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN tip TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.recipes ADD COLUMN status TEXT;
  END IF;
END;
$$;
