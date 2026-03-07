CREATE TABLE IF NOT EXISTS training_day_progress (
  day_id INTEGER PRIMARY KEY,
  date DATE,
  title TEXT,
  series INTEGER,
  repeticoes TEXT,
  estimulos INTEGER DEFAULT 0,
  completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_exercise_progress (
  day_id INTEGER NOT NULL,
  exercise_slug TEXT NOT NULL,
  completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  PRIMARY KEY (day_id, exercise_slug)
);
