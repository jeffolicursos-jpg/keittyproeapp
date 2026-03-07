import { query } from '@/lib/db';

export async function createActivationToken(userId: string, tokenHash: string, expiresAt: Date) {
  await query(
    'INSERT INTO password_tokens (user_id, token_hash, type, expires_at) VALUES ($1,$2,$3,$4)',
    [userId, tokenHash, 'activation', expiresAt.toISOString()]
  );
}

export async function saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked) VALUES ($1,$2,$3,false)',
    [userId, tokenHash, expiresAt.toISOString()]
  );
}

export async function isRefreshTokenValid(userId: string, tokenHash: string) {
  const r = await query(
    'SELECT 1 FROM refresh_tokens WHERE user_id=$1 AND token_hash=$2 AND revoked=false AND expires_at>now() LIMIT 1',
    [userId, tokenHash]
  );
  return !!r.rows[0];
}

export async function revokeRefreshToken(userId: string, tokenHash: string) {
  await query(
    'UPDATE refresh_tokens SET revoked=true WHERE user_id=$1 AND token_hash=$2',
    [userId, tokenHash]
  );
}
