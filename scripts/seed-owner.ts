import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

async function run() {
  const email = 'jefferson.duarte19924@gmail.com'
  const password = 'OwnerInicial#123'
  const name = 'Owner'
  const supabase = getSupabaseAdmin()
  const list = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
  let uid = list.data?.users?.find(u => (u.email || '').toLowerCase() === email.toLowerCase())?.id
  if (!uid) {
    const c = await supabase.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } })
    if (c.error) throw new Error(c.error.message)
    uid = c.data.user?.id || ''
  }
  await supabase.from('user_roles').upsert({ user_id: uid!, role: 'owner' })
  await supabase.from('user_security').upsert({
    user_id: uid!,
    is_protected: true,
    can_be_deleted: false,
    can_be_demoted: false
  })
  await supabase.from('audit_logs').insert({ actor_user_id: uid, target_user_id: uid, action: 'bootstrap_owner', details: {} } as any)
  console.log('owner_ready', { email, id: uid })
}

run().catch(e => { console.error(e); process.exit(1) })
