INSERT INTO users (nome, email, senha_hash, role, status)
VALUES
('Admin', 'admin@teste.com', crypt('123456', gen_salt('bf', 12)), 'admin', 'ativo'),
('Aluno', 'aluno@teste.com', crypt('123456', gen_salt('bf', 12)), 'usuario', 'ativo');

INSERT INTO recipes (recipe_number, name, image_url, image_hint, portions, temperature, total_time, tip, protein_grams, tags, status, user_id)
VALUES
(1, 'Omelete de Claras', NULL, NULL, 1, 'médio', '10 min', 'Use frigideira antiaderente', 25, ARRAY['Café da Manhã','Proteico'], 'published', NULL),
(2, 'Peito de Frango Grelhado', NULL, NULL, 1, 'alto', '20 min', 'Tempere com sal e pimenta', 30, ARRAY['Prato Principal','Proteico'], 'published', NULL);

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM users WHERE email='admin@teste.com';

INSERT INTO user_security (user_id, is_protected, can_be_deleted, can_be_demoted)
SELECT id, TRUE, FALSE, FALSE FROM users WHERE email='admin@teste.com';

INSERT INTO audit_logs (actor_user_id, target_user_id, action, details)
SELECT id, id, 'snapshot_seed', '{}'::jsonb FROM users WHERE email='admin@teste.com';
