
import type { Review } from '@/models/review'
import {
  getBrowserStorage,
  readJson,
  writeJson,
  type KeyValueStorage,
} from '@/utils/safeStorage'

export const REVIEWS_STORAGE_KEY = 'lunchgo:v1:reviews'

const REVIEWS_STORAGE_VERSION = 1

type StoredReviews = {
  version: number
  reviews: Review[]
}

function isValidReview(value: unknown): value is Review {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const review = value as Record<string, unknown>

  return (
    typeof review.id === 'string' &&
    typeof review.userId === 'number' &&
    typeof review.orderId === 'string' &&
    typeof review.productId === 'string' &&
    typeof review.userName === 'string' &&
    typeof review.rating === 'number' &&
    Number.isInteger(review.rating) &&
    review.rating >= 1 &&
    review.rating <= 5 &&
    typeof review.comment === 'string' &&
    typeof review.createdAt === 'string'
  )
}

export function loadReviews(
  storage: KeyValueStorage | undefined = getBrowserStorage()
): Review[] {
  const saved = readJson(REVIEWS_STORAGE_KEY, storage)

  if (
    typeof saved !== 'object' ||
    saved === null ||
    !('version' in saved) ||
    saved.version !== REVIEWS_STORAGE_VERSION ||
    !('reviews' in saved) ||
    !Array.isArray(saved.reviews)
  ) {
    return []
  }

  const seen = new Set<string>()

  return saved.reviews.filter(isValidReview).filter((review) => {
    const key = JSON.stringify([
      review.userId,
      review.orderId,
      review.productId,
    ])

    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

export function saveReviews(
  reviews: Review[],
  storage: KeyValueStorage | undefined = getBrowserStorage()
): boolean {
  if (!storage) return false

  const data: StoredReviews = {
    version: REVIEWS_STORAGE_VERSION,
    reviews,
  }

  writeJson(REVIEWS_STORAGE_KEY, data, storage)

  const saved = readJson(REVIEWS_STORAGE_KEY, storage)

  return JSON.stringify(saved) === JSON.stringify(data)
}
