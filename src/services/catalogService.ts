import { fallbackCatalog } from '@/data/fallbackCatalog'
import type { LunchProduct } from '@/models/product'

export const CATALOG_VERSION = 'lunchgo-week1-v1'

function copyProduct(product: LunchProduct): LunchProduct {
  return {
    ...product,
    ingredients: [...product.ingredients],
    ...(product.nutrition ? { nutrition: { ...product.nutrition } } : {}),
  }
}

export async function getCatalog(): Promise<LunchProduct[]> {
  return fallbackCatalog.map(copyProduct)
}

export async function getCatalogProduct(id: string): Promise<LunchProduct | null> {
  const product = fallbackCatalog.find((item) => item.id === id)
  return product ? copyProduct(product) : null
}
