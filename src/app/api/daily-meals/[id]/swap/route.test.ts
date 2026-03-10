import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PATCH } from './route'

type Meal = { id: string; user_id: string; recipe_id: string; meal_type: string; calories: number; date?: string }
type Recipe = { id: string; calories: number; meal_type?: string }
type DbRows<T = any> = { rows: T[] }

const hoisted = vi.hoisted(() => ({
  queryMock: vi.fn<(...args: any[]) => Promise<DbRows<any>>>(async () => ({ rows: [] })),
  findRecipesByFilters: vi.fn<(filters: any) => Promise<Recipe[]>>(async () => []),
  getMealById: vi.fn<(id: string, userId: string) => Promise<Meal | null>>(async () => null),
  swapDailyMeal: vi.fn<(id: string, userId: string, pick: { id: string; calories: number }) => Promise<any>>(async () => ({})),
}))

vi.mock('@/lib/db', () => ({ query: hoisted.queryMock }))
vi.mock('@/lib/jwt', () => ({ verifyAccess: () => ({ sub: 'u1' }) }))
vi.mock('@/repositories/recipes.repo', () => ({ findRecipesByFilters: hoisted.findRecipesByFilters }))
vi.mock('@/repositories/dailyMeals.repo', () => ({
  getMealById: hoisted.getMealById,
  swapDailyMeal: hoisted.swapDailyMeal,
}))

describe('daily-meals swap API', () => {
  beforeEach(() => {
    hoisted.queryMock.mockReset()
    hoisted.findRecipesByFilters.mockReset()
    hoisted.getMealById.mockReset()
    hoisted.swapDailyMeal.mockReset()
  })

  it('sucesso: troca a refeição e retorna item atualizado', async () => {
    hoisted.getMealById.mockResolvedValueOnce({ id: 'm1', user_id: 'u1', recipe_id: 'r1', meal_type: 'almoco', calories: 500 })
    hoisted.queryMock.mockResolvedValueOnce({ rows: [{ objetivo: 'manter' }] })
    hoisted.findRecipesByFilters
      .mockResolvedValueOnce([{ id: 'r2', calories: 510 }, { id: 'r1', calories: 500 }]) // primeira busca
    hoisted.swapDailyMeal.mockResolvedValueOnce({ id: 'm1', user_id: 'u1', recipe_id: 'r2', meal_type: 'almoco', calories: 510 })

    const req: any = { cookies: { get: () => ({ value: 'token' }) } }
    const res = await PATCH(req, { params: Promise.resolve({ id: 'm1' }) })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.item?.recipe_id).toBe('r2')
    expect(hoisted.swapDailyMeal.mock.calls.length).toBe(1)
    const args = hoisted.swapDailyMeal.mock.calls[0]
    expect(args[0]).toBe('m1')
    expect(args[1]).toBe('u1')
    expect(args[2]).toEqual({ id: 'r2', calories: 510 })
  })

  it('erro: acesso inválido (sem cookie)', async () => {
    const req: any = { cookies: { get: () => undefined } }
    const res = await PATCH(req, { params: Promise.resolve({ id: 'm1' }) })
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('no_access')
  })

  it('falha controlada: sem candidatos válidos', async () => {
    hoisted.getMealById.mockResolvedValueOnce({ id: 'm1', user_id: 'u1', recipe_id: 'r1', meal_type: 'almoco', calories: 500 })
    hoisted.queryMock.mockResolvedValueOnce({ rows: [{ objetivo: 'manter' }] })
    hoisted.findRecipesByFilters
      .mockResolvedValueOnce([]) // primeira busca
      .mockResolvedValueOnce([]) // fallback widen range
    const req: any = { cookies: { get: () => ({ value: 'token' }) } }
    const res = await PATCH(req, { params: Promise.resolve({ id: 'm1' }) })
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('no_candidates')
    expect(hoisted.swapDailyMeal.mock.calls.length).toBe(0)
  })
})

