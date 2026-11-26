import type { Order, OrderStatus } from '@/models'
import {
  getBrowserStorage,
  readJson,
  writeJson,
  type KeyValueStorage,
} from '@/utils/safeStorage'

export const ORDERS_STORAGE_KEY = 'lunchgo:v1:orders'
const ORDERS_STORAGE_VERSION = 1

type StoredOrders = {
  version: number
  orders: Order[]
}

function isValidOrder(value: unknown): value is Order {
  if (typeof value !== 'object' || value === null) return false
  const o = value as Record<string, unknown>

  return (
    typeof o.orderId === 'string' &&
    (typeof o.userId === 'number' || o.userId === null) &&
    typeof o.customer === 'object' &&
    o.customer !== null &&
    Array.isArray(o.items) &&
    typeof o.subtotal === 'number' &&
    typeof o.discount === 'number' &&
    typeof o.total === 'number' &&
    (o.voucherCode === null || typeof o.voucherCode === 'string') &&
    typeof o.paymentMethod === 'string' &&
    typeof o.status === 'string' &&
    ['placed', 'completed', 'cancelled'].includes(o.status as string) &&
    typeof o.createdAt === 'string'
  )
}

/** Đọc tất cả đơn hàng từ LocalStorage */
export function loadOrders(
  storage: KeyValueStorage | undefined = getBrowserStorage()
): Order[] {
  const saved = readJson(ORDERS_STORAGE_KEY, storage)

  if (
    typeof saved !== 'object' ||
    saved === null ||
    !('version' in saved) ||
    saved.version !== ORDERS_STORAGE_VERSION ||
    !('orders' in saved) ||
    !Array.isArray(saved.orders)
  ) {
    return []
  }

  return saved.orders.filter(isValidOrder)
}

/** Lưu tất cả đơn hàng vào LocalStorage */
export function saveOrders(
  orders: Order[],
  storage: KeyValueStorage | undefined = getBrowserStorage()
) {
  const data: StoredOrders = {
    version: ORDERS_STORAGE_VERSION,
    orders,
  }
  writeJson(ORDERS_STORAGE_KEY, data, storage)
}

// ─── OrderRepository: API làm việc với orders ────────────────────────────────

/** Thêm đơn hàng mới */
export function addOrder(
  order: Order,
  storage?: KeyValueStorage
): void {
  const orders = loadOrders(storage)
  orders.push(order)
  saveOrders(orders, storage)
}

/** Lấy đơn hàng theo orderId */
export function getOrderById(
  orderId: string,
  storage?: KeyValueStorage
): Order | null {
  const orders = loadOrders(storage)
  return orders.find((o) => o.orderId === orderId) ?? null
}

/** Lấy tất cả đơn hàng của một user (sắp xếp mới nhất trước) */
export function getOrdersByUserId(
  userId: number,
  storage?: KeyValueStorage
): Order[] {
  const orders = loadOrders(storage)
  return orders
    .filter((o) => o.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

/** Cập nhật trạng thái đơn hàng */
export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  storage?: KeyValueStorage
): Order | null {
  const orders = loadOrders(storage)
  const index = orders.findIndex((o) => o.orderId === orderId)

  if (index === -1) return null

  const order = orders[index]

  // Quy tắc: completed và cancelled không được thay đổi
  if (order.status === 'completed' || order.status === 'cancelled') {
    return null
  }

  const now = new Date().toISOString()
  const updated: Order = {
    ...order,
    status: newStatus,
  }

  if (newStatus === 'completed') {
    updated.completedAt = now
  } else if (newStatus === 'cancelled') {
    updated.cancelledAt = now
  }

  orders[index] = updated
  saveOrders(orders, storage)
  return updated
}

/** Xóa tất cả đơn hàng (dùng cho dev/test) */
export function clearAllOrders(storage?: KeyValueStorage): void {
  saveOrders([], storage)
}
