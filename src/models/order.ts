import type { SelectedOption } from '@/models/customization'

export type OrderDraft = {
  customerName: string
  phone: string
  address: string
  note?: string
  paymentMethod: 'cod'
}

export interface OrderItem {
  itemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  selectedOptions: SelectedOption[]
  lineTotal: number
}

/** Ba trạng thái duy nhất cho đơn hàng demo */
export type OrderStatus = 'placed' | 'completed' | 'cancelled'

export interface Order {
  orderId: string
  /** ID số của tài khoản DummyJSON; null khi đặt hàng không đăng nhập */
  userId: number | null
  customer: Omit<OrderDraft, 'paymentMethod'>
  items: OrderItem[]
  subtotal: number
  discount: number
  voucherCode: string | null
  total: number
  paymentMethod: OrderDraft['paymentMethod']
  status: OrderStatus
  createdAt: string
  /** Thời điểm đơn chuyển sang completed hoặc cancelled */
  completedAt?: string
  cancelledAt?: string
}
