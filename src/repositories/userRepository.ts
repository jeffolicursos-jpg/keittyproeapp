import { safeQuery } from '@/lib/safeQuery'

export type UserRow = {
  id: string
  nome: string | null
  email: string
  senha_hash: string | null
  role: string | null
  status: string | null
  created_at: string | null
  updated_at: string | null
}

export async function getUserById(id: string) {
  const r = await safeQuery<UserRow>(
    'SELECT id, nome, email, senha_hash, role, status, created_at, updated_at FROM users WHERE id=$1 LIMIT 1',
    [id]
  )
  return r.rows[0] || null
}

export async function getUserByEmail(email: string) {
  const r = await safeQuery<UserRow>(
    'SELECT id, nome, email, senha_hash, role, status, created_at, updated_at FROM users WHERE email=$1 LIMIT 1',
    [email]
  )
  return r.rows[0] || null
}

export type CreateUserInput = {
  nome: string
  email: string
  senha_hash?: string | null
  role?: string | null
  status?: string | null
}

export async function createUser(data: CreateUserInput) {
  const nome = data.nome
  const email = data.email.toLowerCase()
  const senha_hash = data.senha_hash ?? null
  const role = data.role ?? 'usuario'
  const status = data.status ?? 'ativo'
  const r = await safeQuery<UserRow>(
    `INSERT INTO users (nome, email, senha_hash, role, status)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (email) DO UPDATE SET
       nome=EXCLUDED.nome,
       senha_hash=COALESCE(EXCLUDED.senha_hash, users.senha_hash),
       role=COALESCE(EXCLUDED.role, users.role),
       status=COALESCE(EXCLUDED.status, users.status),
       updated_at=now()
     RETURNING id, nome, email, senha_hash, role, status, created_at, updated_at`,
    [nome, email, senha_hash, role, status]
  )
  return r.rows[0]
}

