
import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useAppSelector } from '@/app/hooks'
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
} from '@/features/auth/authSlice'
import { useReviews } from '@/features/reviews/useReviews'
import { getReviewableOrders } from '@/features/reviews/reviewQueries'
import { submitReview } from '@/features/reviews/reviewStore'
import { getSampleReviews } from '@/data/sampleReviews'
import type { LunchProduct } from '@/models/product'
import type { ReviewDraft } from '@/models/review'
import ReviewDialog from '@/components/ReviewDialog'
import '@/styles/reviews.scss'

interface ProductReviewsProps {
  product: LunchProduct
}

function ProductReviews({
  product,
}: ProductReviewsProps) {
  const user = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(
    selectIsAuthenticated
  )
  const authLoading = useAppSelector(selectAuthLoading)
  const location = useLocation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [message, setMessage] = useState('')

  const {
    allReviews,
    reviews,
    averageRating,
    reviewCount,
  } = useReviews(
    product.id,
    product.baseRating ?? 0,
    product.baseReviewCount ?? 0
  )

  const sampleReviews = getSampleReviews(product.id)

  const reviewableOrders =
    isAuthenticated && user
      ? getReviewableOrders(
          user.id,
          product.id,
          allReviews
        )
      : []

  const displayedReviews = [
    ...reviews.map((review) => ({
      ...review,
      isSample: false,
    })),
    ...sampleReviews.map((review) => ({
      ...review,
      isSample: true,
    })),
  ].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  )

  const loginHref = `/login?${new URLSearchParams({
    returnTo:
      location.pathname +
      location.search +
      location.hash,
  })}`

  function handleWriteReview() {
    setMessage('')

    if (!isAuthenticated || !user) {
      setMessage('Vui lòng đăng nhập để đánh giá.')
      return
    }

    if (reviewableOrders.length === 0) {
      setMessage(
        'Bạn cần có đơn hàng đã hoàn tất chứa món này và chưa đánh giá món trong đơn đó.'
      )
      return
    }

    setDialogOpen(true)
  }

  function handleSubmit(draft: ReviewDraft) {
    if (!isAuthenticated || !user) {
      return 'Vui lòng đăng nhập để đánh giá.'
    }

    const userName =
      `${user.firstName} ${user.lastName}`.trim() ||
      user.username

    const result = submitReview(
      user.id,
      userName,
      draft
    )

    if (!result.success) {
      return result.message
    }

    setMessage(
      'Đánh giá thành công! Cảm ơn bạn đã chia sẻ trải nghiệm.'
    )

    return null
  }

  return (
    <section
      className="product-reviews"
      id="reviews"
    >
      <div className="product-reviews__header">
        <div>
          <h2>Đánh giá món ăn</h2>
          <p>
            Chia sẻ trải nghiệm của bạn cùng LunchGo.
          </p>
        </div>

        <button
          type="button"
          className="site-button site-button--primary"
          disabled={authLoading}
          onClick={handleWriteReview}
        >
          Viết đánh giá
        </button>
      </div>

      <div className="product-reviews__summary">
        <strong>
          {reviewCount > 0
            ? averageRating.toLocaleString('vi-VN', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })
            : '—'}
        </strong>

        <div>
          <div
            className="product-reviews__stars"
            aria-label={`${averageRating.toFixed(1)} trên 5 sao`}
          >
            {'★'.repeat(Math.round(averageRating))}
            {'☆'.repeat(
              5 - Math.round(averageRating)
            )}
          </div>

          <p>{reviewCount} lượt đánh giá</p>
        </div>
      </div>

      {message && (
        <div
          className="product-reviews__message"
          role="status"
        >
          <p>{message}</p>

          {!isAuthenticated && (
            <Link
              to={loginHref}
              className="site-button site-button--primary"
            >
              Đăng nhập
            </Link>
          )}

          {isAuthenticated &&
            reviewableOrders.length === 0 && (
              <Link to="/orders">
                Xem lịch sử mua hàng →
              </Link>
            )}
        </div>
      )}

      {displayedReviews.length === 0 ? (
        <div className="product-reviews__empty">
          <span aria-hidden="true">☆</span>
          <h3>Chưa có nhận xét</h3>
          <p>
            Hãy chia sẻ trải nghiệm của bạn
            về món ăn này.
          </p>
        </div>
      ) : (
        <div className="product-reviews__list">
          {displayedReviews.map((review) => (
            <article
              key={review.id}
              className="product-review"
            >
              <div className="product-review__header">
                <div className="product-review__avatar">
                  {review.userName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="product-review__author">
                  <strong>{review.userName}</strong>

                  <small>
                    {review.isSample
                      ? 'Đánh giá mẫu'
                      : 'Đã mua món này'}
                  </small>
                </div>

                <time dateTime={review.createdAt}>
                  {new Date(
                    review.createdAt
                  ).toLocaleDateString('vi-VN')}
                </time>
              </div>

              <div
                className="product-reviews__stars"
                aria-label={`${review.rating} trên 5 sao`}
              >
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>

              {review.comment && (
                <p className="product-review__comment">
                  {review.comment}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {dialogOpen &&
        isAuthenticated &&
        user && (
          <ReviewDialog
            key={user.id}
            productId={product.id}
            productName={product.name}
            orders={reviewableOrders}
            onClose={() => setDialogOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
    </section>
  )
}

export default ProductReviews
