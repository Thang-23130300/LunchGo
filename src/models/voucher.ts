/**
 * Mô hình dữ liệu voucher (MỐC 2).
 *
 * Voucher được áp dụng ở giỏ hàng / thanh toán. Mỗi voucher có một mã duy nhất,
 * loại giảm giá (theo phần trăm hoặc số tiền cố định), điều kiện giá trị đơn
 * tối thiểu và giới hạn giảm giá tối đa (cho voucher theo phần trăm).
 */

export type VoucherType = 'PERCENT' | 'FIXED'

export interface Voucher {
  /** Mã voucher, duy nhất, viết hoa không dấu. */
  code: string
  /** Mô tả hiển thị cho người dùng. */
  description: string
  /** PERCENT: giảm theo phần trăm; FIXED: giảm một số tiền cố định. */
  type: VoucherType
  /** PERCENT: phần trăm (10 = 10%); FIXED: số tiền VND (20000 = 20.000đ). */
  value: number
  /** Giá trị đơn hàng tối thiểu để áp dụng voucher (VND). */
  minOrderValue: number
  /** Mức giảm tối đa áp dụng cho voucher PERCENT (VND). */
  maxDiscount?: number
  /** false = voucher không còn hiệu lực (đã hết hạn / ngưng). */
  isActive: boolean
}

/** Thông tin voucher đã được áp dụng thành công. */
export interface AppliedVoucher {
  code: string
  description: string
  type: VoucherType
  value: number
  discountAmount: number
}

/** Lý do voucher không hợp lệ. */
export type VoucherErrorCode =
  | 'NOT_FOUND'
  | 'INACTIVE'
  | 'BELOW_MINIMUM'

export interface VoucherError {
  code: VoucherErrorCode
  message: string
}

/** Kết quả kiểm tra voucher: hợp lệ hoặc không hợp lệ kèm lỗi. */
export type VoucherValidation =
  | { valid: true; voucher: Voucher }
  | { valid: false; error: VoucherError }
