import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { getActor } from '@/lib/adminGuard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  const actor = await getActor(req)
  if (!(actor.role === 'owner' || actor.role === 'super_admin' || actor.role === 'admin')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const page = Number(new URL(req.url).searchParams.get('page') || '1') || 1
  const perPage = Number(new URL(req.url).searchParams.get('perPage') || '50') || 50
  const users = await supabase.auth.admin.listUsers({ page, perPage })
  if (users.error) return NextResponse.json({ error: users.error.message }, { status: 500 })
  const ids = users.data.users.map(u => u.id)
  const rolesRes = await supabase.from('user_roles').select('user_id,role').in('user_id', ids)
  const secRes = await supabase.from('user_security').select('user_id,is_protected,can_be_deleted,can_be_demoted').in('user_id', ids)
  const roles = new Map((rolesRes.data || []).map((r: any) => [r.user_id, r.role]))
  const secs = new Map((secRes.data || []).map((r: any) => [r.user_id, r]))
  const items = users.data.users.map(u => {
    const s = secs.get(u.id) || {}
    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      role: roles.get(u.id) || 'user',
      is_protected: !!s.is_protected,
      can_be_deleted: s.can_be_deleted !== false,
      can_be_demoted: s.can_be_demoted !== false
    }
  })
  return NextResponse.json({ items, page, perPage })
}
