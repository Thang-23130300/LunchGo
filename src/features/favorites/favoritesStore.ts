
import {
  getFavoritesKey,
  loadFavorites,
  saveFavorites,
} from './favoritesStorage'

const EMPTY_FAVORITES: readonly string[] = []

const cache = new Map<number, readonly string[]>()

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function subscribeFavorites(
  listener: () => void,
) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function getFavorites(
  userId: number | null,
): readonly string[] {
  if (userId === null) return EMPTY_FAVORITES

  const cached = cache.get(userId)

  if (cached) return cached

  const favorites = loadFavorites(userId)

  cache.set(userId, favorites)

  return favorites
}

export function toggleFavorite(
  userId: number,
  productId: string,
): void {
  const current = getFavorites(userId)

  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId]

  cache.set(userId, next)

  saveFavorites(userId, next)

  notify()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === null) {
      cache.clear()
      notify()
      return
    }

    for (const userId of cache.keys()) {
      if (event.key === getFavoritesKey(userId)) {
        cache.delete(userId)
        notify()
        break
      }
    }
  })
}
