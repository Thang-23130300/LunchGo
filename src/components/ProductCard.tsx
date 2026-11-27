
import { Link } from 'react-router'
import DishImage from '@/components/DishImage'
import type { LunchProduct } from '@/models/product'
import '@/styles/product-card.scss'

interface ProductCardProps {
  product: LunchProduct
  menuHref?: string
  categoryName?: string
  onAddToCart: (productId: string) => void
  isFavorite?: boolean
  onToggleFavorite?: (productId: string) => void
  rating?: number
  reviewCount?: number
  soldCount?: number
  statusMessage?: string
}

const priceFormatter = new Intl.NumberFormat('vi-VN')

function ProductCard({
  product,
  menuHref = '/menu',
  categoryName,
  onAddToCart,
  isFavorite = false,
  onToggleFavorite,
  rating = product.baseRating ?? 0,
  reviewCount = product.baseReviewCount ?? 0,
  soldCount = product.baseSoldCount ?? 0,
  statusMessage,
}: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-card__media">
        <Link
          to={`/product/${encodeURIComponent(product.id)}`}
          state={{ fromMenu: menuHref }}
          aria-label={`Xem chi tiết ${product.name}`}
        >
          <DishImage
            src={product.image}
            name={product.name}
            className="product-card__image"
            loading="lazy"
          />
        </Link>

        <button
          type="button"
          className={`product-card__favorite${isFavorite ? ' is-active' : ''}`}
          aria-label={
            isFavorite
              ? `Bỏ yêu thích ${product.name}`
              : `Yêu thích ${product.name}`
          }
          aria-pressed={isFavorite}
          disabled={!onToggleFavorite}
          onClick={() => onToggleFavorite?.(product.id)}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>
      </div>

      <div className="product-card__body">
        <p className="product-card__category">
          {categoryName ?? product.category}
        </p>

        <h3 className="product-card__name">
          {product.name}
        </h3>

        <p className="product-card__description">
          {product.description ||
            product.ingredients.slice(0, 3).join(' · ') ||
            'Chưa có thông tin nguyên liệu'}
        </p>

        <div className="product-card__stats">
          <span className="product-card__rating">
            ★ {reviewCount > 0
              ? rating.toLocaleString('vi-VN', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })
              : '—'}
          </span>

          <span>({reviewCount} đánh giá)</span>
          <span>Đã bán {soldCount}</span>
        </div>

        <div className="product-card__order">
          <p className="product-card__price">
            {priceFormatter.format(product.price)} ₫
          </p>

          <div className="product-card__actions">
            <button
              type="button"
              className="site-button site-button--primary"
              disabled={!product.isAvailable}
              onClick={() => onAddToCart(product.id)}
            >
              {product.isAvailable
                ? '+ Thêm vào giỏ'
                : 'Tạm hết món'}
            </button>

            <Link
              className="site-button"
              to={`/product/${encodeURIComponent(product.id)}`}
              state={{ fromMenu: menuHref }}
              aria-label={`Chi tiết món ${product.name}`}
            >
              Chi tiết →
            </Link>
          </div>

          {statusMessage && (
            <p className="product-card__status" role="status">
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
