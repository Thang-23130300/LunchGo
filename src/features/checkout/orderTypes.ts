
import type { OrderDraft } from '@/models/order'

export type CustomerInfo = Required<Omit<OrderDraft, 'paymentMethod'>>

export interface OrderDraftOption {
  id: string
  name: string
  additionalPrice: number
}

export interface OrderDraftItem {
  itemId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  selectedOptions: OrderDraftOption[]
  lineTotal: number
}

export interface ConfirmedOrder {
  orderId: string
  customer: Omit<OrderDraft, 'paymentMethod'>
  items: OrderDraftItem[]
  total: number
  paymentMethod: OrderDraft['paymentMethod']
  createdAt: string
}

export function generateOrderId(): string {
  const ts = Date.now()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `ORD-${ts}-${rand}`
}
