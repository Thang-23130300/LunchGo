import { useMemo } from 'react'
import { Link } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import { usePageTitle } from '@/app/usePageTitle'
import { selectCurrentUserId, selectIsAuthenticated } from '@/features/auth/authSlice'
import { getOrdersByUserId } from '@/features/orders/orderStorage'
import type { Order, OrderStatus } from '@/models'
import Breadcrumb from '@/components/Breadcrumb'
import '@/styles/orders.scss'

const breadcrumb = [{ label: 'Lịch sử mua hàng' }]

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
  placed: 'Đã đặt',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`order-card__status order-card__status--${status}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function OrderCard({ order }: { order: Order }) {
  return (
    <article className="order-card">
      <div className="order-card__header">
        <div>
          <div className="order-card__id">{order.orderId}</div>
          <div className="order-card__date">{formatDate(order.createdAt)}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="order-card__items">
        {order.items.map((item) => (
          <div key={item.itemId} className="order-card__item-row">
            <span>{item.productName} × {item.quantity}</span>
            <span>{formatPrice(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      <div className="order-card__footer">
        <span className="order-card__total">Tổng: {formatPrice(order.total)}</span>
        <Link to={`/orders/${order.orderId}`} className="order-card__view-link">
          Xem chi tiết →
        </Link>
      </div>
    </article>
  )
}

function OrdersPage() {
  usePageTitle('Lịch sử mua hàng')
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const userId = useAppSelector(selectCurrentUserId)

  const orders = useMemo(() => {
    if (!userId) return []
    return getOrdersByUserId(userId)
  }, [userId])

  if (!isAuthenticated || !userId) {
    return (
      <section className="orders-page">
        <Breadcrumb items={breadcrumb} />
        <div className="orders-page__header">
          <h1>Lịch sử mua hàng</h1>
        </div>
        <div className="orders-empty">
          <div className="orders-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="7" r="4" />
              <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
            </svg>
          </div>
          <h2>Bạn chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập để xem lịch sử mua hàng.</p>
          <Link
            to="/login"
            state={{ returnTo: '/orders' }}
            className="site-button site-button--primary"
          >
            Đăng nhập
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="orders-page">
      <Breadcrumb items={breadcrumb} />
      <div className="orders-page__header">
        <h1>Lịch sử mua hàng</h1>
      </div>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <div className="orders-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M4 8h16l1 13H3L4 8Z" />
              <path d="M8 10V6a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <h2>Chưa có đơn hàng nào</h2>
          <p>Bắt đầu đặt món và đơn hàng của bạn sẽ xuất hiện ở đây.</p>
          <Link to="/menu" className="site-button site-button--primary">
            Khám phá thực đơn →
          </Link>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <OrderCard key={order.orderId} order={order} />
          ))}
        </div>
      )}
    </section>
  )
}

export default OrdersPage
