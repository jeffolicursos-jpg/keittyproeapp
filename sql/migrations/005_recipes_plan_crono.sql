ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS plano_minimo TEXT CHECK (plano_minimo IN ('basico','premium','vip'));

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS cronometro TEXT; -- formato 'MM:SS'
