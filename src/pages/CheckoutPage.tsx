import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCart, increaseQuantity, decreaseQuantity, removeFromCart } from '@/features/cart/cartSlice'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import type { LunchProduct } from '@/models/product'
import type { CustomerInfo, OrderDraft, OrderDraftItem } from '@/features/checkout/orderTypes'
import { generateOrderId } from '@/features/checkout/orderTypes'

// ─── helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

function isValidPhone(value: string): boolean {
  // Chỉ chấp nhận chữ số, khoảng trắng, dấu gạch, dấu +
  // Tổng số chữ số phải từ 9 đến 11
  const digits = value.replace(/\D/g, '')
  return digits.length >= 9 && digits.length <= 11
}

type FormErrors = Partial<Record<keyof CustomerInfo, string>>

function validateForm(info: CustomerInfo): FormErrors {
  const errors: FormErrors = {}
  if (!info.name.trim()) errors.name = 'Vui lòng nhập họ và tên.'
  if (!info.phone.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại.'
  } else if (!isValidPhone(info.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ (cần 9–11 chữ số).'
  }
  if (!info.address.trim()) errors.address = 'Vui lòng nhập địa chỉ giao hàng.'
  return errors
}

const EMPTY_INFO: CustomerInfo = { name: '', phone: '', address: '', note: '' }

// ─── OrderSummary ─────────────────────────────────────────────────────────────

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
      <div className="card-body">
        <h5 className="card-title mb-3">Tóm tắt đơn hàng</h5>

        {items.length === 0 ? (
          <p className="text-muted text-center py-3 mb-0">Chưa có món nào trong giỏ.</p>
        ) : (
          <>
            {items.map((item) => {
              const product = products.find((p) => p.id === item.productId)
              return (
                <div key={item.productId} className="card mb-3">
                  <div className="card-body py-2 px-3">
                    <div className="row align-items-center g-2">
                      <div className="col-3">
                        <img
                          src={product?.image ?? ''}
                          alt={item.productName}
                          className="img-fluid rounded"
                        />
                      </div>
                      <div className="col-9">
                        <div className="d-flex justify-content-between gap-2 align-items-start">
                          <div>
                            <p className="mb-1 fw-semibold small">{item.productName}</p>
                            <p className="text-primary fw-bold mb-1 small">
                              {formatPrice(item.unitPrice)}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger align-self-start"
                            onClick={() => onRemove(item.productId)}
                            aria-label={`Xóa ${item.productName}`}
                          >
                            Xóa
                          </button>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            disabled={item.quantity <= 1}
                            onClick={() => onDecrease(item.productId)}
                          >
                            -
                          </button>
                          <span className="fw-bold">{item.quantity}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => onIncrease(item.productId)}
                          >
                            +
                          </button>
                          <small className="text-muted ms-auto">
                            = <strong>{formatPrice(item.lineTotal)}</strong>
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="d-flex justify-content-between mb-2">
              <span>Tạm tính</span>
              <strong>{formatPrice(total)}</strong>
            </div>
            <div className="d-flex justify-content-between mb-3 text-muted">
              <span>Phí giao hàng</span>
              <span>0đ <small>(demo)</small></span>
            </div>

            <hr />

            <div className="d-flex justify-content-between mb-3">
              <strong>Tổng cộng</strong>
              <strong className="text-primary fs-5">{formatPrice(total)}</strong>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="btn btn-primary w-100"
              disabled={submitting || isEmpty}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                  Đang xử lý...
                </>
              ) : (
                'Xác nhận đơn hàng'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── FormField ────────────────────────────────────────────────────────────────

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

// ─── OrderResult ──────────────────────────────────────────────────────────────

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
        <p className="text-muted">
          Đây là đơn hàng <strong>minh họa</strong> — không có giao dịch tiền thật và không có đơn hàng thực tế được tạo.
        </p>
      </div>

      <div className="card mx-auto" style={{ maxWidth: 560 }}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Chi tiết đơn hàng</h5>
            <span className="text-primary fw-semibold font-monospace small">{order.orderId}</span>
          </div>

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
            <span className="text-primary">{formatPrice(order.total)}</span>
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
  const { products, status: catalogStatus } = useAppSelector(selectCatalog)

  const [info, setInfo] = useState<CustomerInfo>(EMPTY_INFO)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerInfo, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDraft | null>(null)

  const submittingRef = useRef(false)

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

  const activeErrors = useMemo<FormErrors>(() => {
    if (Object.keys(touched).length === 0) return {}
    const newErrors = validateForm(info)
    const filtered: FormErrors = {}
    for (const key of Object.keys(touched) as Array<keyof CustomerInfo>) {
      if (newErrors[key]) filtered[key] = newErrors[key]
    }
    return filtered
  }, [info, touched])

  function handleChange(field: keyof CustomerInfo, value: string) {
    setInfo((prev) => ({ ...prev, [field]: value }))
    // Xóa lỗi submit cũ khi người dùng bắt đầu sửa field
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleBlur(field: keyof CustomerInfo) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEmpty) return
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)

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

  // ── Kết quả đơn hàng ───────────────────────────────────────────────────────
  if (confirmedOrder) {
    return <OrderResult order={confirmedOrder} onNewOrder={handleNewOrder} />
  }

  // ── Catalog đang tải ───────────────────────────────────────────────────────
  if (catalogStatus === 'idle') {
    return (
      <section className="container py-5 text-center">
        <p role="status" className="text-muted">Đang tải thông tin đơn hàng...</p>
      </section>
    )
  }

  // ── Giỏ trống ──────────────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <section className="container py-5 text-center" aria-label="Giỏ hàng trống">
        <h1 className="mb-3">Thanh toán</h1>
        <p className="text-muted">Giỏ hàng của bạn đang trống.</p>
        <Link to="/menu" className="btn btn-primary mt-3">
          Xem thực đơn
        </Link>
      </section>
    )
  }

  // ── Form checkout ──────────────────────────────────────────────────────────
  return (
    <section className="container py-4">
      <h1 className="mb-1">Thanh toán</h1>
      <p className="text-muted mb-4">Điền thông tin giao hàng và xác nhận đơn hàng demo.</p>

      <div className="row g-4">
        {/* Cột trái: form thông tin */}
        <div className="col-lg-8">
          <form id="checkout-form" onSubmit={handleSubmit} noValidate aria-label="Biểu mẫu thanh toán">
            <h5 className="mb-3">Thông tin giao hàng</h5>

            <FormField
              id="checkout-name"
              label="Họ và tên"
              required
              value={info.name}
              error={errors.name ?? activeErrors.name}
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
              error={errors.phone ?? activeErrors.phone}
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
              error={errors.address ?? activeErrors.address}
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

            <h5 className="mb-2">Phương thức thanh toán</h5>
            <div className="card mb-3">
              <div className="card-body">
                <div className="form-check">
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
                    <span className="d-block text-muted small">Mô phỏng, không thu tiền thật</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Cột phải: tóm tắt đơn */}
        <div className="col-lg-4">
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
        </div>
      </div>
    </section>
  )
}

export default CheckoutPage
