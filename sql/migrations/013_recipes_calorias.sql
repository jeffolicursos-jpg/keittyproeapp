ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS calorias_kcal INT;

-- Opcional: estimativa simples baseada em proteína (aprox. 4 kcal/g)
-- UPDATE recipes SET calorias_kcal = COALESCE(calorias_kcal, protein_grams * 10)
-- WHERE calorias_kcal IS NULL AND protein_grams IS NOT NULL;
