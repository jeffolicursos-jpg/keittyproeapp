import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { canDemote, normalizeRole } from '@/lib/rbac'
import { getActor } from '@/lib/adminGuard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const actor = await getActor(req)
  if (!(actor.role === 'owner' || actor.role === 'super_admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const targetUserId = String(body.targetUserId || '')
  const newRole = normalizeRole(body.newRole || '')
  if (!targetUserId || !newRole) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const sec = await supabase.from('user_security').select('can_be_demoted').eq('user_id', targetUserId).maybeSingle()
  if ((sec.data as any)?.can_be_demoted === false) return NextResponse.json({ error: 'protected' }, { status: 403 })
  const current = await supabase.from('user_roles').select('role').eq('user_id', targetUserId).maybeSingle()
  const targetRole = normalizeRole((current.data as any)?.role || 'user')
  if (!canDemote(actor.role, targetRole)) return NextResponse.json({ error: 'forbidden_role' }, { status: 403 })
  await supabase.from('user_roles').upsert({ user_id: targetUserId, role: newRole })
  await supabase.from('audit_logs').insert({
    actor_user_id: actor.id,
    target_user_id: targetUserId,
    action: 'demote',
    details: { from: targetRole, to: newRole }
  } as any)
  return NextResponse.json({ ok: true })
}
