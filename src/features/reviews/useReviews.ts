
import { useSyncExternalStore } from 'react'
import {
  getReviews,
  subscribeReviews,
} from './reviewStore'
import {
  getReviewsByProduct,
  getReviewSummary,
} from './reviewQueries'

export function useReviews(
  productId: string,
  baseRating = 0,
  baseReviewCount = 0
) {
  const allReviews = useSyncExternalStore(
    subscribeReviews,
    getReviews,
    getReviews
  )

  const reviews = getReviewsByProduct(
    productId,
    allReviews
  )

  const summary = getReviewSummary(
    productId,
    allReviews,
    baseRating,
    baseReviewCount
  )

  return {
    allReviews,
    reviews,
    ...summary,
  }
}
