import { useMemo, useRef, useState } from 'react'
import { Link, useOutletContext, useRevalidator } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCart, increaseQuantity, decreaseQuantity, removeFromCart } from '@/features/cart/cartSlice'
import { selectCartSummary } from '@/features/cart/cartSummary'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import type { LunchProduct } from '@/models/product'
import type { ConfirmedOrder, CustomerInfo, OrderDraftItem } from '@/features/checkout/orderTypes'
import { generateOrderId } from '@/features/checkout/orderTypes'
import '../styles/checkout.scss'

// ─── helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return /^\+?[\d -]+$/.test(value.trim()) && digits.length >= 9 && digits.length <= 11
}

type FormErrors = Partial<Record<keyof CustomerInfo, string>>

function validateForm(info: CustomerInfo): FormErrors {
  const errors: FormErrors = {}
  if (!info.customerName.trim()) errors.customerName = 'Vui lòng nhập họ và tên.'
  if (!info.phone.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại.'
  } else if (!isValidPhone(info.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ (cần 9–11 chữ số).'
  }
  if (!info.address.trim()) errors.address = 'Vui lòng nhập địa chỉ giao hàng.'
  return errors
}

const EMPTY_INFO: CustomerInfo = { customerName: '', phone: '', address: '', note: '' }

// ─── OrderSummary ─────────────────────────────────────────────────────────────

type OrderSummaryProps = {
  items: OrderDraftItem[]
  products: LunchProduct[]
  total: number
  canCheckout: boolean
  onIncrease: (productId: string) => void
  onDecrease: (productId: string) => void
  onRemove: (productId: string) => void
}

function OrderSummary({
  items, products, total, canCheckout,
  onIncrease, onDecrease, onRemove,
}: OrderSummaryProps) {
  return (
    <aside className="checkout-summary">
      <p className="checkout-summary__title">Tóm tắt đơn hàng</p>
      <div className="checkout-summary__divider" />

      {items.length === 0 ? (
        <p className="checkout-summary__empty">Chưa có món nào trong giỏ.</p>
      ) : (
        <>
          {items.map((item) => {
            const product = products.find((p) => p.id === item.productId)
            return (
              <div key={item.productId} className="checkout-summary__item">
                <div className="checkout-summary__item-header">
                  <div>
                    <p className="checkout-summary__item-name">{item.productName}</p>
                    <p className="checkout-summary__item-price">{formatPrice(item.unitPrice)}</p>
                  </div>
                  <button
                    type="button"
                    className="checkout-summary__item-remove"
                    onClick={() => onRemove(item.productId)}
                    aria-label={`Xóa ${item.productName}`}
                  >
                    Xóa
                  </button>
                </div>
                <div className="checkout-summary__item-controls">
                  <div className="checkout-summary__item-quantity">
                    <button
                      type="button"
                      disabled={item.quantity <= 1}
                      onClick={() => onDecrease(item.productId)}
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onIncrease(item.productId)}
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                  <span className="checkout-summary__item-linetotal">
                    {formatPrice(item.lineTotal)}
                  </span>
                </div>
              </div>
            )
          })}

          <div className="checkout-summary__pricing">
            <div className="checkout-summary__row">
              <span>Tạm tính</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Phí giao hàng</span>
              <span>0đ (demo)</span>
            </div>

            <div className="checkout-summary__total">
              <span>Tổng cộng</span>
              <strong>{formatPrice(total)}</strong>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="checkout-summary__confirm-btn"
              disabled={!canCheckout}
            >
              Xác nhận đơn hàng
            </button>
            <p className="checkout-summary__confirm-note">
              Đơn demo · Không phát sinh thanh toán thật
            </p>
          </div>
        </>
      )}
    </aside>
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
        {required && <span className="required-mark" aria-hidden="true">*</span>}
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
  order: ConfirmedOrder
  menuHref: string
}

function OrderResult({ order, menuHref }: OrderResultProps) {
  return (
    <div className="order-result">
      <div className="order-result__container">
        {/* Breadcrumb */}
        <nav className="order-result__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/checkout">Thanh toán</Link>
          <span>/</span>
          Kết quả đơn hàng
        </nav>

        {/* Check icon */}
        <div className="order-result__check-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="order-result__heading">Đặt hàng demo thành công!</h1>
        <p className="order-result__thank-you">Cảm ơn bạn đã lựa chọn LunchGo.</p>

        <div className="order-result__notice">
          Đây là đơn hàng minh họa. Không có giao dịch tiền thật và không có đơn hàng thực tế được tạo.
        </div>

        {/* Chi tiết đơn hàng */}
        <div className="order-result__card">
          <div className="order-result__card-header">
            <span className="order-result__card-label">Chi tiết đơn hàng</span>
            <span className="order-result__order-id">{order.orderId}</span>
          </div>

          <dl>
            <div className="order-result__info-row">
              <dt>Họ và tên</dt>
              <dd>{order.customer.customerName}</dd>
            </div>
            <div className="order-result__info-row">
              <dt>Điện thoại</dt>
              <dd>{order.customer.phone}</dd>
            </div>
            <div className="order-result__info-row">
              <dt>Địa chỉ</dt>
              <dd>{order.customer.address}</dd>
            </div>
            {order.customer.note && (
              <div className="order-result__info-row">
                <dt>Ghi chú</dt>
                <dd>{order.customer.note}</dd>
              </div>
            )}
            <div className="order-result__info-row">
              <dt>Thanh toán</dt>
              <dd>COD (demo)</dd>
            </div>
          </dl>

          <div className="order-result__items-divider" />

          {order.items.map((item) => (
            <div key={item.productId} className="order-result__item-row">
              <span>{item.productName} × {item.quantity}</span>
              <strong>{formatPrice(item.lineTotal)}</strong>
            </div>
          ))}

          <div className="order-result__total-row">
            <span>Tổng cộng</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </div>

        <div className="order-result__actions">
          <Link to={menuHref} className="order-result__menu-btn">
            Về thực đơn →
          </Link>
        </div>

        <p className="order-result__hint">
          Lưu ý: kết quả đơn là state trong /checkout; tải lại trang sẽ không khôi phục kết quả.
        </p>
      </div>
    </div>
  )
}

// ─── CheckoutPage ─────────────────────────────────────────────────────────────

function CheckoutPage() {
  const dispatch = useAppDispatch()
  const menuHref = useOutletContext<string>()
  const { lines, total, canCheckout } = useAppSelector(selectCartSummary)
  const { products, status: catalogStatus } = useAppSelector(selectCatalog)
  const { state: revalidationState, revalidate } = useRevalidator()

  const [info, setInfo] = useState<CustomerInfo>(EMPTY_INFO)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerInfo, boolean>>>({})
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null)

  const hasConfirmed = useRef(false)

  const orderItems = useMemo<OrderDraftItem[]>(() => {
    return lines.flatMap(({ product, productId, quantity, lineTotal }) => {
      if (!product || lineTotal === null) return []
      return [{
        productId,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        lineTotal,
      }]
    })
  }, [lines])

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
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function handleBlur(field: keyof CustomerInfo) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canCheckout || hasConfirmed.current) return

    const allTouched: Partial<Record<keyof CustomerInfo, boolean>> = {
      customerName: true, phone: true, address: true,
    }
    setTouched(allTouched)
    const formErrors = validateForm(info)
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    const order: ConfirmedOrder = {
      orderId: generateOrderId(),
      customer: {
        customerName: info.customerName.trim(),
        phone: info.phone.trim(),
        address: info.address.trim(),
        note: info.note.trim(),
      },
      items: orderItems,
      total,
      paymentMethod: 'cod',
      createdAt: new Date().toISOString(),
    }

    hasConfirmed.current = true
    setConfirmedOrder(order)
    dispatch(clearCart())
  }

  // ── Kết quả đơn hàng ───────────────────────────────────────────────────────
  if (confirmedOrder) {
    return <OrderResult order={confirmedOrder} menuHref={menuHref} />
  }

  // ── Catalog đang tải ───────────────────────────────────────────────────────
  if (catalogStatus === 'idle') {
    return (
      <div className="checkout-page">
        <div className="checkout-page__container checkout-page__status">
          <p role="status">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    )
  }

  // ── Giỏ trống ──────────────────────────────────────────────────────────────
  if (lines.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-page__container checkout-page__status">
          <h1 className="checkout-page__title">Thanh toán</h1>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Giỏ hàng của bạn đang trống.</p>
          <Link to={menuHref} className="checkout-page__button checkout-page__button--primary">
            Xem thực đơn
          </Link>
        </div>
      </div>
    )
  }

  // ── Lỗi catalog hoặc có món không khả dụng ─────────────────────────────────
  if (catalogStatus === 'error' || !canCheckout) {
    return (
      <div className="checkout-page">
        <div className="checkout-page__container">
          <h1 className="checkout-page__title">Thanh toán</h1>
          <p className="checkout-page__error-text" role="alert">
            {catalogStatus === 'error'
              ? 'Không thể tải danh sách sản phẩm.'
              : 'Hãy xóa món không khả dụng khỏi giỏ trước khi xác nhận đơn.'}
          </p>
          {catalogStatus === 'error' && (
            <button
              type="button"
              className="checkout-page__button checkout-page__button--primary"
              style={{ marginRight: 12 }}
              disabled={revalidationState === 'loading'}
              onClick={() => void revalidate()}
            >
              Thử lại
            </button>
          )}
          <Link
            to="/cart"
            state={{ fromMenu: menuHref }}
            className="checkout-page__button checkout-page__button--outline"
          >
            Quay về giỏ hàng
          </Link>
        </div>
      </div>
    )
  }

  // ── Form checkout ──────────────────────────────────────────────────────────
  return (
    <div className="checkout-page">
      <div className="checkout-page__container">
        {/* Breadcrumb */}
        <nav className="checkout-page__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/cart">Giỏ hàng</Link>
          <span>/</span>
          Thanh toán
        </nav>

        <h1 className="checkout-page__title">Thanh toán</h1>
        <p className="checkout-page__subtitle">Điền thông tin giao hàng và xác nhận đơn hàng demo.</p>

        <div className="checkout-page__layout">
          {/* Cột trái: form */}
          <div>
            <form id="checkout-form" onSubmit={handleSubmit} noValidate aria-label="Biểu mẫu thanh toán">
              <div className="checkout-form-card">
                <h2 className="checkout-form-card__section-title">Thông tin giao hàng</h2>
                <div className="checkout-form-card__divider" />

                <FormField
                  id="checkout-name"
                  label="Họ và tên"
                  required
                  value={info.customerName}
                  error={errors.customerName ?? activeErrors.customerName}
                  autoComplete="name"
                  placeholder="Nguyễn Văn A"
                  onChange={(v) => handleChange('customerName', v)}
                  onBlur={() => handleBlur('customerName')}
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

                <h2 className="checkout-form-card__section-title" style={{ marginTop: 8 }}>
                  Phương thức thanh toán
                </h2>
                <div className="checkout-form-card__divider" />

                <div className="checkout-form-card__cod-card">
                  <div className="checkout-form-card__cod-card-icon" aria-hidden="true">▣</div>
                  <div>
                    <span className="checkout-form-card__cod-card-label">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <span className="checkout-form-card__cod-card-sublabel">
                      Mô phỏng · Không thu tiền thật
                    </span>
                  </div>
                </div>
              </div>
            </form>

            <Link
              to="/cart"
              state={{ fromMenu: menuHref }}
              className="checkout-page__back"
            >
              ← Quay về giỏ hàng
            </Link>

            <p className="checkout-page__hint">
              Các trường * là bắt buộc. Giỏ trống hoặc có món không khả dụng sẽ không thể xác nhận đơn.
            </p>
          </div>

          {/* Cột phải: tóm tắt đơn */}
          <OrderSummary
            items={orderItems}
            products={products}
            total={total}
            canCheckout={canCheckout}
            onIncrease={(id) => dispatch(increaseQuantity(id))}
            onDecrease={(id) => dispatch(decreaseQuantity(id))}
            onRemove={(id) => dispatch(removeFromCart(id))}
          />
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
