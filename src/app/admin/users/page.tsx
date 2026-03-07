'use client'
import { useEffect, useState } from 'react'

type Item = {
  id: string
  email: string | null
  created_at: string | null
  role: string
  is_protected: boolean
  can_be_deleted: boolean
  can_be_demoted: boolean
}

export default function AdminUsersPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  async function load() {
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/admin/users/list')
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'erro')
      setItems(j.items || [])
    } catch (e: any) {
      setError(e?.message || 'erro')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  return (
    <div style={{ padding: 16 }}>
      <h1>Gestão de Usuários</h1>
      {loading && <div>Carregando...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button onClick={load}>Atualizar</button>
      <table style={{ width: '100%', marginTop: 12 }}>
        <thead>
          <tr>
            <th>Email</th><th>Role</th><th>Protegido</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map(u => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.is_protected ? 'Sim' : 'Não'}</td>
              <td style={{ display: 'flex', gap: 8 }}>
                <button onClick={async () => { await fetch('/api/admin/users/promote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ targetUserId: u.id, newRole: 'admin' }) }); load() }}>Promover</button>
                <button onClick={async () => { await fetch('/api/admin/users/demote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ targetUserId: u.id, newRole: 'user' }) }); load() }}>Rebaixar</button>
                <button onClick={async () => { await fetch('/api/admin/users/protect', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ targetUserId: u.id, isProtected: !u.is_protected, canBeDeleted: !u.is_protected, canBeDemoted: !u.is_protected }) }); load() }}>{u.is_protected ? 'Desproteger' : 'Proteger'}</button>
                <button onClick={async () => { await fetch('/api/admin/users/delete', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ targetUserId: u.id }) }); load() }} disabled={u.is_protected || !u.can_be_deleted}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

