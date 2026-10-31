import { createSlice } from '@reduxjs/toolkit'

export type CartItem = {
  productId: string
  quantity: number
}

export type CartState = {
  items: CartItem[]
}

const initialState: CartState = {
  items: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart(state) {
      state.items = []
    },
  },
})

export const { clearCart } = cartSlice.actions
export default cartSlice.reducer
