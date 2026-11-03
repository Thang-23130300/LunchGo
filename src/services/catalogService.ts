import { fallbackCatalog } from '@/data/fallbackCatalog'
import type { LunchProduct } from '@/models/product'
import { getBrowserStorage, readJson, writeJson } from '@/utils/safeStorage'
import type { KeyValueStorage } from '@/utils/safeStorage'

export const CATALOG_VERSION = 'lunchgo-week1-v1'
export const CATALOG_CACHE_KEY = 'lunchgo:v1:catalog-cache'
const seedSignature = JSON.stringify(fallbackCatalog)

function copyProduct(product: LunchProduct): LunchProduct {
  return {
    ...product,
    ingredients: [...product.ingredients],
    ...(product.nutrition ? { nutrition: { ...product.nutrition } } : {}),
  }
}

function isCurrentCache(value: unknown): value is { version: string; products: LunchProduct[] } {
  try {
    return (
      typeof value === 'object' && value !== null &&
      'version' in value && value.version === CATALOG_VERSION &&
      'products' in value && JSON.stringify(value.products) === seedSignature
    )
  } catch {
    return false
  }
}

export async function getCatalog(
  storage: KeyValueStorage | undefined = getBrowserStorage(),
): Promise<LunchProduct[]> {
  const cached = readJson(CATALOG_CACHE_KEY, storage)
  if (isCurrentCache(cached)) return cached.products

  const products = fallbackCatalog.map(copyProduct)
  writeJson(CATALOG_CACHE_KEY, { version: CATALOG_VERSION, products }, storage)
  return products
}

export async function getCatalogProduct(id: string): Promise<LunchProduct | null> {
  const products = await getCatalog()
  return products.find((item) => item.id === id) ?? null
}
