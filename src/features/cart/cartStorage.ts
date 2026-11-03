import type { CartItem, CartState } from '@/features/cart/cartSlice'
import { getBrowserStorage, readJson, writeJson } from '@/utils/safeStorage'
import type { KeyValueStorage } from '@/utils/safeStorage'

export const CART_STORAGE_KEY = 'lunchgo:v1:cart'
const CART_STORAGE_VERSION = 1

function isCartItem(value: unknown): value is CartItem {
  return (
    typeof value === 'object' && value !== null &&
    'productId' in value && typeof value.productId === 'string' &&
    /^(local|themealdb|dummyjson):[^\s/]+$/.test(value.productId) &&
    'quantity' in value && typeof value.quantity === 'number' &&
    Number.isSafeInteger(value.quantity) && value.quantity > 0
  )
}

export function loadCart(storage: KeyValueStorage | undefined = getBrowserStorage()): CartState {
  const saved = readJson(CART_STORAGE_KEY, storage)
  if (
    typeof saved !== 'object' || saved === null ||
    !('version' in saved) || saved.version !== CART_STORAGE_VERSION ||
    !('items' in saved) || !Array.isArray(saved.items) || !saved.items.every(isCartItem)
  ) return { items: [] }

  if (new Set(saved.items.map((item) => item.productId)).size !== saved.items.length) {
    return { items: [] }
  }

  return { items: saved.items.map(({ productId, quantity }) => ({ productId, quantity })) }
}

export function saveCart(state: CartState, storage: KeyValueStorage | undefined) {
  writeJson(CART_STORAGE_KEY, { version: CART_STORAGE_VERSION, items: state.items }, storage)
}
