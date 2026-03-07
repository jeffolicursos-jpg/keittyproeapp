CREATE TABLE IF NOT EXISTS exercises (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  execution_text TEXT,
  default_series INTEGER DEFAULT 3,
  default_reps INTEGER DEFAULT 10,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercises_title ON exercises USING btree ((lower(title)));
