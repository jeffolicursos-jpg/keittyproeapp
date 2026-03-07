type Role = 'owner' | 'super_admin' | 'admin' | 'staff' | 'user'

const order: Role[] = ['user', 'staff', 'admin', 'super_admin', 'owner']

export function roleGte(a: Role, b: Role) {
  return order.indexOf(a) >= order.indexOf(b)
}

export function normalizeRole(r?: string | null): Role {
  const v = String(r || 'user').toLowerCase()
  if (v === 'owner' || v === 'super_admin' || v === 'admin' || v === 'staff' || v === 'user') return v
  return 'user'
}

export function canCreateUser(actor: Role, newRole: Role) {
  if (actor === 'owner') return true
  if (actor === 'super_admin') return newRole === 'admin' || newRole === 'staff' || newRole === 'user'
  if (actor === 'admin') return newRole === 'staff' || newRole === 'user'
  return false
}

export function canPromote(actor: Role, target: Role, toRole: Role) {
  if (toRole === 'owner') return actor === 'owner'
  if (target === 'owner' && actor !== 'owner') return false
  if (actor === 'super_admin') return toRole === 'admin' || toRole === 'super_admin'
  if (actor === 'owner') return target !== 'owner'
  return false
}

export function canDemote(actor: Role, target: Role) {
  if (target === 'owner' && actor !== 'owner') return false
  return actor === 'owner' || actor === 'super_admin'
}

export function canDelete(actor: Role, target: Role) {
  if (target === 'owner') return false
  if (actor === 'owner') return true
  if (actor === 'super_admin') return target !== 'super_admin'
  if (actor === 'admin') return target === 'staff' || target === 'user'
  return false
}
