import type { OrderDraft } from '@/models/order'

export type CustomerInfo = Required<Omit<OrderDraft, 'paymentMethod'>>

export type { SelectedOption as OrderDraftOption } from '@/models/customization'
export type { OrderItem as OrderDraftItem, Order as ConfirmedOrder, OrderStatus } from '@/models/order'

export function generateOrderId(): string {
  const ts = Date.now()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `ORD-${ts}-${rand}`
}
