import { findVoucher } from '@/data/vouchers'
import type {
  AppliedVoucher,
  Voucher,
  VoucherValidation,
} from '@/models/voucher'

/**
 * Kiểm tra voucher có hợp lệ để áp dụng cho đơn hàng có giá trị `orderTotal`.
 * Trả về voucher khi hợp lệ, hoặc lỗi kèm thông báo khi không hợp lệ.
 */
export function validateVoucher(
  code: string,
  orderTotal: number,
): VoucherValidation {
  const trimmed = code.trim()

  if (!trimmed) {
    return {
      valid: false,
      error: { code: 'NOT_FOUND', message: 'Vui lòng nhập mã voucher.' },
    }
  }

  const voucher = findVoucher(trimmed)

  if (!voucher) {
    return {
      valid: false,
      error: { code: 'NOT_FOUND', message: 'Mã voucher không tồn tại.' },
    }
  }

  if (!voucher.isActive) {
    return {
      valid: false,
      error: { code: 'INACTIVE', message: 'Voucher đã hết hạn hoặc bị ngưng.' },
    }
  }

  if (orderTotal < voucher.minOrderValue) {
    return {
      valid: false,
      error: {
        code: 'BELOW_MINIMUM',
        message: `Đơn hàng cần tối thiểu ${formatVnd(voucher.minOrderValue)} để dùng voucher này.`,
      },
    }
  }

  return { valid: true, voucher }
}

/**
 * Tính số tiền giảm dựa trên voucher và giá trị đơn hàng (đã kiểm tra hợp lệ).
 * Kết quả luôn không âm và không vượt quá giá trị đơn hàng.
 */
export function calculateDiscount(voucher: Voucher, orderTotal: number): number {
  if (voucher.type === 'PERCENT') {
    const raw = Math.floor((orderTotal * voucher.value) / 100)
    const capped = voucher.maxDiscount != null
      ? Math.min(raw, voucher.maxDiscount)
      : raw
    return Math.max(0, Math.min(capped, orderTotal))
  }

  return Math.max(0, Math.min(voucher.value, orderTotal))
}

/** Áp dụng voucher: kiểm tra + tính giảm giá, trả về thông tin đã áp dụng hoặc lỗi. */
export function applyVoucherCode(
  code: string,
  orderTotal: number,
): { result: AppliedVoucher } | { error: string } {
  const validation = validateVoucher(code, orderTotal)

  if (!validation.valid) {
    return { error: validation.error.message }
  }

  const discountAmount = calculateDiscount(validation.voucher, orderTotal)

  return {
    result: {
      code: validation.voucher.code,
      description: validation.voucher.description,
      type: validation.voucher.type,
      value: validation.voucher.value,
      discountAmount,
    },
  }
}

function formatVnd(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value) + 'đ'
}
