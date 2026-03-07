-- A) Coluna admin em auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
UPDATE auth.users SET is_admin = true WHERE email = 'admin@seusistema.com';

-- B) RLS receitas (admin vê tudo via email no JWT)
DROP POLICY IF EXISTS "Read receitas by plano authenticated" ON public.receitas;
CREATE POLICY "Admin + plano access" ON public.receitas
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'admin@seusistema.com' OR plano = 'basico');
