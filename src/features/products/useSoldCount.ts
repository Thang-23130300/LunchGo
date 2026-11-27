
import { useSyncExternalStore } from 'react'
import { getSoldCountByProduct } from '@/features/orders/orderQueries'
import { ORDERS_STORAGE_KEY } from '@/features/orders/orderStorage'

function subscribe(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (
      event.key === ORDERS_STORAGE_KEY ||
      event.key === null
    ) {
      onStoreChange()
    }
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener('focus', onStoreChange)

  document.addEventListener(
    'visibilitychange',
    onStoreChange
  )

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener('focus', onStoreChange)

    document.removeEventListener(
      'visibilitychange',
      onStoreChange
    )
  }
}

export function useSoldCount(
  productId: string,
  baseSoldCount = 0
): number {
  return useSyncExternalStore(
    subscribe,
    () =>
      baseSoldCount +
      getSoldCountByProduct(productId),
    () => baseSoldCount
  )
}
