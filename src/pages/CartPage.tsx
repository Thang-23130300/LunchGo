
import { Link, useOutletContext, useRevalidator } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from '@/features/cart/cartSlice'
import { selectCartSummary } from '@/features/cart/cartSummary'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import '../styles/cart.scss'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

function CartPage() {
  const dispatch = useAppDispatch()
  const {
    lines: cartDetails,
    totalQuantity,
    total: totalPrice,
    canCheckout,
  } = useAppSelector(selectCartSummary)

  const { status } = useAppSelector(selectCatalog)
  const { state: revalidationState, revalidate } = useRevalidator()
  const menuHref = useOutletContext<string>()

  if (status === 'idle') {
    return (
      <section className="cart-page">
        <div className="cart-page__container">
          <h1 className="cart-page__title">Giỏ hàng</h1>
          <p className="cart-page__message">Đang tải giỏ hàng...</p>
        </div>
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section className="cart-page">
        <div className="cart-page__container">
          <h1 className="cart-page__title">Giỏ hàng</h1>
          <p className="cart-page__error" role="alert">
            Không thể tải danh sách sản phẩm.
          </p>

          <button
            type="button"
            className="cart-page__button cart-page__button--primary"
            onClick={() => void revalidate()}
            disabled={revalidationState === 'loading'}
          >
            Thử lại
          </button>
        </div>
      </section>
    )
  }


if (cartDetails.length === 0) {
  return (
    <section className="cart-page">
      <div className="cart-page__container cart-page__empty">
        <div className="cart-page__empty-icon" aria-hidden="true">
          🛒
        </div>

        <p className="cart-page__empty-eyebrow">
          LUNCHGO · GIỎ HÀNG
        </p>

        <h1 className="cart-page__title">
          Giỏ hàng đang trống
        </h1>

        <p className="cart-page__empty-description">
          Bạn chưa thêm món ăn nào. Hãy khám phá thực đơn và chọn
          những món yêu thích nhé!
        </p>

        <Link
          to={menuHref}
          className="cart-page__button cart-page__button--primary"
        >
          Khám phá thực đơn
        </Link>
      </div>
    </section>
  )
}


  return (
    <section className="cart-page">
      <div className="cart-page__container">
        <div className="cart-page__header">
          <div>
            <p className="cart-page__eyebrow">LUNCHGO · ĐẶT MÓN YÊU THÍCH</p>
            <h1 className="cart-page__title">Giỏ hàng của bạn</h1>
            <p className="cart-page__subtitle">
              Bạn đang có {totalQuantity} sản phẩm trong giỏ hàng.
            </p>
          </div>

          <button
            type="button"
            className="cart-page__clear"
            onClick={() => dispatch(clearCart())}
          >
            Xóa toàn bộ
          </button>
        </div>

        <div className="cart-page__layout">
          <div className="cart-page__items">
            <h2 className="cart-page__section-title">
              Danh sách món ăn
            </h2>

            {cartDetails.map((item) => (
              <article className="cart-item" key={item.productId}>
                {item.product && item.lineTotal !== null ? (
                  <>
                    <div className="cart-item__image-wrapper">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="cart-item__image"
                      />
                    </div>

                    <div className="cart-item__details">
                      <div className="cart-item__top">
                        <div>
                          <h3 className="cart-item__name">
                            {item.product.name}
                          </h3>
                          <p className="cart-item__price">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="cart-item__remove"
                          onClick={() =>
                            dispatch(removeFromCart(item.productId))
                          }
                          aria-label={`Xóa ${item.product.name} khỏi giỏ hàng`}
                        >
                          Xóa
                        </button>
                      </div>

                      <div className="cart-item__bottom">
                        <div className="cart-item__quantity">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              dispatch(decreaseQuantity(item.productId))
                            }
                            aria-label="Giảm số lượng"
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              dispatch(increaseQuantity(item.productId))
                            }
                            aria-label="Tăng số lượng"
                          >
                            +
                          </button>
                        </div>

                        <p className="cart-item__total">
                          {formatPrice(item.lineTotal)}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  
<div className="cart-item__unavailable">
  <div className="cart-item__unavailable-icon" aria-hidden="true">
    !
  </div>

  <div className="cart-item__unavailable-content">
    <span className="cart-item__unavailable-label">
      Không thể đặt món
    </span>

    <h3>Sản phẩm không khả dụng</h3>

    <p>
      Món ăn này hiện không còn trong thực đơn hoặc đã tạm hết.
      Vui lòng xóa sản phẩm để tiếp tục thanh toán.
    </p>

    <small>Mã sản phẩm: {item.productId}</small>
  </div>

  <button
    type="button"
    className="cart-item__remove"
    onClick={() => dispatch(removeFromCart(item.productId))}
  >
    Xóa món
  </button>
</div>

                )}
              </article>
            ))}

            <Link to={menuHref} className="cart-page__continue">
              ← Tiếp tục mua hàng
            </Link>
          </div>

          <aside className="cart-summary">
            <h2 className="cart-summary__title">Tổng đơn hàng</h2>

            <div className="cart-summary__row">
              <span>Số lượng sản phẩm</span>
              <strong>{totalQuantity}</strong>
            </div>

            <div className="cart-summary__row">
              <span>Tạm tính</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            <div className="cart-summary__divider" />

            <div className="cart-summary__total">
              <span>Tổng cộng</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            {canCheckout ? (
              <Link
                to="/checkout"
                state={{ fromMenu: menuHref }}
                className="cart-summary__checkout"
              >
                Tiến hành thanh toán
              </Link>
            ) : (
              <p className="cart-summary__warning" role="alert">
                Hãy xóa món không khả dụng để thanh toán.
              </p>
            )}

            <p className="cart-summary__note">
              Cảm ơn bạn đã lựa chọn LunchGo!
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default CartPage
