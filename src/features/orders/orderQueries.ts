/**
 * orderQueries.ts
 *
 * Utility dùng chung cho Người 2 (review và sold count).
 * Import từ '@/features/orders/orderQueries'
 */

import { loadOrders } from './orderStorage'
import type { Order } from '@/models'

/**
 * Lấy tất cả đơn hàng đã HOÀN TẤT (status === 'completed').
 * Người 2 dùng để kiểm tra quyền đánh giá và tính lượt bán.
 */
export function getCompletedOrders(): Order[] {
  return loadOrders().filter((o) => o.status === 'completed')
}

/**
 * Kiểm tra user có đơn hoàn tất chứa sản phẩm (productId) không.
 * Dùng để xác định xem user có quyền đánh giá sản phẩm đó không.
 *
 * @param userId   - ID số của tài khoản DummyJSON
 * @param productId - ID sản phẩm cần kiểm tra (ví dụ 'FOOD015')
 */
export function hasCompletedOrderWithProduct(
  userId: number,
  productId: string
): boolean {
  const completed = getCompletedOrders()
  return completed.some(
    (o) =>
      o.userId === userId &&
      o.items.some((item) => item.productId === productId)
  )
}

/**
 * Tổng số lượng đã bán của một sản phẩm (chỉ tính đơn hoàn tất).
 * Đơn bị hủy hoặc chờ KHÔNG được tính.
 *
 * @param productId - ID sản phẩm cần tính
 */
export function getSoldCountByProduct(productId: string): number {
  const completed = getCompletedOrders()
  return completed.reduce((total, order) => {
    const matched = order.items
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0)
    return total + matched
  }, 0)
}

/**
 * Lấy tất cả đơn hoàn tất của một user cụ thể.
 * Người 2 có thể dùng để liệt kê món đủ điều kiện đánh giá.
 *
 * @param userId - ID số của tài khoản DummyJSON
 */
export function getCompletedOrdersByUser(userId: number): Order[] {
  return getCompletedOrders()
    .filter((o) => o.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.createdAt).getTime() -
        new Date(a.completedAt ?? a.createdAt).getTime()
    )
}
