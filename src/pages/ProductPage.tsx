import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '@/app/hooks'
import type { AppDispatch } from '@/app/store'
import { addToCart } from '@/features/cart/cartSlice'
import { selectCatalog } from '@/features/catalog/catalogSlice'
import { useLocation, useNavigate, useParams, useRevalidator } from 'react-router'
import '../styles/product-detail.scss'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

type ShareButtonProps = {
  productName: string
}

function ShareButton({ productName }: ShareButtonProps) {
  const location = useLocation()
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const canonical = location.pathname + location.search

    navigator.clipboard.writeText(canonical).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      type="button"
      className="product-detail__share"
      onClick={handleCopy}
      aria-label={`Sao chép liên kết món ${productName}`}
    >
      {copied ? '✓ Đã sao chép' : '↗ Sao chép liên kết'}
    </button>
  )
}

function ProductPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { products, status } = useAppSelector(selectCatalog)
  const { state: revalidationState, revalidate } = useRevalidator()

  const product = products.find((item) => item.id === id)

  const fromMenu: unknown = (
    location.state as { fromMenu?: unknown } | null
  )?.fromMenu

  const menuHref =
    typeof fromMenu === 'string' &&
    (fromMenu === '/menu' || fromMenu.startsWith('/menu?'))
      ? fromMenu
      : '/menu'

  function handleBack() {
    navigate(menuHref)
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
                className="product-detail__button product-detail__button--primary"
                disabled={revalidationState === 'loading'}
                onClick={() => void revalidate()}
              >
                Thử lại
              </button>
            )}

            <button
              type="button"
              className="product-detail__button product-detail__button--secondary"
              onClick={handleBack}
            >
              ← Quay lại thực đơn
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="product-detail">
      <div className="product-detail__container">
        <div className="product-detail__breadcrumb">
          <button
            type="button"
            className="product-detail__back"
            onClick={handleBack}
          >
            ← Quay lại thực đơn
          </button>

          <ShareButton productName={product.name} />
        </div>

        <div className="product-detail__content">
          <div className="product-detail__image-wrapper">
            <img
              src={product.image}
              alt={product.name}
              className="product-detail__image"
            />
          </div>

          <div className="product-detail__information">
            <span className="product-detail__category">
              {product.category}
            </span>

            <p className="product-detail__eyebrow">
              LUNCHGO · MÓN NGON MỖI NGÀY
            </p>

            <h1 className="product-detail__name">
              {product.name}
            </h1>

            <p className="product-detail__price">
              {formatPrice(product.price)}
            </p>

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
                    <li key={`${ingredient}-${index}`}>
                      <span className="product-detail__ingredient-dot" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Chưa có thông tin nguyên liệu.</p>
              )}
            </div>

            <button
              type="button"
              className="product-detail__add-button"
              disabled={!product.isAvailable}
              onClick={() => dispatch(addToCart(product.id))}
            >
              + Thêm vào giỏ hàng
            </button>

            <p className="product-detail__source">
              Nguồn dữ liệu: {product.source}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductPage