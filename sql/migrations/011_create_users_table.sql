-- Safe migration to ensure 'users' table exists without altering existing structures
-- Compatible with existing queries in the project

-- Ensure UUID generation is available (no-op if already installed)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  email text UNIQUE NOT NULL,
  senha_hash text,
  role text DEFAULT 'usuario',
  status text DEFAULT 'ativo',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

