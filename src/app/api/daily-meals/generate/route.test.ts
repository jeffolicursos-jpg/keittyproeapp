import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

type Recipe = { id: string; calories: number; meal_type?: string }
type DbRows<T = any> = { rows: T[] }
const hoisted = vi.hoisted(() => ({
  queryMock: vi.fn<(...args: any[]) => Promise<DbRows<any>>>(async () => ({ rows: [] })),
  findRecipesByFilters: vi.fn<(filters: any) => Promise<Recipe[]>>(async () => []),
  existsDailyMealsForDate: vi.fn<(userId?: string, date?: string) => Promise<boolean>>(async () => false),
  listDailyMealsByDate: vi.fn<(userId?: string, date?: string) => Promise<any[]>>(async () => []),
  createDailyMealsForDate: vi.fn<(userId: string, date: string, meals: any[]) => Promise<any[]>>(async () => []),
}))

vi.mock('@/lib/db', () => ({ query: hoisted.queryMock }))
vi.mock('@/lib/jwt', () => ({ verifyAccess: () => ({ sub: 'u1' }) }))
vi.mock('@/repositories/recipes.repo', () => ({ findRecipesByFilters: hoisted.findRecipesByFilters }))
vi.mock('@/repositories/dailyMeals.repo', () => ({
  existsDailyMealsForDate: hoisted.existsDailyMealsForDate,
  listDailyMealsByDate: hoisted.listDailyMealsByDate,
  createDailyMealsForDate: hoisted.createDailyMealsForDate,
}))

describe('daily-meals generate API', () => {
  beforeEach(() => {
    hoisted.queryMock.mockReset()
    hoisted.findRecipesByFilters.mockReset()
    hoisted.existsDailyMealsForDate.mockReset()
    hoisted.listDailyMealsByDate.mockReset()
    hoisted.createDailyMealsForDate.mockReset()
  })

  it('sucesso: gera as 4 refeições esperadas', async () => {
    hoisted.queryMock.mockResolvedValueOnce({ rows: [{ objetivo: 'manter', meta_diaria: 2000 }] })
    hoisted.existsDailyMealsForDate.mockResolvedValueOnce(false)
    const recipeBySlot = [
      { id: 'r_cm', calories: 500 },
      { id: 'r_al', calories: 700 },
      { id: 'r_lt', calories: 300 },
      { id: 'r_ja', calories: 500 },
    ]
    hoisted.findRecipesByFilters
      .mockResolvedValueOnce([recipeBySlot[0]])
      .mockResolvedValueOnce([recipeBySlot[1]])
      .mockResolvedValueOnce([recipeBySlot[2]])
      .mockResolvedValueOnce([recipeBySlot[3]])
    hoisted.createDailyMealsForDate.mockResolvedValueOnce([
      { id: 'm1', recipe_id: 'r_cm', meal_type: 'cafe_da_manha', calories: 500, date: '2026-03-09' },
      { id: 'm2', recipe_id: 'r_al', meal_type: 'almoco', calories: 700, date: '2026-03-09' },
      { id: 'm3', recipe_id: 'r_lt', meal_type: 'lanche_da_tarde', calories: 300, date: '2026-03-09' },
      { id: 'm4', recipe_id: 'r_ja', meal_type: 'jantar', calories: 500, date: '2026-03-09' },
    ])

    const req: any = { cookies: { get: () => ({ value: 'token' }) } }
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.items)).toBe(true)
    expect(data.items.length).toBe(4)
    expect(hoisted.findRecipesByFilters.mock.calls.length).toBe(4)
    expect(hoisted.createDailyMealsForDate.mock.calls.length).toBe(1)
    const createdArg = hoisted.createDailyMealsForDate.mock.calls[0][2] as any[]
    expect(Array.isArray(createdArg) && createdArg.length === 4).toBe(true)
  })

  it('idempotência: se já existir, retorna sem duplicar', async () => {
    hoisted.queryMock.mockResolvedValueOnce({ rows: [{ objetivo: 'manter', meta_diaria: 1800 }] })
    hoisted.existsDailyMealsForDate.mockResolvedValueOnce(true)
    hoisted.listDailyMealsByDate.mockResolvedValueOnce([
      { id: 'm1', meal_type: 'cafe_da_manha' },
      { id: 'm2', meal_type: 'almoco' },
      { id: 'm3', meal_type: 'lanche_da_tarde' },
      { id: 'm4', meal_type: 'jantar' },
    ])

    const req: any = { cookies: { get: () => ({ value: 'token' }) } }
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.items.length).toBe(4)
    expect(hoisted.createDailyMealsForDate.mock.calls.length).toBe(0)
    expect(hoisted.listDailyMealsByDate.mock.calls.length).toBe(1)
  })

  it('falha controlada: meta diária ausente', async () => {
    hoisted.queryMock.mockResolvedValueOnce({ rows: [{ objetivo: 'manter', meta_diaria: 0 }] })
    const req: any = { cookies: { get: () => ({ value: 'token' }) } }
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('no_profile')
    expect(hoisted.createDailyMealsForDate.mock.calls.length).toBe(0)
  })

  it('falha controlada: sem candidatos suficientes', async () => {
    hoisted.queryMock.mockResolvedValueOnce({ rows: [{ objetivo: 'manter', meta_diaria: 2000 }] })
    hoisted.existsDailyMealsForDate.mockResolvedValueOnce(false)
    hoisted.findRecipesByFilters.mockImplementation(async () => [])
    const req: any = { cookies: { get: () => ({ value: 'token' }) } }
    const res = await POST(req)
    expect(res.status).toBe(404)
    const data = await res.json()
    expect(data.error).toBe('no_candidates')
    expect(hoisted.createDailyMealsForDate.mock.calls.length).toBe(0)
  })
})
