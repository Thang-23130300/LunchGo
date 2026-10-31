
const BASE_URL = 'https://dummyjson.com'

export interface DummyRecipe {
  id: number
  name: string
  image: string
  cuisine?: string
  ingredients: string[]
  caloriesPerServing?: number
  mealType?: string[]
}

interface DummyRecipeResponse {
  recipes: DummyRecipe[]
  total: number
  skip: number
  limit: number
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`DummyJSON request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function getRecipes(
  limit = 30,
  skip = 0,
): Promise<DummyRecipeResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    skip: String(skip),
  })

  return request<DummyRecipeResponse>(
    `${BASE_URL}/recipes?${params.toString()}`,
  )
}

export async function getRecipeById(
  id: number,
): Promise<DummyRecipe> {
  return request<DummyRecipe>(`${BASE_URL}/recipes/${id}`)
}

export async function searchRecipes(
  keyword: string,
): Promise<DummyRecipe[]> {
  const params = new URLSearchParams({ q: keyword })

  const result = await request<DummyRecipeResponse>(
    `${BASE_URL}/recipes/search?${params.toString()}`,
  )

  return result.recipes
}

export async function getRecipesByMealType(
  mealType: string,
): Promise<DummyRecipe[]> {
  const result = await request<DummyRecipeResponse>(
    `${BASE_URL}/recipes/meal-type/${encodeURIComponent(mealType)}`,
  )

  return result.recipes
}

export async function getRecipeTags(): Promise<string[]> {
  return request<string[]>(`${BASE_URL}/recipes/tags`)
}
