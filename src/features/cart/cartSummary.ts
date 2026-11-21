import { getCustomizationProductId } from '@/data/customizationProductMap'
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import { optionGroups } from '@/data/optionGroups'
import { options } from '@/data/options'
import type { AppliedVoucher } from '@/models/voucher'
import { calculateDiscount, validateVoucher } from '@/features/cart/voucher'

export const selectCartSummary = createSelector(
  [
    (state: RootState) => state.cart.items,
    (state: RootState) => state.cart.voucherCode,
    selectCatalog,
  ],
  (items, voucherCode, { products }) => {
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

    const total = lines.reduce(
      (sum, line) => sum + (line.lineTotal ?? 0),
      0
    )

    // Voucher: kiểm tra điều kiện và tính giảm giá
    let discount = 0
    let appliedVoucher: AppliedVoucher | undefined
    let voucherError: string | undefined

    if (voucherCode) {
      const validation = validateVoucher(voucherCode, total)
      if (validation.valid) {
        discount = calculateDiscount(validation.voucher, total)
        appliedVoucher = {
          code: validation.voucher.code,
          description: validation.voucher.description,
          type: validation.voucher.type,
          value: validation.voucher.value,
          discountAmount: discount,
        }
      } else {
        voucherError = validation.error.message
      }
    }

    const grandTotal = Math.max(0, total - discount)

    return {
      lines,
      totalQuantity: items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
      total,
      discount,
      grandTotal,
      voucherCode,
      appliedVoucher,
      voucherError,
      canCheckout:
        lines.length > 0 &&
        lines.every((line) => line.lineTotal !== null),
    }
  }
)
