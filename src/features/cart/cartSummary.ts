import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { selectCatalog } from '@/features/catalog/catalogSlice'

export const selectCartSummary = createSelector(
  [(state: RootState) => state.cart.items, selectCatalog],
  (items, { products }) => {
    const productsById = new Map(products.map((product) => [product.id, product]))
    const lines = items.map((item) => {
      const product = productsById.get(item.productId)
      return {
        ...item,
        product,
        lineTotal: product?.isAvailable ? product.price * item.quantity : null,
      }
    })

    return {
      lines,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      total: lines.reduce((sum, line) => sum + (line.lineTotal ?? 0), 0),
      canCheckout: lines.length > 0 && lines.every((line) => line.lineTotal !== null),
    }
  },
)
