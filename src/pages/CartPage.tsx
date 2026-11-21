import { useEffect, useRef } from 'react'
import { Link, useOutletContext, useRevalidator } from 'react-router'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { usePageTitle } from '@/app/usePageTitle'
import Breadcrumb from '@/components/Breadcrumb'
import DishImage from '@/components/DishImage'
import { clearCart, decreaseQuantity, increaseQuantity, removeFromCart } from '@/features/cart/cartSlice'
import { selectCartSummary } from '@/features/cart/cartSummary'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import '@/styles/cart.scss'

const cartBreadcrumb = [{ label: 'Giỏ hàng' }]
const priceFormatter = new Intl.NumberFormat('vi-VN')

function formatPrice(price: number) {
  return priceFormatter.format(price) + 'đ'
}

function CartPage() {
  usePageTitle('Giỏ hàng')
  const dispatch = useAppDispatch()
  const { lines, totalQuantity, total, canCheckout } = useAppSelector(selectCartSummary)
  const { status } = useAppSelector(selectCatalog)
  const { state: revalidationState, revalidate } = useRevalidator()
  const menuHref = useOutletContext<string>()
  const clearDialog = useRef<HTMLDialogElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const emptyHeading = useRef<HTMLHeadingElement>(null)
  const hadItems = useRef(lines.length > 0)

  useEffect(() => {
    if (hadItems.current && lines.length === 0) emptyHeading.current?.focus()
    hadItems.current = lines.length > 0
  }, [lines.length])

  function openClearDialog() {
    const dialog = clearDialog.current
    if (!dialog) return

    dialog.returnValue = ''
    dialog.showModal()
    cancelButton.current?.focus()
  }

  return (
    <section className="cart-page">
      <Breadcrumb items={cartBreadcrumb} />
      <div className="cart-page__header">
        <div>
          <h1>{status === 'ready' && canCheckout ? 'Giỏ hàng của bạn' : 'Giỏ hàng'}</h1>
          {status === 'ready' && lines.length > 0 && (
            <p>{canCheckout ? `Bạn đang có ${totalQuantity} sản phẩm trong giỏ hàng.` : 'Giỏ hàng có món không còn khả dụng.'}</p>
          )}
        </div>
        {status === 'ready' && lines.length > 0 && (
          <button type="button" className="site-button" onClick={openClearDialog}>Xóa toàn bộ</button>
        )}
      </div>

      {status === 'idle' && <p role="status">Đang tải giỏ hàng...</p>}

      {status === 'error' && (
        <div className="cart-page__warning" role="alert">
          <p>Không thể tải danh sách sản phẩm.</p>
          <button
            type="button"
            className="site-button"
            onClick={() => void revalidate()}
            disabled={revalidationState === 'loading'}
          >
            Thử lại
          </button>
        </div>
      )}

      {status === 'ready' && lines.length === 0 && (
        <div className="cart-page__empty">
          <div className="cart-page__empty-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 8h16l1 13H3L4 8Z" />
              <path d="M8 10V6a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <h2 ref={emptyHeading} tabIndex={-1}>Giỏ hàng của bạn đang trống.</h2>
          <p>Hãy khám phá thực đơn và chọn món ăn bạn yêu thích.</p>
          <Link to={menuHref} className="site-button site-button--primary">Tiếp tục mua hàng →</Link>
        </div>
      )}

      {status === 'ready' && lines.length > 0 && (
        <>
          <div className="cart-page__layout">
            <div className="cart-page__items">
              <h2 className="visually-hidden">Danh sách món ăn</h2>
              {lines.map(({ itemId, productId, product, quantity, lineTotal, unitPrice, selectedOptions }, index) => {
                const lineId = itemId ?? productId
                const lineLabel = [product?.name, ...selectedOptions.map(({ name }) => name)].join(', ')

                return (
                  <article className="cart-item" key={lineId}>
                    {product && lineTotal !== null ? (
                      <>
                        <DishImage src={product.image} name={product.name} className="cart-item__image" />
                        <div className="cart-item__details">
                          <h3>{product.name}</h3>
                          <p className="cart-item__price">{formatPrice(unitPrice)}</p>
                          {selectedOptions.length > 0 && (
                            <div className="cart-item__options">
                              <p>Tùy chọn đã chọn:</p>
                              {selectedOptions.map(({ id, name, additionalPrice }) => (
                                <div className="cart-item__option" key={id}>
                                  <span>{name}</span>
                                  <span>{additionalPrice > 0 ? `+${formatPrice(additionalPrice)}` : 'Miễn phí'}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="cart-item__quantity">
                            <button
                              type="button"
                              aria-label={`Giảm số lượng ${lineLabel}`}
                              disabled={quantity <= 1}
                              onClick={() => dispatch(decreaseQuantity(lineId))}
                            >
                              −
                            </button>
                            <span aria-live="polite" aria-atomic="true">
                              <span className="visually-hidden">{lineLabel}, số lượng: </span>{quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Tăng số lượng ${lineLabel}`}
                              onClick={() => dispatch(increaseQuantity(lineId))}
                            >
                              +
                            </button>
                          </div>
                          <p className="cart-item__total">Thành tiền: {formatPrice(lineTotal)}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="cart-item__unavailable-icon" aria-hidden="true">!</div>
                        <div className="cart-item__details">
                          <h3 className="cart-item__unavailable-title">{product?.name ?? 'Sản phẩm không khả dụng'}</h3>
                          <p>{product ? 'Món này hiện đã tạm hết.' : 'Món này không còn trong thực đơn.'}</p>
                        </div>
                      </>
                    )}
                    <button
                      type="button"
                      className="site-button cart-item__remove"
                      onClick={() => dispatch(removeFromCart(lineId))}
                      aria-label={product ? `Xóa ${lineLabel} khỏi giỏ hàng` : `Xóa món không khả dụng ở dòng ${index + 1}`}
                    >
                      Xóa
                    </button>
                  </article>
                )
              })}
              <Link to={menuHref} className="site-button">← Tiếp tục mua hàng</Link>
            </div>

            <aside className="cart-summary" aria-labelledby="cart-summary-title">
              <h2 id="cart-summary-title">Tổng đơn hàng</h2>
              <dl>
                <div><dt>Số lượng sản phẩm</dt><dd>{totalQuantity}</dd></div>
                <div><dt>Tạm tính</dt><dd>{formatPrice(total)}</dd></div>
                <div className="cart-summary__total"><dt>Tổng cộng</dt><dd>{formatPrice(total)}</dd></div>
              </dl>
              {canCheckout && (
                <Link to="/checkout" state={{ fromMenu: menuHref }} className="site-button site-button--primary">
                  Tiến hành thanh toán
                </Link>
              )}
            </aside>
          </div>

          {canCheckout ? (
            <div className="page-note">
              <strong>Giỏ hàng được lưu lại</strong>
              <p>Các món vẫn có trong giỏ khi bạn tải lại trang.</p>
            </div>
          ) : (
            <div className="cart-page__warning" role="alert">
              <strong>Không thể thanh toán khi còn món không khả dụng.</strong>
              <p>Hãy xóa món không khả dụng để tiếp tục.</p>
            </div>
          )}

          <dialog
            ref={clearDialog}
            className="cart-page__dialog"
            aria-labelledby="clear-cart-title"
            aria-describedby="clear-cart-description"
            onClose={(event) => {
              if (event.currentTarget.returnValue === 'clear') dispatch(clearCart())
            }}
          >
            <h2 id="clear-cart-title">Xóa toàn bộ giỏ hàng?</h2>
            <p id="clear-cart-description">Tất cả món trong giỏ sẽ bị xóa.</p>
            <form method="dialog">
              <button ref={cancelButton} type="submit" value="cancel" className="site-button">Hủy</button>
              <button type="submit" value="clear" className="site-button site-button--primary">Xóa toàn bộ</button>
            </form>
          </dialog>
        </>
      )}
    </section>
  )
}

export default CartPage
