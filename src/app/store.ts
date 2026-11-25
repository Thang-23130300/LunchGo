import { configureStore } from '@reduxjs/toolkit'
import catalogReducer from '@/features/catalog/catalogSlice'
import cartReducer from '@/features/cart/cartSlice'
import authReducer, { createInitialAuthState } from '@/features/auth/authSlice'
import { loadAuthTokens, saveAuthTokens } from '@/features/auth/authStorage'
import { loadCart, saveCart } from '@/features/cart/cartStorage'
import { getBrowserStorage } from '@/utils/safeStorage'
import type { KeyValueStorage } from '@/utils/safeStorage'

export function createAppStore(storage: KeyValueStorage | undefined = getBrowserStorage()) {
  const appStore = configureStore({
    reducer: { cart: cartReducer, catalog: catalogReducer, auth: authReducer },
    preloadedState: { cart: loadCart(storage), auth: createInitialAuthState(loadAuthTokens(storage)) },
    devTools: import.meta.env.DEV,
  })

  let previousCart = appStore.getState().cart
  let previousAuthTokens = appStore.getState().auth.tokens
  saveCart(previousCart, storage)
  saveAuthTokens(previousAuthTokens, storage)
  appStore.subscribe(() => {
    const currentCart = appStore.getState().cart
    if (currentCart !== previousCart) {
      saveCart(currentCart, storage)
      previousCart = currentCart
    }
    const currentAuthTokens = appStore.getState().auth.tokens
    if (currentAuthTokens !== previousAuthTokens) {
      saveAuthTokens(currentAuthTokens, storage)
      previousAuthTokens = currentAuthTokens
    }
  })

  return appStore
}

export const store = createAppStore()

export type AppStore = ReturnType<typeof createAppStore>
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
