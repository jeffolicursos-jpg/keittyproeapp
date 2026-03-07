import { query } from '@/lib/db';

export async function findByEmail(email: string) {
  const r = await query(
    'SELECT id, email, senha_hash, role, status FROM users WHERE email=$1 LIMIT 1',
    [email]
  );
  return r.rows[0] || null;
}

export async function findById(id: string) {
  const r = await query(
    'SELECT id, email, role, status FROM users WHERE id=$1 LIMIT 1',
    [id]
  );
  return r.rows[0] || null;
}

export async function upsertActivation(email: string, nome: string) {
  const existing = await findByEmail(email);
  if (existing) return existing;
  const r = await query(
    'INSERT INTO users (nome,email,status) VALUES ($1,$2,$3) RETURNING id,email,role,status',
    [nome, email, 'aguardando_senha']
  );
  return r.rows[0];
}

export async function ensureAdmin(email: string, nome: string, senha_hash: string) {
  const exist = await query('SELECT id FROM users WHERE email=$1 LIMIT 1', [email]);
  if (exist.rows[0]?.id) {
    const r = await query(
      'UPDATE users SET senha_hash=$2, role=$3, status=$4, updated_at=now() WHERE email=$1 RETURNING id,email,role,status',
      [email, senha_hash, 'admin', 'ativo']
    );
    return r.rows[0];
  } else {
    const r = await query(
      'INSERT INTO users (nome,email,senha_hash,role,status) VALUES ($1,$2,$3,$4,$5) RETURNING id,email,role,status',
      [nome, email, senha_hash, 'admin', 'ativo']
    );
    return r.rows[0];
  }
}
