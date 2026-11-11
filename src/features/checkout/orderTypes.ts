/**
 * W2-D01 — Contract dữ liệu checkout
 *
 * D chỉ ĐỌC cart từ Redux (CartItem từ cartSlice của B).
 * D KHÔNG tạo Redux slice riêng cho cart.
 * Tổng tiền được tính tại render từ CartItem[] + LunchProduct[].
 */

export interface CustomerInfo {
  /** Họ và tên — bắt buộc */
  name: string
  /** Số điện thoại — bắt buộc, tối thiểu 9–11 chữ số */
  phone: string
  /** Địa chỉ giao hàng — bắt buộc */
  address: string
  /** Ghi chú thêm — không bắt buộc */
  note: string
}

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
export interface OrderDraft {
  /** ID đơn demo — tạo tại client, dạng "ORD-<timestamp>-<4 chữ số ngẫu nhiên>" */
  orderId: string
  customer: CustomerInfo
  items: OrderDraftItem[]
  /** Tổng tiền = Σ lineTotal (VNĐ, tính tại thời điểm xác nhận) */
  total: number
  /** Phương thức thanh toán demo — luôn là 'cod' */
  paymentMethod: 'cod'
  /** Thời điểm tạo đơn (ISO string) */
  createdAt: string
}

/** Tạo ID đơn hàng demo duy nhất */
export function generateOrderId(): string {
  const ts = Date.now()
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `ORD-${ts}-${rand}`
}
