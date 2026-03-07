import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ENV } from '@/lib/env';
import { rateLimit } from '@/lib/rateLimit';
import * as logsRepo from '@/repositories/logsWebhook.repo';
import * as usersRepo from '@/repositories/users.repo';
import * as subsRepo from '@/repositories/subscriptions.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function validSignature(raw: Buffer, sigHex: string, secret: string) {
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sigHex, 'hex'), Buffer.from(expected, 'hex'));
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  const rl = rateLimit(`webhook:${ip}`, 50, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const sig = req.headers.get('x-kiwify-signature') || '';
  const tsHeader = req.headers.get('x-timestamp') || req.headers.get('x-kiwify-timestamp') || '';
  const ts = Number(tsHeader || 0);
  if (!sig || Math.abs(Date.now() - ts) > 5 * 60 * 1000) return NextResponse.json({ error: 'stale' }, { status: 400 });
  // @ts-ignore rawBody is exposed by Next in edge cases; we reconstruct from request
  const rawText = await req.text();
  const raw = Buffer.from(rawText, 'utf-8');
  if (!validSignature(raw, sig, ENV.KIWIFY_WEBHOOK_SECRET)) return NextResponse.json({ error: 'bad_sig' }, { status: 401 });

  const evt = JSON.parse(raw.toString());
  const eventId = String(evt.id || '');
  if (!eventId) return NextResponse.json({ error: 'bad_event' }, { status: 400 });
  const already = await logsRepo.exists(eventId);
  if (already) return NextResponse.json({ ok: true });
  await logsRepo.record('kiwify', eventId, 'received', evt);

  const email = String(evt.customer?.email || '').toLowerCase();
  const nome = String(evt.customer?.name || 'Usuário');
  const type = String(evt.type || '');
  const gatewayId = String(evt.subscription?.id || evt.gateway_id || '');
  const plan = (() => {
    const gid = gatewayId.toLowerCase();
    if (gid.startsWith('sub_basico')) return 'basico';
    if (gid.startsWith('sub_premium')) return 'premium';
    if (gid.startsWith('sub_vip')) return 'vip';
    return undefined;
  })() as 'basico' | 'premium' | 'vip' | undefined;
  if (type === 'pagamento_aprovado') {
    const user = await usersRepo.upsertActivation(email, nome);
    await subsRepo.activateWithPlan(user.id, 'kiwify', plan, gatewayId);
    await logsRepo.record('kiwify', eventId, 'processed', { email, type, plan, gatewayId });
  } else if (type === 'cancelado') {
    await subsRepo.updateByEmailWithPlan(email, 'cancelada', plan, gatewayId);
    await logsRepo.record('kiwify', eventId, 'processed', { email, type, plan, gatewayId });
  } else if (type === 'reembolso') {
    await subsRepo.updateByEmailWithPlan(email, 'expirada', plan, gatewayId);
    await logsRepo.record('kiwify', eventId, 'processed', { email, type, plan, gatewayId });
  } else if (type === 'inadimplente') {
    await subsRepo.updateByEmailWithPlan(email, 'inadimplente', plan, gatewayId);
    await logsRepo.record('kiwify', eventId, 'processed', { email, type, plan, gatewayId });
  } else {
    await logsRepo.record('kiwify', eventId, 'ignored', { type, plan, gatewayId });
  }
  return NextResponse.json({ ok: true });
}

export async function OPTIONS() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Access-Control-Allow-Origin', ENV.CORS_ORIGIN);
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Headers', 'content-type,x-kiwify-signature,x-timestamp,x-kiwify-timestamp');
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  return res;
}
