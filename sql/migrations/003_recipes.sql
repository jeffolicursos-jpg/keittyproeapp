CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_number INT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  image_url TEXT,
  image_hint TEXT,
  portions INT NOT NULL DEFAULT 1,
  temperature TEXT,
  total_time TEXT,
  tip TEXT,
  protein_grams INT,
  tags TEXT[],
  status TEXT NOT NULL CHECK (status IN ('published','draft')) DEFAULT 'published',
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recipes_user ON recipes(user_id);
