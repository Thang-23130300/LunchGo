import type { Voucher } from '@/models/voucher'
import data from './vouchers.json'

export const vouchers: Voucher[] = data as Voucher[]

/** Tìm voucher theo mã (không phân biệt hoa thường). */
export function findVoucher(code: string): Voucher | undefined {
  const normalized = code.trim().toUpperCase()
  return vouchers.find((voucher) => voucher.code === normalized)
}
