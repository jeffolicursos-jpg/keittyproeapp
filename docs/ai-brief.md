# Brief Técnico do Projeto – Dieta Verde

## Visão Geral
- Aplicação web focada em dieta e treinos com planos (básico, premium, vip).
- Recursos principais:
  - Analytics admin (alunos, planos, gráfico, export CSV).
  - TDEE/meta diária e controle de calorias/água.
  - Gamificação (heatmap de 30 dias, streaks e badges com popup e confetti).
  - Import via CSV para receitas e estrutura de treinos.
  - PWA e base para APK (Capacitor).

## Rotas (Hierarquia e Acesso)
- Público
  - / (landing)
  - /planos
  - /depoimentos
- Protegido (login)
  - /dashboard
  - /perfil (configuração TDEE/meta)
  - /treinos (restrito por plano; premium/vip)
  - /admin/* (somente admin)
- Estado de treino do dia (para Home): GET /api/treinos/hoje/status → { tem_treino_hoje, status: "concluido"|"parcial"|"nenhum" }

## Banco e Migrations Relevantes
- subscriptions (migração 010)
  - colunas-chave: id, user_id, gateway, status, data_inicio, renovacao_automatica, historico, plano, nome, telefone, last_login_at, created_at, updated_at
- user_profile e daily_calories (migração 011)
  - user_profile: id, user_id, peso_kg, altura_cm, idade, atividade, objetivo, tdee, meta_diaria, created_at, updated_at
  - daily_calories: id, user_id, data, calorias_consumidas, agua_ml, updated_at (UNIQUE user_id+data)
- streaks e badges (migração 012)
  - streaks: id, user_id, data, tipo('treino'|'agua'|'calorias'), streak_atual, created_at, updated_at
  - badges: id, user_id, nome, emoji, req_streak, req_pontos, desbloqueado_em, created_at, updated_at
- recipes (migração 013)
  - adicionada recipes.calorias_kcal (INT, opcional)
  - colunas principais: recipe_number, name, image_url, image_hint, portions, temperature, total_time, tip, protein_grams, tags, status, user_id, plano_minimo, cronometro, calorias_kcal, updated_at, created_at

## APIs Principais
### Perfil/Calorias
- GET /api/perfil/calorias/me
  - Responde { profile, today: { calorias_consumidas, agua_ml, meta_diaria, percent } }
- POST /api/perfil/calorias/setup
  - Body: { peso_kg, altura_cm, idade, atividade, objetivo } → calcula TDEE/meta e persiste em user_profile
- PATCH /api/perfil/calorias/consumir
  - Body: { calorias } → soma na daily_calories do dia
- PATCH /api/perfil/calorias/agua
  - Body: { ml } → soma água do dia

### Gamificação
- GET /api/gamificacao/streaks
  - Responde { heatmap_30dias:[{date, treino, agua, calorias}], current:{...}, badges_desbloqueados:[...], targets:{...} }
- POST /api/gamificacao/checkin/treino | /agua | /calorias
  - Incrementa streak do dia; quando atingir alvo, retorna { unlockedBadge:{ nome, emoji } }

### Admin • Analytics
- GET /api/admin/analytics
  - Lista alunos (nome, telefone, email, plano, last_login_at) para tabela/filtros/export.
- POST /api/admin/analytics/change-plan
  - Altera plano do usuário.

### Receitas
- GET /api/recipes
  - Lista básica com calorias_kcal incluída (para alimentar Home).
- POST /api/receitas/import e /api/recipes/import
  - Import CSV; aceita coluna opcional calorias_kcal.

### Treinos
- POST /api/admin/import
  - Import CSV unificado para exercícios/dias/grupos (structure only).
- GET /api/treinos/hoje/status
  - Indica estado do treino de hoje para o botão inteligente da Home.

## Lógica da Home
- Barra “consumido/meta %” baseada em /api/perfil/calorias/me.
- “Comer agora” usa calorias_kcal da receita (fallback 250) → PATCH /api/perfil/calorias/consumir.
- Água: +ml → PATCH /api/perfil/calorias/agua; auto check-in água se ≥3000 ml.
- Auto check-in calorias quando consumo ≤110% da meta.
- Check-in treino:
  - GET /api/treinos/hoje/status define o estado do botão: “Check-in ✓”, “Conclua primeiro →” ou “Sem treino hoje”.
  - POST /api/gamificacao/checkin/treino quando concluído.
- Heatmap e badges atualizados após check-ins; popup “Parabéns!” com confetti ao desbloquear badge.

## Import via CSV (amostras)
- Receitas (com calorias):
  - Arquivo: samples/receitas.csv
  - Cabeçalho: recipe_number,name,image_url,image_hint,portions,temperature,total_time,tip,protein_grams,tags,status,plano_minimo,cronometro,calorias_kcal
  - Endpoint: POST /api/receitas/import
- Treinos (estrutura):
  - Arquivo: samples/treinos_unificado.csv
  - Formato exercise/day/group aceito em /admin/import (cria exercícios, dias e grupos).

## PWA + Mobile
- PWA: public/manifest.json e public/sw.js (cache estático/treinos).
- Capacitor: capacitor.config.ts (base para sync e build mobile).

## Deploy
- vercel.json com env secrets mapeados.
- Script: ./deploy.sh (env pull, build, vercel --prod).
- Roteiro de validação pós-deploy no README.

## Convenções e Regras
- Não alterar páginas críticas (/login, /treinos, /recipes), middleware, auth e analytics sem adaptação prévia.
- CSVs antigos de receitas seguem funcionando (coluna calorias_kcal é opcional).
- Teste E2E após mudanças sensíveis.

## Referências de Código
- Admin Analytics: [src/app/admin/analytics/page.tsx](file:///C:/Projetos%20Trae/Dieta%20-%20Template%20Verde/src/app/admin/analytics/page.tsx)
- Gamificação (streaks): [src/app/api/gamificacao/streaks/route.ts](file:///C:/Projetos%20Trae/Dieta%20-%20Template%20Verde/src/app/api/gamificacao/streaks/route.ts)
- Check-ins: [src/app/api/gamificacao/checkin](file:///C:/Projetos%20Trae/Dieta%20-%20Template%20Verde/src/app/api/gamificacao/checkin)
- Perfil/Calorias: [src/app/api/perfil/calorias](file:///C:/Projetos%20Trae/Dieta%20-%20Template%20Verde/src/app/api/perfil/calorias)
- Receitas repo/API: [src/repositories/recipes.repo.ts](file:///C:/Projetos%20Trae/Dieta%20-%20Template%20Verde/src/repositories/recipes.repo.ts), [src/app/api/recipes/route.ts](file:///C:/Projetos%20Trae/Dieta%20-%20Template%20Verde/src/app/api/recipes/route.ts)
- Import Admin: [src/app/api/admin/import/route.ts](file:///C:/Projetos%20Trae/Dieta%20-%20Template%20Verde/src/app/api/admin/import/route.ts)
- HomePage (UI): [src/components/pages/HomePage.tsx](file:///C:/Projetos%20Trae/Dieta%20-%20Template%20Verde/src/components/pages/HomePage.tsx)

