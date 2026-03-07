import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
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
  const isProtected = Boolean(body.isProtected ?? true)
  const canBeDeleted = Boolean(body.canBeDeleted ?? !isProtected)
  const canBeDemoted = Boolean(body.canBeDemoted ?? !isProtected)
  if (!targetUserId) return NextResponse.json({ error: 'invalid' }, { status: 400 })
  await supabase.from('user_security').upsert({
    user_id: targetUserId,
    is_protected: isProtected,
    can_be_deleted: canBeDeleted,
    can_be_demoted: canBeDemoted
  })
  await supabase.from('audit_logs').insert({
    actor_user_id: actor.id,
    target_user_id: targetUserId,
    action: 'protect_user',
    details: { isProtected, canBeDeleted, canBeDemoted }
  } as any)
  return NextResponse.json({ ok: true })
}
