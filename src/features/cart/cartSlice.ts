
import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export type CartItem = {
  productId: string
  quantity: number
  // ID riêng cho từng dòng sản phẩm trong giỏ
  itemId?: string
  // Danh sách ID tùy chọn đã chọn
  selectedOptionIds?: string[]
}

export type AddToCartPayload = {
  productId: string
  quantity?: number
  selectedOptionIds?: string[]
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
    addToCart(
      state,
      action: PayloadAction<string | AddToCartPayload>
    ) {
      const payload = action.payload

      // Tương thích với cách thêm món cũ từ MenuPage
      const productId =
        typeof payload === 'string' ? payload : payload.productId

      const quantity =
        typeof payload === 'string' ? 1 : payload.quantity ?? 1

      const selectedOptionIds =
        typeof payload === 'string'
          ? []
          : [...(payload.selectedOptionIds ?? [])].sort()

      // Chỉ gộp khi cùng sản phẩm và cùng cấu hình tùy chọn
      const existingItem = state.items.find((item) => {
        const currentOptions = [...(item.selectedOptionIds ?? [])].sort()

        return (
          item.productId === productId &&
          JSON.stringify(currentOptions) ===
            JSON.stringify(selectedOptionIds)
        )
      })

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        state.items.push({
          itemId: nanoid(),
          productId,
          quantity,
          selectedOptionIds,
        })
      }
    },

    increaseQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(
        (item) =>
          item.itemId === action.payload ||
          item.productId === action.payload
      )

      if (item) {
        item.quantity += 1
      }
    },

    decreaseQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find(
        (item) =>
          item.itemId === action.payload ||
          item.productId === action.payload
      )

      if (item && item.quantity > 1) {
        item.quantity -= 1
      }
    },

    removeFromCart(state, action: PayloadAction<string>) {
      const index = state.items.findIndex(
        (item) =>
          item.itemId === action.payload ||
          item.productId === action.payload
      )

      if (index !== -1) {
        state.items.splice(index, 1)
      }
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
