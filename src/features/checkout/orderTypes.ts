import type { OrderDraft } from '@/models/order'

export type CustomerInfo = Required<Omit<OrderDraft, 'paymentMethod'>>

export interface OrderDraftItem {
  productId: string
  productName: string
  quantity: number
  /** Đơn giá demo (VNĐ) */
  unitPrice: number
  /** Thành tiền = unitPrice × quantity */
  lineTotal: number
}

/**
 * Đơn hàng demo — chỉ lưu local, không gửi server, không thu tiền thật.
 * Phương thức thanh toán cố định là COD mô phỏng.
 */
export interface ConfirmedOrder {
  /** ID đơn demo — tạo tại client, dạng "ORD-<timestamp>-<4 chữ số ngẫu nhiên>" */
  orderId: string
  customer: Omit<OrderDraft, 'paymentMethod'>
  items: OrderDraftItem[]
  /** Tổng tiền = Σ lineTotal (VNĐ, tính tại thời điểm xác nhận) */
  total: number
  /** Phương thức thanh toán demo — luôn là 'cod' */
  paymentMethod: OrderDraft['paymentMethod']
  /** Thời điểm tạo đơn (ISO string) */
  createdAt: string
}

/** Tạo ID đơn hàng demo duy nhất */
export function generateOrderId(): string {
  const ts = Date.now()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `ORD-${ts}-${rand}`
}
