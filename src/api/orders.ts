import type { Order } from '@/models'
import { postJson } from './client'

/** Gửi đơn hàng lên Fake API (JSON Server) qua POST /orders. */
export function createOrder(order: Order, signal?: AbortSignal): Promise<Order> {
  return postJson<Order>('orders', order, signal)
}
