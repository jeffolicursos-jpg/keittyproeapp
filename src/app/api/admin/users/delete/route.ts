import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { canDelete, normalizeRole } from '@/lib/rbac'
import { getActor } from '@/lib/adminGuard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const actor = await getActor(req)
  if (!(actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const targetUserId = String(body.targetUserId || '')
  if (!targetUserId) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  const sec = await supabase.from('user_security').select('is_protected,can_be_deleted').eq('user_id', targetUserId).maybeSingle()
  if ((sec.data as any)?.is_protected || (sec.data as any)?.can_be_deleted === false) {
    return NextResponse.json({ error: 'protected' }, { status: 403 })
  }
  const current = await supabase.from('user_roles').select('role').eq('user_id', targetUserId).maybeSingle()
  const targetRole = normalizeRole((current.data as any)?.role || 'user')
  if (!canDelete(actor.role, targetRole)) return NextResponse.json({ error: 'forbidden_role' }, { status: 403 })
  await supabase.from('user_roles').delete().eq('user_id', targetUserId)
  await supabase.from('user_security').delete().eq('user_id', targetUserId)
  const del = await supabase.auth.admin.deleteUser(targetUserId)
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 })
  await supabase.from('audit_logs').insert({
    actor_user_id: actor.id,
    target_user_id: targetUserId,
    action: 'delete_user',
    details: {}
  } as any)
  return NextResponse.json({ ok: true })
}
