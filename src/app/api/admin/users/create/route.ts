import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { canCreateUser, normalizeRole } from '@/lib/rbac'
import { getActor } from '@/lib/adminGuard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const actor = await getActor(req)
  if (!(actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const email = String(body.email || '').toLowerCase()
  const password = String(body.password || '')
  const name = String(body.name || '')
  const role = normalizeRole(body.role || 'user')
  const isProtected = Boolean(body.isProtected || false)
  if (!email || !password || !name) return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  if (!canCreateUser(actor.role, role)) return NextResponse.json({ error: 'forbidden_role' }, { status: 403 })
  const created = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } })
  if (created.error) return NextResponse.json({ error: created.error.message }, { status: 500 })
  const uid = created.data.user?.id!
  await supabase.from('user_roles').upsert({ user_id: uid, role })
  await supabase.from('user_security').upsert({
    user_id: uid,
    is_protected: isProtected,
    can_be_deleted: !isProtected,
    can_be_demoted: !isProtected
  })
  await supabase.from('audit_logs').insert({
    actor_user_id: actor.id,
    target_user_id: uid,
    action: 'create_user',
    details: { email, role, isProtected }
  } as any)
  return NextResponse.json({ ok: true, id: uid, email, role, is_protected: isProtected })
}
