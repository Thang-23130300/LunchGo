
import { nanoid } from '@reduxjs/toolkit'
import type { CartItem, CartState } from '@/features/cart/cartSlice'
import {
  getBrowserStorage,
  readJson,
  writeJson,
} from '@/utils/safeStorage'
import type { KeyValueStorage } from '@/utils/safeStorage'

export const CART_STORAGE_KEY = 'lunchgo:v1:cart'
const CART_STORAGE_VERSION = 1

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  if (
    !('productId' in value) ||
    typeof value.productId !== 'string' ||
    !/^(local|themealdb|dummyjson):[^\s/]+$|^(FOOD|DRINK)\d+$/.test(
      value.productId
    )
  ) {
    return false
  }

  if (
    !('quantity' in value) ||
    typeof value.quantity !== 'number' ||
    !Number.isSafeInteger(value.quantity) ||
    value.quantity <= 0
  ) {
    return false
  }

  if (
    'itemId' in value &&
    value.itemId !== undefined &&
    typeof value.itemId !== 'string'
  ) {
    return false
  }

  if (
    'selectedOptionIds' in value &&
    value.selectedOptionIds !== undefined &&
    (
      !Array.isArray(value.selectedOptionIds) ||
      !value.selectedOptionIds.every(
        (id) => typeof id === 'string'
      )
    )
  ) {
    return false
  }

  return true
}

export function loadCart(
  storage: KeyValueStorage | undefined = getBrowserStorage()
): CartState {
  const saved = readJson(CART_STORAGE_KEY, storage)

  if (
    typeof saved !== 'object' ||
    saved === null ||
    !('version' in saved) ||
    saved.version !== CART_STORAGE_VERSION ||
    !('items' in saved) ||
    !Array.isArray(saved.items) ||
    !saved.items.every(isCartItem)
  ) {
    return { items: [], voucherCode: null }
  }

  // Old carts stored at most one line per product before options were added.
  const legacyProductIds = saved.items
    .filter((item) => item.itemId === undefined && item.selectedOptionIds === undefined)
    .map((item) => item.productId)

  if (new Set(legacyProductIds).size !== legacyProductIds.length) {
    return { items: [], voucherCode: null }
  }

  const items = saved.items.map((item) => ({
    ...item,
    itemId: item.itemId ?? nanoid(),
    selectedOptionIds: item.selectedOptionIds ?? [],
  }))

  const itemIds = items.map((item) => item.itemId)

  if (new Set(itemIds).size !== itemIds.length) {
    return { items: [], voucherCode: null }
  }

  const voucherCode =
    'voucherCode' in saved &&
    typeof saved.voucherCode === 'string' &&
    saved.voucherCode.length > 0
      ? saved.voucherCode
      : null

  return { items, voucherCode }
}

export function saveCart(
  state: CartState,
  storage: KeyValueStorage | undefined
) {
  writeJson(
    CART_STORAGE_KEY,
    {
      version: CART_STORAGE_VERSION,
      items: state.items,
      voucherCode: state.voucherCode,
    },
    storage
  )
}
