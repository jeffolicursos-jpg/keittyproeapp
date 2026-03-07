-- Initial schema for SaaS fitness
-- See auditoria for rationale

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  senha_hash TEXT,
  role TEXT NOT NULL DEFAULT 'usuario' CHECK (role IN ('usuario','admin')),
  status TEXT NOT NULL DEFAULT 'aguardando_senha' CHECK (status IN ('aguardando_senha','ativo','bloqueado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email CITEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL CHECK (gateway IN ('kiwify','banco_proprio')),
  status TEXT NOT NULL CHECK (status IN ('ativa','cancelada','inadimplente','expirada')),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  renovacao_automatica BOOLEAN NOT NULL DEFAULT TRUE,
  historico JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sub_user ON subscriptions(user_id);
CREATE INDEX idx_sub_gateway_status ON subscriptions(gateway, status);

CREATE TABLE password_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('activation','reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pt_user_type ON password_tokens(user_id, type);

CREATE TABLE exercicios_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  video_url TEXT,
  tips TEXT,
  default_series INT NOT NULL DEFAULT 3,
  default_reps TEXT NOT NULL DEFAULT '12-15',
  execution_text TEXT,
  audio_url TEXT,
  ai_features JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug)
);
CREATE INDEX idx_exb_user ON exercicios_base(user_id);

CREATE TABLE treinos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  overview TEXT,
  cardio_title TEXT,
  cardio_prescription TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_treinos_user ON treinos(user_id);

CREATE TABLE treino_exercicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treino_id UUID NOT NULL REFERENCES treinos(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  exercise_a_slug TEXT NOT NULL,
  exercise_b_slug TEXT,
  prescription TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_te_treino_order ON treino_exercicios(treino_id, order_index);

CREATE TABLE execucao_exercicio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  treino_id UUID NOT NULL REFERENCES treinos(id) ON DELETE CASCADE,
  exercise_slug TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_exec_user_treino ON execucao_exercicio(user_id, treino_id);
CREATE INDEX idx_exec_user_started ON execucao_exercicio(user_id, started_at);

CREATE TABLE execucao_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execucao_exercicio_id UUID NOT NULL REFERENCES execucao_exercicio(id) ON DELETE CASCADE,
  serie_index INT NOT NULL,
  carga_kg NUMERIC(6,2),
  reps INT,
  tempo_segundos INT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_series_exec ON execucao_series(execucao_exercicio_id, serie_index);

CREATE TABLE logs_webhook (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL
);
