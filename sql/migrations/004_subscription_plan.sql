ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS plano TEXT CHECK (plano IN ('basico','premium','vip'));
