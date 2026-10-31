import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '@/features/cart/cartSlice'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
