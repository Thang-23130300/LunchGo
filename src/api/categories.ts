import type { Category } from '@/models'
import { getById, getJson } from './client'

export function getCategories(signal?: AbortSignal): Promise<Category[]> {
  return getJson<Category[]>('categories', signal)
}

export function getCategoryById(id: string, signal?: AbortSignal): Promise<Category | null> {
  return getById<Category>('categories', id, signal)
}
