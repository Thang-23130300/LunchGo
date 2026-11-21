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

export interface Order {
  orderId: string
  customer: Omit<OrderDraft, 'paymentMethod'>
  items: OrderItem[]
  subtotal: number
  discount: number
  voucherCode: string | null
  total: number
  paymentMethod: OrderDraft['paymentMethod']
  createdAt: string
}
