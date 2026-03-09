# LOGIN_STABLE_VERSION Restore Checklist

## Git
- Tag: LOGIN_STABLE_VERSION
- Branch de backup: backup/LOGIN_STABLE_VERSION

## Vercel Rollback
- Acessar o projeto no Vercel
- Ir em Deployments, selecionar um deploy anterior estável
- Executar “Redeploy” desse commit
- Confirmar variáveis de ambiente no projeto antes do redeploy
- Limpar cache de SW em dev, se aplicável

## Variáveis de Ambiente Necessárias
- APP_URL
- JWT_SECRET
- ACTIVATION_SECRET
- DATABASE_URL ou DB_URL
- CORS_ORIGIN
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- MAIL_FROM
- KIWIFY_WEBHOOK_SECRET
- RATE_LIMIT_MAX
- RATE_LIMIT_WINDOW_MS
- ADMIN_EMAIL (opcional)
- ADMIN_PASSWORD (opcional)
- SEED_SECRET (opcional para seed)

## Passos de Recuperação Manual de Banco
- Garantir extensões: uuid-ossp, citext e pgcrypto instaladas
- Aplicar migrações se necessário:
  - node scripts/db-ops/applyAndSeed.js
- Aplicar snapshot SQL principal:
  - psql "$DATABASE_URL" -f sql/manual-backup/mvp_stable_snapshot.sql
- Validar:
  - SELECT COUNT(*) FROM users;
  - SELECT COUNT(*) FROM recipes;
  - SELECT COUNT(*) FROM subscriptions;
  - SELECT COUNT(*) FROM training_days;
  - SELECT COUNT(*) FROM training_day_groups;
  - SELECT COUNT(*) FROM exercises;

