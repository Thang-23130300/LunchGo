export interface CartItem {
  productId: string
  quantity: number
  // Optional for carts saved before line IDs and customization were introduced.
  itemId?: string
  selectedOptionIds?: string[]
}
