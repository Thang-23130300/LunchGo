
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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
    addToCart(state, action: PayloadAction<string>) {
      const productId = action.payload
      const existingItem = state.items.find(
        (item) => item.productId === productId
      )

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.items.push({
          productId,
          quantity: 1,
        })
      }
    },

    increaseQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(
        (item) => item.productId === action.payload
      )

      if (item) {
        item.quantity += 1
      }
    },

    decreaseQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(
        (item) => item.productId === action.payload
      )

      if (item && item.quantity > 1) {
        item.quantity -= 1
      }
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      )
    },

    clearCart(state) {
      state.items = []
    },
  },
})

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer
