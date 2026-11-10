
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from '@/features/cart/cartSlice'
import { getCatalog } from '@/services/catalogService'
import type { LunchProduct } from '@/models/product'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

function CartPage() {
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector((state) => state.cart.items)

  const [products, setProducts] = useState<LunchProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadProducts() {
      try {
        const data = await getCatalog()

        if (isMounted) {
          setProducts(data)
          setError('')
        }
      } catch {
        if (isMounted) {
          setError('Không thể tải danh sách sản phẩm.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  const cartDetails = cartItems.map((item) => ({
    ...item,
    product: products.find((product) => product.id === item.productId),
  }))

  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  )

  const totalPrice = cartDetails.reduce(
    (total, item) =>
      total + (item.product ? item.product.price * item.quantity : 0),
    0
  )

  if (loading) {
    return (
      <section className="container py-4">
        <h1>Giỏ hàng</h1>
        <p>Đang tải giỏ hàng...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container py-4">
        <h1>Giỏ hàng</h1>
        <p className="text-danger">{error}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Thử lại
        </button>
      </section>
    )
  }

  if (cartItems.length === 0) {
    return (
      <section className="container py-5 text-center">
        <h1 className="mb-3">Giỏ hàng</h1>
        <p className="text-muted">Giỏ hàng của bạn đang trống.</p>
        <Link to="/menu" className="btn btn-primary mt-3">
          Tiếp tục mua hàng
        </Link>
      </section>
    )
  }

  return (
    <section className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Giỏ hàng</h1>
          <p className="text-muted mb-0">
            Bạn đang có {totalQuantity} sản phẩm trong giỏ hàng.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-danger"
          onClick={() => dispatch(clearCart())}
        >
          Xóa toàn bộ
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          {cartDetails.map((item) => (
            <div
              key={item.productId}
              className="card mb-3"
            >
              <div className="card-body">
                {item.product ? (
                  <div className="row align-items-center g-3">
                    <div className="col-4 col-md-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="img-fluid rounded"
                      />
                    </div>

                    <div className="col-8 col-md-9">
                      <div className="d-flex justify-content-between gap-2">
                        <div>
                          <h5 className="mb-2">
                            {item.product.name}
                          </h5>
                          <p className="text-primary fw-bold mb-2">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger align-self-start"
                          onClick={() =>
                            dispatch(removeFromCart(item.productId))
                          }
                        >
                          Xóa
                        </button>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            dispatch(decreaseQuantity(item.productId))
                          }
                        >
                          -
                        </button>

                        <span className="fw-bold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            dispatch(increaseQuantity(item.productId))
                          }
                        >
                          +
                        </button>
                      </div>

                      <p className="mt-2 mb-0">
                        Thành tiền:{' '}
                        <strong>
                          {formatPrice(
                            item.product.price * item.quantity
                          )}
                        </strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1 fw-bold">
                        Sản phẩm không còn tồn tại
                      </p>
                      <small className="text-muted">
                        Mã sản phẩm: {item.productId}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        dispatch(removeFromCart(item.productId))
                      }
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Link to="/menu" className="btn btn-outline-primary">
            Tiếp tục mua hàng
          </Link>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">
                Tổng đơn hàng
              </h5>

              <div className="d-flex justify-content-between mb-3">
                <span>Số lượng sản phẩm</span>
                <strong>{totalQuantity}</strong>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span>Tạm tính</span>
                <strong>{formatPrice(totalPrice)}</strong>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-3">
                <strong>Tổng cộng</strong>
                <strong className="text-primary fs-5">
                  {formatPrice(totalPrice)}
                </strong>
              </div>

              <Link
                to="/checkout"
                className="btn btn-primary w-100"
              >
                Tiến hành thanh toán
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CartPage
