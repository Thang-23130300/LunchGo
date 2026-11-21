import type { Product } from '@/models'
import { getById, getJson } from './client'

export function getProducts(signal?: AbortSignal): Promise<Product[]> {
  return getJson<Product[]>('products', signal)
}

export function getProductById(id: string, signal?: AbortSignal): Promise<Product | null> {
  return getById<Product>('products', id, signal)
}
