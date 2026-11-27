
import { getCompletedOrdersByUser } from '@/features/orders/orderQueries'
import type { Review, ReviewSummary } from '@/models/review'
import type { Order } from '@/models/order'
import { loadReviews } from './reviewStorage'
import { getSampleReviews } from '@/data/sampleReviews'

export function getReviewsByProduct(
  productId: string,
  reviews: readonly Review[] = loadReviews()
): Review[] {
  return reviews
    .filter((review) => review.productId === productId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
}

export function hasReviewedOrder(
  userId: number,
  orderId: string,
  productId: string,
  reviews: readonly Review[] = loadReviews()
): boolean {
  return reviews.some(
    (review) =>
      review.userId === userId &&
      review.orderId === orderId &&
      review.productId === productId
  )
}

export function getReviewableOrders(
  userId: number,
  productId: string,
  reviews: readonly Review[] = loadReviews()
): Order[] {
  return getCompletedOrdersByUser(userId).filter(
    (order) =>
      order.items.some(
        (item) => item.productId === productId
      ) &&
      !hasReviewedOrder(
        userId,
        order.orderId,
        productId,
        reviews
      )
  )
}

export function getReviewSummary(
  productId: string,
  reviews: readonly Review[] = loadReviews(),
  baseRating = 0,
  baseReviewCount = 0
): ReviewSummary {
  const productReviews = getReviewsByProduct(
    productId,
    reviews
  )

  const samples = getSampleReviews(productId)

  const localRatingTotal = productReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  )

  const sampleRatingTotal = samples.reduce(
    (sum, review) => sum + review.rating,
    0
  )

  const reviewCount =
    baseReviewCount +
    samples.length +
    productReviews.length

  const ratingTotal =
    baseRating * baseReviewCount +
    sampleRatingTotal +
    localRatingTotal

  return {
    averageRating:
      reviewCount > 0 ? ratingTotal / reviewCount : 0,
    reviewCount,
  }
}
