import type { LunchProduct } from '@/models/product'
import { loadDemoCatalog } from '@/services/demoCatalogSource'

export { CATALOG_CACHE_KEY, CATALOG_VERSION } from '@/services/demoCatalogSource'

export type CatalogSource = () => Promise<LunchProduct[]>

export const getCatalog = loadDemoCatalog

export async function getCatalogProduct(id: string): Promise<LunchProduct | null> {
  const products = await getCatalog()
  return products.find((item) => item.id === id) ?? null
}
