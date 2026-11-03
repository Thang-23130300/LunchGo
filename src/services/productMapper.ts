
import type { LunchProduct } from '@/models/product'
import type { MealDbMeal } from '@/services/theMealDbClient'
import type { DummyRecipe } from '@/services/dummyJsonClient'

const DEFAULT_DEMO_PRICE = 35000
const OTHER_CATEGORY = 'Khác'

function getMealDbIngredients(meal: MealDbMeal): string[] {
  const ingredients: string[] = []

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`]?.trim()

    if (ingredient) {
      ingredients.push(ingredient)
    }
  }

  return ingredients
}

export function mapMealDbMeal(meal: MealDbMeal): LunchProduct {
  const id = meal.idMeal?.trim()
  const name = meal.strMeal?.trim()
  if (!id || !name) {
    throw new Error('TheMealDB meal is missing its ID or name')
  }

  return {
    id: `themealdb:${id}`,
    name,
    image: meal.strMealThumb?.trim() || '',
    category: meal.strCategory?.trim() || OTHER_CATEGORY,
    price: DEFAULT_DEMO_PRICE,
    source: 'themealdb',
    ingredients: getMealDbIngredients(meal),
    isAvailable: true,
  }
}

export function mapDummyRecipe(recipe: DummyRecipe): LunchProduct {
  const name = recipe.name?.trim()
  if (!Number.isSafeInteger(recipe.id) || recipe.id < 1 || !name) {
    throw new Error('DummyJSON recipe has an invalid ID or missing name')
  }

  const product: LunchProduct = {
    id: `dummyjson:${recipe.id}`,
    name,
    image: recipe.image?.trim() || '',
    category: recipe.cuisine?.trim() || recipe.mealType?.[0]?.trim() || OTHER_CATEGORY,
    price: DEFAULT_DEMO_PRICE,
    source: 'dummyjson',
    ingredients: (recipe.ingredients ?? []).map((ingredient) => ingredient.trim()).filter(Boolean),
    isAvailable: true,
  }

  const calories = recipe.caloriesPerServing
  if (typeof calories === 'number' && Number.isFinite(calories) && calories >= 0) {
    product.calories = calories
  }

  return product
}
