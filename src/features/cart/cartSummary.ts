import { getCustomizationProductId } from '@/data/customizationProductMap'
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import { optionGroups } from '@/data/optionGroups'
import { options } from '@/data/options'

export const selectCartSummary = createSelector(
  [(state: RootState) => state.cart.items, selectCatalog],
  (items, { products }) => {
    const productsById = new Map(
      products.map((product) => [product.id, product])
    )

    const optionsById = new Map(
      options.map((option) => [option.id, option])
    )

    const groupsById = new Map(
      optionGroups.map((group) => [group.id, group])
    )

    const lines = items.map((item) => {
      const product = productsById.get(item.productId)

      const selectedOptions = (item.selectedOptionIds ?? [])
        .map((optionId) => optionsById.get(optionId))
        .filter(
          (option): option is NonNullable<typeof option> =>
            option !== undefined &&
            option.isActive &&
            groupsById.get(option.groupId)?.productId ===
            getCustomizationProductId(item.productId)
        )

      const optionsTotal = selectedOptions.reduce(
        (sum, option) => sum + option.additionalPrice,
        0
      )

      const unitPrice = product
        ? product.price + optionsTotal
        : 0

      const lineTotal =
        product?.isAvailable
          ? unitPrice * item.quantity
          : null

      return {
        ...item,
        product,
        selectedOptions,
        optionsTotal,
        unitPrice,
        lineTotal,
      }
    })

    return {
      lines,
      totalQuantity: items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      total: lines.reduce(
        (sum, line) => sum + (line.lineTotal ?? 0),
        0
      ),
      canCheckout:
        lines.length > 0 &&
        lines.every((line) => line.lineTotal !== null),
    }
  }
)
