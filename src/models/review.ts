export type ReviewRating = 1 | 2 | 3 | 4 | 5

export interface Review {
  id: string
  userId: number
  orderId: string
  productId: string
  userName: string
  rating: ReviewRating
  comment: string
  createdAt: string
}

export interface ReviewDraft {
  orderId: string
  productId: string
  rating: ReviewRating
  comment: string
}

export interface ReviewSummary {
  averageRating: number
  reviewCount: number
}