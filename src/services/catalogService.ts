import type { LunchProduct } from '@/models/product'
import { getProductById, getProducts } from '@/api/products'

export { CATALOG_CACHE_KEY, CATALOG_VERSION } from '@/services/demoCatalogSource'

export type CatalogSource = () => Promise<LunchProduct[]>

export const getCatalog: CatalogSource = () => getProducts()

export const getCatalogProduct = getProductById
