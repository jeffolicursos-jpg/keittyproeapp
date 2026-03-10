import { describe, it, expect, vi } from 'vitest'
import { PATCH } from './route'

const hoisted = vi.hoisted(() => ({
  queryMock: vi.fn(async (sql: string, params?: any[]) => ({ rows: [] })),
}))
vi.mock('@/lib/db', () => ({ query: hoisted.queryMock }))
vi.mock('@/lib/jwt', () => ({ verifyAccess: () => ({ sub: 'u1' }) }))
vi.mock('@/repositories/dailyMeals.repo', () => ({
  markMealConsumed: vi.fn(async () => ({ id: 'm2', user_id: 'u1', recipe_id: 'r2', meal_type: 'almoco', calories: 500, date: '2026-03-09', consumed: true, consumed_at: new Date().toISOString() })),
  getMealById: vi.fn(async () => ({ id: 'm2', user_id: 'u1', recipe_id: 'r2', meal_type: 'almoco', calories: 500, date: '2026-03-09', consumed: true })),
}))

describe('daily-meals consume API', () => {
  it('insere calorias em daily_calories após consumo', async () => {
    const req: any = { cookies: { get: () => ({ value: 'token' }) } }
    const res = await PATCH(req, { params: Promise.resolve({ id: 'm2' }) })
    expect(res.status).toBe(200)
    const calls = hoisted.queryMock.mock.calls.filter((c) => String(c[0]).includes('INSERT INTO daily_calories'))
    expect(calls.length).toBe(1)
  })
})
