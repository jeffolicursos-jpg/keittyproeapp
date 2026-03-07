import { query } from '@/lib/db';

export async function latestStatus(userId: string) {
  const r = await query(
    'SELECT status FROM subscriptions WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 1',
    [userId]
  );
  return r.rows[0]?.status || null;
}

export async function activate(userId: string, gateway: string) {
  await query(
    'INSERT INTO subscriptions (user_id,gateway,status,data_inicio,renovacao_automatica) VALUES ($1,$2,$3, CURRENT_DATE, TRUE)',
    [userId, gateway, 'ativa']
  );
}

export async function activateWithPlan(userId: string, gateway: string, plano?: 'basico' | 'premium' | 'vip', gatewayId?: string) {
  const historico = gatewayId ? { gateway_id: gatewayId } : {};
  await query(
    'INSERT INTO subscriptions (user_id,gateway,status,data_inicio,renovacao_automatica, historico, plano) VALUES ($1,$2,$3, CURRENT_DATE, TRUE, $4, $5)',
    [userId, gateway, 'ativa', historico, plano || null]
  );
}

export async function activateWithPlanDetails(
  userId: string,
  gateway: string,
  plano?: 'basico' | 'premium' | 'vip',
  nome?: string,
  telefone?: string,
  setLoginNow?: boolean
) {
  const historico = {};
  await query(
    `INSERT INTO subscriptions (user_id,gateway,status,data_inicio,renovacao_automatica, historico, plano, nome, telefone, last_login_at)
     VALUES ($1,$2,'ativa', CURRENT_DATE, TRUE, $3, $4, $5, $6, $7)`,
    [userId, gateway, historico, plano || null, nome || null, telefone || null, setLoginNow ? new Date() : null]
  );
}

export async function updateByEmail(email: string, status: string) {
  const u = await query('SELECT id FROM users WHERE email=$1 LIMIT 1', [email]);
  const userId = u.rows[0]?.id;
  if (!userId) return;
  await query(
    'INSERT INTO subscriptions (user_id,gateway,status,data_inicio,renovacao_automatica) VALUES ($1,$2,$3, CURRENT_DATE, TRUE)',
    [userId, 'kiwify', status]
  );
}

export async function latestDetails(userId: string) {
  const r = await query(
    'SELECT id, user_id, gateway, status, data_inicio, data_fim, renovacao_automatica, historico, plano, created_at, updated_at FROM subscriptions WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 1',
    [userId]
  );
  return r.rows[0] || null;
}

export async function cancel(userId: string) {
  await query(
    'INSERT INTO subscriptions (user_id,gateway,status,data_inicio,renovacao_automatica) VALUES ($1,$2,$3, CURRENT_DATE, FALSE)',
    [userId, 'banco_proprio', 'cancelada']
  );
}

export async function updateByEmailWithPlan(email: string, status: string, plano?: 'basico' | 'premium' | 'vip', gatewayId?: string) {
  const u = await query('SELECT id FROM users WHERE email=$1 LIMIT 1', [email]);
  const userId = u.rows[0]?.id;
  if (!userId) return;
  const historico = gatewayId ? { gateway_id: gatewayId } : {};
  await query(
    'INSERT INTO subscriptions (user_id,gateway,status,data_inicio,renovacao_automatica, historico, plano) VALUES ($1,$2,$3, CURRENT_DATE, TRUE, $4, $5)',
    [userId, 'kiwify', status, historico, plano || null]
  );
}

export async function getUserPlan(userId: string): Promise<'basico' | 'premium' | 'vip' | null> {
  const r = await query(
    'SELECT plano FROM subscriptions WHERE user_id=$1 AND status=$2 ORDER BY updated_at DESC LIMIT 1',
    [userId, 'ativa']
  );
  const p = r.rows[0]?.plano || null;
  return p;
}

export async function setLastLogin(userId: string) {
  const r = await query(
    'UPDATE subscriptions SET last_login_at=now(), updated_at=now() WHERE id=(SELECT id FROM subscriptions WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 1)',
    [userId]
  );
  if (r.rowCount === 0) {
    await query(
      'INSERT INTO subscriptions (user_id,gateway,status,data_inicio,renovacao_automatica,last_login_at) VALUES ($1,$2,$3, CURRENT_DATE, TRUE, now())',
      [userId, 'banco_proprio', 'ativa']
    );
  }
}
