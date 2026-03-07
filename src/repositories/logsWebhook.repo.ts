import { query } from '@/lib/db';

export async function exists(eventId: string) {
  const r = await query('SELECT 1 FROM logs_webhook WHERE event_id=$1 LIMIT 1', [eventId]);
  return !!r.rows[0];
}

export async function record(provider: string, eventId: string, status: string, payload: any) {
  await query(
    'INSERT INTO logs_webhook (provider,event_id,status,payload) VALUES ($1,$2,$3,$4)',
    [provider, eventId, status, payload]
  );
}
