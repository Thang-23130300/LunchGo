
import { useSyncExternalStore } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import {
  selectCurrentUserId,
  selectIsAuthenticated,
  selectAuthLoading,
} from '@/features/auth/authSlice'

import {
  getFavorites,
  subscribeFavorites,
  toggleFavorite as updateFavorite,
} from './favoritesStore'

export function useFavorites() {
  const userId = useAppSelector(selectCurrentUserId)
  const isAuthenticated = useAppSelector(
    selectIsAuthenticated,
  )
  const authLoading = useAppSelector(selectAuthLoading)

  const navigate = useNavigate()
  const location = useLocation()

  const activeUserId = isAuthenticated ? userId : null

  const favoriteIds = useSyncExternalStore(
    subscribeFavorites,
    () => getFavorites(activeUserId),
  )

  function isFavorite(productId: string): boolean {
    return favoriteIds.includes(productId)
  }

  function toggleFavorite(productId: string): void {
    if (authLoading) return

    if (activeUserId === null) {
      const returnTo =
        location.pathname +
        location.search +
        location.hash

      navigate(
        `/login?${new URLSearchParams({ returnTo })}`,
      )

      return
    }

    updateFavorite(activeUserId, productId)
  }

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    isAuthenticated,
    authLoading,
  }
}
