import { useCallback, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import { usePageTitle } from '@/app/usePageTitle'
import { selectCurrentUserId } from '@/features/auth/authSlice'
import { getOrderById, updateOrderStatus } from '@/features/orders/orderStorage'
import type { Order, OrderStatus } from '@/models'
import Breadcrumb from '@/components/Breadcrumb'
import '@/styles/orders.scss'

const priceFormatter = new Intl.NumberFormat('vi-VN')
function formatPrice(price: number) {
  return priceFormatter.format(price) + 'đ'
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Đã đặt (chờ xác nhận)',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`order-detail__status-badge order-detail__status-badge--${status}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────

type ConfirmDialogProps = {
  dialogRef: React.RefObject<HTMLDialogElement | null>
  title: string
  description: string
  confirmLabel: string
  confirmVariant: 'complete' | 'cancel'
  onConfirm: () => void
}

function ConfirmDialog({
  dialogRef,
  title,
  description,
  confirmLabel,
  confirmVariant,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      onClose={(e) => {
        if (e.currentTarget.returnValue === 'confirm') onConfirm()
      }}
    >
      <h2 id="confirm-dialog-title">{title}</h2>
      <p id="confirm-dialog-desc">{description}</p>
      <form method="dialog">
        <button type="submit" value="cancel" className="site-button">
          Quay lại
        </button>
        <button
          type="submit"
          value="confirm"
          className={`order-detail__action-btn order-detail__action-btn--${confirmVariant}`}
        >
          {confirmLabel}
        </button>
      </form>
    </dialog>
  )
}

// ─── OrderDetailPage ───────────────────────────────────────────────────────────

function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const currentUserId = useAppSelector(selectCurrentUserId)

  // Đọc từ LocalStorage; dùng state để re-render khi cập nhật
  const [order, setOrder] = useState<Order | null>(() => {
    if (!orderId) return null
    return getOrderById(orderId)
  })

  usePageTitle(order ? `Đơn hàng ${order.orderId}` : 'Chi tiết đơn hàng')

  const completeDialogRef = useRef<HTMLDialogElement>(null)
  const cancelDialogRef = useRef<HTMLDialogElement>(null)
  const [updating, setUpdating] = useState(false)

  const handleUpdateStatus = useCallback(
    (newStatus: OrderStatus) => {
      if (!orderId || updating) return
      setUpdating(true)
      const updated = updateOrderStatus(orderId, newStatus)
      if (updated) setOrder(updated)
      setUpdating(false)
    },
    [orderId, updating]
  )

  // ── Không tìm thấy đơn ──────────────────────────────────────────────────────
  if (!order) {
    return (
      <section className="orders-page">
        <Breadcrumb items={[{ label: 'Lịch sử mua hàng', to: '/orders' }, { label: 'Chi tiết đơn hàng' }]} />
        <div className="order-detail__not-found">
          <h1>Không tìm thấy đơn hàng</h1>
          <p>Mã đơn không tồn tại hoặc đã bị xóa.</p>
          <Link to="/orders" className="site-button site-button--primary" style={{ marginTop: 8 }}>
            Về lịch sử mua hàng
          </Link>
        </div>
      </section>
    )
  }

  // ── Đơn không thuộc tài khoản hiện tại ─────────────────────────────────────
  if (order.userId !== null && order.userId !== currentUserId) {
    return (
      <section className="orders-page">
        <Breadcrumb items={[{ label: 'Lịch sử mua hàng', to: '/orders' }, { label: 'Chi tiết đơn hàng' }]} />
        <div className="order-detail__not-found">
          <h1>Không có quyền xem đơn hàng này</h1>
          <p>Đơn hàng không thuộc tài khoản đang đăng nhập.</p>
          <Link to="/orders" className="site-button site-button--primary" style={{ marginTop: 8 }}>
            Về lịch sử mua hàng
          </Link>
        </div>
      </section>
    )
  }

  const isPlaced = order.status === 'placed'
  const isCompleted = order.status === 'completed'
  const isCancelled = order.status === 'cancelled'

  return (
    <section className="orders-page">
      <Breadcrumb
        items={[
          { label: 'Lịch sử mua hàng', to: '/orders' },
          { label: order.orderId },
        ]}
      />

      <div className="orders-page__header">
        <h1>Chi tiết đơn hàng</h1>
      </div>

      <div className="order-detail__layout">
        {/* Cột trái: thông tin đơn */}
        <div>
          {/* Thông tin người nhận */}
          <div className="order-detail__card">
            <h2 className="order-detail__card-title">Thông tin giao hàng</h2>
            <div className="order-detail__divider" />
            <dl>
              <div className="order-detail__info-row">
                <dt>Mã đơn</dt>
                <dd>{order.orderId}</dd>
              </div>
              <div className="order-detail__info-row">
                <dt>Ngày đặt</dt>
                <dd>{formatDate(order.createdAt)}</dd>
              </div>
              <div className="order-detail__info-row">
                <dt>Họ và tên</dt>
                <dd>{order.customer.customerName}</dd>
              </div>
              <div className="order-detail__info-row">
                <dt>Điện thoại</dt>
                <dd>{order.customer.phone}</dd>
              </div>
              <div className="order-detail__info-row">
                <dt>Địa chỉ</dt>
                <dd>{order.customer.address}</dd>
              </div>
              {order.customer.note && (
                <div className="order-detail__info-row">
                  <dt>Ghi chú</dt>
                  <dd>{order.customer.note}</dd>
                </div>
              )}
              <div className="order-detail__info-row">
                <dt>Thanh toán</dt>
                <dd>COD (demo)</dd>
              </div>
            </dl>
          </div>

          {/* Danh sách món */}
          <div className="order-detail__card">
            <h2 className="order-detail__card-title">Các món đã đặt</h2>
            <div className="order-detail__divider" />

            {order.items.map((item) => (
              <div key={item.itemId} className="order-detail__item-row">
                <div>
                  <div className="order-detail__item-name">
                    {item.productName}
                  </div>
                  <div className="order-detail__item-qty">
                    {formatPrice(item.unitPrice)} × {item.quantity}
                  </div>
                  {item.selectedOptions.length > 0 && (
                    <div className="order-detail__item-options">
                      {item.selectedOptions.map((opt) => (
                        <p key={opt.id}>
                          {opt.name}
                          {opt.additionalPrice > 0
                            ? ` (+${formatPrice(opt.additionalPrice)})`
                            : ''}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <strong>{formatPrice(item.lineTotal)}</strong>
              </div>
            ))}

            {/* Tổng tiền */}
            <div className="order-detail__price-row">
              <span>Tạm tính</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && order.voucherCode && (
              <div className="order-detail__price-row order-detail__price-row--discount">
                <span>Giảm giá ({order.voucherCode})</span>
                <span>−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="order-detail__price-row order-detail__price-row--total">
              <span>Tổng cộng</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>
          </div>

          <Link to="/orders" className="order-detail__back">
            ← Quay về lịch sử mua hàng
          </Link>
        </div>

        {/* Cột phải: trạng thái và hành động */}
        <div>
          <div className="order-detail__status-card">
            <h2 className="order-detail__status-title">Trạng thái đơn hàng</h2>
            <StatusBadge status={order.status} />

            <div className="order-detail__status-time">
              {isPlaced && (
                <p>Đặt lúc: {formatDate(order.createdAt)}</p>
              )}
              {isCompleted && order.completedAt && (
                <p>Hoàn tất lúc: {formatDate(order.completedAt)}</p>
              )}
              {isCancelled && order.cancelledAt && (
                <p>Đã hủy lúc: {formatDate(order.cancelledAt)}</p>
              )}
            </div>

            {isPlaced && (
              <div className="order-detail__actions">
                <button
                  type="button"
                  className="order-detail__action-btn order-detail__action-btn--complete"
                  disabled={updating}
                  onClick={() => completeDialogRef.current?.showModal()}
                >
                  Xác nhận đã nhận món (demo)
                </button>
                <button
                  type="button"
                  className="order-detail__action-btn order-detail__action-btn--cancel"
                  disabled={updating}
                  onClick={() => cancelDialogRef.current?.showModal()}
                >
                  Hủy đơn hàng
                </button>
              </div>
            )}

            {isCompleted && (
              <div className="order-detail__actions">
                {order.items.map((item) => (
                  <Link
                    key={item.productId}
                    to={`/product/${item.productId}`}
                    className="order-detail__action-btn order-detail__action-btn--review"
                  >
                    Đánh giá: {item.productName}
                  </Link>
                ))}
              </div>
            )}

            {(isCompleted || isCancelled) && (
              <div className="order-detail__notice">
                Đơn hàng đã kết thúc và không thể thay đổi trạng thái.
              </div>
            )}
          </div>

          {/* Thông tin demo */}
          <div className="order-detail__status-card" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--site-muted)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--site-deep)' }}>Đây là đơn hàng demo.</strong>
              <br />
              Không có giao dịch tiền thật. Đơn được lưu trong trình duyệt của bạn.
            </div>
          </div>
        </div>
      </div>

      {/* Dialog xác nhận hoàn tất */}
      <ConfirmDialog
        dialogRef={completeDialogRef}
        title="Xác nhận đã nhận món?"
        description="Đơn hàng sẽ chuyển sang trạng thái Hoàn tất và không thể thay đổi."
        confirmLabel="Xác nhận hoàn tất"
        confirmVariant="complete"
        onConfirm={() => handleUpdateStatus('completed')}
      />

      {/* Dialog xác nhận hủy */}
      <ConfirmDialog
        dialogRef={cancelDialogRef}
        title="Hủy đơn hàng này?"
        description="Đơn hàng sẽ bị hủy và không thể thay đổi lại."
        confirmLabel="Hủy đơn"
        confirmVariant="cancel"
        onConfirm={() => handleUpdateStatus('cancelled')}
      />
    </section>
  )
}

export default OrderDetailPage
