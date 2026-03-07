import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { normalizeRole } from '@/lib/rbac'
import { verifyAccess } from '@/lib/jwt'
import { findById } from '@/repositories/users.repo'

export type Role = 'owner' | 'super_admin' | 'admin' | 'staff' | 'user'

export async function getActor(req: NextRequest) {
  const access = req.cookies.get('access')?.value || ''
  const payload = access ? verifyAccess(access) : null
  if (!payload?.sub) return { id: null as string | null, email: '', role: 'user' as Role }
  const user = await findById(payload.sub).catch(() => null as any)
  const email = String(user?.email || '').toLowerCase()
  if (!email) return { id: null as string | null, email: '', role: 'user' as Role }
  const supabase = getSupabaseAdmin()
  const list = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
  const authUser = list.data?.users?.find(u => (u.email || '').toLowerCase() === email.toLowerCase()) || null
  const userId = authUser?.id || null
  let role: Role = 'user'
  if (userId) {
    const r = await supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle()
    role = normalizeRole((r.data as any)?.role || 'user')
  }
  return { id: userId, email, role }
}
