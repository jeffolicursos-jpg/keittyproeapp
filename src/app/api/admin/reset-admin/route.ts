import { NextRequest, NextResponse } from 'next/server'
import { ENV } from '@/lib/env'
import { findByEmail, ensureAdmin } from '@/repositories/users.repo'
import { query } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-reset-secret') || ''
  if (!secret || secret !== ENV.ADMIN_RESET_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const email = String(body.email || '').toLowerCase().trim()
    const nome = String(body.nome || 'Admin').trim()
    const senha = String(body.senha || '').trim()
    if (!email || !senha) {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 })
    }
    const bcrypt = require('bcryptjs')
    const hash = await bcrypt.hash(senha, 12)
    const existing = await findByEmail(email).catch(() => null as any)
    const user = await ensureAdmin(email, nome, hash)
    if (existing?.id) {
      await query('DELETE FROM refresh_tokens WHERE user_id=$1', [existing.id])
    } else if (user?.id) {
      await query('DELETE FROM refresh_tokens WHERE user_id=$1', [user.id])
    }
    return NextResponse.json({ ok: true, email, action: existing ? 'updated' : 'created' })
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
