import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as Repo from '@/repositories/dailyMeals.repo'

const rowsExample = [
  { id: 'm1', user_id: 'u1', recipe_id: 'r1', meal_type: 'cafe_da_manha', calories: 300, date: '2026-03-09', consumed: false, consumed_at: null, created_at: new Date().toISOString(), recipe_name: 'A', recipe_image_url: null },
  { id: 'm2', user_id: 'u1', recipe_id: 'r2', meal_type: 'almoco', calories: 500, date: '2026-03-09', consumed: false, consumed_at: null, created_at: new Date().toISOString(), recipe_name: 'B', recipe_image_url: null },
  { id: 'm3', user_id: 'u1', recipe_id: 'r3', meal_type: 'lanche_da_tarde', calories: 200, date: '2026-03-09', consumed: false, consumed_at: null, created_at: new Date().toISOString(), recipe_name: 'C', recipe_image_url: null },
  { id: 'm4', user_id: 'u1', recipe_id: 'r4', meal_type: 'jantar', calories: 400, date: '2026-03-09', consumed: false, consumed_at: null, created_at: new Date().toISOString(), recipe_name: 'D', recipe_image_url: null },
]

const hoisted = vi.hoisted(() => ({
  queryMock: vi.fn(async (sql: string, params?: any[]) => {
    if (/SELECT\s+dm\.id/.test(sql)) {
      return { rows: rowsExample }
    }
    if (/SELECT\s+1\s+FROM\s+daily_meals/.test(sql)) {
      return { rows: [{ x: 1 }] }
    }
    if (/UPDATE\s+daily_meals\s+SET\s+consumed=true/.test(sql)) {
      return { rows: [{ id: params?.[0], user_id: params?.[1], recipe_id: 'rx', meal_type: 'almoco', calories: 500, date: '2026-03-09', consumed: true, consumed_at: new Date().toISOString() }] }
    }
    if (/UPDATE\s+daily_meals\s+SET\s+recipe_id=/.test(sql)) {
      return { rows: [{ id: params?.[0], user_id: params?.[1], recipe_id: params?.[2], meal_type: 'almoco', calories: params?.[3], date: '2026-03-09', consumed: false }] }
    }
    return { rows: [] }
  }),
}))

vi.mock('@/lib/db', () => ({ query: hoisted.queryMock }))

beforeEach(() => {
  hoisted.queryMock.mockClear()
})

describe('dailyMeals.repo', () => {
  it('createDailyMealsForDate insere quatro refeições com proteção de duplicidade', async () => {
    const userId = 'u1'
    const date = '2026-03-09'
    const meals: Repo.NewMeal[] = [
      { recipe_id: 'r1', meal_type: 'cafe_da_manha', calories: 300 },
      { recipe_id: 'r2', meal_type: 'almoco', calories: 500 },
      { recipe_id: 'r3', meal_type: 'lanche_da_tarde', calories: 200 },
      { recipe_id: 'r4', meal_type: 'jantar', calories: 400 },
    ]
    const result = await Repo.createDailyMealsForDate(userId, date, meals)
    expect(result.length).toBe(4)
    const insertCalls = hoisted.queryMock.mock.calls.filter((c) => typeof c[0] === 'string' && /INSERT\s+INTO\s+daily_meals/.test(c[0]))
    expect(insertCalls.length).toBe(4)
    insertCalls.forEach((c) => {
      expect(String(c[0])).toMatch(/ON\s+CONFLICT\s+\(user_id,\s*date,\s*meal_type\)\s+DO\s+NOTHING/)
    })
  })

  it('existsDailyMealsForDate retorna true quando há registros', async () => {
    const ok = await Repo.existsDailyMealsForDate('u1', '2026-03-09')
    expect(ok).toBe(true)
  })

  it('markMealConsumed marca consumido e retorna registro atualizado', async () => {
    const updated = await Repo.markMealConsumed('meal-x', 'u1')
    expect(updated).toBeTruthy()
    expect(updated?.consumed).toBe(true)
    expect(updated?.consumed_at).toBeTruthy()
  })

  it('swapDailyMeal troca receita e calorias e zera consumo', async () => {
    const swapped = await Repo.swapDailyMeal('meal-y', 'u1', { id: 'new-recipe', calories: 450 })
    expect(swapped).toBeTruthy()
    expect(swapped?.recipe_id).toBe('new-recipe')
    expect(swapped?.calories).toBe(450)
    expect(swapped?.consumed).toBe(false)
  })
})
