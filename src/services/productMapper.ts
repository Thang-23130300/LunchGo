
import type { LunchProduct } from '@/models/product'
import type { MealDbMeal } from '@/services/theMealDbClient'
import type { DummyRecipe } from '@/services/dummyJsonClient'

const DEFAULT_DEMO_PRICE = 35000

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
  if (!meal.idMeal || !meal.strMeal) {
    throw new Error('TheMealDB meal is missing its ID or name')
  }

  return {
    id: `themealdb:${meal.idMeal}`,
    name: meal.strMeal,
    image: meal.strMealThumb ?? '',
    category: meal.strCategory ?? 'Khác',
    price: DEFAULT_DEMO_PRICE,
    source: 'themealdb',
    ingredients: getMealDbIngredients(meal),
    isAvailable: true,
  }
}

export function mapDummyRecipe(recipe: DummyRecipe): LunchProduct {
  if (!recipe.id || !recipe.name) {
    throw new Error('DummyJSON recipe is missing its ID or name')
  }

  return {
    id: `dummyjson:${recipe.id}`,
    name: recipe.name,
    image: recipe.image ?? '',
    category: recipe.cuisine ?? recipe.mealType?.[0] ?? 'Khác',
    price: DEFAULT_DEMO_PRICE,
    source: 'dummyjson',
    ingredients: recipe.ingredients ?? [],
    calories: recipe.caloriesPerServing,
    isAvailable: true,
  }
}
