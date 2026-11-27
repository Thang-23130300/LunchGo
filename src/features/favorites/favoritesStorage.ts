
import {
  getBrowserStorage,
  readJson,
  writeJson,
} from '@/utils/safeStorage'

const FAVORITES_PREFIX = 'lunchgo:v1:favorites:'

export function getFavoritesKey(userId: number): string {
  return `${FAVORITES_PREFIX}${userId}`
}

export function loadFavorites(userId: number): string[] {
  const data = readJson(
    getFavoritesKey(userId),
    getBrowserStorage(),
  )

  if (!Array.isArray(data)) return []

  return [...new Set(
    data.filter(
      (id): id is string =>
        typeof id === 'string' && id.trim().length > 0,
    ),
  )]
}

export function saveFavorites(
  userId: number,
  productIds: string[],
): void {
  writeJson(
    getFavoritesKey(userId),
    [...new Set(productIds)],
    getBrowserStorage(),
  )
}
