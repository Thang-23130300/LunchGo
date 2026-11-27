
import type { Review, ReviewDraft } from '@/models/review'
import { getOrderById } from '@/features/orders/orderStorage'
import { hasReviewedOrder } from './reviewQueries'
import {
  loadReviews,
  saveReviews,
  REVIEWS_STORAGE_KEY,
} from './reviewStorage'

let reviews: readonly Review[] = loadReviews()

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function subscribeReviews(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function getReviews(): readonly Review[] {
  return reviews
}

type SubmitReviewResult =
  | { success: true; review: Review }
  | { success: false; message: string }

export function submitReview(
  userId: number | null,
  userName: string,
  draft: ReviewDraft
): SubmitReviewResult {
  if (userId === null) {
    return {
      success: false,
      message: 'Bạn cần đăng nhập để đánh giá.',
    }
  }

  if (
    !Number.isInteger(draft.rating) ||
    draft.rating < 1 ||
    draft.rating > 5
  ) {
    return {
      success: false,
      message: 'Vui lòng chọn từ 1 đến 5 sao.',
    }
  }

  const order = getOrderById(draft.orderId)

  if (
    !order ||
    order.userId !== userId ||
    order.status !== 'completed' ||
    !order.items.some(
      (item) => item.productId === draft.productId
    )
  ) {
    return {
      success: false,
      message: 'Bạn chưa có đơn hoàn tất hợp lệ cho món này.',
    }
  }

  const currentReviews = loadReviews()

  if (
    hasReviewedOrder(
      userId,
      draft.orderId,
      draft.productId,
      currentReviews
    )
  ) {
    return {
      success: false,
      message: 'Bạn đã đánh giá món này trong đơn hàng đó.',
    }
  }

  const comment = draft.comment.trim()

  if (comment.length > 500) {
    return {
      success: false,
      message: 'Nhận xét không được vượt quá 500 ký tự.',
    }
  }

  const review: Review = {
    id: JSON.stringify([
      userId,
      draft.orderId,
      draft.productId,
    ]),
    userId,
    userName: userName.trim() || 'Khách hàng',
    orderId: draft.orderId,
    productId: draft.productId,
    rating: draft.rating,
    comment,
    createdAt: new Date().toISOString(),
  }

  const nextReviews = [review, ...currentReviews]

  if (!saveReviews(nextReviews)) {
    return {
      success: false,
      message: 'Không thể lưu đánh giá. Vui lòng thử lại.',
    }
  }

  reviews = nextReviews
  notify()

  return {
    success: true,
    review,
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (
      event.key === REVIEWS_STORAGE_KEY ||
      event.key === null
    ) {
      reviews = loadReviews()
      notify()
    }
  })
}
