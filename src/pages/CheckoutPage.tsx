import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCart, increaseQuantity, decreaseQuantity, removeFromCart } from '@/features/cart/cartSlice'
import { getCatalog } from '@/services/catalogService'
import type { LunchProduct } from '@/models/product'
import type { CustomerInfo, OrderDraft, OrderDraftItem } from '@/features/checkout/orderTypes'
import { generateOrderId } from '@/features/checkout/orderTypes'

// ─── helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

/** Validate cơ bản: 9–11 chữ số, có thể có khoảng trắng hoặc dấu gạch */
function isValidPhone(value: string): boolean {
  return /^[\d\s\-+]{9,15}$/.test(value.trim()) && value.replace(/\D/g, '').length >= 9
}

type FormErrors = Partial<Record<keyof CustomerInfo, string>>

function validateForm(info: CustomerInfo): FormErrors {
  const errors: FormErrors = {}
  if (!info.name.trim()) errors.name = 'Vui lòng nhập họ và tên.'
  if (!info.phone.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại.'
  } else if (!isValidPhone(info.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ (cần ít nhất 9 chữ số).'
  }
  if (!info.address.trim()) errors.address = 'Vui lòng nhập địa chỉ giao hàng.'
  return errors
}

const EMPTY_INFO: CustomerInfo = { name: '', phone: '', address: '', note: '' }

// ─── sub-components ──────────────────────────────────────────────────────────

type OrderSummaryProps = {
  items: OrderDraftItem[]
  products: LunchProduct[]
  total: number
  submitting: boolean
  isEmpty: boolean
  onIncrease: (productId: string) => void
  onDecrease: (productId: string) => void
  onRemove: (productId: string) => void
}

function OrderSummary({
  items, products, total, submitting, isEmpty,
  onIncrease, onDecrease, onRemove,
}: OrderSummaryProps) {
  return (
    <div className="card">
      <div className="card-header fw-semibold">Tóm tắt đơn</div>

      {items.length === 0 ? (
        <div className="card-body text-secondary text-center py-4">
          Chưa có món nào trong giỏ.
        </div>
      ) : (
        <>
          <ul className="list-group list-group-flush">
            {items.map((item) => {
              const product = products.find((p) => p.id === item.productId)
              return (
                <li key={item.productId} className="list-group-item py-3">
                  <div className="d-flex gap-3 align-items-center">
                    {/* Ảnh thumbnail */}
                    <img
                      src={product?.image ?? ''}
                      alt={item.productName}
                      style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                    />
                    {/* Tên + giá */}
                    <div className="flex-grow-1 min-w-0">
                      <div className="fw-medium text-truncate">{item.productName}</div>
                      <small className="text-secondary">
                        {formatPrice(item.unitPrice)} × {item.quantity}
                        {' = '}
                        <span className="fw-semibold text-danger">{formatPrice(item.lineTotal)}</span>
                      </small>
                    </div>
                    {/* Nút số lượng */}
                    <div className="d-flex align-items-center gap-1" style={{ flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm px-2 py-0"
                        style={{ lineHeight: '1.6' }}
                        onClick={() => item.quantity === 1 ? onRemove(item.productId) : onDecrease(item.productId)}
                        aria-label={item.quantity === 1 ? `Xóa ${item.productName}` : `Giảm số lượng ${item.productName}`}
                      >
                        {item.quantity === 1 ? '🗑' : '−'}
                      </button>
                      <span
                        className="text-center fw-semibold"
                        style={{ minWidth: 24 }}
                        aria-label={`Số lượng: ${item.quantity}`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm px-2 py-0"
                        style={{ lineHeight: '1.6' }}
                        onClick={() => onIncrease(item.productId)}
                        aria-label={`Tăng số lượng ${item.productName}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="card-body pt-2 pb-0">
            <div className="d-flex justify-content-between text-secondary mb-1">
              <span>Tạm tính</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="d-flex justify-content-between text-secondary mb-3">
              <span>Phí giao hàng</span>
              <span>0đ <small>(demo)</small></span>
            </div>
            <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-3 mb-3">
              <span>Tổng cộng</span>
              <span className="text-success">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="card-footer bg-transparent border-0 pb-3 px-3">
            <button
              type="submit"
              form="checkout-form"
              className="btn btn-lg w-100 fw-semibold text-white"
              style={{ backgroundColor: '#2d6a4f', borderColor: '#2d6a4f', borderRadius: 8 }}
              disabled={submitting || isEmpty}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận đơn'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

type FieldProps = {
  id: string
  label: string
  required?: boolean
  value: string
  error?: string
  type?: string
  as?: 'input' | 'textarea'
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  placeholder?: string
  onChange: (value: string) => void
  onBlur?: () => void
}

function FormField({
  id, label, required, value, error, type = 'text',
  as = 'input', inputMode, autoComplete, placeholder, onChange, onBlur,
}: FieldProps) {
  const invalid = !!error
  const commonProps = {
    id,
    value,
    autoComplete,
    placeholder,
    'aria-required': required,
    'aria-invalid': invalid || undefined,
    'aria-describedby': invalid ? `${id}-error` : undefined,
    className: `form-control${invalid ? ' is-invalid' : ''}`,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onBlur,
  }

  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea {...commonProps} rows={3} />
      ) : (
        <input {...commonProps} type={type} inputMode={inputMode} />
      )}
      {invalid && (
        <div id={`${id}-error`} className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  )
}

// ─── OrderResult — hiển thị sau khi đặt hàng thành công ──────────────────────

type OrderResultProps = {
  order: OrderDraft
  onNewOrder: () => void
}

function OrderResult({ order, onNewOrder }: OrderResultProps) {
  return (
    <section className="container py-5" aria-label="Kết quả đặt hàng">
      <div className="text-center mb-4">
        <div className="display-1" aria-hidden="true">✅</div>
        <h1 className="fw-bold mt-2">Đặt hàng demo thành công!</h1>
        <p className="text-secondary">
          Đây là đơn hàng <strong>minh họa</strong> — không có giao dịch tiền thật và không có đơn hàng thực tế được tạo.
        </p>
      </div>

      <div className="card mx-auto" style={{ maxWidth: 560 }}>
        <div className="card-header fw-semibold d-flex justify-content-between">
          <span>Mã đơn</span>
          <span className="text-primary font-monospace">{order.orderId}</span>
        </div>
        <div className="card-body">
          <dl className="row mb-3">
            <dt className="col-5">Họ và tên</dt>
            <dd className="col-7">{order.customer.name}</dd>
            <dt className="col-5">Điện thoại</dt>
            <dd className="col-7">{order.customer.phone}</dd>
            <dt className="col-5">Địa chỉ</dt>
            <dd className="col-7">{order.customer.address}</dd>
            {order.customer.note && (
              <>
                <dt className="col-5">Ghi chú</dt>
                <dd className="col-7">{order.customer.note}</dd>
              </>
            )}
            <dt className="col-5">Thanh toán</dt>
            <dd className="col-7">COD (tiền mặt khi nhận — minh họa)</dd>
          </dl>

          <ul className="list-group list-group-flush mb-3">
            {order.items.map((item) => (
              <li
                key={item.productId}
                className="list-group-item d-flex justify-content-between px-0"
              >
                <span>{item.productName} × {item.quantity}</span>
                <span className="fw-semibold">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-2">
            <span>Tổng cộng</span>
            <span className="text-danger">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="d-flex gap-3 justify-content-center mt-4 flex-wrap">
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={onNewOrder}
        >
          Đặt thêm món khác
        </button>
        <Link to="/menu" className="btn btn-primary">
          Về thực đơn
        </Link>
      </div>
    </section>
  )
}

// ─── CheckoutPage ─────────────────────────────────────────────────────────────

function CheckoutPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const cartItems = useAppSelector((state) => state.cart.items)

  const [products, setProducts] = useState<LunchProduct[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)

  const [info, setInfo] = useState<CustomerInfo>(EMPTY_INFO)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerInfo, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDraft | null>(null)

  // Chặn submit lặp khi bấm đúp
  const submittingRef = useRef(false)

  // Tải catalog để lấy tên + giá sản phẩm
  useEffect(() => {
    let active = true
    getCatalog().then((result) => {
      if (active) { setProducts(result); setCatalogLoading(false) }
    }).catch(() => {
      if (active) setCatalogLoading(false)
    })
    return () => { active = false }
  }, [])

  // Tính order items từ Redux cart + catalog
  const orderItems = useMemo<OrderDraftItem[]>(() => {
    return cartItems.flatMap((cartItem) => {
      const product = products.find((p) => p.id === cartItem.productId)
      if (!product) return []
      return [{
        productId: cartItem.productId,
        productName: product.name,
        quantity: cartItem.quantity,
        unitPrice: product.price,
        lineTotal: product.price * cartItem.quantity,
      }]
    })
  }, [cartItems, products])

  const total = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [orderItems],
  )

  const isEmpty = cartItems.length === 0

  // Validate theo field khi đã touched
  useEffect(() => {
    if (Object.keys(touched).length === 0) return
    const newErrors = validateForm(info)
    // Chỉ hiện lỗi cho field đã touched
    const filtered: FormErrors = {}
    for (const key of Object.keys(touched) as Array<keyof CustomerInfo>) {
      if (newErrors[key]) filtered[key] = newErrors[key]
    }
    setErrors(filtered)
  }, [info, touched])

  function handleChange(field: keyof CustomerInfo, value: string) {
    setInfo((prev) => ({ ...prev, [field]: value }))
  }

  function handleBlur(field: keyof CustomerInfo) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Chặn đặt hàng khi giỏ trống
    if (isEmpty) return

    // Chặn submit lặp
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)

    // Validate toàn bộ form
    const allTouched: Partial<Record<keyof CustomerInfo, boolean>> = {
      name: true, phone: true, address: true,
    }
    setTouched(allTouched)
    const formErrors = validateForm(info)
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      submittingRef.current = false
      setSubmitting(false)
      return
    }

    // Mô phỏng xử lý đơn hàng (async demo)
    await new Promise<void>((resolve) => setTimeout(resolve, 600))

    const order: OrderDraft = {
      orderId: generateOrderId(),
      customer: {
        name: info.name.trim(),
        phone: info.phone.trim(),
        address: info.address.trim(),
        note: info.note.trim(),
      },
      items: orderItems,
      total,
      paymentMethod: 'cod',
      createdAt: new Date().toISOString(),
    }

    // Xóa giỏ CHỈ KHI xác nhận thành công
    dispatch(clearCart())
    setConfirmedOrder(order)
    submittingRef.current = false
    setSubmitting(false)
  }

  function handleNewOrder() {
    setConfirmedOrder(null)
    setInfo(EMPTY_INFO)
    setErrors({})
    setTouched({})
    navigate('/menu')
  }

  // ── Hiển thị kết quả đơn hàng ───────────────────────────────────────────
  if (confirmedOrder) {
    return <OrderResult order={confirmedOrder} onNewOrder={handleNewOrder} />
  }

  // ── Giỏ trống ────────────────────────────────────────────────────────────
  if (!catalogLoading && isEmpty) {
    return (
      <section className="container py-5 text-center" aria-label="Giỏ hàng trống">
        <div className="display-1" aria-hidden="true">🛒</div>
        <h1 className="fw-bold mt-2">Giỏ hàng trống</h1>
        <p className="text-secondary">
          Bạn chưa có món nào trong giỏ. Hãy chọn món trước khi thanh toán.
        </p>
        <Link to="/menu" className="btn btn-primary mt-2">
          Xem thực đơn
        </Link>
      </section>
    )
  }

  // ── Form checkout ────────────────────────────────────────────────────────
  return (
    <section className="container py-4">
      <h1 className="fw-bold mb-1">Thanh toán</h1>
      <p className="text-secondary mb-4">
        Điền thông tin giao hàng và xác nhận đơn hàng demo.
      </p>

      <div className="row g-4">
        {/* Cột trái: form */}
        <div className="col-12 col-lg-7">
          <form id="checkout-form" onSubmit={handleSubmit} noValidate aria-label="Biểu mẫu thanh toán">
            <h2 className="h5 fw-semibold mb-3">Thông tin giao hàng</h2>

            <FormField
              id="checkout-name"
              label="Họ và tên"
              required
              value={info.name}
              error={errors.name}
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              onChange={(v) => handleChange('name', v)}
              onBlur={() => handleBlur('name')}
            />
            <FormField
              id="checkout-phone"
              label="Số điện thoại"
              required
              type="tel"
              inputMode="tel"
              value={info.phone}
              error={errors.phone}
              autoComplete="tel"
              placeholder="0901 234 567"
              onChange={(v) => handleChange('phone', v)}
              onBlur={() => handleBlur('phone')}
            />
            <FormField
              id="checkout-address"
              label="Địa chỉ giao hàng"
              required
              value={info.address}
              error={errors.address}
              autoComplete="street-address"
              placeholder="Số nhà, đường, phường, quận"
              onChange={(v) => handleChange('address', v)}
              onBlur={() => handleBlur('address')}
            />
            <FormField
              id="checkout-note"
              label="Ghi chú"
              as="textarea"
              value={info.note}
              autoComplete="off"
              placeholder="Ví dụ: giao giờ hành chính"
              onChange={(v) => handleChange('note', v)}
              onBlur={() => handleBlur('note')}
            />

            <div className="mb-4">
              <h2 className="h5 fw-semibold mb-2">Thanh toán</h2>
              <div
                className="form-check p-3 border rounded"
                style={{ borderColor: '#2d6a4f', backgroundColor: '#f0f7f4' }}
              >
                <input
                  className="form-check-input"
                  type="radio"
                  id="payment-cod"
                  name="payment"
                  value="cod"
                  defaultChecked
                  readOnly
                />
                <label className="form-check-label" htmlFor="payment-cod">
                  <span className="fw-semibold">Thanh toán khi nhận hàng (COD)</span>
                  <span className="d-block text-secondary small">Mô phỏng, không thu tiền thật</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Cột phải: tóm tắt đơn */}
        <div className="col-12 col-lg-5">
          {catalogLoading ? (
            <p className="text-secondary" role="status">Đang tải thông tin đơn hàng...</p>
          ) : (
            <OrderSummary
              items={orderItems}
              products={products}
              total={total}
              submitting={submitting}
              isEmpty={isEmpty}
              onIncrease={(id) => dispatch(increaseQuantity(id))}
              onDecrease={(id) => dispatch(decreaseQuantity(id))}
              onRemove={(id) => dispatch(removeFromCart(id))}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default CheckoutPage
