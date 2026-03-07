# Dieta Template Verde – Deploy Vercel

## Pré-requisitos
- Vercel CLI instalado e autenticado
- Supabase/Postgres com migrações aplicadas
- Variáveis de ambiente configuradas

## Variáveis de ambiente
Crie `.env.local` ou configure na Vercel:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- DB_URL
- KIWIFY_WEBHOOK_SECRET
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- CORS_ORIGIN

## Passos de deploy
1. vercel login
2. ./deploy.sh
3. Teste: acesse `/admin/analytics`

## Comandos úteis
- npm run vercel-build
- npm run deploy

## CSV de receitas (exemplo com calorias)
Use as colunas:
recipe_number,name,image_url,image_hint,portions,temperature,total_time,tip,protein_grams,tags,status,plano_minimo,cronometro,calorias_kcal

Exemplo (apenas uma linha):
1,Strogonoff de Frango,/images/strogonoff.png,prato,4,Quente,30 min,Use peito,35,Prato Principal|Publicado,published,basico,00:30:00,450

CSVs antigos, sem a coluna 'calorias_kcal', continuam funcionando.

## Amostras prontas
- samples/receitas.csv → 10 linhas reais com calorias_kcal preenchidas
- samples/treinos_unificado.csv → estrutura de exercícios/dias/grupos para /admin/import

## Roteiro de deploy final (Keity – 7K)
1. vercel login
2. ./deploy.sh → copie a URL LIVE
3. Importar samples/receitas.csv via POST /api/receitas/import
4. Importar samples/treinos_unificado.csv em /admin/import
5. Criar 10 alunos em /admin/usuarios
6. Enviar DM: “App: URL_LIVE/login”
7. Acompanhar /admin/analytics (tabela, filtros, export e retenção)

## Testes pós-deploy
- /admin/analytics: validar tabela, filtros e export CSV
- Crie 2–3 alunos teste em `/admin/usuarios`
- Envie o link de login: `URL_LIVE/login`
- Faça login com um deles → vá em `/perfil` e salve calorias
- Home: ver barra kcal, água, streaks e check-ins

## Roteiro Keity (Instagram 7K – Live)
1. Crie 3 alunos em `/admin/usuarios`
2. Envie DM com “Link app: URL_LIVE/login”
3. Monitore `/admin/analytics` (planos, status e churn)

## Teste local rápido (2min)
1. `node scripts/db-ops/applyAndSeed.js` → confirme OK no terminal
2. `npm run dev`
3. Visite `/admin/analytics` → crie aluno → veja nome/telefone na tabela
