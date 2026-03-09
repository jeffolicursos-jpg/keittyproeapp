# LOGIN_STABLE_VERSION Snapshot

## Módulos Ativos
- Autenticação: /api/auth/login, /api/auth/refresh, /api/auth/logout, /api/auth/guard, /api/auth/soft-guard, /api/auth/signup
- Assinaturas: /api/subscriptions/me, /api/subscriptions/cancel
- Conteúdo: /api/recipes
- Treinos: /api/training/days/[id], /api/treinos/[id]/status, /api/treinos/[id]/exercicio/[slug]
- Webhook: /api/webhook/kiwify
- Saúde/Teste: /api/health, /api/test/db, /api/test/seed-admin, /api/test/user
- Middleware: src/middleware.ts (único middleware ativo)

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
- ADMIN_EMAIL (opcional, fallback admin)
- ADMIN_PASSWORD (opcional, fallback admin)
- SEED_SECRET (protege rota /api/test/seed-admin)

## Rotas Ativas
- Páginas: /login, /dashboard, /admin, /app, /recipes, /plano, páginas públicas (/, /planos, /sobre)
- APIs listadas em Módulos Ativos

## Rotas Desabilitadas
- middleware.ts na raiz removido; apenas src/middleware.ts é usado
- Não há /api/admin/users/list no código atual

## Fluxo de Autenticação Atual
- Login: valida email/senha (bcryptjs com senha_hash em users), exige status='ativo'
- Em sucesso: emite access (15m) e refresh (30d, com jti) via jsonwebtoken HS256 (ENV.JWT_SECRET)
- Cookies: access (httpOnly, sameSite=lax), refresh (httpOnly), role, email
- Middleware: verifica access com jose (HS256, ENV.JWT_SECRET); /admin requer role='admin'
- Refresh: valida jti (hash sha256 salvo em refresh_tokens) e emite novos tokens

## Status Atual de Receitas/Treinos/Perfil/Assinaturas
- Receitas: tabela recipes criada; lista e leitura por API
- Treinos: tabelas training_days, training_day_groups e exercises ativas; páginas de treino client-side funcionando
- Perfil: componentes de perfil e navegação presentes; sem dependências críticas de backend além de autenticação
- Assinaturas: tabela subscriptions, endpoints /me e /cancel; /api/auth/guard valida status/plano

## Artefatos de Restauração
- SQL Snapshot: [sql/manual-backup/mvp_stable_snapshot.sql](file:///C:/Projetos%20Trae/Dieta%20-%20Template%20Verde/sql/manual-backup/mvp_stable_snapshot.sql)

