import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '@/features/cart/cartSlice'
import { loadCart, saveCart } from '@/features/cart/cartStorage'
import { getBrowserStorage } from '@/utils/safeStorage'
import type { KeyValueStorage } from '@/utils/safeStorage'

export function createAppStore(storage: KeyValueStorage | undefined = getBrowserStorage()) {
  const appStore = configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: loadCart(storage) },
    devTools: import.meta.env.DEV,
  })

  let previousCart = appStore.getState().cart
  saveCart(previousCart, storage)
  appStore.subscribe(() => {
    const currentCart = appStore.getState().cart
    if (currentCart !== previousCart) {
      saveCart(currentCart, storage)
      previousCart = currentCart
    }
  })

  return appStore
}

export const store = createAppStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
