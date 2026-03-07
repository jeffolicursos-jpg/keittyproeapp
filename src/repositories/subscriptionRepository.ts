import { safeQuery } from '@/lib/safeQuery'

export type SubscriptionRow = {
  id: string
  user_id: string
  gateway: string | null
  status: string | null
  data_inicio: string | null
  data_fim?: string | null
  renovacao_automatica?: boolean | null
  historico?: any
  plano?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export async function getSubscriptionByUserId(userId: string) {
  const r = await safeQuery<SubscriptionRow>(
    `SELECT id, user_id, gateway, status, data_inicio, data_fim, renovacao_automatica, historico, plano, created_at, updated_at
     FROM subscriptions
     WHERE user_id=$1
     ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
     LIMIT 1`,
    [userId]
  )
  return r.rows[0] || null
}

export type CreateSubscriptionInput = {
  user_id: string
  gateway: string
  status: string
  historico?: any
  plano?: string | null
}

export async function createSubscription(data: CreateSubscriptionInput) {
  const r = await safeQuery<SubscriptionRow>(
    `INSERT INTO subscriptions (user_id, gateway, status, data_inicio, renovacao_automatica, historico, plano)
     VALUES ($1,$2,$3, CURRENT_DATE, TRUE, $4, $5)
     RETURNING id, user_id, gateway, status, data_inicio, data_fim, renovacao_automatica, historico, plano, created_at, updated_at`,
    [data.user_id, data.gateway, data.status, data.historico ?? null, data.plano ?? null]
  )
  return r.rows[0]
}

export async function updateSubscriptionStatus(id: string, status: string) {
  const r = await safeQuery<SubscriptionRow>(
    `UPDATE subscriptions
     SET status=$2, updated_at=now()
     WHERE id=$1
     RETURNING id, user_id, gateway, status, data_inicio, data_fim, renovacao_automatica, historico, plano, created_at, updated_at`,
    [id, status]
  )
  return r.rows[0] || null
}

