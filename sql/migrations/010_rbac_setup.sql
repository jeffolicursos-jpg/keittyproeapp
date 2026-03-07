DO $$ BEGIN
CREATE TYPE public.app_role AS ENUM ('owner','super_admin','admin','staff','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_security (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  is_protected boolean NOT NULL DEFAULT false,
  can_be_deleted boolean NOT NULL DEFAULT true,
  can_be_demoted boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NULL,
  target_user_id uuid NULL,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
CREATE TRIGGER trg_user_roles_updated
BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE TRIGGER trg_user_security_updated
BEFORE UPDATE ON public.user_security
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
CREATE POLICY user_roles_admin_access ON public.user_roles
FOR ALL TO authenticated
USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY user_security_admin_access ON public.user_security
FOR ALL TO authenticated
USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE POLICY audit_logs_admin_access ON public.audit_logs
FOR ALL TO authenticated
USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb AS $$
DECLARE
uid uuid;
r public.app_role;
claims jsonb;
BEGIN
uid := (event->>'user_id')::uuid;
SELECT role INTO r FROM public.user_roles WHERE user_id = uid;
IF r IS NULL THEN r := 'user'::public.app_role; END IF;
claims := coalesce(event->'claims', '{}'::jsonb);
claims := jsonb_set(claims, '{user_role}', to_jsonb(r::text), true);
RETURN jsonb_set(event, '{claims}', claims, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
