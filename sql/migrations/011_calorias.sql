CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  peso_kg FLOAT NOT NULL DEFAULT 80,
  altura_cm INT NOT NULL DEFAULT 175,
  idade INT NOT NULL DEFAULT 30,
  atividade TEXT CHECK (atividade IN ('sedentario','leve','moderado','ativo','muito_ativo')) NOT NULL DEFAULT 'moderado',
  objetivo TEXT CHECK (objetivo IN ('manter','perder','ganhar')) NOT NULL DEFAULT 'perder',
  tdee FLOAT NOT NULL DEFAULT 2200,
  meta_diaria FLOAT NOT NULL DEFAULT 1700,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_calories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  data DATE NOT NULL,
  calorias_consumidas FLOAT DEFAULT 0,
  agua_ml INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, data)
);

CREATE INDEX IF NOT EXISTS idx_daily_calories_user_date ON daily_calories(user_id, data);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_profile_updated_at') THEN
    CREATE TRIGGER trg_user_profile_updated_at
    BEFORE UPDATE ON user_profile
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_daily_calories_updated_at') THEN
    CREATE TRIGGER trg_daily_calories_updated_at
    BEFORE UPDATE ON daily_calories
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;
