CREATE TABLE IF NOT EXISTS training_days (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  overview TEXT,
  cardio_title TEXT,
  cardio_prescription TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_day_groups (
  id SERIAL PRIMARY KEY,
  training_day_id TEXT NOT NULL REFERENCES training_days(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 1,
  exercise_a_slug TEXT REFERENCES exercises(slug) ON DELETE SET NULL,
  exercise_b_slug TEXT REFERENCES exercises(slug) ON DELETE SET NULL,
  prescription TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_training_days_title ON training_days USING btree ((lower(title)));
CREATE INDEX IF NOT EXISTS idx_training_groups_day ON training_day_groups(training_day_id);
