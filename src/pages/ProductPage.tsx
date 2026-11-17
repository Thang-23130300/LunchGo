
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@/app/hooks'
import type { AppDispatch } from '@/app/store'
import {
  addToCart,
  increaseQuantity,
} from '@/features/cart/cartSlice'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import { Link, useLocation, useOutletContext, useParams, useRevalidator } from 'react-router'
import { usePageTitle } from '@/app/usePageTitle'
import Breadcrumb from '@/components/Breadcrumb'
import DishImage from '@/components/DishImage'
import '../styles/product-detail.scss'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

type ShareButtonProps = {
  productName: string
}

function ShareButton({ productName }: ShareButtonProps) {
  const [result, setResult] = useState<'copied' | 'failed'>()

  async function handleCopy() {
    const url = new URL(window.location.href)
    url.hash = ''
    try {
      await navigator.clipboard.writeText(url.href)
      setResult('copied')
    } catch {
      setResult('failed')
    }
  }

  return (
    <div className="product-detail__share-control">
      <button
        type="button"
        className="site-button product-detail__share"
        onClick={handleCopy}
        aria-label={`Sao chép liên kết món ${productName}`}
      >
        Sao chép liên kết
      </button>
      <p className="action-status" role="status">
        {result === 'copied' && 'Đã sao chép liên kết.'}
        {result === 'failed' && 'Không thể sao chép. Bạn có thể dùng địa chỉ trên thanh trình duyệt.'}
      </p>
    </div>
  )
}

function ProductPage() {
  const dispatch = useDispatch<AppDispatch>()
  const [quantity, setQuantity] = useState(1)
  const [addedProduct, setAddedProduct] = useState<{ id: string; count: number }>()

  const { id } = useParams<{ id: string }>()
  const { pathname, search } = useLocation()
  const menuHref = useOutletContext<string>()
  const { products, status } = useAppSelector(selectCatalog)
  const { state: revalidationState, revalidate } = useRevalidator()

  const product = products.find((item) => item.id === id)
  usePageTitle(product?.name ?? 'Chi tiết món')
  const cartQuantity = useAppSelector((state) => state.cart.items.find((item) => item.productId === id)?.quantity ?? 0)

  function handleAddToCart() {
    if (!product || !product.isAvailable) return

    dispatch(addToCart(product.id))

    for (let i = 1; i < quantity; i += 1) {
      dispatch(increaseQuantity(product.id))
    }

    setAddedProduct({ id: product.id, count: cartQuantity + quantity })
    setQuantity(1)
  }

  if (status === 'idle') {
    return (
      <section className="product-detail">
        <div className="product-detail__container">
          <p className="product-detail__message" role="status">
            Đang tải thông tin món ăn...
          </p>
        </div>
      </section>
    )
  }

  if (!product) {
    return (
      <section className="product-detail">
        <div className="product-detail__container">
          <div className="product-detail__error" role="alert">
            {status === 'error'
              ? 'Không thể tải thông tin món ăn.'
              : 'Không tìm thấy món ăn này.'}
          </div>

          <div className="product-detail__error-actions">
            {status === 'error' && (
              <button
                type="button"
                className="site-button site-button--primary"
                disabled={revalidationState === 'loading'}
                onClick={() => void revalidate()}
              >
                Thử lại
              </button>
            )}

            <Link
              to={menuHref}
              className="site-button"
            >
              ← Quay lại thực đơn
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="product-detail">
      <div className="product-detail__container">
        <Breadcrumb items={[{ label: 'Thực đơn', to: menuHref }, { label: product.name }]} />
        <div className="product-detail__actions">
          <Link className="product-detail__back" to={menuHref}>← Quay lại thực đơn</Link>

          <ShareButton key={pathname + search} productName={product.name} />
        </div>

        <div className="product-detail__content">
          <div className="product-detail__image-wrapper">
            <DishImage
              src={product.image}
              name={product.name}
              className="product-detail__image"
            />
          </div>

          <div className="product-detail__information">
            <span className="product-detail__category">
              {product.category}
            </span>

            <h1 className="product-detail__name">
              {product.name}
            </h1>

            <p className="product-detail__price">
              {formatPrice(product.price)}
            </p>

            <div className="product-detail__divider" />
            <p
              className={
                product.isAvailable
                  ? 'product-detail__availability product-detail__availability--available'
                  : 'product-detail__availability product-detail__availability--unavailable'
              }
            >
              <span className="product-detail__availability-dot" />
              {product.isAvailable ? 'Đang có sẵn' : 'Tạm hết món'}
            </p>
            <p className="product-detail__source">Nguồn dữ liệu: {product.source}</p>

            {product.calories !== undefined && (
              <p className="product-detail__calories">
                Năng lượng: {product.calories} kcal / khẩu phần
              </p>
            )}

            <div className="product-detail__divider" />

            <div className="product-detail__ingredients">
              <h2>NGUYÊN LIỆU</h2>

              {product.ingredients.length > 0 ? (
                <ul>
                  {product.ingredients.map((ingredient, index) => (
                    <li key={`${ingredient}-${index}`}>{ingredient}</li>
                  ))}
                </ul>
              ) : (
                <p>Chưa có thông tin nguyên liệu.</p>
              )}
            </div>

            <div className="product-detail__quantity">
              <span className="product-detail__quantity-label">
                Số lượng
              </span>

              <div className="product-detail__quantity-controls">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  disabled={quantity <= 1 || !product.isAvailable}
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                >
                  −
                </button>

                <span aria-live="polite">{quantity}</span>

                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  disabled={!product.isAvailable}
                  onClick={() =>
                    setQuantity((current) => current + 1)
                  }
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="site-button site-button--primary product-detail__add-button"
              disabled={!product.isAvailable}
              onClick={handleAddToCart}
            >
              + Thêm {quantity > 1 ? `${quantity} sản phẩm` : 'vào giỏ hàng'}
            </button>

            <p className="action-status" role="status">
              {addedProduct?.id === product.id && `Đã thêm ${product.name} · ${addedProduct.count} phần trong giỏ.`}
            </p>
          </div>
        </div>
        <div className="page-note">
          <strong>Điều hướng quay lại thực đơn</strong>
          <p>Các bộ lọc trước đó được giữ khi bạn quay lại từ chi tiết món.</p>
        </div>
      </div>
    </section>
  )
}

export default ProductPage
