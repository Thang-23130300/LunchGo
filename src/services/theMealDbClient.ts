
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

export interface MealDbMeal {
  idMeal?: string
  strMeal?: string
  strMealThumb?: string
  strCategory?: string
  [key: string]: string | null | undefined
}

interface MealDbResponse {
  meals: MealDbMeal[] | null
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`TheMealDB request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function searchMeals(
  keyword: string,
): Promise<MealDbMeal[]> {
  const params = new URLSearchParams({ s: keyword })

  const result = await request<MealDbResponse>(
    `${BASE_URL}/search.php?${params.toString()}`,
  )

  return result.meals ?? []
}

export async function getMealById(
  id: string,
): Promise<MealDbMeal | null> {
  const params = new URLSearchParams({ i: id })

  const result = await request<MealDbResponse>(
    `${BASE_URL}/lookup.php?${params.toString()}`,
  )

  return result.meals?.[0] ?? null
}

export async function getMealsByCategory(
  category: string,
): Promise<MealDbMeal[]> {
  const params = new URLSearchParams({ c: category })

  const result = await request<MealDbResponse>(
    `${BASE_URL}/filter.php?${params.toString()}`,
  )

  return result.meals ?? []
}

export async function getRandomMeal(): Promise<MealDbMeal | null> {
  const result = await request<MealDbResponse>(
    `${BASE_URL}/random.php`,
  )

  return result.meals?.[0] ?? null
}

export async function getMealCategories(): Promise<string[]> {
  const result = await request<{
    categories: Array<{ strCategory: string }>
  }>(`${BASE_URL}/categories.php`)

  return result.categories.map((category) => category.strCategory)
}
